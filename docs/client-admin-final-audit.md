# Zavrsni audit klijentskog dela i admin smera

Datum: 2026-07-10

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

## Kratak zakljucak

Klijentski deo je vrlo blizu dobrog v1 stanja. Sajt sada ima jasnu premium real-estate prezentaciju, kanonski tok do ponude stanova, detalje stanova zadrzane u postojecem v1 obliku, kontakt modal bez redirekcije, stabilniji Supabase fallback i admin panel koji vec prati glavne operativne potrebe prodaje.

Najveci preostali dobici pre produkcije nisu novi veliki redesign, vec zavrsne provere:

1. rucni vizuelni prolaz kroz sve javne i admin rute u browseru;
2. produkciona Supabase/Edge Function provera sa realnim env vrednostima;
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
- Skip link postoji na javnom i admin layout-u.
- `favicon.svg` je dodat, tako da osnovna browser favicon referenca vise nije 404.

## Konverzioni tok i forme

### Kontakt modal

Kontakt modal je sada centralni kupacki tok:

- CTA-jevi tipa `Pisite nam` otvaraju modal na istoj stranici;
- modal prima kontekst: projekat, stan, dostupnost, obilazak ili opsti upit;
- success/error feedback ima live region;
- success stanje nudi zatvaranje ili povratak na ponudu stanova kroz SPA `Link`;
- telefon je obavezan za prodajno kriticne upite: konkretan stan, dostupnost i obilazak;
- telefon ostaje opcion za opste/privacy kontekste;
- Edge Function validacija prati isto pravilo.

### Land offer forma

Tok za prodavce placeva/starih kuca je odvojen:

- koristi sopstvenu formu;
- ima honeypot;
- ima `aria-busy` tokom slanja;
- success/error poruke imaju live region;
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
- Javne rute imaju ciljane meta vrednosti.
- Detalj stana koristi tlocrt kao share image.
- `kupujemo-placeve` koristi svoju optimizovanu hero sliku.
- `robots.txt` i XML-validan `sitemap.xml` su dodati u `public`; robots izuzima `/admin` i legacy `/apartmani/` putanju iz crawl-a.
- Sitemap ukljucuje 24 javna URL-a: home, projekat, ponuda/spisak, 15 detalja stanova, kontakt, lokacija, O nama, kupujemo placeve, politika privatnosti.
- Admin i legacy redirect rute nisu u sitemap-u.
- Sitemap `lastmod` vrednosti su osvezene na 2026-07-09 posle zavrsnog polish batch-a.
- `/admin/prijava` ima eksplicitan `noindex,nofollow`, neutralan admin title/description i kanonsku admin putanju, tako da se ne mesa sa javnim SEO signalima.
- 404 i pogresni detalji imaju `noindex,follow`.
- JSON-LD je konzervativan: Organization, ApartmentComplex i ContactPage, bez cena/rejtinga/ponuda koje nisu javno prikazane.

Rizik:

- Meta/JSON-LD su client-side. Za pouzdanije social share preview-e i crawler pokrivanje, sledeci arhitektonski korak je prerender/SSR.
- `robots.txt` i `sitemap.xml` koriste `https://mimgradnja.rs`; pre produkcije potvrditi da je to finalni domen.

## Performanse

Uradjeno:

- Admin auth provera ne sme da visi minutima: ako nema lokalne sesije, brzo vodi na login.
- Supabase public/admin citanja imaju kratke timeout fallbacke tamo gde bi spora mreza blokirala UI.
- Detalji stanova renderuju lokalni fallback odmah.
- Admin login submit ima timeout i jasnu poruku ako Supabase Auth ne odgovori.
- `kupovina-placeva-hero` je prebacen iz velikog PNG-a u optimizovan JPG.
- Hero/logo slike van detalja stanova imaju preciznije image hint-ove: poznate lokalne slike imaju dimenzije, prioritetne hero slike `fetchPriority="high"`, a dekorativnije/below-fold slike `loading="lazy"` i `decoding="async"` gde je bezbedno.
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
- Kontakt modal i land forma imaju status feedback.
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

Rizik:

- `database.types.ts` je rucno odrzavan lokalno. Pri svakoj sematskoj promeni SQL modela treba regenerisati ili azurirati tipove u istom PR-u.
- Produkciona RLS, Edge Function env vrednosti, Brevo kljucevi i rate-limit ponasanje moraju se proveriti u stvarnom Supabase okruzenju.

Read-only Supabase smoke, poslednja provera 2026-07-10:

- lokalni frontend `.env.local` ima `VITE_SUPABASE_URL` i `VITE_SUPABASE_ANON_KEY`;
- dodat je `mim-invest-frontend/.env.example` za javne Vite/Supabase vrednosti;
- dodat je `supabase/.env.example` za server-only Edge Function/Brevo vrednosti;
- Supabase CLI nije instaliran u ovom okruzenju, pa migracije/deploy nisu pokretani iz terminala;
- javni REST endpointi vracaju 200 za `projects`, `units`, `project_media` i `construction_updates`;
- cloud `project_media` trenutno vraca 0 redova, pa pre produkcije treba primeniti seed/media podatke ili ih uneti kroz admin;
- Edge Function `OPTIONS` preflight za `submit-contact-inquiry` i `submit-land-offer` vraca 200;
- Edge Functions sada dele helper za form rate-limit i proveravaju dva bucket-a: e-mail hash i IP/network hash;
- namerno nije radjen POST test kontakt/land forme, jer bi to napravilo realan upis i potencijalno email slanje.
- `npm.cmd run smoke:supabase:readonly` prolazi: `projects` vraca 1 red, `units` 5 redova, `construction_updates` 3 reda, privatne lead/log tabele vracaju 401 za anon key, a obe public Edge Function preflight provere vracaju 200 sa CORS origin-om `*`;
- isti smoke ostavlja upozorenje da je `project_media` dostupna preko REST-a, ali trenutno vraca 0 redova u cloud okruzenju.
- dodat je i `npm.cmd run smoke:supabase:launch`, read-only varijanta koja namerno pada ako `project_media` nema objavljene redove kada se ocekuje produkciono popunjena media biblioteka.

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

