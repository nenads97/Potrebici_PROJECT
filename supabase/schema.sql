-- Potrebici Project - Supabase schema
-- Run this SQL in the Supabase SQL editor or apply it as the initial database migration.

create extension if not exists "pgcrypto";
create extension if not exists "citext";

create schema if not exists app_private;

create type public.unit_type as enum (
  'apartment',
  'commercial_space',
  'business_apartment'
);

create type public.unit_status as enum (
  'available',
  'reserved',
  'sold'
);

create type public.price_display_mode as enum (
  'on_request',
  'hidden'
);

create type public.project_pdf_type as enum (
  'apartment_floor_plan',
  'building_floor_plan',
  'garage_plan',
  'storage_plan',
  'general_brochure'
);

create type public.timeline_state as enum (
  'done',
  'active',
  'upcoming'
);

create type public.contact_inquiry_type as enum (
  'general',
  'unit',
  'viewing',
  'availability'
);

create type public.email_related_entity_type as enum (
  'contact_inquiry',
  'land_offer'
);

create type public.email_delivery_kind as enum (
  'user_confirmation',
  'sales_notification'
);

create type public.email_delivery_status as enum (
  'pending',
  'sent',
  'failed'
);

create type public.admin_item_status as enum (
  'new',
  'contacted',
  'closed'
);

create type public.project_media_type as enum (
  'project_image',
  'unit_image',
  'apartment_floor_plan_pdf',
  'building_floor_plan_pdf',
  'garage_plan_pdf',
  'storage_plan_pdf',
  'general_brochure_pdf',
  'construction_update_image'
);

create table public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email citext not null unique,
  created_at timestamptz not null default now()
);

create table public.site_settings (
  id boolean primary key default true check (id),
  site_name text not null default 'M & M Gradnja',
  default_seo_title text,
  default_seo_description text,
  contact_phone text,
  contact_email citext,
  company_name text not null default 'M & M Gradnja',
  company_address text,
  footer_text text,
  social_links jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.email_service_settings (
  id boolean primary key default true check (id),
  brevo_api_key text not null,
  sender_email text not null default 'prodaja@mimgradnja.rs',
  sender_name text not null default 'M & M Gradnja',
  sales_email text not null default 'prodaja@mimgradnja.rs',
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  address text not null,
  city text not null,
  district text,
  project_status text not null default 'active' check (project_status in ('planned', 'active', 'completed', 'hidden')),
  status_label text,
  short_description text,
  full_description text,
  lead text,
  description text,
  location_description text,
  floor_structure text,
  construction_start_date date,
  construction_end_date date,
  total_apartments integer not null default 0 check (total_apartments >= 0),
  total_commercial_spaces integer not null default 0 check (total_commercial_spaces >= 0),
  total_business_apartments integer not null default 0 check (total_business_apartments >= 0),
  total_storage_units integer not null default 0 check (total_storage_units >= 0),
  total_garage_parking_spaces integer not null default 0 check (total_garage_parking_spaces >= 0),
  total_yard_parking_spaces integer not null default 0 check (total_yard_parking_spaces >= 0),
  hero_image_url text,
  gallery_images jsonb not null default '[]'::jsonb,
  seo_title text,
  seo_description text,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.units (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  code text not null,
  slug text not null,
  unit_type public.unit_type not null,
  floor_label text,
  floor_number integer,
  area_m2 numeric(8, 2) check (area_m2 is null or area_m2 > 0),
  room_structure text,
  status public.unit_status not null default 'available',
  orientation text,
  bathrooms text,
  terrace text,
  short_description text,
  full_description text,
  features jsonb not null default '[]'::jsonb,
  main_image_url text,
  gallery_images jsonb not null default '[]'::jsonb,
  floor_plan_pdf_url text,
  price_display_mode public.price_display_mode not null default 'on_request',
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint units_project_code_unique unique (project_id, code),
  constraint units_project_slug_unique unique (project_id, slug)
);

create table public.project_pdfs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  pdf_type public.project_pdf_type not null,
  file_url text not null,
  description text,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  unit_id uuid references public.units(id) on delete cascade,
  title text not null,
  media_type public.project_media_type not null,
  file_path text not null,
  alt_text text,
  description text,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  constraint project_media_owner_check check (project_id is not null or unit_id is not null)
);

create table public.construction_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  update_date date,
  tag text,
  title text not null,
  short_description text,
  image_gallery jsonb not null default '[]'::jsonb,
  status_label text,
  timeline_state public.timeline_state not null default 'upcoming',
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint construction_updates_project_title_unique unique (project_id, title)
);

create table public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_key text not null check (page_key in ('home', 'about', 'contact', 'land_acquisition')),
  section_key text not null,
  title text,
  subtitle text,
  body text,
  image_path text,
  items jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint page_sections_page_section_unique unique (page_key, section_key)
);

