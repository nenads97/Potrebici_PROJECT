# Pre-production runbook

Datum: 2026-07-10

Ovaj runbook je praktican redosled provera pre objave sajta. Namenjen je za poslednji prolaz kroz klijentski deo, admin panel i Supabase okruzenje bez ponovnog trazenja konteksta po audit dokumentima.

## Principi

- Ne menjati detalje stanova tokom ovog runbook-a. Detalji ostaju kako su bili u postojecem v1 obliku; proveravaju se samo zbog brzine ucitavanja, broken slika i osnovne funkcionalnosti.
- Prvo pokrenuti lokalne i read-only provere koje nemaju spoljne posledice.
- POST forme, Brevo email, deploy Edge Function-a i promene u Supabase projektu raditi tek kada postoji izricita odluka da se radi produkcioni test.
- Service role, Brevo i DB URL vrednosti nikada ne stavljati u frontend `.env.local` niti u `VITE_` promenljive.
- Ako provera padne, zabeleziti tacan izlaz komande i ne zaobilaziti guardrail brisanjem provere.

## 1. Lokalni kvalitet bez spoljnih posledica

Pokrenuti iz `mim-invest-frontend`:

```powershell
npm.cmd run quality
git diff --check
```

Ocekivani dokaz:

- `audit:surface` prolazi;
- lint prolazi;
- produkcioni build prolazi;
- `npm audit --audit-level=low` vraca 0 vulnerabilities;
- `git diff --check` nema stvarne whitespace greske, osim mogucih Windows LF -> CRLF upozorenja.

Sta ova provera pokriva:

- import graf i uklanjanje mrtvog koda;
- public asset reference;
- hard-reload interne linkove;
- alt tekst;
- privremene razvojne markere;
- sitemap/robots pravila;
- Supabase form rate-limit wiring;
- env template-e;
- package manifest sanity;
- UX guardrail-e za skip linkove, admin login i consent touch target.

## 2. Read-only Supabase smoke

Pokrenuti iz `mim-invest-frontend` samo kada `.env.local` sadrzi realne javne Supabase vrednosti:

```powershell
npm.cmd run smoke:supabase:readonly
```

Ocekivani dokaz:

- `projects` vraca bar 1 red;
- `units` vraca bar 1 red;
- `construction_updates` je dostupan preko REST-a;
- `project_media` je dostupan preko REST-a;
- privatne tabele `contact_inquiries`, `land_offers`, `email_delivery_log` i `form_rate_limit_events` nisu citljive preko anon key-a;
- `submit-contact-inquiry` i `submit-land-offer` vracaju uspesan `OPTIONS` preflight.

Trenutni poznati nalaz:

- cloud `project_media` je dostupan, ali vraca 0 redova. Pre produkcije treba uneti/seed-ovati media podatke ili potvrditi da javni sajt namerno koristi lokalne fallback slike za v1.

Kada ocekujemo da cloud baza ima objavljene media redove, pokrenuti strozi read-only launch smoke:

```powershell
npm.cmd run smoke:supabase:launch
```

Ova komanda ne salje forme i ne pravi upise, ali namerno pada ako `project_media`
nema nijedan objavljen red.

Zasto je ovo bitno:

- Supabase uvodi eksplicitnije Data API izlaganje tabela. Nove/public tabele ne treba pretpostaviti dostupnim bez stvarnog REST smoke-a.

## 3. Content i SEO sanity

Proveriti:

- finalni domen za `robots.txt`, `sitemap.xml` i canonical URL-ove;
- da li `https://mimgradnja.rs` ostaje finalni domen;
- sitemap sadrzi samo javne kanonske rute, bez `/admin` i bez legacy `/apartmani/`;
- admin login ima `noindex,nofollow`;
- 404 i pogresan detalj stana imaju `noindex,follow`;
- cene ostaju `Na upit`;
- garazna mesta i ostave su jasno odvojena kupovina;
- prvi projekat se komunicira transparentno, bez laznih portfolio tvrdnji.

## 4. Manual browser QA

Proci najmanje ove rute:

```txt
/
/projekti/heroja-pinkija-13/o-projektu
/projekti/heroja-pinkija-13/ponuda-stanova
/projekti/heroja-pinkija-13/ponuda-stanova/1
/projekti/heroja-pinkija-13/spisak-stanova
/o-nama
/politika-privatnosti
/lokacija
/kupujemo-placeve
/kontakt
/admin/prijava
```

