# Supabase Setup

This folder contains the database setup for the Potrebici project.

Project:

```txt
kamwovkvhkurjvabbfks
https://kamwovkvhkurjvabbfks.supabase.co
```

## Files

- `schema.sql` - database schema, enums, tables, indexes, triggers, grants and RLS policies
- `seed.sql` - initial content for Heroja Pinkija 13, apartments, construction timeline, media metadata and the land acquisition page
- `advisor-remediation.sql` - manual, reviewed SQL plan for current Supabase
  advisor WARN/INFO cleanup; not a generated migration file

## Current access model

- Public visitors can read only published website content.
- Contact inquiries, land offers, email logs and rate-limit events are private.
- Form submissions should go through the backend/API layer so honeypot checks, server-side rate limiting and Brevo email sending can happen before database writes.
- Admin editing is restricted to users listed in `public.admin_profiles`.

## Apply to Supabase

The initial schema has been applied to the cloud project as migration:

```txt
20260522091421_initial_potrebici_schema
add_inquiry_attachments
```

The Supabase CLI is not installed in this workspace.

If the database ever needs to be recreated manually, run the SQL in the Supabase dashboard:

1. Open your Supabase project.
2. Go to SQL Editor.
3. Run `schema.sql`.
4. Run `seed.sql`.
5. Create one admin user in Supabase Auth.
6. Insert that user's ID into `public.admin_profiles`.

Example admin profile insert:

```sql
insert into public.admin_profiles (user_id, email)
values ('00000000-0000-0000-0000-000000000000', 'admin@example.com');
```

Replace the UUID with the real `auth.users.id`.

## Environment variables

Frontend public reads use the Vite variables in `../mim-invest-frontend/.env.example`:

```txt
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_TURNSTILE_SITE_KEY=
```

Backend/server-only Edge Function writes use the variables in `./.env.example`.
Never expose these in frontend code and never prefix them with `VITE_`:

```txt
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_SECRET_KEYS=
BREVO_API_KEY=
BREVO_SENDER_EMAIL=
BREVO_SENDER_NAME=
SALES_EMAIL=
MIM_SECRET_KEY_CAPTCHA=
TURNSTILE_ALLOWED_HOSTNAMES=
```

`SUPABASE_SERVICE_ROLE_KEY` is the legacy server-only key path. If the deployment
environment provides `SUPABASE_SECRET_KEYS`, the shared mail helper can read the
`default` key from that JSON bundle instead.

`SUPABASE_DB_URL` is only useful for manual SQL/CLI database operations. It is
not read by the Edge Functions in this repository.

Edge Functions first read Brevo/sales settings from Supabase secrets. The
schema also defines `public.email_service_settings` as a service-role fallback
for deployments that store email settings in the database. That table contains
secret material, so it intentionally has RLS enabled with no `anon` or
`authenticated` policies in v1. Do not grant browser/admin access to it unless a
separate admin secret-management flow is explicitly designed.

## Edge Functions and email

The public forms call these Edge Functions:

```txt
submit-contact-inquiry
submit-land-offer
```

The land-offer and contact inquiry forms use Cloudflare Turnstile. The browser
receives only the public site key; `submit-land-offer` and
`submit-contact-inquiry` verify the single-use token with Cloudflare before any
database write, and check the configured action and hostname. The existing
honeypot and rate-limit protections remain active as additional layers.

Each function validates the payload, checks the honeypot field, rate-limits repeated submissions by hashed e-mail and hashed IP/network bucket, inserts the record into the relevant table, sends Brevo confirmation/notification e-mails and writes `email_delivery_log` with `delivery_kind`.

### Inquiry attachments

Both public inquiry forms accept one optional document attachment. The server
accepts PDF, DOC, DOCX, JPG/JPEG and PNG files up to 4 MiB. The frontend checks
the same limit for immediate feedback, but the Edge Functions and the private
Storage bucket enforce it again.

Attachments are uploaded by the Edge Functions to the private
`inquiry-attachments` bucket only after honeypot, Turnstile, field validation
and rate-limit checks pass. The attachment metadata is stored alongside the
inquiry in `contact_inquiries` or `land_offers`. The sales notification email
contains the document as a Brevo attachment; the user confirmation email does
not echo the document back to the submitter.

Authenticated administrators can download the document from the admin panel
through a five-minute signed URL. The Storage bucket has no browser upload
policy, and its read policy is limited to users accepted by
`app_private.is_admin()`.

Create a Turnstile widget in Cloudflare and allow the production hostnames used by
the site. Configure the public site key in the frontend environment and the secret
key plus exact hostnames as Supabase Edge Function secrets. Never place
`MIM_SECRET_KEY_CAPTCHA` in a `VITE_` variable.

Deploy after setting secrets in the Supabase project:

