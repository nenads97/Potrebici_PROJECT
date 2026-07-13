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
    ('1',  'stan-1',  1, '1. etaza', 62.15, 'Trosoban', '2 kupatila', 'Terasa', 'Veci stan sa dva kupatila, pogodan za porodicu.'),
    ('2',  'stan-2',  1, '1. etaza', 58.26, 'Trosoban', '2 kupatila', 'Terasa', 'Trosoban stan sa dobrim odnosom komfora i kvadrature.'),
    ('3',  'stan-3',  1, '1. etaza', 28.55, 'Garsonjera', '1 kupatilo', 'Bez terase', 'Kompaktan stan i jedini tip bez terase.'),
    ('4',  'stan-4',  1, '1. etaza', 46.95, 'Dvosoban', '1 kupatilo', 'Terasa', 'Praktican dvosoban stan sa terasom.'),
    ('5',  'stan-5',  1, '1. etaza', 42.57, 'Dvosoban', '1 kupatilo', 'Terasa', 'Manji dvosoban stan sa jasnim rasporedom.'),
    ('6',  'stan-6',  2, '2. etaza', 60.29, 'Trosoban', '2 kupatila', 'Terasa', 'Veci stan sa dva kupatila, pogodan za porodicu.'),
    ('7',  'stan-7',  2, '2. etaza', 56.50, 'Trosoban', '2 kupatila', 'Terasa', 'Trosoban stan sa dobrim odnosom komfora i kvadrature.'),
    ('8',  'stan-8',  2, '2. etaza', 27.69, 'Garsonjera', '1 kupatilo', 'Bez terase', 'Kompaktan stan i jedini tip bez terase.'),
    ('9',  'stan-9',  2, '2. etaza', 45.54, 'Dvosoban', '1 kupatilo', 'Terasa', 'Praktican dvosoban stan sa terasom.'),
    ('10', 'stan-10', 2, '2. etaza', 41.29, 'Dvosoban', '1 kupatilo', 'Terasa', 'Manji dvosoban stan sa jasnim rasporedom.'),
    ('11', 'stan-11', 3, '3. etaza', 60.29, 'Trosoban', '2 kupatila', 'Terasa', 'Veci stan sa dva kupatila, pogodan za porodicu.'),
    ('12', 'stan-12', 3, '3. etaza', 56.50, 'Trosoban', '2 kupatila', 'Terasa', 'Trosoban stan sa dobrim odnosom komfora i kvadrature.'),
    ('13', 'stan-13', 3, '3. etaza', 27.69, 'Garsonjera', '1 kupatilo', 'Bez terase', 'Kompaktan stan i jedini tip bez terase.'),
    ('14', 'stan-14', 3, '3. etaza', 45.54, 'Dvosoban', '1 kupatilo', 'Terasa', 'Praktican dvosoban stan sa terasom.'),
    ('15', 'stan-15', 3, '3. etaza', 41.29, 'Dvosoban', '1 kupatilo', 'Terasa', 'Manji dvosoban stan sa jasnim rasporedom.')
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
  '["Podno grejanje", "Lift od podzemne garaze do svih spratova", "Garazno mesto dostupno za odvojenu kupovinu", "Ostava dostupna za odvojenu kupovinu"]'::jsonb,
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
),
known_seed_paths(file_path) as (
  values
    ('/images/heroja-pinkija-13/gradilisna-tabla.jpg'),
    ('/images/heroja-pinkija-13/gradilisna-tabla-slika.jpg'),
    ('/images/heroja-pinkija-13/radovi-u-toku.jpg'),
    ('/images/apartment-plans/showcase-stan-1-6-11.png'),
    ('/images/apartment-plans/showcase-stan-2-7-12.png'),
    ('/images/apartment-plans/showcase-stan-3-8-13.png'),
    ('/images/apartment-plans/showcase-stan-4-9-14.png'),
    ('/images/apartment-plans/showcase-stan-5-10-15.png'),
    ('/images/apartment-plans/stan-1-6-11.png'),
    ('/images/apartment-plans/stan-1-6-11-comparison.png'),
    ('/images/apartment-plans/stan-2-7-12.png'),
    ('/images/apartment-plans/stan-3-8-13.png'),
    ('/images/apartment-plans/stan-4-9-14.png'),
    ('/images/apartment-plans/stan-5-10-15.png')
),
project_units as (
  select units.id
  from public.units
  join project on project.id = units.project_id
)
delete from public.project_media media
using known_seed_paths
where media.file_path = known_seed_paths.file_path
  and (
    media.project_id = (select id from project)
    or media.unit_id in (select id from project_units)
  );

