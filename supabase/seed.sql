-- Potrebici Project - initial seed data
-- Safe to run after supabase/schema.sql. Adjust image/PDF URLs after assets are uploaded.

insert into public.site_settings (
  id,
  site_name,
  default_seo_title,
  default_seo_description,
  contact_phone,
  contact_email,
  company_name,
  footer_text
)
values (
  true,
  'M & M Gradnja',
  'M & M Gradnja - Heroja Pinkija 13',
  'Moderan stambeno-poslovni objekat na pocetku Telepa u Novom Sadu.',
  '064 227 9117',
  'prodaja@mimgradnja.rs',
  'M & M Gradnja',
  'Profesionalna prezentacija projekata, stanova i kontakt informacija.'
)
on conflict (id) do update set
  site_name = excluded.site_name,
  default_seo_title = excluded.default_seo_title,
  default_seo_description = excluded.default_seo_description,
  contact_phone = excluded.contact_phone,
  contact_email = excluded.contact_email,
  company_name = excluded.company_name,
  footer_text = excluded.footer_text;

insert into public.projects (
  slug,
  name,
  address,
  city,
  district,
  status_label,
  short_description,
  full_description,
  lead,
  description,
  location_description,
  floor_structure,
  construction_start_date,
  construction_end_date,
  total_apartments,
  total_commercial_spaces,
  total_business_apartments,
  total_storage_units,
  total_garage_parking_spaces,
  total_yard_parking_spaces,
  seo_title,
  seo_description,
  sort_order,
  is_published
)
values (
  'heroja-pinkija-13',
  'Heroja Pinkija 13',
  'Heroja Pinkija 13',
  'Novi Sad',
  'Telep',
  'Izgradnja u toku',
  'Moderan stambeno-poslovni objekat na pocetku Telepa, osmisljen za miran zivot uz brzu vezu sa gradom.',
  'Projekat M & M Gradnja objedinjuje stanove, poslovne apartmane, lokale, garazna i dvorisna parking mesta, uz jasan prodajni pregled dostupnih jedinica.',
  'Moderan stambeno-poslovni objekat na pocetku Telepa, osmisljen za miran zivot uz brzu vezu sa gradom.',
  'Projekat M & M Gradnja objedinjuje stanove, poslovne apartmane, lokale, garazna i dvorisna parking mesta, uz jasan prodajni pregled dostupnih jedinica.',
  'Pocetak Telepa je praktican izbor za kupce koji zele mirniji stambeni ambijent, ali i brzu vezu sa centrom, skolama, trgovinom i rekreativnim zonama uz Dunav.',
  'PO + P + 3',
  date '2026-03-16',
  date '2027-11-15',
  15,
  2,
  3,
  15,
  13,
  10,
  'Heroja Pinkija 13 - M & M Gradnja',
  'Stanovi, poslovni apartmani i lokali u objektu Heroja Pinkija 13 u Novom Sadu.',
  1,
  true
)
on conflict (slug) do update set
  name = excluded.name,
  address = excluded.address,
  city = excluded.city,
  district = excluded.district,
  status_label = excluded.status_label,
  short_description = excluded.short_description,
  full_description = excluded.full_description,
  lead = excluded.lead,
  description = excluded.description,
  location_description = excluded.location_description,
  floor_structure = excluded.floor_structure,
  construction_start_date = excluded.construction_start_date,
  construction_end_date = excluded.construction_end_date,
  total_apartments = excluded.total_apartments,
  total_commercial_spaces = excluded.total_commercial_spaces,
  total_business_apartments = excluded.total_business_apartments,
  total_storage_units = excluded.total_storage_units,
  total_garage_parking_spaces = excluded.total_garage_parking_spaces,
  total_yard_parking_spaces = excluded.total_yard_parking_spaces,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  sort_order = excluded.sort_order,
  is_published = excluded.is_published;

