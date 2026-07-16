# Zavrsni audit klijentskog dela i admin smera

Datum: 2026-07-15

## Izvori za ovaj audit

Pregledani su:

- `docs/Project-spec.md`
- `docs/Frontend-guide.md`
- `docs/Database_model.md`
- `docs/figma-generate-design-real-estate.md`
- trenutni React/Vite frontend
- Supabase schema/seed/Edge Function pravac iz radnog stabla
- public asset folder i aktivne rute

Ovaj dokument je ociscena verzija ranijih audit beleznica: uklonjeno je ponavljanje, a stavke su podeljene na trenutno stanje, dokazano uradjeno, rizike i sledeci najkorisniji batch.

Za sam launch koristiti i `docs/pre-production-runbook.md`, jer tamo postoji operativni redosled provera i jasna granica izmedju read-only provera i testova koji prave realne upise/emailove.

Dopuna 2026-07-15: posle zavrsnog polish prolaza dodati su inline validation guardrail za lead forme, rollback za neuspesno cuvanje statusa leadova u adminu, hygiene provere za mixed Latin/Cyrillic tekst, normalizovani `tel:` helper za sve telefonske CTA linkove i Supabase advisor hardening belezenje za `set_updated_at`, service-only email podesavanja i public bucket listing.

## Kratak zakljucak

Klijentski deo je vrlo blizu dobrog v1 stanja. Sajt sada ima jasnu premium real-estate prezentaciju, kanonski tok do ponude stanova, detalje stanova zadrzane u postojecem v1 obliku, kontakt modal bez redirekcije, stabilniji Supabase fallback i admin panel koji vec prati glavne operativne potrebe prodaje.

Najvaznije launch tacke vise nisu novi veliki redesign, vec zavrsne provere i nekoliko odluka:

1. rucni vizuelni prolaz kroz sve javne i admin rute u browseru;
2. produkciona Supabase/Edge Function provera sa realnim env vrednostima je uradjena: kontrolisani POST testovi 2026-07-14, read-only/launch/admin smoke ponovo 2026-07-15;
3. odluka da li se uvodi prerender/SSR za bolji SEO/share preview;
4. kasnije cepanje velikog `global.scss` fajla i napredniji media model.

Detalje stanova ne dirati u narednim cleanup/redesign batch-evima. Postojeci izgled i ponasanje su baseline za v1; menjati samo konkretan bug, performansni problem ili izricito trazenu izmenu.

## Uskladjenost sa specifikacijom

### Stack i arhitektura

Stanje je uskladjeno sa `Project-spec.md` i `Frontend-guide.md`:

- frontend je React + Vite + TypeScript + SCSS;
- admin zivi pod `/admin`;
- Supabase ostaje jedini backend u v1;
- nema dodatnog CMS/backend sloja;
- Edge Functions su predvidjene za kontakt/land forme i server-side validaciju;
- javne stranice koriste lokalni fallback i kratke Supabase timeout-e, tako da spori Supabase poziv ne sme da zadrzi UI u viseminutnom loading stanju.

### Poslovna pravila

U javnom copy-ju i dokumentaciji mora ostati pravilo:

- garazna mesta i ostave su odvojena kupovina;
- cene se ne prikazuju javno, vec `Na upit`;
- prvi projekat se komunicira transparentno, bez laznih portfolio tvrdnji.

Ovaj pravac je trenutno ispravno zapisan u docs i podrzan u UI-ju.

## Javne rute

### Ruta i status

| Ruta | Status |
| --- | --- |
| `/` | Premium home sa jasnim projektom, ponudom stanova, land-acquisition tokom i kontakt CTA-jevima. |
| `/projekti` | Redirect na aktuelni projekat. |
| `/projekti/heroja-pinkija-13` | Alias za projekat, canonical vodi na `/o-projektu`. |
| `/projekti/heroja-pinkija-13/o-projektu` | Glavna projektna strana, cita Supabase project/timeline podatke uz fallback. |
| `/projekti/heroja-pinkija-13/ponuda-stanova` | Karticni prikaz ponude sa filterima i tlocrt preview slikama. |
| `/projekti/heroja-pinkija-13/ponuda-stanova/:apartmentNumber` | Detalj stana u postojecem v1 UX-u; ne menjati raspored ni vizuelni koncept bez izricitog zahteva. |
| `/projekti/heroja-pinkija-13/spisak-stanova` | Tabelarni prikaz za brzo poredjenje, filteri, stampa i CSV export. |
| `/apartmani/:apartmentNumber` | Legacy redirect na novu kanonsku putanju detalja stana. |
| `/o-nama` | Vizuelno uskladjena stranica poverenja/kompanije. |
| `/politika-privatnosti` | Vizuelno uskladjena pravna stranica sa kontakt modalom. |
| `/lokacija` | Lokacijska strana sa Google Maps linkom i JSON-LD lokacijskim podacima. |
| `/kupujemo-placeve` | Odvojen tok za prodavce placeva/starih kuca, sa svojom formom i bez kupackog footer CTA. |
| `/kontakt` | Kontakt hub, ne druga duplirana forma; koristi modal tok i direktne kontakte. |
| `*` | Brendirana 404 stranica sa `noindex,follow` i povratnim linkovima. |

### Najvaznije javne dorade koje su vec primenjene i zadrzavaju se

- Kanonski URL detalja stana je prebacen na `/projekti/heroja-pinkija-13/ponuda-stanova/:apartmentNumber`.
- Detalj stana vise nema blokirajuci `Ucitavanje stana...`; lokalni fallback renderuje odmah, Supabase samo osvezava podatke.
- Detalj stana ostaje u postojecem izgledu i ponasanju; stavke iznad nisu spisak novih UI izmena za sledeci batch.
- Kartice u ponudi stanova koriste dostavljene tlocrt preview slike.
- Globalni footer CTA za kupce stanova ne prikazuje se na `/kupujemo-placeve` i na detaljima pojedinacnog stana, jer bi tu bio pogresan ili suvisan.
- Javno dugme "Nazad" koristi React Router history kada postoji interna istorija, a za direktne posetioce ima bezbedan fallback: detalj stana -> ponuda, spisak -> ponuda, ponuda -> projekat, projekat -> pocetna.
- Header nav ima active state, `aria-current`, dropdown `aria-expanded`, stabilan menu ID i bolji mobilni prikaz drugog nivoa projektnih linkova.
- Header dropdown se zatvara na Escape i vraca fokus na trigger, tako da `aria-expanded` ne ostaje zaglavljen na `true`.
- Mobilni hamburger meni se zatvara na Escape i vraca fokus na toggle dugme, tako da `aria-expanded` ne ostaje zaglavljen na `true`.
- Skip link postoji na javnom i admin layout-u.
- `favicon.svg` je dodat, tako da osnovna browser favicon referenca vise nije 404.
- Svi javni i admin telefonski linkovi koriste normalizovan `tel:` href, dok vidljiv tekst zadrzava citljiv format broja.

