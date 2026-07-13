import fs from "node:fs";
import path from "node:path";

const frontendRoot = process.cwd();
const envPaths = [path.join(frontendRoot, ".env.local"), path.join(frontendRoot, ".env")];
const env = loadEnvFiles(envPaths);
const supabaseUrl = (env.VITE_SUPABASE_URL ?? "").replace(/\/+$/, "");
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY ?? "";
const requireProjectMedia =
  process.argv.includes("--require-project-media") || isTruthy(env.REQUIRE_PROJECT_MEDIA);
const failures = [];
const warnings = [];
const results = {};

if (!supabaseUrl || !supabaseAnonKey) {
  fail(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env.local and fill public Supabase values.",
  );
} else {
  await runReadOnlySmoke();
}

if (warnings.length > 0) {
  console.warn("Supabase read-only smoke warnings:\n");
  console.warn(warnings.join("\n"));
}

if (failures.length > 0) {
  console.error("Supabase read-only smoke failed:\n");
  console.error(failures.join("\n\n"));
  process.exit(1);
}

console.log("Supabase read-only smoke passed:");
console.log(JSON.stringify(results, null, 2));

async function runReadOnlySmoke() {
  results.rest = {
    projects: await expectPublicRows("projects", "slug,name", "is_published=eq.true", { minRows: 1 }),
    units: await expectPublicRows("units", "code,area_m2,status", "is_published=eq.true", { minRows: 1 }),
    projectMedia: await expectPublicRows(
      "project_media",
      "id,title,file_path",
      "is_published=eq.true",
      { minRows: requireProjectMedia ? 1 : 0, warnIfEmpty: !requireProjectMedia },
    ),
    constructionUpdates: await expectPublicRows(
      "construction_updates",
      "id,title,status_label",
      "is_published=eq.true",
      { minRows: 0, warnIfEmpty: true },
    ),
  };

  results.privateTables = {
    contactInquiries: await expectPrivateTableBlocked("contact_inquiries"),
    landOffers: await expectPrivateTableBlocked("land_offers"),
    emailDeliveryLog: await expectPrivateTableBlocked("email_delivery_log"),
    formRateLimitEvents: await expectPrivateTableBlocked("form_rate_limit_events"),
  };

  results.edgeFunctions = {
    submitContactInquiry: await expectFunctionPreflight("submit-contact-inquiry"),
    submitLandOffer: await expectFunctionPreflight("submit-land-offer"),
  };
}

async function expectPublicRows(table, select, filter, { minRows, warnIfEmpty = false }) {
  const query = new URLSearchParams({ select, limit: "5" });

  if (filter) {
    const [key, value] = filter.split("=");
    query.set(key, value);
  }

  const response = await supabaseFetch(`/rest/v1/${table}?${query.toString()}`);
  const body = await readJson(response);

  if (!response.ok) {
    fail(`Public table ${table} returned ${response.status}: ${formatBody(body)}`);
    return { ok: false, status: response.status, rows: 0 };
  }

  const rows = Array.isArray(body) ? body.length : 0;

  if (rows < minRows) {
    fail(`Public table ${table} returned ${rows} rows, expected at least ${minRows}.`);
  }

  if (warnIfEmpty && rows === 0) {
    warnings.push(`Public table ${table} is reachable but currently returns 0 rows.`);
  }

  return { ok: true, status: response.status, rows };
}

async function expectPrivateTableBlocked(table) {
  const response = await supabaseFetch(`/rest/v1/${table}?select=id&limit=1`);
  const body = await readJson(response);

  if (response.ok) {
    fail(`Private table ${table} is readable with the public anon key. Expected 401/403.`);
    return { ok: false, status: response.status };
  }

  if (![401, 403].includes(response.status)) {
    fail(`Private table ${table} returned ${response.status}; expected 401/403. Body: ${formatBody(body)}`);
    return { ok: false, status: response.status };
  }

  return { ok: true, status: response.status };
}

async function expectFunctionPreflight(functionName) {
  const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
    method: "OPTIONS",
    headers: {
      Origin: "http://localhost:5173",
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "authorization,content-type",
    },
  });
  const allowOrigin = response.headers.get("access-control-allow-origin");

  if (!response.ok) {
    fail(`Edge Function ${functionName} OPTIONS returned ${response.status}.`);
  }

  if (!allowOrigin) {
    fail(`Edge Function ${functionName} OPTIONS is missing access-control-allow-origin.`);
  }

  return {
    ok: response.ok && Boolean(allowOrigin),
    status: response.status,
    allowOrigin,
  };
}

async function supabaseFetch(restPath) {
  return fetch(`${supabaseUrl}${restPath}`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });
}

async function readJson(response) {
  return response.json().catch(() => null);
}

function formatBody(body) {
  if (!body) {
    return "no JSON body";
  }

  return JSON.stringify(body);
}

function fail(message) {
  failures.push(message);
}

function isTruthy(value) {
  return ["1", "true", "yes", "on"].includes(String(value ?? "").trim().toLowerCase());
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
