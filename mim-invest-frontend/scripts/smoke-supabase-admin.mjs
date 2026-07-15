import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const frontendRoot = process.cwd();
const env = loadEnvFiles([
  path.join(frontendRoot, ".env.local"),
  path.join(frontendRoot, ".env"),
  path.join(frontendRoot, ".env.admin.local"),
]);

const supabaseUrl = (env.VITE_SUPABASE_URL ?? "").replace(/\/+$/, "");
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY ?? "";
const adminEmail = env.SUPABASE_ADMIN_EMAIL ?? "";
const adminPassword = env.SUPABASE_ADMIN_PASSWORD ?? "";
const timeoutMs = Number(env.SUPABASE_ADMIN_SMOKE_TIMEOUT_MS ?? 8000);
const testLeadEmail = env.SUPABASE_ADMIN_SMOKE_TEST_EMAIL ?? "";
const testLeadNamePrefix = sanitizeLikePrefix(env.SUPABASE_ADMIN_SMOKE_TEST_NAME_PREFIX ?? "Launch Test");
const testContactIds = parseCsvEnv(env.SUPABASE_ADMIN_SMOKE_TEST_CONTACT_IDS);
const testLandIds = parseCsvEnv(env.SUPABASE_ADMIN_SMOKE_TEST_LAND_IDS);
const shouldProcessTestLeads = env.SUPABASE_ADMIN_SMOKE_PROCESS_TEST_LEADS === "true";
const hasTestLeadSelector = Boolean(testLeadEmail || testContactIds.length > 0 || testLandIds.length > 0);
const failures = [];
const results = {};

if (!supabaseUrl || !supabaseAnonKey) {
  fail("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.");
}

if (!adminEmail || !adminPassword) {
  fail(
    "Missing SUPABASE_ADMIN_EMAIL or SUPABASE_ADMIN_PASSWORD. Set them in your shell or ignored .env.admin.local before running this admin smoke.",
  );
}

if (failures.length === 0) {
  await runAdminSmoke();
}

if (failures.length > 0) {
  console.error("Supabase admin smoke failed:\n");
  console.error(failures.join("\n\n"));
  process.exit(1);
}

console.log("Supabase admin smoke passed:");
console.log(JSON.stringify(results, null, 2));

async function runAdminSmoke() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const signInStartedAt = Date.now();
  const signInResult = await withTimeout(
    supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    }),
    "Admin sign-in",
  );

  if (signInResult.error || !signInResult.data.user) {
    fail(`Admin sign-in failed: ${signInResult.error?.message ?? "missing user"}`);
    return;
  }

  const userId = signInResult.data.user.id;
  results.auth = {
    ok: true,
    elapsedMs: Date.now() - signInStartedAt,
    email: signInResult.data.user.email,
  };

  const profileStartedAt = Date.now();
  const profileResult = await withTimeout(
    supabase
      .from("admin_profiles")
      .select("user_id,email")
      .eq("user_id", userId)
      .maybeSingle(),
    "Admin profile lookup",
  );

  if (profileResult.error || !profileResult.data) {
    fail(`Admin profile lookup failed: ${profileResult.error?.message ?? "admin profile not found"}`);
    return;
  }

  results.adminProfile = {
    ok: true,
    elapsedMs: Date.now() - profileStartedAt,
    email: profileResult.data.email,
  };

  const dataStartedAt = Date.now();
  const adminQueries = [
    {
      key: "contactInquiries",
      query: supabase.from("contact_inquiries").select("id", { count: "exact", head: true }),
    },
    {
      key: "landOffers",
      query: supabase.from("land_offers").select("id", { count: "exact", head: true }),
    },
    {
      key: "units",
      query: supabase.from("units").select("id", { count: "exact", head: true }),
      minRows: 1,
    },
    {
      key: "projects",
      query: supabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .eq("slug", "heroja-pinkija-13"),
      minRows: 1,
    },
    {
      key: "constructionUpdates",
      query: supabase.from("construction_updates").select("id", { count: "exact", head: true }),
    },
    {
      key: "projectMedia",
      query: supabase.from("project_media").select("id", { count: "exact", head: true }),
      minRows: 1,
    },
  ];

  const dataResults = await withTimeout(
    Promise.all(adminQueries.map((item) => item.query)),
    "Admin data fetch",
  );

  results.adminData = {
    ok: true,
    elapsedMs: Date.now() - dataStartedAt,
    tables: {},
  };

  for (const [index, result] of dataResults.entries()) {
    const expected = adminQueries[index];
    const rows = result.count ?? 0;

    if (result.error) {
      fail(`Admin table ${expected.key} failed: ${result.error.message}`);
      continue;
    }

    if (expected.minRows && rows < expected.minRows) {
      fail(`Admin table ${expected.key} returned ${rows} rows, expected at least ${expected.minRows}.`);
    }

    results.adminData.tables[expected.key] = rows;
  }

  if (hasTestLeadSelector) {
    await maybeProcessTestLeads(supabase);
  }

  await supabase.auth.signOut();
}