## Konverzioni tok i forme

### Kontakt modal

Kontakt modal je sada centralni kupacki tok:

- CTA-jevi tipa `Pisite nam` otvaraju modal na istoj stranici;
- modal prima kontekst: projekat, stan, dostupnost, obilazak ili opsti upit;
- success/error feedback ima live region;
- success stanje nudi zatvaranje ili povratak na ponudu stanova kroz SPA `Link`;
- telefon je obavezan za prodajno kriticne upite: konkretan stan, dostupnost i obilazak;
- telefon ostaje opcion za opste/privacy kontekste;
- frontend validacija sada pre slanja prikazuje inline greske po polju, povezuje ih preko `aria-invalid`/`aria-describedby` i fokusira prvo neispravno polje;
- Edge Function validacija prati isto pravilo.

### Land offer forma

Tok za prodavce placeva/starih kuca je odvojen:

- koristi sopstvenu formu;
- ima honeypot;
- ima `aria-busy` tokom slanja;
- success/error poruke imaju live region;
- obavezna polja, email, telefon, povrsina parcele i saglasnost imaju isti inline validation pattern kao kontakt modal;
- mikrocopy objasnjava da je prva provera bez obaveze;
- globalni kupacki footer CTA je sakriven na toj stranici.

### Edge Functions

`submit-contact-inquiry` i `submit-land-offer` su prosirene logikom koja je bitna za produkciju:

- validacija obaveznih polja;
- validacija `inquiryType`;
- telefon obavezan za kriticne prodajne upite;
- `sourcePage` prihvata samo bezbednu internu putanju;
- rate-limit koristi email hash i IP/network hash bucket-e, bez cuvanja sirove IP adrese;
- kontekst upita se salje u prodajni email;
- admin dobija cist izvor upita bez rizicnih eksternih linkova.

## SEO, share preview i strukturirani podaci

Uradjeno:

- `PageMeta` postavlja title, description, robots, canonical, Open Graph, Twitter card i JSON-LD.
- `PageMeta` koristi `VITE_PUBLIC_SITE_URL` / `shared/config/site.ts` za javni canonical/share origin, uz fallback `https://mimgradnja.rs`, tako da staging/localhost origin ne mora da procuri u canonical/OG URL-ove.
- `PageMeta` odrzava `og:image:width` i `og:image:height` za poznate lokalne share slike po ruti, a uklanja ih ako slika nije u poznatoj mapi, da se ne zadrze zastarele dimenzije iz statickog fallback-a.
- `PageMeta` postavlja `og:image:alt` i `twitter:image:alt`; rute sa posebnim share slikama prosledjuju precizan alt, a ostale koriste default alt za Heroja Pinkija 13.
- `index.html` ima osnovni staticki canonical/robots/OG/Twitter fallback za home/projekat pre nego sto React `PageMeta` preuzme rutu.
- `index.html` koristi `lang="sr-Latn"` i isti home description kao runtime `PageMeta`, uz `og:locale=sr_RS`, da no-JS fallback ostane uskladjen sa latinicnim sadrzajem.
- `index.html` ima minimalan `noscript` fallback sa linkom ka ponudi stanova, kontakt stranici i prodajnom emailu, da stranica ne bude potpuno prazna ako JavaScript nije dostupan.
- CSV export spiska stanova koristi isti javni URL helper, tako da preuzeti spisak nosi produkcione linkove ka detaljima stanova umesto `localhost` origin-a.
- Javne rute imaju ciljane meta vrednosti.
- Detalj stana koristi tlocrt kao share image.
- `kupujemo-placeve` koristi svoju optimizovanu hero sliku.
- Home i Kontakt vise ne koriste eksterni Unsplash stock hero; koriste lokalne slike projekta sa eksplicitnim dimenzijama da se izbegne treci domen, poboljsa poverenje i smanji rizik od eksternog asset fail-a/CLS-a.
- `robots.txt` i XML-validan `sitemap.xml` su dodati u `public`; robots izuzima `/admin` i legacy `/apartmani/` putanju iz crawl-a.
- Sitemap ukljucuje 24 javna URL-a: home, projekat, ponuda/spisak, 15 detalja stanova, kontakt, lokacija, O nama, kupujemo placeve, politika privatnosti.
- Admin i legacy redirect rute nisu u sitemap-u.
- Sitemap `lastmod` vrednosti su osvezene na 2026-07-09 posle zavrsnog polish batch-a.
- `/admin/prijava` ima eksplicitan `noindex,nofollow`, neutralan admin title/description i kanonsku admin putanju, tako da se ne mesa sa javnim SEO signalima.
- 404 i pogresni detalji imaju `noindex,follow`.
- JSON-LD je konzervativan: Organization, ApartmentComplex i ContactPage, bez cena/rejtinga/ponuda koje nisu javno prikazane.

Rizik:

- Ruta-specific meta/JSON-LD su client-side. `index.html` sada ima staticki fallback za home share preview, ali za pouzdanije social share preview-e svih dubokih ruta sledeci arhitektonski korak je prerender/SSR.
- `robots.txt`, `sitemap.xml` i `VITE_PUBLIC_SITE_URL` koriste/treba da koriste isti finalni domen; pre produkcije potvrditi da `https://mimgradnja.rs` ostaje finalni domen.

## Performanse

Uradjeno:

- Admin auth provera ne sme da visi minutima: koristi kanonsku proveru Supabase user-a i `admin_profiles`, bez duplog kratkog session precheck-a koji moze dati lazni negativan rezultat.
- Supabase public citanja imaju kratke timeout fallbacke tamo gde bi spora mreza blokirala UI; admin citanja imaju duzi, ali i dalje ogranicen timeout, kako stvarni admin podaci ne bi lazno padali u fallback tokom auth/session handshake-a.
- Detalji stanova renderuju lokalni fallback odmah.
- Admin login submit ima timeout i jasnu poruku ako Supabase Auth ne odgovori.
- `kupovina-placeva-hero` je prebacen iz velikog PNG-a u optimizovan JPG.
- Hero/logo slike van detalja stanova imaju preciznije image hint-ove: poznate lokalne slike imaju dimenzije, prioritetne hero slike `fetchPriority="high"`, a dekorativnije/below-fold slike `loading="lazy"` i `decoding="async"` gde je bezbedno.
- Javne hero slike na Home/Kontakt stranama vise ne zavise od eksternog Unsplash hosta; koriste postojece lokalne projektne fotografije sa poznatim `width`/`height` atributima.
- Public asset scan posle dodavanja favicon-a ne nalazi nereferencirane public fajlove.
- Najveci trenutni public asseti su ispod ~465KB; tlocrt PNG fajlovi su svesno zadrzani u citljivom formatu jer nose tehnicku dokumentaciju.

Rizik / kasnije:

- Ako se pojave realni Core Web Vitals problemi, sledeci korak su WebP/AVIF varijante fotografija i eventualni `srcset`.
- Za sledeci nivo slike treba meriti Lighthouse/Core Web Vitals na produkcionom hostu pre uvodjenja agresivnijeg `srcset`/preload pristupa.

## Accessibility i UX polish

Uradjeno:

- Vidljivi label-i postoje na formama.
- Consent checkbox u kontakt modalu i land formi ima eksplicitan `id/htmlFor`, da tekst bude pouzdano vezan za kontrolu.
- Consent label ima 44px+ klik/tap povrsinu, sto je vazno za mobilno popunjavanje forme.
- Kontakt modal i land forma imaju `autocomplete`/`inputMode` hintove za ime, telefon, e-mail, adresu i numericku povrsinu parcele, da mobilno popunjavanje bude brze i sa manje gresaka.
- Telefonski linkovi koriste `contactPhoneHref` ili `createPhoneHref(phone)`, da mobilni poziv ne zavisi od razmaka u prikaznom broju.
- Kontakt modal i land forma imaju status feedback.
- Kontakt modal i land forma imaju `aria-busy` tokom slanja, da glavni lead tok jasno najavi zauzeto stanje i asistivnim tehnologijama.
- Error feedback koristi `role="alert"`; success koristi `role="status"`.
- Admin card feedback za greske koristi assertive live region.
- Animirane javne stranice postuju `prefers-reduced-motion`: home gasi parallax/blur/reveal pokrete, land stranica gasi reveal/hover pomeranja, a globalni smooth scroll prelazi na `auto`.
- Admin pretraga stanova ima skriveni label tekst, ne oslanja se samo na placeholder.
- Admin login ima skip link, `main-content` anchor, eksplicitno povezane email/lozinka label-e i `aria-busy` na formi tokom provere pristupa.
- Icon-only/compact kontrole imaju aria label-e tamo gde je bitno.
- Svi `target="_blank"` linkovi sada eksplicitno koriste `rel="noopener noreferrer"`.
- Nema internih public/admin root linkova kao obicnih `href="/..."` u aktivnom React kodu; interni tok je SPA gde treba da bude.
- Footer linkovi imaju vecu klik/tap povrsinu: 36px+ na desktopu i 44px na mobilnom viewport-u.
- Header dropdown podrzava Escape zatvaranje i vracanje fokusa na trigger.
- Zatvoren mobilni header meni ne presrece klikove na CTA-jeve ispod sebe; linkovi unutar skrivenog menija imaju iskljucen hit-testing dok meni nije otvoren.

Preostala preporuka:

- Uraditi jedan rucni keyboard prolaz kroz header dropdown, kontakt modal, filtere ponude, tabelu stanova i admin media panel.

## Admin panel

### Trenutna struktura

Admin je uskladjen sa `Frontend-guide.md`:

- `/admin/prijava`
- `/admin` Pregled
- `/admin/upiti-stanovi`
- `/admin/upiti-placevi`
- `/admin/stanovi`
- `/admin/projekat`
- `/admin/fajlovi`

### Pregled

`/admin` vise nije duplikat inboxa. Sada je operativni pregled:

- novi upiti za stanove;
- nove ponude placeva;
- status inventara slobodno/rezervisano/prodato;
- stavke koje traze proveru;
- poslednji leadovi;
- brze akcije za stanove, upite, projekat i fajlove;
- SPA `Link` navigacija bez nepotrebnog full reload-a.

### Upiti

Uradjeno:

- tip upita je vidljiv kroz tag;
- `unitCode` linkuje na javni detalj stana;
- `sourcePage` linkuje samo ako je bezbedna interna ruta;
- prazan telefon se ne prikazuje kao prazan `tel:` link;
- interne beleske se eksplicitno cuvaju;
- kartice imaju per-card feedback za cuvanje/status.
- ako cuvanje statusa lead-a ne uspe, status se vraca na prethodnu vrednost i feedback daje sledeci korak za oporavak.

### Stanovi

Uradjeno:

- filteri po pretrazi, statusu, etazi i objavi;
- status i objava se cuvaju uz per-row feedback;
- status select u tabeli ima kontekstualni `aria-label` po stanu, da promena statusa bude jasna i korisnicima citaca ekrana;
- kratak opis kartice/detalja moze da se menja;
- full opis detalja i SEO title/description su u drawer-u po stanu;
- javni detalj stana koristi isti Supabase/fallback tok kao ponuda, pa admin izmene imaju put do javnog prikaza;
- svaki stan ima javni link;
- prikazuju se tlocrt/plan variant upozorenja.

Preostalo za kasnije:

- Prvi admin maintainability koraci su uradjeni: zajednicki display/source/media
  helper-i su izdvojeni u `src/features/admin/utils/adminDisplay.ts`, a mali
  ponovljivi UI elementi (`AdminToolbar`, `WorkflowSelect`, `EmptyAdminList`,
  `AdminCardFeedbackMessage`) u `src/features/admin/components/AdminUi.tsx`.
  Surface audit proverava da se ne vrate neprimetno u `AdminDashboardPage.tsx`.
- Pre novih admin v2 funkcija razbiti preostali veliki `AdminDashboardPage.tsx`
  po panelima (`overview`, `inquiries`, `land`, `units`, `project`, `media`).
  Trenutni jedan page fajl je prihvatljiv za v1, ali bi dalje dodavanje
  CRM/analytics/media-crop funkcija u isti fajl brzo otezalo odrzavanje.
- `availability_note` po stanu ako prodaja zeli preciznu poruku za rezervisane/prodate stanove.
- Istorija promena statusa ako bude potrebna odgovornost po korisniku/vremenu.