create table public.land_acquisition_page (
  id boolean primary key default true check (id),
  title text not null,
  slug text not null unique default 'kupujemo-placeve',
  hero_image_url text,
  intro_text text,
  criteria_items jsonb not null default '[]'::jsonb,
  process_steps jsonb not null default '[]'::jsonb,
  contact_cta_text text,
  seo_title text,
  seo_description text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  project_slug text,
  unit_code text,
  inquiry_type public.contact_inquiry_type not null default 'general',
  full_name text not null check (char_length(full_name) between 2 and 160),
  phone text check (phone is null or char_length(phone) <= 80),
  email citext not null,
  message text check (message is null or char_length(message) <= 4000),
  source_page text,
  consent_accepted boolean not null default false,
  admin_status public.admin_item_status not null default 'new',
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.land_offers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 160),
  phone text not null check (char_length(phone) between 5 and 80),
  email citext not null,
  property_address text,
  plot_area_m2 numeric(10, 2) check (plot_area_m2 is null or plot_area_m2 > 0),
  details text check (details is null or char_length(details) <= 5000),
  source_page text,
  consent_accepted boolean not null default false,
  admin_status public.admin_item_status not null default 'new',
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.email_delivery_log (
  id uuid primary key default gen_random_uuid(),
  related_entity_type public.email_related_entity_type not null,
  related_entity_id uuid,
  delivery_kind public.email_delivery_kind not null,
  recipient_email citext not null,
  subject text not null,
  provider text not null default 'brevo',
  provider_message_id text,
  status public.email_delivery_status not null default 'pending',
  error_message text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create table public.form_rate_limit_events (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  identifier_hash text not null,
  source_page text,
  created_at timestamptz not null default now()
);

create index projects_published_sort_idx
  on public.projects (is_published, sort_order, created_at desc);

create index units_project_status_idx
  on public.units (project_id, status, sort_order);

create index units_project_type_idx
  on public.units (project_id, unit_type, floor_number, sort_order);

create index project_pdfs_project_type_idx
  on public.project_pdfs (project_id, pdf_type, sort_order);

create index project_media_project_sort_idx
  on public.project_media (project_id, media_type, is_published, sort_order);

create index project_media_unit_sort_idx
  on public.project_media (unit_id, media_type, is_published, sort_order);

create index construction_updates_project_sort_idx
  on public.construction_updates (project_id, is_published, sort_order, update_date desc);

create index page_sections_lookup_idx
  on public.page_sections (page_key, section_key, is_published, sort_order);

create index contact_inquiries_created_idx
  on public.contact_inquiries (created_at desc);

create index land_offers_created_idx
  on public.land_offers (created_at desc);

create index email_delivery_log_related_idx
  on public.email_delivery_log (related_entity_type, related_entity_id, created_at desc);

create index form_rate_limit_events_lookup_idx
  on public.form_rate_limit_events (action, identifier_hash, created_at desc);

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

create trigger site_settings_set_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

create trigger email_service_settings_set_updated_at
before update on public.email_service_settings
for each row execute function public.set_updated_at();

create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create trigger units_set_updated_at
before update on public.units
for each row execute function public.set_updated_at();

create trigger project_pdfs_set_updated_at
before update on public.project_pdfs
for each row execute function public.set_updated_at();

create trigger page_sections_set_updated_at
before update on public.page_sections
for each row execute function public.set_updated_at();

create trigger construction_updates_set_updated_at
before update on public.construction_updates
for each row execute function public.set_updated_at();

create trigger land_acquisition_page_set_updated_at
before update on public.land_acquisition_page
for each row execute function public.set_updated_at();

create trigger contact_inquiries_set_updated_at
before update on public.contact_inquiries
for each row execute function public.set_updated_at();

create trigger land_offers_set_updated_at
before update on public.land_offers
for each row execute function public.set_updated_at();

create or replace function app_private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.admin_profiles
    where user_id = auth.uid()
  );
$$;

grant usage on schema app_private to authenticated;
grant execute on function app_private.is_admin() to authenticated;

-- Harden future public schema objects for Supabase Data API changes.
-- Every public table below still gets explicit grants and RLS policies; new
-- tables/functions must do the same instead of relying on platform defaults.
alter default privileges for role postgres in schema public
  revoke select, insert, update, delete on tables from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke execute on functions from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke usage, select on sequences from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke execute on functions from public;

alter table public.admin_profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.email_service_settings enable row level security;
alter table public.projects enable row level security;
alter table public.units enable row level security;
alter table public.project_pdfs enable row level security;
alter table public.project_media enable row level security;
alter table public.construction_updates enable row level security;
alter table public.page_sections enable row level security;
alter table public.land_acquisition_page enable row level security;
alter table public.contact_inquiries enable row level security;
alter table public.land_offers enable row level security;
alter table public.email_delivery_log enable row level security;
alter table public.form_rate_limit_events enable row level security;