async function maybeProcessTestLeads(supabase) {
  const testLeadStartedAt = Date.now();
  const [contactResult, landResult] = await withTimeout(
    Promise.all([
      buildTestLeadQuery(supabase, "contact_inquiries", testContactIds),
      buildTestLeadQuery(supabase, "land_offers", testLandIds),
    ]),
    "Admin test lead lookup",
  );

  if (contactResult.error) {
    fail(`Admin test contact lead lookup failed: ${contactResult.error.message}`);
    return;
  }

  if (landResult.error) {
    fail(`Admin test land lead lookup failed: ${landResult.error.message}`);
    return;
  }

  const contactLeads = contactResult.data ?? [];
  const landLeads = landResult.data ?? [];

  results.testLeads = {
    ok: true,
    elapsedMs: Date.now() - testLeadStartedAt,
    mode: shouldProcessTestLeads ? "processed" : "read-only",
    selector: testContactIds.length > 0 || testLandIds.length > 0 ? "explicit-ids" : "email-and-name-prefix",
    contactInquiries: {
      found: contactLeads.length,
      closed: contactLeads.filter((item) => item.admin_status === "closed").length,
    },
    landOffers: {
      found: landLeads.length,
      closed: landLeads.filter((item) => item.admin_status === "closed").length,
    },
  };

  if (!shouldProcessTestLeads) {
    return;
  }

  if (contactLeads.length === 0 && landLeads.length === 0) {
    fail("No matching admin test leads found for the provided selector.");
    return;
  }

  const processingNote = `Kontrolisani admin smoke: test lead zatvoren ${new Date().toISOString().slice(0, 10)}.`;
  const updates = [
    ...contactLeads.map((item) =>
      supabase
        .from("contact_inquiries")
        .update({
          admin_status: "closed",
          admin_note: mergeAdminNote(item.admin_note, processingNote),
        })
        .eq("id", item.id),
    ),
    ...landLeads.map((item) =>
      supabase
        .from("land_offers")
        .update({
          admin_status: "closed",
          admin_note: mergeAdminNote(item.admin_note, processingNote),
        })
        .eq("id", item.id),
    ),
  ];

  const updateResults = await withTimeout(Promise.all(updates), "Admin test lead processing");
  const updateError = updateResults.find((item) => item.error)?.error;

  if (updateError) {
    fail(`Admin test lead processing failed: ${updateError.message}`);
    return;
  }

  const [contactVerifyResult, landVerifyResult] = await withTimeout(
    Promise.all([
      buildTestLeadQuery(supabase, "contact_inquiries", testContactIds, "id,admin_status"),
      buildTestLeadQuery(supabase, "land_offers", testLandIds, "id,admin_status"),
    ]),
    "Admin test lead processing verification",
  );

  if (contactVerifyResult.error || landVerifyResult.error) {
    fail(
      `Admin test lead processing verification failed: ${
        contactVerifyResult.error?.message ?? landVerifyResult.error?.message
      }`,
    );
    return;
  }

  const processedContactLeads = contactVerifyResult.data ?? [];
  const processedLandLeads = landVerifyResult.data ?? [];
  const openAfterProcessing = [...processedContactLeads, ...processedLandLeads].filter(
    (item) => item.admin_status !== "closed",
  );

  if (openAfterProcessing.length > 0) {
    fail(`Admin test lead processing left ${openAfterProcessing.length} test lead(s) not closed.`);
  }

  results.testLeads.contactInquiries.closed = processedContactLeads.filter(
    (item) => item.admin_status === "closed",
  ).length;
  results.testLeads.landOffers.closed = processedLandLeads.filter(
    (item) => item.admin_status === "closed",
  ).length;
}

function buildTestLeadQuery(supabase, tableName, ids, columns = "id,admin_status,admin_note") {
  let query = supabase.from(tableName).select(columns);

  if (ids.length > 0) {
    return query.in("id", ids);
  }

  return query.eq("email", testLeadEmail).ilike("full_name", `${testLeadNamePrefix}%`);
}

function withTimeout(promise, label) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms.`));
    }, timeoutMs);

    Promise.resolve(promise).then(
      (value) => {
        clearTimeout(timeoutId);
        resolve(value);
      },
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      },
    );
  });
}

function loadEnvFiles(files) {
  const loadedEnv = { ...process.env };

  for (const file of files) {
    if (!fs.existsSync(file)) {
      continue;
    }

    const content = fs.readFileSync(file, "utf8");

    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");
      const key = trimmed.slice(0, separatorIndex).trim();
      const rawValue = trimmed.slice(separatorIndex + 1).trim();

      if (!key || key in loadedEnv) {
        continue;
      }

      loadedEnv[key] = rawValue.replace(/^["']|["']$/g, "");
    }
  }

  return loadedEnv;
}

function parseCsvEnv(value = "") {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function sanitizeLikePrefix(value) {
  return value.trim().replace(/[%_]/g, "") || "Launch Test";
}

function mergeAdminNote(existingNote, processingNote) {
  const normalizedExistingNote = (existingNote ?? "").trim();

  if (!normalizedExistingNote) {
    return processingNote;
  }

  if (normalizedExistingNote.includes(processingNote)) {
    return normalizedExistingNote;
  }

  return `${normalizedExistingNote}\n${processingNote}`;
}

function fail(message) {
  failures.push(message);
}
