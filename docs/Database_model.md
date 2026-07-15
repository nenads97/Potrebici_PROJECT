# DATABASE_MODEL.md

## AI context

Use Supabase as the only backend platform in v1. Keep schema small. Public content can start as local TS data, then migrate to these tables.

Database setup files live in:

```txt
supabase/schema.sql
supabase/seed.sql
supabase/README.md
```

Run `schema.sql` first, then `seed.sql`.

## Backend responsibilities

- PostgreSQL stores projects, units, content, inquiries, land offers, email logs.
- Supabase Auth protects `/admin`.
- Supabase Storage stores images and PDFs.
- Edge Functions handle forms, validation, spam checks, inserts, email sending.
- RLS must be enabled on every exposed table.
- Public visitors read only published public data.
- Admin reads/writes after auth.
- Service role key and email API keys only inside Edge Functions.

## Core tables

### site_settings

Global settings: site name, SEO defaults, phone, email, company name/address, footer text, social links.

Essential columns:

```txt
id boolean pk default true
site_name text
default_seo_title text
default_seo_description text
contact_phone text
contact_email text
company_name text
company_address text
footer_text text
social_links jsonb
created_at timestamptz
updated_at timestamptz
```

### email_service_settings

Server-only fallback settings for outgoing email. Edge Functions should prefer
Supabase secrets (`BREVO_API_KEY`, sender values and `SALES_EMAIL`), but this
table exists as an operational fallback when email configuration is stored in
the database.

This table contains secret material and must stay service-only:

- RLS enabled;
- no `anon` or `authenticated` grants;
- no public/admin RLS policies in v1;
- service-role Edge Functions may read it.

Essential columns:

```txt
id boolean pk default true
brevo_api_key text
sender_email text
sender_name text
sales_email text
updated_at timestamptz
```

### projects

One row per project. First project is `heroja-pinkija-13`.

Essential columns:

```txt
id uuid pk
name text
slug text unique
address text
city text
district text
status_label text
short_description text
full_description text
lead text
description text
location_description text
floor_structure text
construction_start_date date
construction_end_date date
project_status text -- planned|active|completed|hidden
total_apartments int
total_commercial_spaces int
total_business_apartments int
total_storage_units int
total_garage_parking_spaces int
total_yard_parking_spaces int
hero_image_url text
gallery_images jsonb
seo_title text
seo_description text
sort_order int
is_published boolean
created_at timestamptz
updated_at timestamptz
```

`total_storage_units` and `total_garage_parking_spaces` are inventory counts only.
Storage units and garage parking spaces are separate paid options and must not be
presented as included apartment features.

Frontend v1 now reads the public "O projektu" basics from `projects` when Supabase is configured:
`name`, `address`, `city`, `district`, `status_label`, `short_description`,
`full_description`, `location_description`, `floor_structure`, construction dates,
`hero_image_url` and SEO fields. Detailed benefits, parking/storage copy and advanced timeline
content still need a dedicated editable-section model before they become fully CMS-driven.

### units

Apartments, commercial spaces, business apartments. Do not list every parking/storage unit publicly in v1.
When unit copy references parking/storage availability, phrase it as separate purchase.

Essential columns:

```txt
id uuid pk
project_id uuid fk projects.id
code text
slug text
unit_type text -- apartment|commercial_space|business_apartment
floor_label text
floor_number int
area_m2 numeric
room_structure text
status text -- available|reserved|sold
orientation text
bathrooms text
terrace text
short_description text
full_description text
features jsonb
main_image_url text
gallery_images jsonb
floor_plan_pdf_url text
price_display_mode text -- default on_request
sort_order int
is_featured boolean
is_published boolean
seo_title text
seo_description text
created_at timestamptz
updated_at timestamptz
unique(project_id, code)
unique(project_id, slug)
```

Napomena: operational `contact_inquiries.unit_code` cuva tekstualni kod koji je kupac poslao
u upitu, dok je kanonska kolona na inventaru stanova `units.code`.

### project_pdfs

Legacy metadata za PDF fajlove projekta. Novi admin tok favorizuje `project_media`,
ali tabela i dalje postoji u SQL modelu za odvojene PDF planove i brosure.

Essential columns:

```txt
id uuid pk
project_id uuid fk projects.id
title text
pdf_type text -- apartment_floor_plan|building_floor_plan|garage_plan|storage_plan|general_brochure
file_url text
description text
sort_order int
is_published boolean
created_at timestamptz
updated_at timestamptz
```

### project_media

Metadata for files in Supabase Storage.

Current seed data includes:

- project photos for Heroja Pinkija 13;
- a construction update image;
- showcase floor-plan images used on apartment-offer cards;
- per-apartment floor-plan images used on apartment detail pages;
- comparison floor-plan images used beside the room grid where available.

Essential columns:

