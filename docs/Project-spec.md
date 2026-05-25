# PROJECT_SPEC.md

## AI context

Real estate website for M & M Gradnja. First project: Heroja Pinkija 13, Novi Sad. Public site sells/presents units and collects inquiries. Admin panel is small and Serbian-language.

## Stack decision

- Frontend: React + Vite + TypeScript + SCSS.
- Backend platform: Supabase.
- Admin: React routes under `/admin`.
- Database: Supabase PostgreSQL.
- Auth: Supabase Auth.
- Files: Supabase Storage.
- Secure form/mail logic: Supabase Edge Functions.
- Email provider: Brevo by default.
- Do not add a separate backend/CMS layer in v1.

## Project facts

- Investor: Marko Potrebic, Milan Potrebic.
- Brand/company: M & M Gradnja.
- Address: Heroja Pinkija 13, Novi Sad.
- Area: beginning of Telep / Liman 5 context.
- Structure: PO + P + 3.
- Construction start: 2026-03-16.
- Planned completion: 2027-11-15.
- Basement: 15 storage units, 13 garage parking spaces.
- Yard: 10 outdoor parking spaces.
- Ground floor: 2 commercial spaces, 3 business apartments.
- Floors 1-3: 5 residential apartments per floor.
- Residential total: 15 apartments.
- Per residential floor: 1 studio, 2 two-bedroom, 2 three-bedroom.
- Prices: hidden publicly, show `Na upit`.

## Target users

- apartment buyers in Novi Sad.
- buyers interested in Telep/Liman 5.
- buyers interested in new construction.
- commercial/business unit buyers.
- land owners offering plots or old houses for future development.

## Primary actions

- Ask about a specific apartment/unit.
- Submit general project inquiry.
- Submit land/old-house offer.
- Call or contact investor.

## Public routes

- `/`
- `/projekti`
- `/projekti/heroja-pinkija-13`
- `/projekti/heroja-pinkija-13/ponuda-stanova`
- `/projekti/heroja-pinkija-13/spisak-stanova`
- `/kupujemo-placeve`
- `/kontakt`

## Public content sections

Home:

- hero
- projects/current construction preview
- apartment/project info preview
- land acquisition preview
- contact CTA

Project detail:

- hero/project overview
- key facts
- location
- building structure
- apartment availability
- PDFs/plans where useful
- CTA/contact

Apartments:

- filters by status and structure.
- later optionally floor filter.
- statuses: `available`, `reserved`, `sold`.
- structures: studio, two-bedroom, three-bedroom.

Land acquisition:

- explain that company buys plots/old houses.
- form fields: full name, phone, email, property address, plot area, details.

## Forms

Contact/apartment inquiry fields:

- full name
- phone
- email
- message
- selected project optional
- selected unit optional
- consent accepted

Land offer fields:

- full name
- phone
- email
- property address
- plot area m2
- details
- consent accepted

Form flow:

- React submits to Supabase Edge Function.
- Edge Function validates, checks honeypot/rate limit, inserts into database.
- Edge Function sends user confirmation and sales notification email.
- Edge Function logs email result.

## Admin v1

Admin is Serbian and task-focused.

Required:

- login
- view apartment/contact inquiries
- view land offers
- update inquiry/offer status: `new`, `contacted`, `closed`
- add admin note
- update apartment status
- update basic project/unit text
- manage images/PDF metadata and uploads

Not needed in v1:

- CRM conversations
- price history
- status history
- multiple roles
- individual public listing for each parking/storage unit
- full CMS workflows

## Design rules

- modern, warm, premium, calm, trustworthy.
- real estate presentation, not SaaS landing page.
- warm neutral palette, dark ink, subtle borders.
- CTAs visible but not aggressive.
- apartment cards must be scannable.
- no fake claims about visuals.
- mobile must avoid horizontal scroll and text overlap.