### Projekat

Uradjeno:

- admin projekat prati javnu stranu "O projektu";
- checklist pokazuje spremnost hero-a, opisa, lokacije, rokova/statusa, ponude, slika i SEO;
- uredjuju se status label, dugi opis, hero slika, SEO title i SEO description;
- forma za osnovna polja projekta ima `onSubmit`, pa Enter u polju i dugme "Sacuvaj izmene" koriste isti save tok bez default browser submit ponasanja;
- javna projektna strana cita `projects` podatke iz Supabase uz lokalni fallback;
- javni timeline cita `construction_updates` uz fallback.

Preostalo za kasnije:

- pun CMS za staticke sekcije kroz `page_sections` ili specijalizovan model;
- vezivanje timeline slika direktno za pojedinacne `construction_updates` ako se status radova bude cesto osvezavao.

### Slike i PDF fajlovi

Uradjeno:

- filter po tipu media fajla;
- preview za slike i placeholder za PDF/fajl;
- namena fajla je vidljiva;
- objavljene slike zahtevaju alt tekst;
- metadata se cuva eksplicitno;
- publish/unpublish vraca prethodno UI stanje ako Supabase cuvanje ne uspe;
- upload zamenskog fajla ima `try/finally` zastitu;
- kreiranje nove media kartice podrzava projekat ili konkretan stan;
- uklanjanje media kartice ima dvokorak potvrdu;
- Storage fajl se ne brise automatski pri uklanjanju metadata kartice, sto je bezbednije za v1.

Preostalo za kasnije:

- eksplicitno `usage`/`variant` polje, npr. hero, showcase, comparison, gallery;
- crop/focal-point kontrola za hero i tlocrt varijante;
- zasebno "obrisi fajl iz Storage-a" samo uz strogu potvrdu i prikaz gde se asset koristi.

## Supabase i DB model

Uskladjeno sa `Database_model.md`:

- `projects` podrzava javne osnovne podatke i SEO;
- `units` podrzava status, opis, SEO i plan;
- `project_media` pokriva slike, PDF-ove, tlocrt kartice i comparison tlocrt;
- `construction_updates` pokriva timeline/status radova;
- `contact_inquiries` i `land_offers` pokrivaju operativne leadove;
- `sourcePage` je tretiran kao interna putanja;
- browser Supabase client koristi `createClient<Database>(...)`.
- `schema.sql` eksplicitno revoke-uje default privilegije za buduce `public` tabele, funkcije i sekvence, pa nove Data API tabele moraju imati svesno dodate grantove i RLS politike.
- `email_service_settings` je dokumentovan i dodat u kanonsku lokalnu semu kao service-only fallback za Edge Functions, bez `anon`/`authenticated` policy-ja.
- Lokalna sema sada priprema `public.set_updated_at()` sa stabilnim `search_path = public, pg_temp` i ne dodaje broad anonimni `storage.objects` SELECT policy za public bucket listing.

Rizik:

- `database.types.ts` je rucno odrzavan lokalno. Pri svakoj sematskoj promeni SQL modela treba regenerisati ili azurirati tipove u istom PR-u.
- Produkciona RLS, Edge Function env vrednosti, Brevo kljucevi i rate-limit ponasanje moraju se proveriti u stvarnom Supabase okruzenju.
- Supabase advisors 2026-07-15 nemaju critical/high nalaze u dostupnom izlazu, ali imaju WARN/INFO triage: `set_updated_at` search_path, `citext` u public schema-i, broad public bucket listing, leaked password protection disabled, service-only `email_service_settings` bez policy-ja, unused index-e i multiple permissive SELECT policy-je. Repo-safe SQL stavke su pripremljene u lokalnoj semi i operator planu; cloud DB migraciju raditi kontrolisano.
- `supabase/advisor-remediation.sql` je dodat kao operator-run plan za SQL deo advisor cleanup-a: `set_updated_at`, service-only `email_service_settings` i uklanjanje broad public bucket listing policy-ja. Ne pokretati ga kao automatski build/test korak i ne koristiti ga umesto prave migracije kada Supabase CLI bude dostupan.

Produkcione Supabase provere:

- lokalni frontend `.env.local` ima `VITE_SUPABASE_URL` i `VITE_SUPABASE_ANON_KEY`;
- dodat je `mim-invest-frontend/.env.example` za javne Vite/Supabase vrednosti;
- dodat je `supabase/.env.example` za server-only Edge Function/Brevo vrednosti;
- Supabase CLI nije instaliran u ovom okruzenju, pa migracije/deploy nisu pokretani iz terminala;
- javni REST endpointi vracaju 200 za `projects`, `units`, `project_media` i `construction_updates`;
- cloud `project_media` je popunjen media metadata seed-om za Heroja Pinkija 13: 26 redova ukupno, 25 objavljenih;
- Edge Function `OPTIONS` preflight za `submit-contact-inquiry` i `submit-land-offer` vraca 200;
- Edge Functions sada dele helper za form rate-limit i proveravaju dva bucket-a: e-mail hash i IP/network hash;
- kontrolisani POST test kontakt forme i forme za placeve je uradjen uz odobrenje; oba testa su vratila `ok`, upisala leadove i napravila `email_delivery_log` redove sa statusom `sent`;
- `npm.cmd run smoke:supabase:readonly` prolazi: `projects` vraca 1 red, `units` 15 redova, `project_media` 25 objavljenih redova, `construction_updates` 3 reda, privatne lead/log tabele vracaju 401 za anon key, a obe public Edge Function preflight provere vracaju 200 sa CORS origin-om `*`; smoke prijavljuje stvaran REST count uz sample od 5 redova i pada ako javna ponuda nema svih 15 objavljenih stanova;
- `npm.cmd run smoke:supabase:launch` prolazi kada se zahteva bar jedan objavljen `project_media` red.
- UI smoke u browseru 2026-07-14: `/admin` neulogovanog korisnika prebacuje na login formu za oko 1.2s, `/admin/prijava` prikazuje formu bez blokirajuce provere sesije, a kompletan submit sa lokalnim test/admin nalogom otvara admin shell za oko 4.9s i zatim ucitava dashboard iz Supabase baze; detalj stana `/projekti/heroja-pinkija-13/ponuda-stanova/2` renderuje bez blokirajuceg `Ucitavanje stana...`.
- `npm.cmd run smoke:supabase:admin` prolazi 2026-07-14 sa aktivnim admin nalogom: Supabase Auth ~649ms, `admin_profiles` provera ~386ms, citanje zasticenih admin tabela ~277ms; pokriveno je citanje `contact_inquiries`, `land_offers`, `units`, `projects`, `construction_updates` i `project_media`.
- Kontrolisana admin obrada test leadova je proverena 2026-07-14 kroz eksplicitne test ID selektore: 4 test kontakt upita i 1 test ponuda placa su procitani kroz admin RLS, azurirani na `closed` i verifikovani kao zatvoreni.
- Supabase smoke 2026-07-15: read-only i launch smoke prolaze; admin smoke je read-only i prolazi sa Auth ~698ms, `admin_profiles` ~152ms, admin data ~229ms, uz procitanih 10 kontakt upita, 1 ponudu placa, 15 stanova, 1 projekat, 3 construction update-a i 26 media redova.
- Supabase smoke posle advisor remediation plana 2026-07-15: read-only i launch smoke ponovo prolaze sa exact REST count proverom za javne tabele, a admin smoke prolazi sa Auth ~355ms, `admin_profiles` ~177ms i admin data ~164ms.
- Supabase advisor 2026-07-15: dostupni security/performance advisors ne vracaju critical/high nalaze, ali vracaju WARN/INFO stavke koje su zabelezene u runbook-u; cloud migracije za njih ne pokretati bez odvojene potvrde.

