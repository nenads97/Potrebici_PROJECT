-- Potrebici Project - Supabase advisor remediation plan
-- Date: 2026-07-15
--
-- Purpose:
--   Manual, controlled SQL for the current Supabase advisor WARN/INFO triage.
--   This is not a generated Supabase migration file. The CLI is not installed
--   in this workspace, so keep this file as an operator-run script until a real
--   migration can be generated/applied with the Supabase CLI or dashboard.
--
-- Before running:
--   1. Confirm a recent backup exists.
--   2. Confirm Edge Function secrets are configured and preferred over the
--      database fallback for Brevo/API keys.
--   3. Confirm public assets are referenced through public URLs and
--      public.project_media metadata, not by anonymous bucket listing.
--   4. Run this in a reviewed SQL session, then rerun:
--      - npm.cmd run smoke:supabase:readonly
--      - npm.cmd run smoke:supabase:launch
--      - npm.cmd run smoke:supabase:admin
--      - Supabase Security/Performance Advisors

begin;

-- 1. Security advisor: function_search_path_mutable on public.set_updated_at.
-- Keep the trigger helper invoker-safe and pin its lookup path.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2. Security advisor: service-only email settings table has RLS enabled but no
-- policies. That is intentional while the table contains secret material and is
-- read only by service-role Edge Functions. This block makes that intent
-- explicit and idempotent.
create table if not exists public.email_service_settings (
  id boolean primary key default true check (id),
  brevo_api_key text not null,
  sender_email text not null default 'prodaja@mimgradnja.rs',
  sender_name text not null default 'M & M Gradnja',
  sales_email text not null default 'prodaja@mimgradnja.rs',
  updated_at timestamptz not null default now()
);

alter table public.email_service_settings enable row level security;
revoke all on public.email_service_settings from anon, authenticated;
grant all on public.email_service_settings to service_role;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'email_service_settings_set_updated_at'
      and tgrelid = 'public.email_service_settings'::regclass
  ) then
    create trigger email_service_settings_set_updated_at
    before update on public.email_service_settings
    for each row execute function public.set_updated_at();
  end if;
end;
$$;

-- 3. Security advisor: public_bucket_allows_listing on public-assets.
-- Public buckets can serve direct object URLs; anonymous listing should flow
-- through public.project_media, not broad SELECT on storage.objects.
drop policy if exists "Public can read public assets" on storage.objects;

commit;

-- Verification queries after commit:
--
-- Function search_path:
-- select n.nspname as schema_name, p.proname, p.proconfig
-- from pg_proc p
-- join pg_namespace n on n.oid = p.pronamespace
-- where n.nspname = 'public'
--   and p.proname = 'set_updated_at';
--
-- Service-only email settings access model:
-- select schemaname, tablename, rowsecurity
-- from pg_tables
-- where schemaname = 'public'
--   and tablename = 'email_service_settings';
--
-- select schemaname, tablename, policyname, roles, cmd
-- from pg_policies
-- where schemaname = 'public'
--   and tablename = 'email_service_settings';
--
-- Public bucket listing policy removed:
-- select policyname, roles, cmd, qual
-- from pg_policies
-- where schemaname = 'storage'
--   and tablename = 'objects'
--   and policyname = 'Public can read public assets';
--
-- Dashboard-only follow-up:
--   Enable Supabase Auth leaked password protection in Auth settings if there
--   is no product reason to keep it disabled.
--
-- Deferred migration:
--   The citext extension currently lives in public. Move it to a dedicated
--   extensions schema only in a separate, tested migration because existing
--   columns depend on citext.
