import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const frontendRoot = process.cwd();
const projectRoot = path.resolve(frontendRoot, "..");
const srcRoot = path.join(frontendRoot, "src");
const publicRoot = path.join(frontendRoot, "public");
const docsRoot = path.join(projectRoot, "docs");
const supabaseRoot = path.join(projectRoot, "supabase");
const packageJsonPath = path.join(frontendRoot, "package.json");
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx"]);
const textExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".jsx",
  ".json",
  ".md",
  ".mjs",
  ".scss",
  ".sql",
  ".toml",
  ".ts",
  ".tsx",
  ".txt",
  ".xml",
]);
const failures = [];

function fail(message) {
  failures.push(message);
}

function walk(targetPath) {
  if (!fs.existsSync(targetPath)) {
    return [];
  }

  const stat = fs.statSync(targetPath);

  if (stat.isFile()) {
    return [targetPath];
  }

  return fs.readdirSync(targetPath, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".git") {
      return [];
    }

    const fullPath = path.join(targetPath, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function toRelative(filePath) {
  return path.relative(projectRoot, filePath).replace(/\\/g, "/");
}

function getSourceFiles() {
  return walk(srcRoot).filter((filePath) => sourceExtensions.has(path.extname(filePath)));
}

function resolveImport(fromFile, specifier) {
  if (!specifier.startsWith(".")) {
    return null;
  }

  const basePath = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [];

  for (const extension of sourceExtensions) {
    candidates.push(`${basePath}${extension}`);
  }

  for (const extension of sourceExtensions) {
    candidates.push(path.join(basePath, `index${extension}`));
  }

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function auditImportGraph() {
  const files = getSourceFiles();
  const graph = new Map(files.map((file) => [file, []]));
  const importPattern =
    /(?:import|export)\s+(?:[^'";]+?\s+from\s+)?['"]([^'"]+)['"]|import\(['"]([^'"]+)['"]\)/g;

  for (const file of files) {
    const content = readText(file);
    let match;

    while ((match = importPattern.exec(content))) {
      const specifier = match[1] ?? match[2];
      const resolved = resolveImport(file, specifier);

      if (resolved) {
        graph.get(file)?.push(resolved);
      }
    }
  }

  const entry = path.join(srcRoot, "main.tsx");
  const reachable = new Set();
  const stack = [entry];

  while (stack.length > 0) {
    const file = stack.pop();

    if (!file || reachable.has(file)) {
      continue;
    }

    reachable.add(file);
    stack.push(...(graph.get(file) ?? []));
  }

  const unreachable = files.filter((file) => !reachable.has(file));

  if (unreachable.length > 0) {
    fail(`Unreachable source files:\n${unreachable.map(toRelative).join("\n")}`);
  }

  return { sourceFiles: files.length, reachableFiles: reachable.size };
}

function auditPublicAssets() {
  const publicFiles = walk(publicRoot).filter((file) => fs.statSync(file).isFile());
  const searchableFiles = [
    ...walk(srcRoot),
    ...walk(docsRoot),
    ...walk(supabaseRoot),
    path.join(frontendRoot, "index.html"),
  ].filter((file) => fs.existsSync(file) && textExtensions.has(path.extname(file)));
  const haystack = searchableFiles.map(readText).join("\n");
  const unreferenced = publicFiles.filter((file) => {
    const relativePath = path.relative(publicRoot, file).replace(/\\/g, "/");
    const slashPath = `/${relativePath}`;
    const basename = path.basename(file);

    return !haystack.includes(relativePath) && !haystack.includes(slashPath) && !haystack.includes(basename);
  });

  if (unreferenced.length > 0) {
    fail(`Unreferenced public files:\n${unreferenced.map(toRelative).join("\n")}`);
  }

  return { publicFiles: publicFiles.length };
}

function auditSourceHygiene() {
  const runtimeSourceFiles = walk(srcRoot).filter((file) => fs.existsSync(file) && textExtensions.has(path.extname(file)));
  const files = [
    ...walk(srcRoot),
    ...walk(docsRoot),
    ...walk(supabaseRoot),
    path.join(frontendRoot, "index.html"),
  ].filter((file) => fs.existsSync(file) && textExtensions.has(path.extname(file)));
  const hardReloadLinks = [];
  const debugTokens = [];
  const suspiciousEncoding = [];
  const imgWithoutAlt = [];
  const mojibakePattern =
    /[\uFFFD]|\u00C2(?=[\u00A0-\u00BF])|\u00C3(?=[\u0080-\u00BF])|\u00E2(?=\u20AC|\u0080)/;

  for (const file of files) {
    const content = readText(file);
    const relative = toRelative(file);

    if (runtimeSourceFiles.includes(file) && /<a\b[\s\S]*?\shref=["']\/(?!\/)/.test(content)) {
      hardReloadLinks.push(relative);
    }

    for (const [index, line] of content.split(/\r?\n/).entries()) {
      if (/\b(TODO|FIXME|debugger|console\.log|alert\()\b/.test(line)) {
        debugTokens.push(`${relative}:${index + 1}`);
      }

      if (mojibakePattern.test(line)) {
        suspiciousEncoding.push(`${relative}:${index + 1}`);
      }
    }

    for (const match of content.matchAll(/<img\b[\s\S]*?>/g)) {
      if (!/\salt=/.test(match[0])) {
        imgWithoutAlt.push(relative);
      }
    }
  }

  if (hardReloadLinks.length > 0) {
    fail(`Internal href="/..." links found:\n${[...new Set(hardReloadLinks)].join("\n")}`);
  }

  if (debugTokens.length > 0) {
    fail(`Debug/TODO tokens found:\n${debugTokens.join("\n")}`);
  }

  if (suspiciousEncoding.length > 0) {
    fail(`Suspicious encoding artifacts found:\n${suspiciousEncoding.join("\n")}`);
  }

  if (imgWithoutAlt.length > 0) {
    fail(`Images without alt found:\n${[...new Set(imgWithoutAlt)].join("\n")}`);
  }

  return {
    checkedTextFiles: files.length,
    hardReloadLinks: hardReloadLinks.length,
    debugTokens: debugTokens.length,
    suspiciousEncoding: suspiciousEncoding.length,
    imgWithoutAlt: imgWithoutAlt.length,
  };
}

function auditSitemapAndRobots() {
  const sitemapPath = path.join(publicRoot, "sitemap.xml");
  const robotsPath = path.join(publicRoot, "robots.txt");
  const pagesRoot = path.join(srcRoot, "views", "pages");
  const canonicalOrigin = "https://mimgradnja.rs";
  const expectedSitemapUrls = [
    "/",
    "/projekti/heroja-pinkija-13/o-projektu",
    "/projekti/heroja-pinkija-13/ponuda-stanova",
    "/projekti/heroja-pinkija-13/spisak-stanova",
    "/kupujemo-placeve",
    "/lokacija",
    "/o-nama",
    "/kontakt",
    "/politika-privatnosti",
    ...Array.from({ length: 15 }, (_, index) => `/projekti/heroja-pinkija-13/ponuda-stanova/${index + 1}`),
  ].map((urlPath) => `${canonicalOrigin}${urlPath}`);

  if (!fs.existsSync(sitemapPath)) {
    fail("Missing public/sitemap.xml");
    return {};
  }

  if (!fs.existsSync(robotsPath)) {
    fail("Missing public/robots.txt");
    return {};
  }

  const sitemap = readText(sitemapPath);
  const robots = readText(robotsPath);
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const lastmods = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((match) => match[1]);
  const duplicateLocs = locs.filter((loc, index) => locs.indexOf(loc) !== index);
  const nonCanonicalLocs = locs.filter(
    (loc) => loc.includes("/admin") || loc.includes("/apartmani/") || loc.endsWith("/projekti/heroja-pinkija-13"),
  );
  const missingExpectedLocs = expectedSitemapUrls.filter((loc) => !locs.includes(loc));
  const unexpectedLocs = locs.filter((loc) => !expectedSitemapUrls.includes(loc));
  const invalidLastmods = lastmods.filter((lastmod) => !/^\d{4}-\d{2}-\d{2}$/.test(lastmod));

  if (!sitemap.trimStart().startsWith("<?xml")) {
    fail("sitemap.xml is missing an XML declaration.");
  }

  if (locs.length !== 24 || lastmods.length !== 24) {
    fail(`Expected 24 sitemap URLs and 24 lastmod values, got ${locs.length} URLs and ${lastmods.length} lastmods.`);
  }

  if (duplicateLocs.length > 0) {
    fail(`Duplicate sitemap locs:\n${duplicateLocs.join("\n")}`);
  }

  if (nonCanonicalLocs.length > 0) {
    fail(`Non-canonical/admin URLs in sitemap:\n${nonCanonicalLocs.join("\n")}`);
  }

  if (missingExpectedLocs.length > 0) {
    fail(`Expected canonical sitemap URLs are missing:\n${missingExpectedLocs.join("\n")}`);
  }

  if (unexpectedLocs.length > 0) {
    fail(`Unexpected sitemap URLs:\n${unexpectedLocs.join("\n")}`);
  }

  if (invalidLastmods.length > 0) {
    fail(`Invalid sitemap lastmod values:\n${invalidLastmods.join("\n")}`);
  }

  if (!/Disallow:\s*\/admin\b/.test(robots)) {
    fail("robots.txt should disallow /admin.");
  }

  if (!/Disallow:\s*\/apartmani\//.test(robots)) {
    fail("robots.txt should disallow /apartmani/.");
  }

  if (!/Sitemap:\s*https:\/\/mimgradnja\.rs\/sitemap\.xml/.test(robots)) {
    fail("robots.txt should reference the canonical sitemap.");
  }

  const pageFiles = walk(pagesRoot).filter((filePath) => path.extname(filePath) === ".tsx");
  const pageFilesWithoutMeta = pageFiles.filter((filePath) => !readText(filePath).includes("PageMeta"));

  if (pageFilesWithoutMeta.length > 0) {
    fail(`Page files without PageMeta:\n${pageFilesWithoutMeta.map(toRelative).join("\n")}`);
  }

  return {
    sitemapUrls: locs.length,
    sitemapLastmods: lastmods.length,
    expectedSitemapUrls: expectedSitemapUrls.length - missingExpectedLocs.length,
    pageMetaFiles: pageFiles.length - pageFilesWithoutMeta.length,
  };
}

function auditRouteContract() {
  const routerPath = path.join(srcRoot, "app", "router", "AppRouter.tsx");
  const projectSpecPath = path.join(docsRoot, "Project-spec.md");
  const projectPagePath = path.join(
    srcRoot,
    "views",
    "pages",
    "projects",
    "HerojaPinkija13",
    "HerojaPinkija13Page.tsx",
  );

  if (!fs.existsSync(routerPath) || !fs.existsSync(projectSpecPath) || !fs.existsSync(projectPagePath)) {
    fail("Missing router, project spec or project page for route contract audit.");
    return {};
  }

  const router = readText(routerPath);
  const projectSpec = readText(projectSpecPath);
  const projectPage = readText(projectPagePath);
  const documentedPublicRoutes = [
    "/",
    "/projekti",
    "/projekti/heroja-pinkija-13",
    "/projekti/heroja-pinkija-13/o-projektu",
    "/projekti/heroja-pinkija-13/ponuda-stanova",
    "/projekti/heroja-pinkija-13/ponuda-stanova/:apartmentNumber",
    "/projekti/heroja-pinkija-13/spisak-stanova",
    "/o-nama",
    "/politika-privatnosti",
    "/lokacija",
    "/kupujemo-placeve",
    "/kontakt",
  ];
  const legacyRedirectRoute = "/apartmani/:apartmentNumber";
  const missingFromSpec = documentedPublicRoutes.filter((routePath) => !projectSpec.includes(`\`${routePath}\``));
  const missingFromRouter = [...documentedPublicRoutes, legacyRedirectRoute].filter(
    (routePath) => !router.includes(`path="${routePath}"`),
  );
  const checks = {
    projectSpecDocumentsPublicRoutes: missingFromSpec.length === 0,
    routerImplementsPublicRoutes: missingFromRouter.length === 0,
    projectIndexRedirectsToCanonical:
      router.includes('path="/projekti"') &&
      router.includes('to="/projekti/heroja-pinkija-13/o-projektu"'),
    legacyApartmentRedirectsToCanonical:
      router.includes('path="/apartmani/:apartmentNumber"') &&
      router.includes("to={`/projekti/heroja-pinkija-13/ponuda-stanova/${apartmentNumber ?? \"\"}`"),
    projectAliasUsesCanonicalMeta:
      router.includes('path="/projekti/heroja-pinkija-13"') &&
      projectPage.includes('canonicalPath="/projekti/heroja-pinkija-13/o-projektu"'),
    projectSpecDocumentsLegacyRedirect:
      projectSpec.includes(
        "legacy redirect: `/apartmani/:apartmentNumber` -> `/projekti/heroja-pinkija-13/ponuda-stanova/:apartmentNumber`",
      ),
  };

  for (const [name, ok] of Object.entries(checks)) {
    if (!ok) {
      fail(
        `Route contract check failed: ${name}\n` +
          `missingFromSpec=${missingFromSpec.join(",")}\n` +
          `missingFromRouter=${missingFromRouter.join(",")}`,
      );
    }
  }

  return {
    documentedPublicRoutes: documentedPublicRoutes.length,
    routerPublicRoutes: documentedPublicRoutes.length + 1 - missingFromRouter.length,
    ...checks,
  };
}

function auditSupabaseFunctionHardening() {
  const schemaPath = path.join(supabaseRoot, "schema.sql");
  const helperPath = path.join(supabaseRoot, "functions", "_shared", "rate-limit.ts");
  const contactPath = path.join(supabaseRoot, "functions", "submit-contact-inquiry", "index.ts");
  const landPath = path.join(supabaseRoot, "functions", "submit-land-offer", "index.ts");
  const smokeScriptPath = path.join(frontendRoot, "scripts", "smoke-supabase-readonly.mjs");

  if (
    !fs.existsSync(schemaPath) ||
    !fs.existsSync(helperPath) ||
    !fs.existsSync(contactPath) ||
    !fs.existsSync(landPath) ||
    !fs.existsSync(smokeScriptPath)
  ) {
    fail("Missing one or more Supabase form function files.");
    return {};
  }

  const schema = readText(schemaPath);
  const helper = readText(helperPath);
  const contact = readText(contactPath);
  const land = readText(landPath);
  const smokeScript = readText(smokeScriptPath);
  const requiredHeaders = ["cf-connecting-ip", "x-real-ip", "x-forwarded-for", "forwarded"];
  const publicTables = Array.from(schema.matchAll(/create table public\.([a-z_]+)/g)).map(
    (match) => match[1],
  );
  const publicFunctionBlocks =
    schema.match(/create\s+(?:or\s+replace\s+)?function\s+public\.[\s\S]*?\$\$;/gi) ?? [];
  const checks = {
    schemaEnablesRlsForAllPublicTables: publicTables.every((tableName) =>
      schema.includes(`alter table public.${tableName} enable row level security;`),
    ),
    schemaRevokesDefaultTableGrants:
      schema.includes("alter default privileges for role postgres in schema public") &&
      schema.includes("revoke select, insert, update, delete on tables from anon, authenticated, service_role"),
    schemaRevokesDefaultFunctionGrants:
      schema.includes("revoke execute on functions from anon, authenticated, service_role") &&
      schema.includes("revoke execute on functions from public"),
    schemaGrantsPublicMediaRead: schema.includes("grant select on public.project_media to anon, authenticated"),
    schemaAvoidsAuthRolePolicies: !schema.includes("auth.role("),
    schemaAvoidsPublicSecurityDefiner: publicFunctionBlocks.every(
      (functionBlock) => !/security\s+definer/i.test(functionBlock),
    ),
    schemaKeepsAdminDefinerPrivate:
      schema.includes("create or replace function app_private.is_admin()") &&
      schema.includes("grant execute on function app_private.is_admin() to authenticated") &&
      !schema.includes("grant execute on function app_private.is_admin() to anon"),
    helperHashesEmail: helper.includes("sha256(`email:${email.toLowerCase()}`)"),
    helperHashesIp: helper.includes("sha256(`ip:${clientIp}`)"),
    helperReadsForwardedHeaders: requiredHeaders.every((header) => helper.includes(header)),
    contactUsesHelper: contact.includes("checkFormRateLimit") && contact.includes("recordFormRateLimitEvents"),
    landUsesHelper: land.includes("checkFormRateLimit") && land.includes("recordFormRateLimitEvents"),
    noStaleEmailOnlyActionInEntries:
      !contact.includes('.eq("action", "submit-contact-inquiry")') &&
      !land.includes('.eq("action", "submit-land-offer")'),
    smokeCanRequireProjectMedia:
      smokeScript.includes("REQUIRE_PROJECT_MEDIA") &&
      smokeScript.includes("--require-project-media") &&
      smokeScript.includes("minRows: requireProjectMedia ? 1 : 0"),
  };

  for (const [name, ok] of Object.entries(checks)) {
    if (!ok) {
      fail(`Supabase function hardening check failed: ${name}`);
    }
  }

  return checks;
}

function auditEnvironmentTemplates() {
  const frontendEnvPath = path.join(frontendRoot, ".env.example");
  const supabaseEnvPath = path.join(supabaseRoot, ".env.example");
  const frontendRequiredKeys = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"];
  const supabaseRequiredKeys = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_SECRET_KEYS",
    "BREVO_API_KEY",
    "BREVO_SENDER_EMAIL",
    "BREVO_SENDER_NAME",
    "SALES_EMAIL",
  ];
  const hasEnvKey = (content, key) => new RegExp(`^\\s*#?\\s*${key.replaceAll("_", "\\_")}\\s*=`, "m").test(content);

  if (!fs.existsSync(frontendEnvPath)) {
    fail("Missing mim-invest-frontend/.env.example");
    return {};
  }

  if (!fs.existsSync(supabaseEnvPath)) {
    fail("Missing supabase/.env.example");
    return {};
  }

  const frontendEnv = readText(frontendEnvPath);
  const supabaseEnv = readText(supabaseEnvPath);
  const frontendMissing = frontendRequiredKeys.filter((key) => !hasEnvKey(frontendEnv, key));
  const supabaseMissing = supabaseRequiredKeys.filter((key) => !hasEnvKey(supabaseEnv, key));
  const frontendLeakedServerKeys = supabaseRequiredKeys.filter((key) => hasEnvKey(frontendEnv, key));

  if (frontendMissing.length > 0) {
    fail(`Missing frontend env example keys:\n${frontendMissing.join("\n")}`);
  }

  if (supabaseMissing.length > 0) {
    fail(`Missing Supabase env example keys:\n${supabaseMissing.join("\n")}`);
  }

  if (frontendLeakedServerKeys.length > 0) {
    fail(`Server-only env keys found in frontend env example:\n${frontendLeakedServerKeys.join("\n")}`);
  }

  return {
    frontendEnvKeys: frontendRequiredKeys.length - frontendMissing.length,
    supabaseEnvKeys: supabaseRequiredKeys.length - supabaseMissing.length,
    frontendLeakedServerKeys: frontendLeakedServerKeys.length,
  };
}

function auditDocumentationModelDrift() {
  const databaseModelPath = path.join(docsRoot, "Database_model.md");
  const schemaPath = path.join(supabaseRoot, "schema.sql");

  if (!fs.existsSync(databaseModelPath) || !fs.existsSync(schemaPath)) {
    fail("Missing Database_model.md or supabase/schema.sql for documentation drift audit.");
    return {};
  }

  const databaseModel = readText(databaseModelPath);
  const schema = readText(schemaPath);
  const contactBlock = databaseModel.match(/### contact_inquiries[\s\S]*?### land_offers/)?.[0] ?? "";
  const checks = {
    databaseModelTracksLandAcquisitionPage:
      !schema.includes("create table public.land_acquisition_page") ||
      databaseModel.includes("### land_acquisition_page"),
    databaseModelTracksEmailDeliveryKind:
      !schema.includes("delivery_kind public.email_delivery_kind") ||
      databaseModel.includes("delivery_kind text -- user_confirmation|sales_notification"),
    databaseModelTracksEmailSentAt:
      !schema.includes("sent_at timestamptz") || databaseModel.includes("sent_at timestamptz"),
    databaseModelUsesTextInquiryContext:
      !contactBlock.includes("project_id uuid") && !contactBlock.includes("unit_id uuid"),
  };

  for (const [name, ok] of Object.entries(checks)) {
    if (!ok) {
      fail(`Database documentation drift check failed: ${name}`);
    }
  }

  return checks;
}

function auditProjectContentModel() {
  const projectDataPath = path.join(srcRoot, "features", "projects", "data", "herojaPinkija13.data.ts");
  const projectSpecPath = path.join(docsRoot, "Project-spec.md");

  if (!fs.existsSync(projectDataPath) || !fs.existsSync(projectSpecPath)) {
    fail("Missing project data or Project-spec.md for project content model audit.");
    return {};
  }

  const projectData = readText(projectDataPath);
  const projectSpec = readText(projectSpecPath);
  const stackNumberMatches = [...projectData.matchAll(/numbers:\s*\[([^\]]+)\]/g)];
  const apartmentNumbers = stackNumberMatches.flatMap((match) =>
    [...match[1].matchAll(/["'](\d+)["']/g)].map((numberMatch) => numberMatch[1]),
  );
  const expectedApartmentNumbers = Array.from({ length: 15 }, (_, index) => String(index + 1));
  const duplicateApartmentNumbers = apartmentNumbers.filter(
    (number, index) => apartmentNumbers.indexOf(number) !== index,
  );
  const missingApartmentNumbers = expectedApartmentNumbers.filter((number) => !apartmentNumbers.includes(number));
  const unexpectedApartmentNumbers = apartmentNumbers.filter((number) => !expectedApartmentNumbers.includes(number));
  const checks = {
    projectSpecResidentialTotal15: projectSpec.includes("Residential total: 15 apartments"),
    projectDataHasFiveApartmentStacks: stackNumberMatches.length === 5,
    projectDataHasFifteenApartmentNumbers: apartmentNumbers.length === 15,
    projectDataApartmentNumbersAreCanonical:
      missingApartmentNumbers.length === 0 &&
      unexpectedApartmentNumbers.length === 0 &&
      duplicateApartmentNumbers.length === 0,
  };

  for (const [name, ok] of Object.entries(checks)) {
    if (!ok) {
      fail(
        `Project content model check failed: ${name}\n` +
          `apartmentNumbers=${apartmentNumbers.join(",")}\n` +
          `missing=${missingApartmentNumbers.join(",")}\n` +
          `unexpected=${unexpectedApartmentNumbers.join(",")}\n` +
          `duplicates=${duplicateApartmentNumbers.join(",")}`,
      );
    }
  }

  return {
    apartmentStacks: stackNumberMatches.length,
    apartmentNumbers: apartmentNumbers.length,
    ...checks,
  };
}

function auditPackageManifest() {
  if (!fs.existsSync(packageJsonPath)) {
    fail("Missing mim-invest-frontend/package.json");
    return {};
  }

  const packageJson = JSON.parse(readText(packageJsonPath));
  const scripts = packageJson.scripts ?? {};
  const dependencies = packageJson.dependencies ?? {};
  const devDependencies = packageJson.devDependencies ?? {};
  const sourceHaystack = [
    ...walk(srcRoot),
    path.join(frontendRoot, "vite.config.ts"),
    path.join(frontendRoot, "index.html"),
  ]
    .filter((file) => fs.existsSync(file) && textExtensions.has(path.extname(file)))
    .map(readText)
    .join("\n");
  const runtimeImportPatterns = {
    "@fontsource-variable/dm-sans": /@fontsource-variable\/dm-sans/,
    "@supabase/supabase-js": /@supabase\/supabase-js/,
    "framer-motion": /from\s+["']framer-motion["']/,
    "lucide-react": /from\s+["']lucide-react["']/,
    react: /from\s+["']react["']/,
    "react-dom": /react-dom\/client/,
    "react-router-dom": /from\s+["']react-router-dom["']/,
  };
  const buildOnlyPackages = ["sass"];
  const duplicateDeps = Object.keys(dependencies).filter((dependency) => dependency in devDependencies);
  const unusedRuntimeDeps = Object.keys(dependencies).filter((dependency) => {
    const pattern = runtimeImportPatterns[dependency];

    return pattern ? !pattern.test(sourceHaystack) : false;
  });
  const buildOnlyInRuntime = buildOnlyPackages.filter((dependency) => dependency in dependencies);
  const missingBuildOnlyDevDeps = buildOnlyPackages.filter((dependency) => !(dependency in devDependencies));
  const qualityScript = scripts.quality ?? "";
  const checks = {
    hasDependencyAuditScript: scripts["audit:deps"] === "npm audit --audit-level=low",
    hasSupabaseReadonlySmokeScript:
      scripts["smoke:supabase:readonly"] === "node scripts/smoke-supabase-readonly.mjs",
    hasSupabaseLaunchSmokeScript:
      scripts["smoke:supabase:launch"] ===
      "node scripts/smoke-supabase-readonly.mjs --require-project-media",
    hasSupabaseAdminSmokeScript:
      scripts["smoke:supabase:admin"] === "node scripts/smoke-supabase-admin.mjs",
    qualityRunsSurfaceAudit: qualityScript.includes("npm run audit:surface"),
    qualityRunsLint: qualityScript.includes("npm run lint"),
    qualityRunsBuild: qualityScript.includes("npm run build"),
    qualityRunsDependencyAudit: qualityScript.includes("npm run audit:deps"),
  };

  if (duplicateDeps.length > 0) {
    fail(`Packages declared in both dependencies and devDependencies:\n${duplicateDeps.join("\n")}`);
  }

  if (unusedRuntimeDeps.length > 0) {
    fail(`Runtime dependencies without matching source imports:\n${unusedRuntimeDeps.join("\n")}`);
  }

  if (buildOnlyInRuntime.length > 0) {
    fail(`Build-only packages should not be runtime dependencies:\n${buildOnlyInRuntime.join("\n")}`);
  }

  if (missingBuildOnlyDevDeps.length > 0) {
    fail(`Missing expected build-only devDependencies:\n${missingBuildOnlyDevDeps.join("\n")}`);
  }

  for (const [name, ok] of Object.entries(checks)) {
    if (!ok) {
      fail(`Package script check failed: ${name}`);
    }
  }

  return {
    runtimeDependencies: Object.keys(dependencies).length,
    devDependencies: Object.keys(devDependencies).length,
    duplicateDeps: duplicateDeps.length,
    unusedRuntimeDeps: unusedRuntimeDeps.length,
    buildOnlyInRuntime: buildOnlyInRuntime.length,
    hasDependencyAuditScript: checks.hasDependencyAuditScript,
    hasSupabaseReadonlySmokeScript: checks.hasSupabaseReadonlySmokeScript,
    hasSupabaseLaunchSmokeScript: checks.hasSupabaseLaunchSmokeScript,
    hasSupabaseAdminSmokeScript: checks.hasSupabaseAdminSmokeScript,
    qualityChecks: Object.values(checks).filter(Boolean).length,
  };
}

function auditUxGuardrails() {
  const adminLoginPath = path.join(srcRoot, "views", "pages", "admin", "AdminLoginPage.tsx");
  const mainLayoutPath = path.join(srcRoot, "views", "layout", "MainLayout.tsx");
  const adminLayoutPath = path.join(srcRoot, "views", "layout", "AdminLayout.tsx");
  const homePath = path.join(srcRoot, "views", "pages", "HomePage.tsx");
  const contactModalPath = path.join(srcRoot, "features", "inquiries", "components", "ContactModal.tsx");
  const landBuyPath = path.join(srcRoot, "views", "pages", "LandBuyPage.tsx");
  const stylesPath = path.join(srcRoot, "shared", "styles", "global.scss");

  if (
    !fs.existsSync(adminLoginPath) ||
    !fs.existsSync(mainLayoutPath) ||
    !fs.existsSync(adminLayoutPath) ||
    !fs.existsSync(homePath) ||
    !fs.existsSync(contactModalPath) ||
    !fs.existsSync(landBuyPath) ||
    !fs.existsSync(stylesPath)
  ) {
    fail("Missing one or more UX guardrail source files.");
    return {};
  }

  const adminLogin = readText(adminLoginPath);
  const mainLayout = readText(mainLayoutPath);
  const adminLayout = readText(adminLayoutPath);
  const home = readText(homePath);
  const contactModal = readText(contactModalPath);
  const landBuy = readText(landBuyPath);
  const styles = readText(stylesPath);
  const formConsentBlock = styles.match(/^\.form-consent\s*\{([\s\S]*?)^\}/m)?.[1] ?? "";
  const checks = {
    adminLoginNoindex: adminLogin.includes('robots="noindex,nofollow"'),
    adminLoginCanonical: adminLogin.includes('canonicalPath="/admin/prijava"'),
    adminLoginSkipTarget:
      adminLogin.includes('href="#main-content"') &&
      adminLogin.includes('id="main-content"') &&
      adminLogin.includes("tabIndex={-1}"),
    adminLoginLabels:
      adminLogin.includes('htmlFor="admin-login-email"') &&
      adminLogin.includes('id="admin-login-email"') &&
      adminLogin.includes('htmlFor="admin-login-password"') &&
      adminLogin.includes('id="admin-login-password"'),
    publicLayoutSkipTarget:
      mainLayout.includes('href="#main-content"') &&
      mainLayout.includes('id="main-content"') &&
      mainLayout.includes("tabIndex={-1}"),
    publicDropdownEscape:
      mainLayout.includes('event.key !== "Escape"') &&
      mainLayout.includes("triggerRef.current?.focus()") &&
      mainLayout.includes("onKeyDown={handleKeyDown}"),
    mobileNavEscape:
      mainLayout.includes("const handleNavKeyDown") &&
      mainLayout.includes("!isNavOpen") &&
      mainLayout.includes('document.querySelector<HTMLButtonElement>(".site-header__menu-toggle")?.focus()') &&
      (mainLayout.match(/onKeyDown=\{handleNavKeyDown\}/g)?.length ?? 0) >= 2,
    adminLayoutSkipTarget:
      adminLayout.includes('href="#admin-main-content"') &&
      adminLayout.includes('id="admin-main-content"') &&
      adminLayout.includes("tabIndex={-1}"),
    consentHasTouchTarget:
      /min-height:\s*44px/.test(formConsentBlock) &&
      /cursor:\s*pointer/.test(formConsentBlock),
    mobileClosedNavDoesNotInterceptClicks:
      styles.includes(".site-nav:not(.site-nav--open) .site-nav__menu") &&
      styles.includes(".site-nav:not(.site-nav--open) .site-nav__panel a") &&
      /\.site-nav:not\(\.site-nav--open\)[\s\S]*?pointer-events:\s*none/.test(styles),
    contactModalFocusTrapSkipsNegativeTabIndex:
      contactModal.includes('name="website"') &&
      contactModal.includes("tabIndex={-1}") &&
      contactModal.includes("element.tabIndex < 0"),
    contactModalFormAnnouncesBusyState:
      contactModal.includes('className="contact-modal__form"') &&
      contactModal.includes('aria-busy={formStatus === "sending"}'),
    leadFormsExposeAutofillHints:
      adminLogin.includes('autoComplete="email"') &&
      adminLogin.includes('autoComplete="current-password"') &&
      contactModal.includes('autoComplete="name"') &&
      contactModal.includes('autoComplete="tel"') &&
      contactModal.includes('inputMode="tel"') &&
      contactModal.includes('autoComplete="email"') &&
      landBuy.includes('autoComplete="name"') &&
      landBuy.includes('autoComplete="tel"') &&
      landBuy.includes('inputMode="tel"') &&
      landBuy.includes('autoComplete="email"') &&
      landBuy.includes('autoComplete="street-address"') &&
      landBuy.includes('inputMode="numeric"'),
    publicMotionRespectsReducedMotion:
      home.includes("useReducedMotion") &&
      home.includes("staticFadeUp") &&
      landBuy.includes("useReducedMotion") &&
      landBuy.includes("staticFadeUp") &&
      styles.includes("@media (prefers-reduced-motion: reduce)") &&
      /html\s*\{[\s\S]*?scroll-behavior:\s*auto/.test(styles),
  };

  for (const [name, ok] of Object.entries(checks)) {
    if (!ok) {
      fail(`UX guardrail check failed: ${name}`);
    }
  }

  return checks;
}

function auditJsxGuardrails() {
  const nativeButtonsMissingType = [];
  const iconOnlyButtonsMissingAccessibleName = [];
  const nativeFormsMissingSubmitHandler = [];
  const nativeFormControlsMissingAccessibleName = [];
  const targetBlankLinksMissingSafeRel = [];
  let nativeButtonCount = 0;
  let iconOnlyButtonCount = 0;
  let nativeFormCount = 0;
  let nativeFormControlCount = 0;
  let targetBlankLinkCount = 0;

  for (const filePath of getSourceFiles()) {
    const extension = path.extname(filePath);
    const scriptKind =
      extension === ".tsx"
        ? ts.ScriptKind.TSX
        : extension === ".jsx"
          ? ts.ScriptKind.JSX
          : extension === ".js"
            ? ts.ScriptKind.JS
            : ts.ScriptKind.TS;
    const sourceText = readText(filePath);
    const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true, scriptKind);
    const labelForValues = collectLabelForValues(sourceFile);

    const visit = (node) => {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const tagName = getJsxTagName(node.tagName);

        if (tagName === "button") {
          nativeButtonCount += 1;

          const hasType = node.attributes.properties.some(
            (attribute) => ts.isJsxAttribute(attribute) && attribute.name.text === "type",
          );

          if (!hasType) {
            const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
            nativeButtonsMissingType.push(`${toRelative(filePath)}:${line + 1}:${character + 1}`);
          }

          const hasButtonText = hasButtonTextContent(node, sourceFile);

          if (!hasButtonText) {
            iconOnlyButtonCount += 1;
          }

          if (!hasButtonText && !hasExplicitButtonAccessibleName(node)) {
            const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
            iconOnlyButtonsMissingAccessibleName.push(`${toRelative(filePath)}:${line + 1}:${character + 1}`);
          }
        }

        if (tagName === "form") {
          nativeFormCount += 1;

          const hasSubmitHandler = node.attributes.properties.some(
            (attribute) => ts.isJsxAttribute(attribute) && attribute.name.text === "onSubmit",
          );

          if (!hasSubmitHandler) {
            const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
            nativeFormsMissingSubmitHandler.push(`${toRelative(filePath)}:${line + 1}:${character + 1}`);
          }
        }

        if (["input", "select", "textarea"].includes(tagName) && !isHiddenInput(node, sourceFile)) {
          nativeFormControlCount += 1;

          if (!hasAccessibleFormControlName(node, sourceFile, labelForValues)) {
            const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
            nativeFormControlsMissingAccessibleName.push(
              `${toRelative(filePath)}:${line + 1}:${character + 1}`,
            );
          }
        }

        if (tagName === "a" && getJsxAttributeStaticStringValue(node, "target", sourceFile) === "_blank") {
          targetBlankLinkCount += 1;

          if (!hasSafeTargetBlankRel(node, sourceFile)) {
            const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
            targetBlankLinksMissingSafeRel.push(`${toRelative(filePath)}:${line + 1}:${character + 1}`);
          }
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
  }

  if (nativeButtonsMissingType.length > 0) {
    fail(
      `Native <button> elements must explicitly set type to avoid accidental form submits:\n${nativeButtonsMissingType.join("\n")}`,
    );
  }

  if (iconOnlyButtonsMissingAccessibleName.length > 0) {
    fail(
      `Icon-only native <button> elements must have an accessible name via visible text, aria-label, aria-labelledby, or title:\n${iconOnlyButtonsMissingAccessibleName.join("\n")}`,
    );
  }

  if (nativeFormsMissingSubmitHandler.length > 0) {
    fail(
      `Native <form> elements must handle onSubmit so Enter and button clicks use the same save/submit path:\n${nativeFormsMissingSubmitHandler.join("\n")}`,
    );
  }

  if (nativeFormControlsMissingAccessibleName.length > 0) {
    fail(
      `Native form controls must have an accessible name via wrapping <label>, label htmlFor/id, aria-label, or aria-labelledby:\n${nativeFormControlsMissingAccessibleName.join("\n")}`,
    );
  }

  if (targetBlankLinksMissingSafeRel.length > 0) {
    fail(
      `Native <a target="_blank"> links must include rel="noopener noreferrer":\n${targetBlankLinksMissingSafeRel.join("\n")}`,
    );
  }

  return {
    nativeButtonCount,
    nativeButtonsMissingType: nativeButtonsMissingType.length,
    iconOnlyButtonCount,
    iconOnlyButtonsMissingAccessibleName: iconOnlyButtonsMissingAccessibleName.length,
    nativeFormCount,
    nativeFormsMissingSubmitHandler: nativeFormsMissingSubmitHandler.length,
    nativeFormControlCount,
    nativeFormControlsMissingAccessibleName: nativeFormControlsMissingAccessibleName.length,
    targetBlankLinkCount,
    targetBlankLinksMissingSafeRel: targetBlankLinksMissingSafeRel.length,
  };
}

function hasSafeTargetBlankRel(node, sourceFile) {
  const relValue = getJsxAttributeStaticStringValue(node, "rel", sourceFile);

  if (!relValue) {
    return false;
  }

  const relTokens = new Set(relValue.split(/\s+/).filter(Boolean));

  return relTokens.has("noopener") && relTokens.has("noreferrer");
}

function hasButtonTextContent(node, sourceFile) {
  if (!ts.isJsxElement(node.parent)) {
    return false;
  }

  return node.parent.children.some((child) => hasTextualJsxContent(child, sourceFile));
}

function hasExplicitButtonAccessibleName(node) {
  return hasJsxAttribute(node, "aria-label") || hasJsxAttribute(node, "aria-labelledby") || hasJsxAttribute(node, "title");
}

function hasTextualJsxContent(node, sourceFile) {
  if (ts.isJsxText(node)) {
    return node.getText(sourceFile).trim().length > 0;
  }

  if (ts.isJsxExpression(node)) {
    return hasTextualExpression(node.expression);
  }

  if (ts.isJsxElement(node)) {
    const tagName = getJsxTagName(node.openingElement.tagName);

    if (!/^[a-z]/.test(tagName)) {
      return false;
    }

    return node.children.some((child) => hasTextualJsxContent(child, sourceFile));
  }

  return false;
}

function hasTextualExpression(expression) {
  if (!expression) {
    return false;
  }

  if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) {
    return expression.text.trim().length > 0;
  }

  if (ts.isTemplateExpression(expression)) {
    return true;
  }

  if (ts.isConditionalExpression(expression)) {
    return hasTextualExpression(expression.whenTrue) || hasTextualExpression(expression.whenFalse);
  }

  if (ts.isBinaryExpression(expression)) {
    return hasTextualExpression(expression.left) || hasTextualExpression(expression.right);
  }

  if (ts.isParenthesizedExpression(expression)) {
    return hasTextualExpression(expression.expression);
  }

  return (
    ts.isIdentifier(expression) ||
    ts.isPropertyAccessExpression(expression) ||
    ts.isCallExpression(expression)
  );
}

function collectLabelForValues(sourceFile) {
  const values = new Set();

  const visit = (node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tagName = getJsxTagName(node.tagName);

      if (tagName === "label") {
        const htmlForValue = getJsxAttributeValueKey(node, "htmlFor", sourceFile);

        if (htmlForValue) {
          values.add(htmlForValue);
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return values;
}

function hasAccessibleFormControlName(node, sourceFile, labelForValues) {
  if (hasJsxAttribute(node, "aria-label") || hasJsxAttribute(node, "aria-labelledby")) {
    return true;
  }

  if (hasAncestorLabel(node)) {
    return true;
  }

  const idValue = getJsxAttributeValueKey(node, "id", sourceFile);

  return Boolean(idValue && labelForValues.has(idValue));
}

function hasAncestorLabel(node) {
  let current = node.parent;

  while (current) {
    if (
      ts.isJsxElement(current) &&
      getJsxTagName(current.openingElement.tagName) === "label"
    ) {
      return true;
    }

    current = current.parent;
  }

  return false;
}

function isHiddenInput(node, sourceFile) {
  return (
    getJsxTagName(node.tagName) === "input" &&
    getJsxAttributeStaticStringValue(node, "type", sourceFile) === "hidden"
  );
}

function hasJsxAttribute(node, name) {
  return node.attributes.properties.some(
    (attribute) => ts.isJsxAttribute(attribute) && attribute.name.text === name,
  );
}

function getJsxAttributeValueKey(node, name, sourceFile) {
  const attribute = node.attributes.properties.find(
    (property) => ts.isJsxAttribute(property) && property.name.text === name,
  );

  if (!attribute || !ts.isJsxAttribute(attribute) || !attribute.initializer) {
    return null;
  }

  if (ts.isStringLiteral(attribute.initializer)) {
    return `string:${attribute.initializer.text}`;
  }

  if (ts.isJsxExpression(attribute.initializer) && attribute.initializer.expression) {
    return `expression:${attribute.initializer.expression.getText(sourceFile)}`;
  }

  return null;
}

function getJsxAttributeStaticStringValue(node, name, sourceFile) {
  const attribute = node.attributes.properties.find(
    (property) => ts.isJsxAttribute(property) && property.name.text === name,
  );

  if (!attribute || !ts.isJsxAttribute(attribute) || !attribute.initializer) {
    return null;
  }

  if (ts.isStringLiteral(attribute.initializer)) {
    return attribute.initializer.text;
  }

  if (ts.isJsxExpression(attribute.initializer) && attribute.initializer.expression) {
    const expression = attribute.initializer.expression;

    return ts.isStringLiteral(expression) ? expression.text : expression.getText(sourceFile);
  }

  return null;
}

function getJsxTagName(tagName) {
  if (ts.isIdentifier(tagName)) {
    return tagName.text;
  }

  if (ts.isThisTypeNode(tagName)) {
    return "this";
  }

  return tagName.getText();
}

const summary = {
  importGraph: auditImportGraph(),
  publicAssets: auditPublicAssets(),
  sourceHygiene: auditSourceHygiene(),
  seoFiles: auditSitemapAndRobots(),
  routeContract: auditRouteContract(),
  supabaseForms: auditSupabaseFunctionHardening(),
  envTemplates: auditEnvironmentTemplates(),
  documentation: auditDocumentationModelDrift(),
  projectContent: auditProjectContentModel(),
  packageManifest: auditPackageManifest(),
  uxGuardrails: auditUxGuardrails(),
  jsxGuardrails: auditJsxGuardrails(),
};

if (failures.length > 0) {
  console.error("Surface audit failed:\n");
  console.error(failures.join("\n\n"));
  process.exit(1);
}

console.log("Surface audit passed:");
console.log(JSON.stringify(summary, null, 2));