with project as (
  select id from public.projects where slug = 'heroja-pinkija-13'
),
unit_rows as (
  select *
  from (values
    ('1',  'stan-1',  1, '1. etaza', 62.15, 'Dvoiposoban', '2 kupatila', 'Terasa', 'Veci stan sa dva kupatila, pogodan za porodicu.'),
    ('2',  'stan-2',  1, '1. etaza', 58.26, 'Dvoiposoban', '2 kupatila', 'Terasa', 'Dvoiposoban stan sa dobrim odnosom komfora i kvadrature.'),
    ('3',  'stan-3',  1, '1. etaza', 28.55, 'Garsonjera', '1 kupatilo', 'Bez terase', 'Kompaktan stan i jedini tip bez terase.'),
    ('4',  'stan-4',  1, '1. etaza', 46.95, 'Jednoiposoban', '1 kupatilo', 'Terasa', 'Praktican jednoiposoban stan sa terasom.'),
    ('5',  'stan-5',  1, '1. etaza', 42.57, 'Jednoiposoban', '1 kupatilo', 'Terasa', 'Manji jednoiposoban stan sa jasnim rasporedom.'),
    ('6',  'stan-6',  2, '2. etaza', 60.29, 'Dvoiposoban', '2 kupatila', 'Terasa', 'Veci stan sa dva kupatila, pogodan za porodicu.'),
    ('7',  'stan-7',  2, '2. etaza', 56.50, 'Dvoiposoban', '2 kupatila', 'Terasa', 'Dvoiposoban stan sa dobrim odnosom komfora i kvadrature.'),
    ('8',  'stan-8',  2, '2. etaza', 27.69, 'Garsonjera', '1 kupatilo', 'Bez terase', 'Kompaktan stan i jedini tip bez terase.'),
    ('9',  'stan-9',  2, '2. etaza', 45.54, 'Jednoiposoban', '1 kupatilo', 'Terasa', 'Praktican jednoiposoban stan sa terasom.'),
    ('10', 'stan-10', 2, '2. etaza', 41.29, 'Jednoiposoban', '1 kupatilo', 'Terasa', 'Manji jednoiposoban stan sa jasnim rasporedom.'),
    ('11', 'stan-11', 3, '3. etaza', 60.29, 'Dvoiposoban', '2 kupatila', 'Terasa', 'Veci stan sa dva kupatila, pogodan za porodicu.'),
    ('12', 'stan-12', 3, '3. etaza', 56.50, 'Dvoiposoban', '2 kupatila', 'Terasa', 'Dvoiposoban stan sa dobrim odnosom komfora i kvadrature.'),
    ('13', 'stan-13', 3, '3. etaza', 27.69, 'Garsonjera', '1 kupatilo', 'Bez terase', 'Kompaktan stan i jedini tip bez terase.'),
    ('14', 'stan-14', 3, '3. etaza', 45.54, 'Jednoiposoban', '1 kupatilo', 'Terasa', 'Praktican jednoiposoban stan sa terasom.'),
    ('15', 'stan-15', 3, '3. etaza', 41.29, 'Jednoiposoban', '1 kupatilo', 'Terasa', 'Manji jednoiposoban stan sa jasnim rasporedom.')
  ) as rows(code, slug, floor_number, floor_label, area_m2, room_structure, bathrooms, terrace, short_description)
)
insert into public.units (
  project_id,
  code,
  slug,
  unit_type,
  floor_label,
  floor_number,
  area_m2,
  room_structure,
  status,
  orientation,
  bathrooms,
  terrace,
  short_description,
  full_description,
  features,
  price_display_mode,
  sort_order,
  is_published
)
select
  project.id,
  unit_rows.code,
  unit_rows.slug,
  'apartment'::public.unit_type,
  unit_rows.floor_label,
  unit_rows.floor_number,
  unit_rows.area_m2,
  unit_rows.room_structure,
  'available'::public.unit_status,
  'Prema prodajnoj dokumentaciji',
  unit_rows.bathrooms,
  unit_rows.terrace,
  unit_rows.short_description,
  'Prodaja stanova je pocela. Za cenu, uslove kupovine i tacan status kontaktirajte prodaju.',
  '["Podno grejanje", "Lift od podzemne garaze do svih spratova", "Mogucnost kupovine garaznog mesta", "Ostava dostupna uz stan"]'::jsonb,
  'on_request'::public.price_display_mode,
  unit_rows.code::integer,
  true
from project, unit_rows
on conflict (project_id, code) do update set
  slug = excluded.slug,
  floor_label = excluded.floor_label,
  floor_number = excluded.floor_number,
  area_m2 = excluded.area_m2,
  room_structure = excluded.room_structure,
  bathrooms = excluded.bathrooms,
  terrace = excluded.terrace,
  short_description = excluded.short_description,
  full_description = excluded.full_description,
  features = excluded.features,
  sort_order = excluded.sort_order,
  is_published = excluded.is_published;

with project as (
  select id from public.projects where slug = 'heroja-pinkija-13'
)
insert into public.construction_updates (
  project_id,
  tag,
  title,
  short_description,
  status_label,
  timeline_state,
  sort_order,
  is_published
)
select project.id, tag, title, short_description, status_label, timeline_state::public.timeline_state, sort_order, true
from project,
(values
  ('Gradiliste', 'Objekat je u fazi izgradnje', 'Pregled projekta je pripremljen za redovno objavljivanje novih informacija, fotografija i statusa radova.', 'Aktuelno', 'active', 1),
  ('Stanovi', 'Prodaja stanova je pocela', 'U ponudi je 15 stanova sa ponavljajucim rasporedima po etazama i jasnim kontaktom za svaki upit.', 'Prodaja', 'active', 2),
  ('Plan', 'Planirani zavrsetak je 15. novembar 2027.', 'Timeline prikazuje najvaznije faze gradnje i daje kupcima jednostavan pregled razvoja projekta.', 'Rok', 'upcoming', 3)
) as rows(tag, title, short_description, status_label, timeline_state, sort_order)
on conflict (project_id, title) do update set
  tag = excluded.tag,
  short_description = excluded.short_description,
  status_label = excluded.status_label,
  timeline_state = excluded.timeline_state,
  sort_order = excluded.sort_order,
  is_published = excluded.is_published;

insert into public.land_acquisition_page (
  id,
  title,
  slug,
  hero_image_url,
  intro_text,
  criteria_items,
  process_steps,
  contact_cta_text,
  seo_title,
  seo_description,
  is_published
)
values (
  true,
  'Kupujemo placeve',
  'kupujemo-placeve',
  '/images/kupovina-placeva-hero.png',
  'M & M Gradnja razmatra atraktivne lokacije za buduce stambene projekte.',
  '["Plac ili kuca za rusenje", "Novi Sad i bliza okolina", "Stambena namena", "Pravno cista situacija"]'::jsonb,
  '["Posaljite osnovne podatke o parceli, kuci ili lokaciji.", "Nas tim proverava potencijal lokacije i kontaktira vas za dodatne informacije.", "Dogovaramo sledeci korak, procenu i uslove saradnje."]'::jsonb,
  'Posaljite ponudu',
  'Kupujemo placeve - M & M Gradnja',
  'Posaljite ponudu za plac ili kucu pogodnu za buducu stambenu izgradnju.',
  true
)
on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug,
  hero_image_url = excluded.hero_image_url,
  intro_text = excluded.intro_text,
  criteria_items = excluded.criteria_items,
  process_steps = excluded.process_steps,
  contact_cta_text = excluded.contact_cta_text,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  is_published = excluded.is_published;
