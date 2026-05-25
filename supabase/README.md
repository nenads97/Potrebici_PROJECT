# Supabase Setup

This folder contains the database setup for the Potrebici project.

Project:

```txt
kamwovkvhkurjvabbfks
https://kamwovkvhkurjvabbfks.supabase.co
```

## Files

- `schema.sql` - database schema, enums, tables, indexes, triggers, grants and RLS policies
- `seed.sql` - initial content for Heroja Pinkija 13, apartments and the land acquisition page

## Current access model

- Public visitors can read only published website content.
- Contact inquiries, land offers, email logs and rate-limit events are private.
- Form submissions should go through the backend/API layer so honeypot checks, server-side rate limiting and Brevo email sending can happen before database writes.
- Admin editing is restricted to users listed in `public.admin_profiles`.

## Apply to Supabase

The initial schema has been applied to the cloud project as migration:

```txt
20260522091421_initial_potrebici_schema
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

Frontend public reads can use:

```txt
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Backend/server-only writes should use a service role key or a direct Postgres connection string. Never expose these in frontend code:

```txt
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_DB_URL=
BREVO_API_KEY=
BREVO_SENDER_EMAIL=
BREVO_SENDER_NAME=
SALES_EMAIL=
```

## Edge Functions and email

The public forms call these Edge Functions:

```txt
submit-contact-inquiry
submit-land-offer
```

Each function validates the payload, checks the honeypot field, rate-limits repeated submissions by hashed e-mail, inserts the record into the relevant table, sends Brevo confirmation/notification e-mails and writes `email_delivery_log`.

Deploy after setting secrets in the Supabase project:

```powershell
supabase secrets set BREVO_API_KEY="..." BREVO_SENDER_EMAIL="prodaja@mimgradnja.rs" BREVO_SENDER_NAME="M & M Gradnja" SALES_EMAIL="prodaja@mimgradnja.rs"
supabase functions deploy submit-contact-inquiry --project-ref kamwovkvhkurjvabbfks
supabase functions deploy submit-land-offer --project-ref kamwovkvhkurjvabbfks
```

`supabase/config.toml` sets `verify_jwt = false` for both public form functions so anonymous visitors can submit forms while privileged database writes remain server-side through the function service credentials.

## Verification SQL

After setup, these queries should return data:

```sql
select slug, name from public.projects where is_published;
select code, area_m2, status from public.units order by sort_order limit 5;
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