Proveriti:

- nema blokirajuceg loading stanja;
- nema broken slika;
- nema horizontalnog overflow-a na desktopu i 390px mobilnom viewport-u;
- detalj stana ostaje u postojecem v1 izgledu; QA ovde ne otvara novi redesign, vec samo belezi eventualni bug ili performansni problem;
- header dropdown radi tastaturom i misem;
- mobilni hamburger pokazuje projektne podlinkove;
- zatvoren mobilni hamburger meni ne presrece klikove na CTA-jeve ispod sebe;
- kontakt modal otvara fokus u formi;
- Escape zatvara modal i vraca fokus na CTA;
- greske i success poruke imaju live-region ponasanje;
- consent checkbox moze da se aktivira klikom na tekst;
- admin login ima povezane label-e, skip link i brz timeout za sporu auth proveru.

Poslednji read-only runtime smoke iz browsera je uradjen 2026-07-10. Desktop i 390px mobilni prolaz nisu nasli broken slike, missing alt, horizontal overflow, error boundary, blokirajuci loading tekst ili console error-e. Ovo ne zamenjuje zavrsni rucni keyboard QA pre objave.

Interakcioni QA 2026-07-10 je dodatno proverio da javni dropdown `Projekti` zatvara Escape i vraca `aria-expanded=false`, kontakt modal fokusira ime i vraca fokus na CTA posle zatvaranja, tabelarni filter sprata smanjuje prikaz sa 15 na 5 redova i `Ponisti filtere` vraca sve filtere na `all`, a admin login ima ispravne email/lozinka labele i `aria-busy=false` u idle stanju.

## 5. Admin content readiness

U admin panelu proveriti:

- upiti za stanove i upiti za placeve imaju citljiv status, izvor i interne beleske;
- promena statusa stana se cuva i vidi u javnoj ponudi nakon osvezavanja Supabase podataka;
- projekat ima status label, opis, hero image, SEO title i SEO description;
- media panel ima objavljene slike sa alt tekstom;
- `project_media` u cloudu nije prazan ako se ocekuje da javni sajt cita slike iz Supabase-a;
- PDF/media brisanje ostaje dvokorak i ne brise Storage fajl slucajno.

## 6. Controlled POST testovi sa posledicama

Ovo ne raditi automatski. Potrebna je odluka da se naprave realni test upisi i potencijalno posalju emailovi.

Pre testa potvrditi:

- Brevo sender/domain podesavanja;
- `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`, `SALES_EMAIL`;
- `SUPABASE_URL` i server-only service/secret key za Edge Functions;
- prodajni email koji sme da primi test poruke;
- test telefon/email vrednosti koje je dozvoljeno poslati.

Kontrolisani testovi:

1. poslati jedan kontakt/upit za stan;
2. poslati jednu ponudu placa;
3. proveriti da su nastali redovi u `contact_inquiries` i `land_offers`;
4. proveriti da su nastali rate-limit dogadjaji u `form_rate_limit_events`;
5. proveriti `email_delivery_log` za user confirmation i sales notification;
6. proveriti da admin panel prikazuje nove leadove;
7. oznaciti test leadove kao zatvorene ili ih ocistiti po dogovoru.

### Predlozeni test payload-i

Ove komande su namerno zapisane kao sablon. Ne pokretati ih dok se ne potvrdi
da test sme da napravi realne redove i potencijalno posalje emailove.

Pre pokretanja u istom terminalu podesiti:

```powershell
$env:SUPABASE_URL="https://PROJECT_REF.supabase.co"
$testEmail="test+launch@mimgradnja.rs"
$testPhone="0600000000"
```

Kontakt/upit za stan:

```powershell
$contactPayload = @{
  fullName = "Launch Test Kupac"
  phone = $testPhone
  email = $testEmail
  inquiryType = "unit"
  projectSlug = "heroja-pinkija-13"
  unitCode = "1"
  sourcePage = "/projekti/heroja-pinkija-13/ponuda-stanova/1"
  message = "Kontrolisani produkcioni test kontakt forme. Zatvoriti/obrisati nakon provere."
  consentAccepted = $true
  website = ""
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri "$env:SUPABASE_URL/functions/v1/submit-contact-inquiry" `
  -ContentType "application/json" `
  -Body $contactPayload
```

