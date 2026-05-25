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
id uuid pk
site_name text
default_seo_title text
default_seo_description text
contact_phone text
contact_email text
company_name text
company_address text
footer_text text
social_links jsonb
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
short_description text
full_description text
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
hero_image_path text
seo_title text
seo_description text
sort_order int
is_published boolean
created_at timestamptz
updated_at timestamptz
```

### units

Apartments, commercial spaces, business apartments. Do not list every parking/storage unit publicly in v1.

Essential columns:

```txt
id uuid pk
project_id uuid fk projects.id
unit_code text
slug text
unit_type text -- apartment|commercial_space|business_apartment
floor_label text
floor_number int
area_m2 numeric
room_structure text
status text -- available|reserved|sold
orientation text
bathrooms int
terrace text
short_description text
full_description text
features jsonb
main_image_path text
floor_plan_pdf_path text
price_display_mode text -- default on_request
sort_order int
is_featured boolean
is_published boolean
seo_title text
seo_description text
created_at timestamptz
updated_at timestamptz
unique(project_id, unit_code)
unique(project_id, slug)
```

### project_media

Metadata for files in Supabase Storage.

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
title text
short_description text
status_label text
sort_order int
is_published boolean
created_at timestamptz
updated_at timestamptz
```

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
updated_at timestamptz
unique(page_key, section_key)
```

## Operational tables

### contact_inquiries

Buyer/contact/apartment inquiries.

```txt
id uuid pk
project_id uuid nullable fk
unit_id uuid nullable fk
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
recipient_email text
subject text
provider text -- brevo default
provider_message_id text
status text -- pending|sent|failed
error_message text
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
- apply rate limiting or abuse protection
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

Only public reads should happen in the browser. Service role keys, Brevo keys and direct database URLs must stay server-side only.
