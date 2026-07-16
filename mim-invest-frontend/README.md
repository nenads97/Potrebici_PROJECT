# MIM Invest Frontend

React, Vite, TypeScript, and SCSS frontend for the M & M Gradnja real estate website.

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
npm run audit:surface
npm run quality
npm run smoke:supabase:readonly
npm run smoke:supabase:launch
npm run smoke:supabase:admin
```

Run all commands from this `mim-invest-frontend` directory.

## Environment

Copy `.env.example` to `.env.local` and fill the public Supabase browser values:

```txt
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

These values are allowed in the browser. Do not add service role keys, Brevo keys,
or any other server-only secret to a `VITE_` variable.

If these values are missing or Supabase is slow, public apartment/project pages
still render local fallback content immediately. Supabase then refreshes data when
it is configured and responds in time.

## Quality gate

Before handing off a larger change, run:

```powershell
npm.cmd run quality
git diff --check
```

`quality` runs the surface audit, lint, production build and dependency audit.

If `.env.local` points to a real Supabase project, run the read-only Supabase
smoke check before production handoff:

```powershell
npm.cmd run smoke:supabase:readonly
```

It checks public REST reads, private lead/log table blocking and Edge Function
CORS preflight only. It does not submit forms, create database rows or send email.
For public tables, it reports exact REST counts separately from the 5-row sample
and fails if the published `units` inventory does not expose all 15 apartments.

Use the stricter launch variant when the cloud database should already contain
published media rows:

```powershell
npm.cmd run smoke:supabase:launch
```

This is still read-only, but it fails if `project_media` has no published rows.

When testing the protected admin flow, provide credentials only through your
shell or an ignored `.env.admin.local` file:

```powershell
$env:SUPABASE_ADMIN_EMAIL="admin@example.com"
$env:SUPABASE_ADMIN_PASSWORD="..."
npm.cmd run smoke:supabase:admin
```

This signs into Supabase Auth, verifies `admin_profiles`, and confirms protected
admin tables are readable. Never commit admin credentials.

If you need to prove that the admin flow can process existing controlled test
leads, use explicit test selectors and an explicit processing flag. This changes
only the matching test lead rows by setting their `admin_status` to `closed`:

```powershell
$env:SUPABASE_ADMIN_SMOKE_TEST_EMAIL="test+launch@mimgradnja.rs"
$env:SUPABASE_ADMIN_SMOKE_PROCESS_TEST_LEADS="true"
npm.cmd run smoke:supabase:admin
```

Alternatively, use ignored/local `SUPABASE_ADMIN_SMOKE_TEST_CONTACT_IDS` and
`SUPABASE_ADMIN_SMOKE_TEST_LAND_IDS` values when you want to target exact test
records. Do not commit credentials or real production lead identifiers.

## Structure

```txt
src/app/       App providers and routing
src/views/     Route-level pages and layouts
src/features/  Domain features, data, components, and types
src/shared/    Shared components and global styles
public/        Static public assets
```

Project documentation lives in `../docs`.
