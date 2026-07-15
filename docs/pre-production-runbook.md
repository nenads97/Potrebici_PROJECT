# Pre-production runbook

Datum: 2026-07-14

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
- mixed Latin/Cyrillic text u istoj liniji;
- sirove `tel:` href vrednosti umesto normalizovanog helper-a;
- sitemap/robots pravila;
- tacan kanonski sitemap URL set i `PageMeta` pokrivenost aktivnih stranica;
- route contract izmedju specifikacije, router-a, kanonskog projekta i legacy `/apartmani` redirect-a;
- Supabase form rate-limit wiring;
- env template-e;
- uskladjenost lokalnog modela ponude: 5 stack-ova / 15 stanova;
- package manifest sanity;
- prisustvo read-only, launch i admin Supabase smoke scriptova;
- Supabase schema hardening: RLS na svim `public` tabelama, bez `auth.role()`
  policy-ja i bez `SECURITY DEFINER` funkcija u `public`;
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

- cloud `project_media` je popunjen za Heroja Pinkija 13 i strozi launch smoke prolazi. Ako se media metadata kasnije brise ili menja, ponovo pokrenuti `npm.cmd run smoke:supabase:launch`.

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
- prazan submit u kontakt modalu i formi za placeve ostaje lokalno, prikazuje inline greske, povezuje ih preko `aria-describedby` i fokusira prvo neispravno polje;
- consent checkbox moze da se aktivira klikom na tekst;
- telefonski CTA linkovi imaju normalizovan `tel:` href bez razmaka, dok vidljiv broj ostaje citljiv;
- admin login ima povezane label-e, skip link i ogranicen timeout za sporu auth proveru; zasticeni admin guard proverava Supabase user-a i `admin_profiles` bez duplog kratkog session precheck-a.

Poslednji automatizovani runtime smoke iz browsera je uradjen 2026-07-14. Desktop prolaz kroz 30 ruta, ukljucujuci svih 15 detalja stanova, legacy `/apartmani/1`, 404, `/admin` i `/admin/prijava`, nije nasao broken slike, missing alt, horizontal overflow, error boundary ili blokirajuci loading tekst. Mobilni 390px prolaz kroz 13 kljucnih ruta, ukljucujuci detalje stanova `/1`, `/8`, `/15` i `/admin/prijava`, takodje nije nasao iste probleme. Ovo ne zamenjuje zavrsni rucni keyboard QA pre objave.

Interakcioni QA 2026-07-10 je dodatno proverio da javni dropdown `Projekti` zatvara Escape i vraca `aria-expanded=false`, kontakt modal fokusira ime i vraca fokus na CTA posle zatvaranja, tabelarni filter sprata smanjuje prikaz sa 15 na 5 redova i `Ponisti filtere` vraca sve filtere na `all`, a admin login ima ispravne email/lozinka labele i `aria-busy=false` u idle stanju.

Admin runtime QA 2026-07-14 je proverio da `/admin` neulogovanog korisnika brzo prebacuje na `/admin/prijava`, da login forma nije zaglavljena na `Provera sesije`, da kontrolisani submit sa test/admin nalogom otvara admin panel i da dashboard javlja `Podaci su ucitani iz Supabase baze.` Opcioni `smoke:supabase:admin` je istog dana prosao sa aktivnim admin nalogom: Auth, `admin_profiles` i citanje zasticenih admin tabela prolaze za manje od 1s po fazi.

Keyboard/interakcioni QA 2026-07-14 je dodatno proverio:

- desktop dropdown `Projekti` otvaranje/zatvaranje na Escape i povratak fokusa;
- kontakt modal otvaranje bez submit-a, fokus na ime, `aria-modal=true`, scroll lock,
  `aria-busy=false` i Escape close sa povratkom fokusa;
- spisak stanova: 15 redova, filter sprata daje 5 redova, `Ponisti filtere`
  vraca 15 redova i sve filtere na `all`;
- mobilni hamburger na 390px prikazuje projektne linkove, Escape ga zatvara,
  `aria-expanded` se vraca na `false`, fokus ostaje na toggle dugmetu i nema
  horizontal overflow-a;
- admin login submit sa test/admin nalogom otvara protected admin shell, a `/admin`
  dashboard prikazuje metrike i Supabase loaded feedback.

Lead form validation QA 2026-07-15 je proverio prazan submit bez slanja podataka:

- `/kupujemo-placeve` forma prikazuje inline greske za ime, telefon, e-mail i
  saglasnost, fokusira polje `name`, a svako neispravno polje ima
  `aria-invalid=true` i `aria-describedby`;
- kontakt modal na detalju stana `/projekti/heroja-pinkija-13/ponuda-stanova/1`
  prikazuje isti pattern za ime, telefon, e-mail i saglasnost, fokusira polje
  `name` i ne pokusava network submit dok lokalna validacija ne prodje.

## 5. Admin content readiness

U admin panelu proveriti:

