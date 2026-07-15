# Potrebici Project

Real estate presentation website for M & M Gradnja projects in Novi Sad.

## Repository Structure

```txt
docs/                 Project, frontend, database, and design documentation
mim-invest-frontend/  React + Vite + TypeScript frontend application
```

The repository root is intentionally not a Node project. Frontend dependencies and scripts live inside `mim-invest-frontend`.

## Frontend

```powershell
cd mim-invest-frontend
npm install
Copy-Item .env.example .env.local
npm run dev
```

The current frontend stack requires Node.js 20.19 or newer.

Fill `mim-invest-frontend/.env.local` with the public Supabase browser values
before testing live Supabase data:

```txt
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Server-only values for Edge Functions live outside the Vite frontend and are
documented in `supabase/.env.example` and `supabase/README.md`.

## Useful Commands

```powershell
cd mim-invest-frontend
npm.cmd run quality
git diff --check
```

Optional production-readiness smoke when `mim-invest-frontend/.env.local` points
to the real Supabase project:

```powershell
cd mim-invest-frontend
npm.cmd run smoke:supabase:readonly
```

For the stricter launch check that also requires published `project_media` rows:

```powershell
cd mim-invest-frontend
npm.cmd run smoke:supabase:launch
```

Optional admin smoke, only with local/ignored admin credentials:

```powershell
cd mim-invest-frontend
$env:SUPABASE_ADMIN_EMAIL="admin@example.com"
$env:SUPABASE_ADMIN_PASSWORD="..."
npm.cmd run smoke:supabase:admin
```

This is read-only by default. For controlled launch cleanup, the same smoke can
close matching test leads only when explicit test selectors and
`SUPABASE_ADMIN_SMOKE_PROCESS_TEST_LEADS="true"` are set in the local shell.
Never commit admin credentials, production lead identifiers or any admin value
under a `VITE_` variable.

For the final launch sequence, follow [docs/pre-production-runbook.md](docs/pre-production-runbook.md).