## Obrisano / ocisceno

Uklonjeni su neaktivni pre-redesign/prototip fajlovi koji nisu bili importovani u aktivne rute:

- `src/features/projects/components/ProjectFooter.tsx`
- `src/features/projects/components/ProjectGallery.tsx`
- `src/features/projects/components/ProjectHeader.tsx`
- `src/features/projects/components/ProjectHero.tsx`
- `src/features/projects/components/ProjectInfoSections.tsx`
- `src/features/projects/components/ProjectUpdates.tsx`
- `src/views/pages/projects/HerojaPinkija13/ProjectOverviewPage.tsx`
- `src/core/validators/contextValidator.ts`
- `src/app/providers/AppProviders.tsx`
- stari veliki `public/images/kupovina-placeva-hero.png`, zamenjen JPG varijantom
- neaktivni public project data export-i za stare stats/progress/gallery/building-level
  blokove, zajedno sa pratecim neupotrebljenim tipovima
- neaktivna hero slika `public/images/heroja-pinkija-13/hero-generated-with-adjacent-building.png`
- zastareli frontend agents vodič koji je pominjao Umbraco/.NET kao buduci smer
  uskladjen je sa v1 odlukom da Supabase ostaje jedini backend/CMS sloj

Napomena: `variables.scss` je ostao jer ga `global.scss` koristi kroz `@use`.

## Verifikacija

Do sada prolazi:

- `npm.cmd run quality`
- `npm.cmd run smoke:supabase:readonly` kada `.env.local` pokazuje na realan Supabase projekat
- `npm.cmd run smoke:supabase:launch` kada `.env.local` pokazuje na realan Supabase projekat i cloud media metadata je popunjen
- opcioni `npm.cmd run smoke:supabase:admin` kada su `SUPABASE_ADMIN_EMAIL` i `SUPABASE_ADMIN_PASSWORD` dostupni samo kroz lokalni/ignorisan env
- `npm.cmd run lint`
- `npm.cmd run build`
- `npm.cmd run audit:surface`
- `npm.cmd run audit:deps`
- `git diff --check` bez stvarnih whitespace gresaka; postoje samo Windows LF -> CRLF upozorenja
- `npm.cmd run quality`, `git diff --check`, `npm.cmd run smoke:supabase:readonly` i `npm.cmd run smoke:supabase:launch` su ponovo provereni 2026-07-14;
- `npm.cmd run quality` i `git diff --check` su ponovo provereni 2026-07-15 posle lead-form, admin rollback, hygiene i phone-link polish izmena;
- `npm.cmd run quality`, `git diff --check`, `npm.cmd run smoke:supabase:readonly`, `npm.cmd run smoke:supabase:launch` i `npm.cmd run smoke:supabase:admin` su ponovo provereni 2026-07-15 posle Supabase advisor remediation plana;
- `npm.cmd run quality` je ponovo proverio 2026-07-15 staticki `index.html` canonical/OG/Twitter fallback, CSV public URL export guardrail i lokalne Home/Kontakt hero slike;
- `npm.cmd run quality` je ponovo proverio 2026-07-15 i minimalni `noscript` fallback u `index.html`; build output ostaje mali (`dist/index.html` oko 3.06KB, gzip oko 0.94KB);
- `npm.cmd run quality` je ponovo proverio 2026-07-15 admin helper/UI refactor; `AdminDashboardPage` i dalje build-uje kao ista admin ruta, a surface audit sada eksplicitno proverava `adminDashboardUsesSharedDisplayHelpers` i `adminDashboardUsesSharedUiComponents`;
- import graf: svi TS/JS fajlovi iz aplikacionog entry-ja su reachable
- public asset scan: svi public fajlovi imaju referencu u kodu, dokumentaciji, `index.html` ili Supabase seed-u
- dependency sanity scan: nema ocigledno neiskoriscenih runtime/dev paketa
- surface audit proverava import graf, public assete, interni hard-reload link regression, alt tekst, debug tokene, encoding/mojibake artefakte, ceste casing/merge artefakte, mixed Latin/Cyrillic tekst, sirove `tel:` href vrednosti, tacan kanonski sitemap URL set, robots pravila, `PageMeta` pokrivenost aktivnih page fajlova i Supabase form rate-limit wiring
- surface audit proverava i da `index.html` zadrzi staticki canonical/OG/Twitter fallback za home/projekat pre React `PageMeta` izvrsavanja
- surface audit proverava i da staticki fallback zadrzi `lang="sr-Latn"`, uskladjen home description/title i `og:locale=sr_RS`
- surface audit proverava i da `index.html` zadrzi minimalan `noscript` fallback sa ponudom stanova, kontaktom i email linkom
- surface audit proverava i da javni kod ne koristi `window.location.origin` / `location.origin` za URL-ove koji mogu zavrsiti u exportu, share preview-u ili canonical toku; za javne URL-ove koristi se `createPublicUrl` / `publicSiteUrl`
- surface audit proverava i da `PageMeta` odrzava ili uklanja `og:image` dimenzije po konkretnoj share slici, da staticki home fallback ne ostane pogresan na detaljima stanova ili drugim rutama
- surface audit proverava i da `PageMeta` i rute sa posebnim share slikama zadrze `og:image:alt` / `twitter:image:alt` metadata
- surface audit proverava i da se u runtime source-u ne vracaju genericki Unsplash stock hero URL-ovi; produkcijske prodajne slike treba da budu lokalne/projektne ili svesno dodate kroz admin media tok
- surface audit proverava i da lokalni Home/Kontakt hero asseti imaju eksplicitne `width`/`height` atribute
- surface audit proverava i route contract izmedju `Project-spec.md`, `AppRouter.tsx`, kanonskog projekta i legacy `/apartmani/:apartmentNumber` redirect-a
- surface audit proverava i Supabase schema hardening: RLS mora biti ukljucen na svim `public` tabelama, default privilege revoke mora postojati za buduce public objekte, `project_media` mora imati eksplicitni public read grant, policy-ji ne smeju koristiti `auth.role()`, a `SECURITY DEFINER` funkcije ne smeju ziveti u `public`
- surface audit proverava i vazne tacke uskladjenosti `docs/Database_model.md` sa `supabase/schema.sql`, ukljucujuci `land_acquisition_page`, `delivery_kind`, `sent_at` i tekstualni kontekst upita
- surface audit proverava i da lokalni model ponude ostaje 5 stack-ova / 15 kanonskih stanova, uskladjeno sa `Project-spec.md`
- surface audit proverava i da env template-i postoje i sadrze ocekivane javne/server-only kljuceve
- surface audit proverava package manifest sanity: runtime dependency mora imati source import, build-only `sass` mora biti u `devDependencies`, paket ne sme biti dupliran u obe dependency grupe, a read-only/launch/admin Supabase smoke scriptovi moraju ostati u `package.json`
- surface audit proverava i UX guardrail-e: skip link/main targete, admin login `noindex,nofollow`, admin login label/id veze, mobilni Escape za hamburger meni i 44px consent touch target
- surface audit proverava i da zajednicki admin display/source/media helper-i ostanu u `src/features/admin/utils/adminDisplay.ts`, a mali admin UI elementi u `src/features/admin/components/AdminUi.tsx`, umesto da se ponovo gomilaju u `AdminDashboardPage.tsx`
- surface audit proverava i da lead forme zadrzavaju `autocomplete`/`inputMode` hintove za brze popunjavanje na desktopu i mobilnom
- surface audit proverava i da lead forme zadrzavaju lokalnu inline validaciju, `aria-invalid`/`aria-describedby` veze i fokus na prvo neispravno polje pre network submit-a
- surface audit proverava i da admin status leadova ima rollback/recovery guardrail ako Supabase persist ne uspe
- surface audit proverava i da kontakt modal forma zadrzava `aria-busy` tokom slanja, jer je to glavni konverzioni tok
- surface audit proverava i da animirane javne stranice zadrze `prefers-reduced-motion` fallback
- surface audit proverava i javni dropdown Escape guardrail, da se globalna navigacija ne zaglavi u otvorenom `aria-expanded` stanju
- surface audit proverava i JSX guardrail-e: svaki native `<button>` mora eksplicitno imati `type`, icon-only native dugmad moraju imati dostupno ime, svaki native `<form>` mora imati `onSubmit`, svaka native form kontrola mora imati dostupno ime, a svaki native `<a target="_blank">` mora imati `rel="noopener noreferrer"`
- surface audit proverava i da postoji read-only Supabase smoke script za REST/preflight proveru bez slanja formi, da smoke prijavljuje exact REST count i da javni `units` inventar ima svih 15 objavljenih stanova
- surface audit je uhvatio i uklonjen je preostali interni `href="/..."` u admin projektu; akcije sada koriste React Router `Link`
- `sass` je premesten iz runtime `dependencies` u `devDependencies`, jer je potreban za Vite/SCSS build, ne za runtime aplikacije
- dodat je `npm.cmd run quality` kao jedinstven lokalni gate koji pokrece surface audit, lint, build i dependency audit
- dodat je `npm.cmd run smoke:supabase:readonly` za bezbednu proveru javnih REST endpointa, blokiranih privatnih lead/log tabela i Edge Function CORS preflight-a
- dodat je `npm.cmd run smoke:supabase:launch` za isti read-only smoke, ali uz obavezan published `project_media` red pred launch
- dodat je `npm.cmd run smoke:supabase:admin` za kontrolisanu proveru Supabase Auth-a, `admin_profiles` RLS-a i citanja zasticenih admin tabela bez commitovanja admin kredencijala
- `smoke:supabase:admin` ima eksplicitnu opt-in opciju za obradu kontrolisanih test leadova: po defaultu ostaje read-only, a update na `closed` radi samo kada su zadati test e-mail ili eksplicitni test ID-jevi i `SUPABASE_ADMIN_SMOKE_PROCESS_TEST_LEADS="true"`
- UI admin smoke 2026-07-14: `/admin` -> `/admin/prijava` bez viseminutnog cekanja, login forma je interaktivna, submit sa admin nalogom ucitava dashboard iz Supabase baze, a admin `PageMeta` menja title u `Pregled prodaje i sadrzaja | Admin | M & M Gradnja`
- Supabase admin smoke 2026-07-14 sa aktivnim admin nalogom: Auth, `admin_profiles` i citanje zasticenih admin tabela prolaze za manje od 1s po fazi, bez izlaganja admin kredencijala u fajlovima ili logovima
- Admin processing smoke 2026-07-14: eksplicitno targetirani test leadovi su zatvoreni kroz admin RLS, bez menjanja realnih klijentskih upita
- `npm.cmd audit --omit=dev` i `npm.cmd audit --audit-level=low` posle dependency polish-a vracaju 0 vulnerabilities
- smoke rute posle poslednjih izmena:
  - `/`
  - `/kupujemo-placeve`
  - `/projekti/heroja-pinkija-13/ponuda-stanova/1`
  - `/admin`
  - `/favicon.svg`
- browser QA 2026-07-09:
  - javne rute imaju renderovane `h1`, title/meta/canonical/robots vrednosti i nemaju blokirajuci loading tekst;
  - proverene rute nemaju broken slike ni horizontal overflow na desktop sirini;
  - footer CTA je prisutan na prodajnim overview rutama, a sakriven na `/kontakt`, `/kupujemo-placeve` i detalju pojedinacnog stana;
  - kontakt modal na detalju stana otvara se u stranici, fokusira ime, nosi kontekst stana i zahteva telefon za taj tip upita;
  - Escape zatvara kontakt modal i vraca fokus na CTA koji ga je otvorio;
  - gornji tlocrt/preview na detalju stana otvara se kao in-page lightbox sa zakljucanim scroll-om i close dugmetom;
  - Escape zatvara lightbox i vraca body scroll;
  - mobile smoke na 390px za home, ponudu, detalj stana, kupujemo-placeve i admin login nema horizontal overflow ni broken slike;
  - mobilni hamburger prikazuje projektne podlinkove odmah, uz `aria-expanded="true"` kada je otvoren.