```txt
id uuid pk
project_id uuid nullable fk
unit_id uuid nullable fk
title text
media_type text
file_path text
alt_text text
description text
sort_order int
is_published boolean
created_at timestamptz
```

`project_media` mora imati bar jednog vlasnika: `project_id` ili `unit_id`.
U v1 se razlicite namene slike razlikuju kroz `unit_id`, `sort_order`, `title`
i `description`; eksplicitno `usage`/`variant` polje je namerno ostavljeno za
kasniji napredniji media model.

`media_type` values:

```txt
project_image
unit_image
apartment_floor_plan_pdf
building_floor_plan_pdf
garage_plan_pdf
storage_plan_pdf
general_brochure_pdf
construction_update_image
```

### construction_updates

Timeline/progress data.

Essential columns:

```txt
id uuid pk
project_id uuid fk
update_date date
tag text
title text
short_description text
image_gallery jsonb
status_label text
timeline_state text -- done|active|upcoming
sort_order int
is_published boolean
created_at timestamptz
updated_at timestamptz
```

Frontend v1 sada cita `construction_updates` za javni timeline projekta kada je Supabase
konfigurisan. Admin panel uredjuje `title`, `tag`, `status_label`,
`short_description`, `update_date`, `timeline_state`, `sort_order` i `is_published`.

### page_sections

Small editable blocks for home/contact/land pages.

Essential columns:

```txt
id uuid pk
page_key text -- home|about|contact|land_acquisition
section_key text
title text
subtitle text
body text
image_path text
items jsonb
sort_order int
is_published boolean
created_at timestamptz
updated_at timestamptz
unique(page_key, section_key)
```

### land_acquisition_page

Jedan editable blok za javnu stranicu `/kupujemo-placeve`. Trenutni frontend
jos koristi kod/fallback za vecinu land copy-ja, ali SQL model vec predvidja
posebnu tabelu za kasniju kontrolu ove stranice bez uvodjenja odvojenog CMS-a.

Essential columns:

```txt
id boolean pk default true
title text
slug text unique
hero_image_url text
intro_text text
criteria_items jsonb
process_steps jsonb
contact_cta_text text
seo_title text
seo_description text
is_published boolean
created_at timestamptz
updated_at timestamptz
```

## Operational tables

### contact_inquiries

Buyer/contact/apartment inquiries.

```txt
id uuid pk
project_slug text
unit_code text
inquiry_type text -- general|unit|viewing|availability
full_name text
phone text
email text
message text
source_page text
consent_accepted boolean
admin_status text -- new|contacted|closed
admin_note text
created_at timestamptz
updated_at timestamptz
```

### land_offers

Offers from land/old-house owners.

```txt
id uuid pk
full_name text
phone text
email text
property_address text
plot_area_m2 numeric
details text
source_page text
consent_accepted boolean
admin_status text -- new|contacted|closed
admin_note text
created_at timestamptz
updated_at timestamptz
```

### email_delivery_log

Audit log for outgoing emails.

```txt
id uuid pk
related_entity_type text
related_entity_id uuid
delivery_kind text -- user_confirmation|sales_notification
recipient_email text
subject text
provider text -- brevo default
provider_message_id text
status text -- pending|sent|failed
error_message text
created_at timestamptz
sent_at timestamptz
```

### form_rate_limit_events

Lightweight abuse-protection log for public form submissions. The Edge Functions store
hashes only; raw email/IP values are not persisted in this table.

```txt
id uuid pk
action text -- submit-contact-inquiry:email|submit-contact-inquiry:ip|submit-land-offer:email|submit-land-offer:ip
identifier_hash text -- sha256 hash of normalized email or client network identifier
source_page text
created_at timestamptz
```

## Edge Functions

Required:

```txt
submit-contact-inquiry
submit-land-offer
```

Each function must:

- validate required fields
- validate email/phone/text lengths
- check honeypot
- apply email-hash and IP-hash rate limiting
- insert DB record
- send confirmation email
- send sales notification email
- write `email_delivery_log`

## Security notes

- Enable RLS on all public schema tables.
- Anonymous users can read only `is_published = true` content.
- Anonymous users should submit forms through Edge Functions.
- Admin writes require Supabase Auth.
- Public Storage bucket is acceptable for sales images/PDFs.
- Use signed URLs later if private files become necessary.

## Frontend connection

The frontend uses:

```txt
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

The typed Supabase client is located at:

```txt
mim-invest-frontend/src/shared/supabase/client.ts
mim-invest-frontend/src/shared/supabase/database.types.ts
```

`client.ts` uses `createClient<Database>(...)`, so frontend Supabase calls are checked against the local table and column model. When the SQL schema changes, regenerate or update `database.types.ts` in the same change so admin/public queries do not silently drift from the database.

Only public reads should happen in the browser. Service role keys, Brevo keys and direct database URLs must stay server-side only.