Napomena: `variables.scss` je ostao jer ga `global.scss` koristi kroz `@use`.

## Verifikacija

Do sada prolazi:

- `npm.cmd run quality`
- `npm.cmd run smoke:supabase:readonly` kada `.env.local` pokazuje na realan Supabase projekat
- `npm.cmd run lint`
- `npm.cmd run build`
- `npm.cmd run audit:surface`
- `npm.cmd run audit:deps`
- `git diff --check` bez stvarnih whitespace gresaka; postoje samo Windows LF -> CRLF upozorenja
- `npm.cmd run quality`, `git diff --check` i `npm.cmd run smoke:supabase:readonly` su ponovo provereni 2026-07-10;
- import graf: svi TS/JS fajlovi iz aplikacionog entry-ja su reachable
- public asset scan: svi public fajlovi imaju referencu u kodu, dokumentaciji, `index.html` ili Supabase seed-u
- dependency sanity scan: nema ocigledno neiskoriscenih runtime/dev paketa
- surface audit proverava import graf, public assete, interni hard-reload link regression, alt tekst, debug tokene, encoding/mojibake artefakte, sitemap/robots pravila i Supabase form rate-limit wiring
- surface audit proverava i Supabase schema hardening: default privilege revoke za buduce public objekte i eksplicitni public read grant za `project_media`
- surface audit proverava i da env template-i postoje i sadrze ocekivane javne/server-only kljuceve
- surface audit proverava package manifest sanity: runtime dependency mora imati source import, build-only `sass` mora biti u `devDependencies`, a paket ne sme biti dupliran u obe dependency grupe
- surface audit proverava i UX guardrail-e: skip link/main targete, admin login `noindex,nofollow`, admin login label/id veze i 44px consent touch target
- surface audit proverava i da lead forme zadrzavaju `autocomplete`/`inputMode` hintove za brze popunjavanje na desktopu i mobilnom
- surface audit proverava i da animirane javne stranice zadrze `prefers-reduced-motion` fallback
- surface audit proverava i javni dropdown Escape guardrail, da se globalna navigacija ne zaglavi u otvorenom `aria-expanded` stanju
- surface audit proverava i JSX guardrail-e: svaki native `<button>` mora eksplicitno imati `type`, icon-only native dugmad moraju imati dostupno ime, svaki native `<form>` mora imati `onSubmit`, svaka native form kontrola mora imati dostupno ime, a svaki native `<a target="_blank">` mora imati `rel="noopener noreferrer"`
- surface audit proverava i da postoji read-only Supabase smoke script za REST/preflight proveru bez slanja formi
- surface audit je uhvatio i uklonjen je preostali interni `href="/..."` u admin projektu; akcije sada koriste React Router `Link`
- `sass` je premesten iz runtime `dependencies` u `devDependencies`, jer je potreban za Vite/SCSS build, ne za runtime aplikacije
- dodat je `npm.cmd run quality` kao jedinstven lokalni gate koji pokrece surface audit, lint, build i dependency audit
- dodat je `npm.cmd run smoke:supabase:readonly` za bezbednu proveru javnih REST endpointa, blokiranih privatnih lead/log tabela i Edge Function CORS preflight-a
- dodat je `npm.cmd run smoke:supabase:launch` za isti read-only smoke, ali uz obavezan published `project_media` red pred launch
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
- keyboard/interakcioni QA 2026-07-10:
  - javni dropdown `Projekti` se otvara, Escape ga zatvara, `aria-expanded` se vraca na `false`, a fokus ostaje na trigger-u;
  - kontakt modal se otvara iz header CTA-a, fokusira polje `Ime i prezime`, zakljucava body scroll, close dugme zatvara modal i vraca fokus na CTA `Pisite nam`;
  - honeypot `website` polje u kontakt modalu je offscreen, 1x1px, `overflow:hidden`, `tabIndex=-1` i iskljuceno iz focus-trap liste;
  - na 390px viewport-u zatvoren mobilni meni ne presrece klik na `Pisite nam`; modal se otvara iz sadrzaja strane, prima dugu test poruku bez horizontalnog overflow-a, a Escape ga zatvara i vraca fokus na CTA;
  - tabelarni spisak ima tri filtera, 15 redova u pocetnom stanju, filter sprata smanjuje prikaz na 5 redova, a `Ponisti filtere` vraca sve vrednosti na `all`;
  - admin login ima skip link, email/password labele, ispravne input tipove, submit dugme i `aria-busy=false` u idle stanju.

## Preostali rizici i sledeci najkorisniji batch

### Pre produkcije

0. Proci `docs/pre-production-runbook.md` kao launch checklist.
1. Rucni keyboard QA celog tab redosleda kroz sve javne rute i admin sekcije.
2. Potvrditi finalni domen za sitemap/robots.
3. Testirati Supabase Auth, RLS, Edge Functions i email slanje u stvarnom environment-u.
4. Proveriti kontakt modal na mobilnom viewport-u i na dugim porukama.
5. Proveriti da status stana promenjen u adminu brzo stize do javne ponude u realnom Supabase okruzenju.

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