- browser polish QA posle poslednjih izmena:
  - `/admin/prijava` ima `noindex,nofollow`, admin-specific title/description, skip link, `#main-content`, `tabIndex=-1`, povezane email/lozinka label-e, `aria-busy=false` u idle stanju, bez broken slika, bez horizontal overflow-a i bez blocking loading teksta;
  - footer linkovi na desktopu imaju 36px visinu mete;
  - footer linkovi, kontakt mete i consent label na 390px viewport-u imaju 44px visinu mete i ne izazivaju horizontal overflow.
- browser runtime smoke 2026-07-10:
  - desktop prolaz kroz `/`, `/projekti`, `/projekti/heroja-pinkija-13`, `/projekti/heroja-pinkija-13/o-projektu`, `/projekti/heroja-pinkija-13/ponuda-stanova`, `/projekti/heroja-pinkija-13/ponuda-stanova/1`, `/projekti/heroja-pinkija-13/spisak-stanova`, `/o-nama`, `/politika-privatnosti`, `/lokacija`, `/kupujemo-placeve`, `/kontakt`, legacy `/apartmani/1`, 404 rutu, `/admin/prijava` i `/admin` nema broken slike, missing alt, horizontal overflow, error boundary ili blokirajuci loading tekst;
  - `/projekti` redirectuje na kanonsku projektnu stranu, legacy `/apartmani/1` redirectuje na kanonski detalj stana, a `/admin` bez sesije brzo zavrsava na `/admin/prijava`;
  - mobile 390px prolaz kroz glavne javne rute i `/admin/prijava` nema broken slike, missing alt, horizontal overflow, error boundary ili blokirajuci loading tekst;
  - console error log iz browser taba je prazan posle runtime smoke-a.
- browser runtime smoke 2026-07-14 posle admin/auth hardening-a:
  - desktop prolaz kroz 30 ruta nema broken slike, missing alt, horizontal overflow, error boundary ili blokirajuci loading tekst: home, projektne rute, ponuda, spisak, svih 15 detalja stanova, `/kontakt`, `/lokacija`, `/o-nama`, `/kupujemo-placeve`, `/politika-privatnosti`, legacy `/apartmani/1`, 404 rutu, `/admin` i `/admin/prijava`;
  - `/projekti` i legacy `/apartmani/1` redirectuju na kanonske rute, a `/admin` bez sesije zavrsava na `/admin/prijava`;
  - mobile 390px prolaz kroz 13 kljucnih ruta, ukljucujuci detalje stanova `/1`, `/8`, `/15` i `/admin/prijava`, nema broken slike, missing alt, horizontal overflow, error boundary ili blokirajuci loading tekst;
  - posle mobilnog smoke-a viewport override je resetovan na normalno browser stanje.
- browser runtime smoke 2026-07-15:
  - smart desktop/mobile prolaz kroz 43 route provere nema failova: nema stvarno broken slika, missing alt-a, horizontal overflow-a, error boundary-ja, blokirajuceg loading-a ili sirovih `tel:` href vrednosti;
  - posle zamene stock hero slika, `/` ucitava lokalni `/images/heroja-pinkija-13/hero-generated.png` hero sa `naturalWidth=1672`, produkcionim canonical URL-om i bez horizontalnog overflow-a;
  - `/kontakt` ucitava lokalni `/images/heroja-pinkija-13/gradilisna-tabla-slika.jpg` hero sa `naturalWidth=1672`, produkcionim canonical URL-om i bez horizontalnog overflow-a;
  - dopunska provera potvrdjuje da Home hero ima `width=1672 height=941`, Kontakt hero `width=1672 height=941`, da se atributi poklapaju sa natural dimenzijama i da nema console error-a;
  - runtime meta provera potvrdjuje da `/` ima `og:image` `/images/heroja-pinkija-13/gradilisna-tabla.jpg` sa `og:image:width=818` i `og:image:height=783`, dok detalj `/projekti/heroja-pinkija-13/ponuda-stanova/1` prebacuje `og:image` na `/images/apartment-plans/stan-1-6-11.png` sa `2105x1488`;
  - runtime provera potvrdjuje da `/` ima `og:image:alt` / `twitter:image:alt` = `Gradilisna tabla projekta Heroja Pinkija 13`, a detalj stana 1 = `Projektni tlocrt stanova 1, 6 i 11`;
  - runtime provera potvrdjuje `document.documentElement.lang="sr-Latn"`, `og:locale=sr_RS` i isti home description kroz `meta[name=description]`, `og:description` i `twitter:description`;
  - browser console error log je prazan posle Home/Kontakt provere;
  - lazy slike daleko ispod viewport-a su potvrdene kao false-positive za osnovni naturalWidth smoke, ne kao broken asseti;
  - `/projekti`, `/apartmani/1` i `/admin` redirecti ostaju ispravni.
- keyboard/interakcioni QA 2026-07-10:
  - javni dropdown `Projekti` se otvara, Escape ga zatvara, `aria-expanded` se vraca na `false`, a fokus ostaje na trigger-u;
  - kontakt modal se otvara iz header CTA-a, fokusira polje `Ime i prezime`, zakljucava body scroll, close dugme zatvara modal i vraca fokus na CTA `Pisite nam`;
  - honeypot `website` polje u kontakt modalu je offscreen, 1x1px, `overflow:hidden`, `tabIndex=-1` i iskljuceno iz focus-trap liste;
  - na 390px viewport-u zatvoren mobilni meni ne presrece klik na `Pisite nam`; modal se otvara iz sadrzaja strane, prima dugu test poruku bez horizontalnog overflow-a, a Escape ga zatvara i vraca fokus na CTA;
  - tabelarni spisak ima tri filtera, 15 redova u pocetnom stanju, filter sprata smanjuje prikaz na 5 redova, a `Ponisti filtere` vraca sve vrednosti na `all`;
  - admin login ima skip link, email/password labele, ispravne input tipove, submit dugme i `aria-busy=false` u idle stanju.