```powershell
supabase secrets set SUPABASE_URL="https://kamwovkvhkurjvabbfks.supabase.co" SUPABASE_SERVICE_ROLE_KEY="..." BREVO_API_KEY="..." BREVO_SENDER_EMAIL="prodaja@mimgradnja.rs" BREVO_SENDER_NAME="M & M Gradnja" SALES_EMAIL="prodaja@mimgradnja.rs" MIM_SECRET_KEY_CAPTCHA="..." TURNSTILE_ALLOWED_HOSTNAMES="mimgradnja.rs,www.mimgradnja.rs"
supabase functions deploy submit-contact-inquiry --project-ref kamwovkvhkurjvabbfks
supabase functions deploy submit-land-offer --project-ref kamwovkvhkurjvabbfks
```

`supabase/config.toml` sets `verify_jwt = false` for both public form functions so anonymous visitors can submit forms while privileged database writes remain server-side through the function service credentials.

Pre-production checks:

- run an `OPTIONS` preflight check for both public form functions;
- send one controlled contact test and one controlled land-offer test only after
  confirming Brevo sender/domain settings;
- confirm rows are inserted into `contact_inquiries`, `land_offers`,
  `form_rate_limit_events` and `email_delivery_log`;
- confirm RLS still blocks direct anonymous reads from private lead/log tables.

Read-only smoke from the frontend folder:

```powershell
cd ..\mim-invest-frontend
npm.cmd run smoke:supabase:readonly
```

This uses only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from `.env.local`.
It checks public REST reads, private lead/log table blocking and public Edge
Function `OPTIONS` preflight. It intentionally does not send POST requests,
create rows or trigger Brevo email.

Before launch, use the stricter media-aware variant:

```powershell
cd ..\mim-invest-frontend
npm.cmd run smoke:supabase:launch
```

This is also read-only, but it fails if `project_media` has no published rows.
Use it after applying `seed.sql` or entering media metadata through admin.

For admin Auth/RLS regression checks, use an ignored local admin environment
instead of committing credentials:

```powershell
cd ..\mim-invest-frontend
$env:SUPABASE_ADMIN_EMAIL="admin@example.com"
$env:SUPABASE_ADMIN_PASSWORD="..."
npm.cmd run smoke:supabase:admin
```

This signs into Supabase Auth, confirms the user exists in `admin_profiles` and
reads protected admin tables through RLS. It intentionally stays outside
`npm.cmd run quality` because it needs real admin credentials.

The admin smoke is read-only unless controlled test lead selectors are provided
through local/ignored environment values and
`SUPABASE_ADMIN_SMOKE_PROCESS_TEST_LEADS="true"` is set. Use this only for
launch cleanup of known test rows, never for broad production lead updates.

Use `../docs/pre-production-runbook.md` for the complete launch order, including
the controlled POST tests that intentionally create rows and can trigger email.
That runbook contains exact PowerShell payload templates and SQL verification
queries for one contact inquiry and one land offer.

## Data API grants and future tables

`schema.sql` explicitly revokes broad Data API privileges, enables RLS on all
public tables, and then grants the minimum browser/admin access required by v1.
It also revokes default privileges for future `public` tables, functions and
sequences. When adding a new public table, include explicit `GRANT` statements
and matching RLS policies in the same change.

The `public-assets` bucket is public for direct object URLs, but `schema.sql`
does not add a broad anonymous `storage.objects` SELECT policy. Published file
metadata should flow through `public.project_media`; anonymous clients should
not be able to list the whole bucket catalogue.

Advisor follow-up from 2026-07-15:

- `public.set_updated_at()` should keep a stable `search_path = public, pg_temp`.
- `public.email_service_settings` is expected to show as RLS-enabled with no
  policies; this is intentional while the table is service-only.
- If the cloud project still has a broad `Public can read public assets`
  storage policy, remove it in a controlled migration after confirming admin
  uploads still use direct object URLs and `project_media` metadata.
- The `citext` extension currently exists in `public`; moving extensions to a
  dedicated schema should be planned as a separate migration because several
  columns use `citext`.

Use `advisor-remediation.sql` only as a reviewed operator script. It addresses
the low-risk SQL follow-up for `set_updated_at`, service-only email settings and
anonymous bucket listing. It intentionally does not move `citext` or change Auth
settings; leaked-password protection must be enabled in the Supabase Dashboard.

## Verification SQL

After setup, these queries should return data:

```sql
select slug, name from public.projects where is_published;
select code, area_m2, status from public.units order by sort_order limit 5;
select title, file_path from public.project_media where is_published order by sort_order limit 5;
select title from public.land_acquisition_page where is_published;
```

RLS check:

```sql
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'projects',
    'units',
    'contact_inquiries',
    'land_offers',
    'email_delivery_log'
  );
```