revoke all on public.admin_profiles from anon, authenticated;
revoke all on public.site_settings from anon, authenticated;
revoke all on public.email_service_settings from anon, authenticated;
revoke all on public.projects from anon, authenticated;
revoke all on public.units from anon, authenticated;
revoke all on public.project_pdfs from anon, authenticated;
revoke all on public.project_media from anon, authenticated;
revoke all on public.construction_updates from anon, authenticated;
revoke all on public.page_sections from anon, authenticated;
revoke all on public.land_acquisition_page from anon, authenticated;
revoke all on public.contact_inquiries from anon, authenticated;
revoke all on public.land_offers from anon, authenticated;
revoke all on public.email_delivery_log from anon, authenticated;
revoke all on public.form_rate_limit_events from anon, authenticated;

grant select on public.site_settings to anon, authenticated;
grant select on public.projects to anon, authenticated;
grant select on public.units to anon, authenticated;
grant select on public.project_pdfs to anon, authenticated;
grant select on public.project_media to anon, authenticated;
grant select on public.construction_updates to anon, authenticated;
grant select on public.page_sections to anon, authenticated;
grant select on public.land_acquisition_page to anon, authenticated;

grant all on public.admin_profiles to authenticated, service_role;
grant all on public.site_settings to authenticated, service_role;
grant all on public.email_service_settings to service_role;
grant all on public.projects to authenticated, service_role;
grant all on public.units to authenticated, service_role;
grant all on public.project_pdfs to authenticated, service_role;
grant all on public.project_media to authenticated, service_role;
grant all on public.construction_updates to authenticated, service_role;
grant all on public.page_sections to authenticated, service_role;
grant all on public.land_acquisition_page to authenticated, service_role;
grant all on public.contact_inquiries to authenticated, service_role;
grant all on public.land_offers to authenticated, service_role;
grant all on public.email_delivery_log to authenticated, service_role;
grant all on public.form_rate_limit_events to authenticated, service_role;

create policy "Public can read site settings"
on public.site_settings for select
to anon, authenticated
using (true);

create policy "Admins can manage site settings"
on public.site_settings for all
to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());

create policy "Public can read published projects"
on public.projects for select
to anon, authenticated
using (is_published);

create policy "Admins can manage projects"
on public.projects for all
to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());

create policy "Public can read published units from published projects"
on public.units for select
to anon, authenticated
using (
  is_published
  and exists (
    select 1
    from public.projects
    where projects.id = units.project_id
      and projects.is_published
  )
);

create policy "Admins can manage units"
on public.units for all
to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());

create policy "Public can read published PDFs from published projects"
on public.project_pdfs for select
to anon, authenticated
using (
  is_published
  and exists (
    select 1
    from public.projects
    where projects.id = project_pdfs.project_id
      and projects.is_published
  )
);

create policy "Admins can manage project PDFs"
on public.project_pdfs for all
to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());

create policy "Public can read published project media"
on public.project_media for select
to anon, authenticated
using (
  is_published
  and (
    exists (
      select 1
      from public.projects
      where projects.id = project_media.project_id
        and projects.is_published
    )
    or exists (
      select 1
      from public.units
      join public.projects on projects.id = units.project_id
      where units.id = project_media.unit_id
        and units.is_published
        and projects.is_published
    )
  )
);

create policy "Admins can manage project media"
on public.project_media for all
to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());

create policy "Public can read published construction updates"
on public.construction_updates for select
to anon, authenticated
using (
  is_published
  and exists (
    select 1
    from public.projects
    where projects.id = construction_updates.project_id
      and projects.is_published
  )
);

create policy "Admins can manage construction updates"
on public.construction_updates for all
to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());

create policy "Public can read published page sections"
on public.page_sections for select
to anon, authenticated
using (is_published);

create policy "Admins can manage page sections"
on public.page_sections for all
to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());

create policy "Public can read published land acquisition page"
on public.land_acquisition_page for select
to anon, authenticated
using (is_published);

create policy "Admins can manage land acquisition page"
on public.land_acquisition_page for all
to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());

create policy "Admins can read admin profiles"
on public.admin_profiles for select
to authenticated
using (app_private.is_admin());

create policy "Admins can manage contact inquiries"
on public.contact_inquiries for all
to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());

create policy "Admins can manage land offers"
on public.land_offers for all
to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());

create policy "Admins can manage email delivery log"
on public.email_delivery_log for all
to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());

create policy "Admins can manage rate limit events"
on public.form_rate_limit_events for all
to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());

insert into storage.buckets (id, name, public)
values ('public-assets', 'public-assets', true)
on conflict (id) do update set public = excluded.public;

-- Public buckets serve object URLs without a broad storage.objects SELECT
-- policy. Avoid exposing a listable object catalogue to anonymous clients;
-- published file metadata is controlled through public.project_media.

create policy "Admins can upload public assets"
on storage.objects for insert
to authenticated
with check (bucket_id = 'public-assets' and app_private.is_admin());

create policy "Admins can update public assets"
on storage.objects for update
to authenticated
using (bucket_id = 'public-assets' and app_private.is_admin())
with check (bucket_id = 'public-assets' and app_private.is_admin());

create policy "Admins can delete public assets"
on storage.objects for delete
to authenticated
using (bucket_id = 'public-assets' and app_private.is_admin());