- keyboard/interakcioni QA 2026-07-14:
  - desktop header dropdown `Projekti` se otvara, prikazuje projektne linkove, Escape ga zatvara i fokus ostaje na trigger-u;
  - kontakt modal se otvara iz header CTA-a, fokusira ime, `aria-modal=true`, zakljucava scroll, ima `aria-busy=false` u idle stanju, a Escape ga zatvara i vraca fokus na CTA;
  - spisak stanova ima 15 redova, filter sprata smanjuje prikaz na 5 redova, a `Ponisti filtere` vraca 15 redova i sve filtere na `all`;
  - mobilni hamburger na 390px prikazuje projektne linkove, Escape zatvara meni, `aria-expanded` se vraca na `false`, label se vraca na `Otvori navigaciju`, fokus ostaje na toggle dugmetu i nema horizontal overflow-a;
  - admin login prikazuje `Admin prijava`, formu sa `aria-busy=false` i submit dugmetom; prijava otvara protected admin shell sa Supabase feedback-om, a `/admin` dashboard prikazuje `Pregled prodaje i sadrzaja`, metrike i nema horizontal overflow/error boundary.
- keyboard/interakcioni QA 2026-07-15:
  - header kontakt modal se otvara, prazan opsti submit ostaje lokalno, fokusira `name`, prikazuje inline greske za ime/e-mail/saglasnost i ne ulazi u busy/network stanje;
  - upit za konkretan stan na detalju stana dodatno zahteva telefon i nosi kontekst `Stan`, `Sprat`, `Povrsina`, `Struktura`, `Status`;
  - `/kupujemo-placeve` forma na prazan submit fokusira `name`, prikazuje inline greske za ime/telefon/e-mail/saglasnost i ostaje `aria-busy=false`;
  - mobilni hamburger na 390px prikazuje projektne linkove, Escape ga zatvara, fokus ostaje na toggle dugmetu i nema horizontal overflow-a.

## Preostali rizici i sledeci najkorisniji batch

### Completion audit prema originalnom cilju

| Zahtev | Dokaz | Status |
| --- | --- | --- |
| Proci kroz sve javne stranice | Browser smoke pokriva home, projekat, ponudu, spisak, 15 detalja stanova, kontakt, lokaciju, O nama, kupujemo placeve, politiku privatnosti, legacy redirect i 404. | Dokazano za automatizovani/runtime QA. |
| Procitati i uskladiti dokumentaciju | Azurirani su `Project-spec.md` pravac kroz audit, `Frontend-guide.md`, `Database_model.md`, `pre-production-runbook.md`, `client-admin-final-audit.md`, `supabase/README.md` i Figma/design brief je ukljucen kao izvor. | Dokazano za repo dokumentaciju. |
| Predloziti i primeniti premium/conversion dorade | Kontakt modal umesto redirekcije, inline validacija, normalizovani `tel:` linkovi, uklonjeni duplirani CTA tokovi, ocuvani detalji stanova i browser QA za desktop/mobile. | Implementirano i verifikovano. |
| Izbaciti visak/neaktivni kod | Surface audit proverava import graf i public asset reference; raniji prototip fajlovi, neaktivni project komponentni sloj, neupotrebljeni public project data export-i i neaktivna hero slika su uklonjeni. | Implementirano i pod guardrail-om. |
| Razmisliti unapred za admin panel | Admin sada pokriva pregled, upite, placeve, stanove/status, projekat i fajlove; audit opisuje sledece kasnije korake: media usage/variant, crop/focal point, status history i page_sections CMS. | Implementirano za v1, roadmap dokumentovan. |
| Proveriti Supabase/admin spremnost | Read-only, launch i admin smoke prolaze; controlled POST testovi i admin processing testovi su dokumentovani; advisor nalaz ima operator-run remediation plan. | Dokazano uz pre-production odluke. |
| Stabilizovati canonical/share domen | `PageMeta` vise ne koristi implicitni browser origin vec `VITE_PUBLIC_SITE_URL` kroz centralni site config; sitemap/robots ostaju vezani za isti finalni domen. | Implementirano; finalni domen jos treba poslovno potvrditi. |
| Zavrsiti bezbedno pred launch | Ostaju samo odluke koje zahtevaju eksternu potvrdu ili produkcioni zahvat: finalni domen, Supabase advisor WARN/INFO primena/prihvatanje, eventualni SSR/prerender. | Nije automatski zatvoreno; svesno ostavljeno kao launch odluka. |

### Pre produkcije

0. Proci `docs/pre-production-runbook.md` kao launch checklist.
1. Rucni keyboard QA celog tab redosleda kroz sve javne rute i admin sekcije.
2. Potvrditi finalni domen za sitemap/robots/canonical i `VITE_PUBLIC_SITE_URL`.
3. Ponoviti Supabase Auth, RLS, Edge Functions i email slanje samo ako se menjaju Supabase secrets, RLS politike ili Edge Functions.
4. Proveriti kontakt modal na mobilnom viewport-u i na dugim porukama.
5. Proveriti da status stana promenjen u adminu brzo stize do javne ponude u realnom Supabase okruzenju.
6. Pokretati `smoke:supabase:admin` kao regression gate kada se menjaju admin auth, RLS, env ili admin data fetch.
7. Odvojeno odluciti kada se primenjuju Supabase advisor WARN/INFO migracije: `set_updated_at` search_path, uklanjanje broad public bucket listing policy-ja, eventualno premestanje `citext` extension-a i ukljucivanje leaked password protection u Dashboard-u.

### Kasnije, ako klijent zeli jos vise kontrole

1. Prerender/SSR za SEO/share preview.
2. `page_sections` CMS sloj za home/about/contact/land staticke blokove.
3. `usage`/`variant` i crop/focal-point za media biblioteku.
4. PDF export tabelarnog spiska stanova.
5. Istorija promena statusa stanova.
6. Razbijanje `global.scss` na domenske SCSS fajlove kada se zavrsi poslednji veci UI batch.

## Zavrsna procena

Pravac je dobar i blizu produkcionog v1: javni deo vec radi ono sto je najvaznije za ovaj tip sajta - brzo informise kupca o dostupnim stanovima, daje mu tlocrt i osnovne cinjenice, a zatim ga bez trenja uvodi u kontakt modal. Admin panel vise nije genericki, nego prati realne potrebe prodaje: upiti, statusi, stanovi, projekat i fajlovi.

Preostali posao je vise hardening i final QA nego nova velika funkcionalnost.