Ponuda placa:

```powershell
$landPayload = @{
  fullName = "Launch Test Vlasnik"
  phone = $testPhone
  email = $testEmail
  propertyAddress = "Test adresa, Novi Sad"
  plotAreaM2 = 500
  sourcePage = "/kupujemo-placeve"
  details = "Kontrolisani produkcioni test forme za placeve. Zatvoriti/obrisati nakon provere."
  consentAccepted = $true
  website = ""
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri "$env:SUPABASE_URL/functions/v1/submit-land-offer" `
  -ContentType "application/json" `
  -Body $landPayload
```

Ocekivani API odgovor za oba testa:

```json
{ "ok": true, "id": "..." }
```

Ako API vrati `429`, rate-limit radi, ali test treba ponoviti kasnije sa istim
oprezom i zabeleziti da je prethodni pokusaj vec napravio rate-limit dogadjaje.

### SQL dokazi posle POST testova

Pokrenuti u Supabase SQL editoru ili preko sigurnog admin alata:

```sql
select id, inquiry_type, unit_code, full_name, email, source_page, admin_status, created_at
from public.contact_inquiries
where email = 'test+launch@mimgradnja.rs'
order by created_at desc
limit 5;

select id, full_name, email, property_address, plot_area_m2, source_page, admin_status, created_at
from public.land_offers
where email = 'test+launch@mimgradnja.rs'
order by created_at desc
limit 5;

select related_entity_type, delivery_kind, recipient_email, subject, status, created_at
from public.email_delivery_log
where recipient_email = 'test+launch@mimgradnja.rs'
   or subject ilike '%test%'
order by created_at desc
limit 20;

select action, source_page, created_at
from public.form_rate_limit_events
where source_page in (
  '/projekti/heroja-pinkija-13/ponuda-stanova/1',
  '/kupujemo-placeve'
)
order by created_at desc
limit 20;
```

Posle provere:

- proveriti da admin panel prikazuje oba test leada;
- proveriti da su emailovi stigli na test/prodajni inbox ili da su zabelezeni kao failed sa jasnim razlogom;
- oznaciti test leadove kao `closed` ili ih ocistiti po dogovoru;
- zabeleziti tacne ID-jeve test redova u launch beleznici.

## 7. Supabase security/advisor check

Ako je Supabase CLI dostupan, prvo proveriti verziju i komande kroz `--help`.

Po mogucnosti pokrenuti:

```powershell
supabase --version
supabase db --help
supabase db advisors --help
```

Ako projekat koristi Supabase MCP/advisors, proveriti:

- RLS je ukljucen na svim `public` tabelama;
- privatne lead/log tabele nisu izlozene anon read-u;
- nema neocekivanih `SECURITY DEFINER` funkcija u `public`;
- nema policy-ja koji koriste zastareli `auth.role()`;
- grants su eksplicitni za javne Data API tabele.
- default privileges za buduce `public` tabele/funkcije/sekvence su revoke-ovani, pa nove tabele moraju eksplicitno dobiti grantove i RLS politike.

## 8. Launch decision

Launch je realno spreman tek kada su sva sledeca polja potvrdjena:

- [ ] `npm.cmd run quality` prolazi.
- [ ] `git diff --check` nema stvarne greske.
- [ ] `npm.cmd run smoke:supabase:readonly` prolazi.
- [ ] `npm.cmd run smoke:supabase:launch` prolazi kada se ocekuju cloud media podaci.
- [ ] `project_media` je popunjen ili je fallback-only v1 svesno prihvacen.
- [ ] finalni domen je potvrdjen za sitemap/robots/canonical.
- [ ] manual browser QA je prosao desktop + mobile.
- [ ] keyboard QA je prosao javne i admin tokove.
- [ ] kontrolisani POST test kontakt forme je prosao.
- [ ] kontrolisani POST test land forme je prosao.
- [ ] email delivery je potvrdjen u Brevo/logovima.
- [ ] admin vidi i obradjuje test leadove.
- [ ] RLS/advisor/security provera nema otvorenih critical/high nalaza.

Ako bilo koja stavka ostaje otvorena, to nije razlog za paniku, ali treba je eksplicitno ostaviti kao pre-production rizik umesto da se podrazumeva da je pokrivena build-om.
