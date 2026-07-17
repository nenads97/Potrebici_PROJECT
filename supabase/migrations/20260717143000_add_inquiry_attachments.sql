alter table public.contact_inquiries
  add column if not exists attachment_path text,
  add column if not exists attachment_name text,
  add column if not exists attachment_mime_type text,
  add column if not exists attachment_size_bytes bigint;

alter table public.land_offers
  add column if not exists attachment_path text,
  add column if not exists attachment_name text,
  add column if not exists attachment_mime_type text,
  add column if not exists attachment_size_bytes bigint;

alter table public.contact_inquiries
  drop constraint if exists contact_inquiries_attachment_fields_check;

alter table public.contact_inquiries
  add constraint contact_inquiries_attachment_fields_check check (
    (
      attachment_path is null
      and attachment_name is null
      and attachment_mime_type is null
      and attachment_size_bytes is null
    )
    or (
      attachment_path is not null
      and attachment_name is not null
      and attachment_mime_type is not null
      and attachment_size_bytes between 1 and 4194304
    )
  );

alter table public.land_offers
  drop constraint if exists land_offers_attachment_fields_check;

alter table public.land_offers
  add constraint land_offers_attachment_fields_check check (
    (
      attachment_path is null
      and attachment_name is null
      and attachment_mime_type is null
      and attachment_size_bytes is null
    )
    or (
      attachment_path is not null
      and attachment_name is not null
      and attachment_mime_type is not null
      and attachment_size_bytes between 1 and 4194304
    )
  );

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'inquiry-attachments',
  'inquiry-attachments',
  false,
  4194304,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ]::text[]
)
on conflict (id) do update set
  name = excluded.name,
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins can read inquiry attachments" on storage.objects;

create policy "Admins can read inquiry attachments"
on storage.objects for select
to authenticated
using (
  bucket_id = 'inquiry-attachments'
  and app_private.is_admin()
);