with project as (
  select id from public.projects where slug = 'heroja-pinkija-13'
),
media_rows(unit_code, title, media_type, file_path, alt_text, description, sort_order, is_published) as (
  values
    (null, 'Heroja Pinkija 13 - gradilisna tabla', 'project_image'::public.project_media_type, '/images/heroja-pinkija-13/gradilisna-tabla.jpg', 'Gradilisna tabla projekta Heroja Pinkija 13', 'Hero slika na stranici projekta.', 1, true),
    (null, 'Heroja Pinkija 13 - detalj gradilisne table', 'project_image'::public.project_media_type, '/images/heroja-pinkija-13/gradilisna-tabla-slika.jpg', 'Detalj gradilisne table projekta Heroja Pinkija 13', 'Rezervna projektna fotografija za buduce sekcije.', 2, false),
    (null, 'Radovi u toku', 'construction_update_image'::public.project_media_type, '/images/heroja-pinkija-13/radovi-u-toku.jpg', 'Radovi u toku na projektu Heroja Pinkija 13', 'Slika za sekciju lokacije/statusa radova.', 3, true),
    ('1', 'Showcase tlocrt stanova 1, 6 i 11', 'unit_image'::public.project_media_type, '/images/apartment-plans/showcase-stan-1-6-11.png', 'Showcase tlocrt stanova 1, 6 i 11', 'Slika za karticu u sekciji Ponuda stanova na stranici projekta.', 11, true),
    ('2', 'Showcase tlocrt stanova 2, 7 i 12', 'unit_image'::public.project_media_type, '/images/apartment-plans/showcase-stan-2-7-12.png', 'Showcase tlocrt stanova 2, 7 i 12', 'Slika za karticu u sekciji Ponuda stanova na stranici projekta.', 12, true),
    ('3', 'Showcase tlocrt stanova 3, 8 i 13', 'unit_image'::public.project_media_type, '/images/apartment-plans/showcase-stan-3-8-13.png', 'Showcase tlocrt stanova 3, 8 i 13', 'Slika za karticu u sekciji Ponuda stanova na stranici projekta.', 13, true),
    ('4', 'Showcase tlocrt stanova 4, 9 i 14', 'unit_image'::public.project_media_type, '/images/apartment-plans/showcase-stan-4-9-14.png', 'Showcase tlocrt stanova 4, 9 i 14', 'Slika za karticu u sekciji Ponuda stanova na stranici projekta.', 14, true),
    ('5', 'Showcase tlocrt stanova 5, 10 i 15', 'unit_image'::public.project_media_type, '/images/apartment-plans/showcase-stan-5-10-15.png', 'Showcase tlocrt stanova 5, 10 i 15', 'Slika za karticu u sekciji Ponuda stanova na stranici projekta.', 15, true),
    ('1', 'Tlocrt stana 1', 'unit_image'::public.project_media_type, '/images/apartment-plans/stan-1-6-11.png', 'Tlocrt stana 1 u projektu Heroja Pinkija 13', 'Tlocrt za detalj stana i poredjenje prostorija.', 101, true),
    ('2', 'Tlocrt stana 2', 'unit_image'::public.project_media_type, '/images/apartment-plans/stan-2-7-12.png', 'Tlocrt stana 2 u projektu Heroja Pinkija 13', 'Tlocrt za detalj stana i poredjenje prostorija.', 102, true),
    ('3', 'Tlocrt stana 3', 'unit_image'::public.project_media_type, '/images/apartment-plans/stan-3-8-13.png', 'Tlocrt stana 3 u projektu Heroja Pinkija 13', 'Tlocrt za detalj stana i poredjenje prostorija.', 103, true),
    ('4', 'Tlocrt stana 4', 'unit_image'::public.project_media_type, '/images/apartment-plans/stan-4-9-14.png', 'Tlocrt stana 4 u projektu Heroja Pinkija 13', 'Tlocrt za detalj stana i poredjenje prostorija.', 104, true),
    ('5', 'Tlocrt stana 5', 'unit_image'::public.project_media_type, '/images/apartment-plans/stan-5-10-15.png', 'Tlocrt stana 5 u projektu Heroja Pinkija 13', 'Tlocrt za detalj stana i poredjenje prostorija.', 105, true),
    ('6', 'Tlocrt stana 6', 'unit_image'::public.project_media_type, '/images/apartment-plans/stan-1-6-11.png', 'Tlocrt stana 6 u projektu Heroja Pinkija 13', 'Tlocrt za detalj stana i poredjenje prostorija.', 106, true),
    ('7', 'Tlocrt stana 7', 'unit_image'::public.project_media_type, '/images/apartment-plans/stan-2-7-12.png', 'Tlocrt stana 7 u projektu Heroja Pinkija 13', 'Tlocrt za detalj stana i poredjenje prostorija.', 107, true),
    ('8', 'Tlocrt stana 8', 'unit_image'::public.project_media_type, '/images/apartment-plans/stan-3-8-13.png', 'Tlocrt stana 8 u projektu Heroja Pinkija 13', 'Tlocrt za detalj stana i poredjenje prostorija.', 108, true),
    ('9', 'Tlocrt stana 9', 'unit_image'::public.project_media_type, '/images/apartment-plans/stan-4-9-14.png', 'Tlocrt stana 9 u projektu Heroja Pinkija 13', 'Tlocrt za detalj stana i poredjenje prostorija.', 109, true),
    ('10', 'Tlocrt stana 10', 'unit_image'::public.project_media_type, '/images/apartment-plans/stan-5-10-15.png', 'Tlocrt stana 10 u projektu Heroja Pinkija 13', 'Tlocrt za detalj stana i poredjenje prostorija.', 110, true),
    ('11', 'Tlocrt stana 11', 'unit_image'::public.project_media_type, '/images/apartment-plans/stan-1-6-11.png', 'Tlocrt stana 11 u projektu Heroja Pinkija 13', 'Tlocrt za detalj stana i poredjenje prostorija.', 111, true),
    ('12', 'Tlocrt stana 12', 'unit_image'::public.project_media_type, '/images/apartment-plans/stan-2-7-12.png', 'Tlocrt stana 12 u projektu Heroja Pinkija 13', 'Tlocrt za detalj stana i poredjenje prostorija.', 112, true),
    ('13', 'Tlocrt stana 13', 'unit_image'::public.project_media_type, '/images/apartment-plans/stan-3-8-13.png', 'Tlocrt stana 13 u projektu Heroja Pinkija 13', 'Tlocrt za detalj stana i poredjenje prostorija.', 113, true),
    ('14', 'Tlocrt stana 14', 'unit_image'::public.project_media_type, '/images/apartment-plans/stan-4-9-14.png', 'Tlocrt stana 14 u projektu Heroja Pinkija 13', 'Tlocrt za detalj stana i poredjenje prostorija.', 114, true),
    ('15', 'Tlocrt stana 15', 'unit_image'::public.project_media_type, '/images/apartment-plans/stan-5-10-15.png', 'Tlocrt stana 15 u projektu Heroja Pinkija 13', 'Tlocrt za detalj stana i poredjenje prostorija.', 115, true),
    ('1', 'Projektni tlocrt stana 1 za poredjenje', 'unit_image'::public.project_media_type, '/images/apartment-plans/stan-1-6-11-comparison.png', 'Projektni tlocrt stana 1 za poredjenje sa gridom prostorija', 'Originalni projektni tlocrt koji se koristi pored grida prostorija.', 201, true),
    ('6', 'Projektni tlocrt stana 6 za poredjenje', 'unit_image'::public.project_media_type, '/images/apartment-plans/stan-1-6-11-comparison.png', 'Projektni tlocrt stana 6 za poredjenje sa gridom prostorija', 'Originalni projektni tlocrt koji se koristi pored grida prostorija.', 206, true),
    ('11', 'Projektni tlocrt stana 11 za poredjenje', 'unit_image'::public.project_media_type, '/images/apartment-plans/stan-1-6-11-comparison.png', 'Projektni tlocrt stana 11 za poredjenje sa gridom prostorija', 'Originalni projektni tlocrt koji se koristi pored grida prostorija.', 211, true)
)
insert into public.project_media (
  project_id,
  unit_id,
  title,
  media_type,
  file_path,
  alt_text,
  description,
  sort_order,
  is_published
)
select
  case when media_rows.unit_code is null then project.id else null end,
  units.id,
  media_rows.title,
  media_rows.media_type,
  media_rows.file_path,
  media_rows.alt_text,
  media_rows.description,
  media_rows.sort_order,
  media_rows.is_published
from media_rows
cross join project
left join public.units
  on units.project_id = project.id
  and units.code = media_rows.unit_code;

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
  '/images/kupovina-placeva-hero.jpg',
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