- upiti za stanove i upiti za placeve imaju citljiv status, izvor i interne beleske;
- neuspesno cuvanje statusa lead-a vraca status u UI-ju na prethodnu vrednost i prikazuje recovery hint, umesto da ostavi lazno optimistic stanje;
- promena statusa stana se cuva i vidi u javnoj ponudi nakon osvezavanja Supabase podataka;
- projekat ima status label, opis, hero image, SEO title i SEO description;
- media panel ima objavljene slike sa alt tekstom;
- `project_media` u cloudu nije prazan ako se ocekuje da javni sajt cita slike iz Supabase-a;
- PDF/media brisanje ostaje dvokorak i ne brise Storage fajl slucajno.

Kada postoji admin nalog za test, pre rucnog prolaza pokrenuti opcioni admin
smoke iz `mim-invest-frontend`:

```powershell
$env:SUPABASE_ADMIN_EMAIL="admin@example.com"
$env:SUPABASE_ADMIN_PASSWORD="..."
npm.cmd run smoke:supabase:admin
```

Ocekivani dokaz:

- Supabase Auth login uspeva;
- isti user postoji u `public.admin_profiles`;
- admin RLS dozvoljava citanje `contact_inquiries`, `land_offers`, `units`,
  `projects`, `construction_updates` i `project_media`;
- `units`, aktuelni projekat i `project_media` imaju bar jedan red.
- u browseru `/admin` ne sme ostati na `Provera sesije`, vec neulogovanog korisnika brzo salje na login, a ulogovanog u admin panel.

Ovaj smoke ne sme biti deo javnog env template-a i ne sme koristiti `VITE_`
promenljive za admin kredencijale. Ako treba lokalni fajl, koristiti ignorisani
`.env.admin.local`.

Ako je potrebno dokazati i obradu kontrolisanih test leadova, admin smoke ostaje
read-only dok se eksplicitno ne prosledi processing flag. Primer preko test
e-maila iz ovog runbook-a:

```powershell
$env:SUPABASE_ADMIN_SMOKE_TEST_EMAIL="test+launch@mimgradnja.rs"
$env:SUPABASE_ADMIN_SMOKE_PROCESS_TEST_LEADS="true"
npm.cmd run smoke:supabase:admin
```

Ako su test leadovi vec poznati po ID-jevima, koristiti lokalne/ignorisane
vrednosti `SUPABASE_ADMIN_SMOKE_TEST_CONTACT_IDS` i
`SUPABASE_ADMIN_SMOKE_TEST_LAND_IDS`. Ne commitovati realne lead ID-jeve.

Napomena 2026-07-14: admin processing smoke je prosao sa eksplicitnim test ID
selektorima. Zatvorena su 4 test kontakt upita i 1 test ponuda placa kroz admin
RLS, bez menjanja realnih klijentskih upita.

## 6. Controlled POST testovi sa posledicama

Ovo ne raditi automatski. Potrebna je odluka da se naprave realni test upisi i potencijalno posalju emailovi.

Napomena 2026-07-14: kontrolisani POST test kontakt forme i land forme je uradjen uz odobrenje. Oba API odgovora su vratila `ok`, oba lead reda su upisana, a sva cetiri email delivery loga su imala status `sent`.

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

- [x] `npm.cmd run quality` prolazi. Poslednja provera: 2026-07-15.
- [x] `git diff --check` nema stvarne greske, osim Windows LF -> CRLF upozorenja. Poslednja provera: 2026-07-15.
- [x] `npm.cmd run smoke:supabase:readonly` prolazi. Pokriveno i kroz `smoke:supabase:launch`, poslednja provera: 2026-07-14.
- [x] `npm.cmd run smoke:supabase:launch` prolazi kada se ocekuju cloud media podaci. Poslednja provera: 2026-07-14.
- [x] `project_media` je popunjen za Heroja Pinkija 13.
- [ ] finalni domen je potvrdjen za sitemap/robots/canonical.
- [x] automatizovani browser runtime smoke desktop + mobile je prosao. Poslednja provera: 2026-07-14.
- [x] manual/browser smoke QA je prosao desktop + mobile za kljucne rute i tokove. Poslednja provera: 2026-07-14.
- [x] keyboard/interakcioni QA je prosao glavne javne i admin tokove. Poslednja provera: 2026-07-14.
- [x] `npm.cmd run smoke:supabase:admin` prolazi sa test/admin nalogom. Poslednja provera: 2026-07-14.
- [x] kontrolisani POST test kontakt forme je prosao 2026-07-14.
- [x] kontrolisani POST test land forme je prosao 2026-07-14.
- [x] email delivery je potvrdjen u `email_delivery_log` sa statusom `sent` 2026-07-14.
- [x] admin vidi i obradjuje test leadove. Poslednja provera: 2026-07-14, 4 test kontakt upita i 1 test ponuda placa zatvoreni kroz admin RLS.
- [x] lokalni schema security guardrail prolazi kroz `audit:surface`: RLS na svim `public` tabelama, bez `auth.role()` policy-ja i bez `SECURITY DEFINER` funkcija u `public`.
- [ ] RLS/advisor/security provera nema otvorenih critical/high nalaza.

Ako bilo koja stavka ostaje otvorena, to nije razlog za paniku, ali treba je eksplicitno ostaviti kao pre-production rizik umesto da se podrazumeva da je pokrivena build-om.
