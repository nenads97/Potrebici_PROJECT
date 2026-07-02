# Zavrsni audit klijentskog dela i admin smera

Datum: 2026-07-02

## Trenutni zakljucak

Klijentski deo je blizu dobrog v1 stanja: vizuelni pravac je premium, tok za detalje stanova je mnogo jasniji posle redesign-a, a kontakt modal sada smanjuje trenje izmedju interesovanja i slanja upita. Najveci preostali dobici su u tri oblasti:

1. jos brze poredjenje stanova,
2. bolja SEO/metapodatkovna osnova,
3. admin panel koji uredjuje tacno ono sto javni sajt sada prikazuje.

## Sta je vec dobro postavljeno

- Jasan primarni konverzioni cilj: korisnik brzo dolazi do ponude stanova i moze da posalje upit bez redirekcije.
- Detalj stana sada koristi kanonsku putanju `/projekti/heroja-pinkija-13/ponuda-stanova/:apartmentNumber`.
- Legacy `/apartmani/:apartmentNumber` radi redirect, sto je dobro za stare linkove.
- Heroja Pinkija 13 stranica ima dobar premium ton: manje generickog SaaS jezika, vise konkretnih cinjenica.
- "O nama" i "Politika privatnosti" su vizuelno uskladjene sa novim pravcem.
- Modal kontakt forma je centralizovana i kontekstualna: moze da ponese stan, lokaciju, projekat ili privacy temu.
- Supabase model vec podrzava v1 potrebe: upiti, ponude placeva, jedinice, mediji, statusi, admin beleske.
- Admin panel vec cita/pise osnovne operativne podatke kada je Supabase konfigurisan.

## Sta je ocisceno tokom ovog audita

Uklonjeni su neaktivni pre-redesign/prototip fajlovi koji nisu bili importovani u aktivne rute:

- `src/features/projects/components/ProjectFooter.tsx`
- `src/features/projects/components/ProjectGallery.tsx`
- `src/features/projects/components/ProjectHeader.tsx`
- `src/features/projects/components/ProjectHero.tsx`
- `src/features/projects/components/ProjectInfoSections.tsx`
- `src/features/projects/components/ProjectUpdates.tsx`
- `src/views/pages/projects/HerojaPinkija13/ProjectOverviewPage.tsx`
- `src/core/validators/contextValidator.ts`

Napomena: `variables.scss` je proverom vracen jer ga `global.scss` koristi kroz `@use`.

## Sitne dorade vec primenjene

- Dodata `/projekti` ruta koja vodi na aktuelni projekat.
- Error poruke u kontakt/land formama koriste `role="alert"`, a success koristi `role="status"`.
- Admin copy vise ne zvuci kao prototip "pre povezivanja" nego kao operativni panel.

## Prioritet 1: zavrsno peglanje klijentskog dela

### 1. `/spisak-stanova` mora biti stvarno tabelarni prikaz

Uradjeno u ovom batch-u: `/projekti/heroja-pinkija-13/spisak-stanova` sada koristi zaseban tabelarni izlaz preko `ApartmentsTablePage`, sa kolonama za stan, sprat, povrsinu, strukturu, status i link ka detalju.

Preostale dorade:

- dodati brzo skeniranje po spratu i strukturi;
- dodati filtere direktno na tabelarni prikaz ili deliti filter state sa karticnim prikazom;
- razmotriti export/print prikaz ako prodajni tim zeli da salje spisak kupcima.

Ovo je verovatno najkorisniji dodatak za korisnike koji zele brzo poredjenje.

### 2. SEO metadata za svaku javnu rutu

Uradjeno u ovom batch-u: dodat je mali `PageMeta` sloj i povezan je na javne rute:

- pocetna,
- O nama,
- Kontakt,
- Kupujemo placeve,
- Lokacija,
- Politika privatnosti,
- Heroja Pinkija 13,
- Ponuda stanova,
- Detalj stana.

Preostaje napredniji SEO posao, posebno ako se kasnije uvede prerender/SSR ili server-side meta za share preview.

Predlog za sledecu fazu:

- canonical URL po ruti;
- Open Graph title/description/image;
- moguci prerender za javne stranice;
- povezati SEO polja iz Supabase tabela kada admin pocne da ih uredjuje.

### 3. Modal forma: jos precizniji UX

Uradjeno u ovom batch-u: modal sada ima jasniji success/error feedback, error ikonicu, `aria-live` najave i success akcije "Zatvori" / "Pogledajte ponudu stanova" umesto ponovnog slanja prazne forme.

Preostale dorade za maksimalnu konverziju:

- dodati "Telefon" kao preporuceno polje u copy-ju, a ne samo opciono polje;
- razmisliti da telefon postane obavezan za `viewing` i `unit` upite, ako prodajni proces zavisi od poziva;
- dodati mikrocopy ispod dugmeta: "Odgovaramo u najkracem roku" / "Bez obaveze kupovine";

### 4. Statusi stanova i administrativna istina

Javni sajt dobro prikazuje statuse, ali treba proveriti tok:

- status promenjen u adminu mora se odmah reflektovati na ponudi;
- na detalju stana treba vizuelno jasnije tretirati rezervisano/prodato stanje;
- ako je stan prodat, CTA ne treba potpuno nestati, ali copy treba da bude "Pitajte za slicne stanove".

### 5. Slike i performanse

Vecina slika ima alt tekst i dimenzije, ali preporuka je:

- proveriti realnu velicinu svih PNG tlocrt slika;
- razmotriti WebP/AVIF varijante za velike fotografije;
- za hero slike dodati bolje `fetchpriority`/lazy strategije po potrebi;
- u admin panelu voditi `alt_text` kao obavezno polje za objavljene slike.

### 6. Kontakt stranica sada treba da bude "hub", ne druga forma

Kontakt stranica je prebacena na modal tok. Sledece poboljsanje:

- uciniti da kartice Telefon/E-mail/Adresa izgledaju kao izbori po nameri:
  - "Hocu brz poziv"
  - "Zelim pisani upit"
  - "Zelim da obidjem lokaciju"
- trenutni direktni mailto linkovi mogu ostati kao sekundarni kontakt, ali primarni digitalni upit treba da bude modal.

## Prioritet 2: content i poverenje

### 1. Jasan "sta je odvojena kupovina"

Dokumentacija ispravno insistira da garaze i ostave nisu ukljucene u cenu stana. Ovaj princip treba svuda dosledno cuvati:

- "Garazno mesto: odvojena kupovina"
- "Ostava: odvojena kupovina"
- ne koristiti formulacije koje zvuce kao da su ukljucene.

### 2. Dodati kratak "kako izgleda proces kupovine"

Na detalju stana ili u `O projektu` korisno je imati 3 koraka:

1. posaljete upit za stan,
2. dobijate cenu/dostupnost/termin,
3. obilazak i dogovor oko rezervacije.

To smanjuje neizvesnost i povecava broj upita.

### 3. Pojacati poverenje bez preterivanja

Posto je ovo prvi projekat, dobar pravac je transparentnost, ne lazni portfolio. Predlozi:

- "Prvi projekat, direktna komunikacija sa investitorima";
- realne slike radova;
- datumi i faze radova;
- jasno odvojene informacije od marketinskih tvrdnji.

## Prioritet 3: admin panel prilagodjen trenutnoj klijentskoj strani

Admin treba da prati javni sajt, ne genericki CMS. Predlozena struktura:

### 1. Dashboard pocetna

Dodati `/admin` pregled sa:

- novi upiti za stanove;
- novi upiti za placeve;
- broj slobodnih/rezervisanih/prodatih stanova;
- poslednji upiti;
- brze akcije: "Promeni status stana", "Dodaj sliku/tlocrt", "Uredi projekat".

### 2. Upiti za stanove

Uradjeno u ovom batch-u:

- `unitCode` dobija brz link ka javnom detalju stana;
- `sourcePage` dobija brz link ka izvoru upita;
- interna beleska se vise ne cuva na svaki keystroke, vec lokalno editovanje ima dugme "Sacuvaj belesku";
- isti princip je primenjen i na upite za placeve;
- status update ostaje brz/instant, jer je to operativno korisno.

Preostale dorade:

- prikazati `inquiryType` kao tag: opsti, stan, obilazak, dostupnost;
- prikazati feedback po kartici, ne samo globalni admin feedback.

### 3. Stanovi i statusi

Ovo treba da bude srce admina:

- tabela stanova sa filterom po spratu/statusu/strukturi;
- brzo menjanje statusa;
- edit osnovnih polja koja se vide javno: kratak opis, full opis, dostupnost, highlight;
- prikaz koji tlocrt/plan variant koristi stan;
- upozorenje ako je stan sakriven ili nema sliku/tlocrt.

### 4. Projekat

Trenutni panel pokriva osnovu, ali javni sajt sada ima vise sekcija. Admin treba da podrzi:

- hero tekst;
- status radova;
- rokovi;
- lokacijski tekst;
- prednosti projekta;
- detalje o parkingu/ostavama;
- CTA copy.

### 5. Slike i PDF fajlovi

Trenutno se uredjuje metadata. Sledeci realni korak:

- Supabase Storage upload;
- media type filter;
- preview slike/PDF-a;
- povezivanje fajla sa projektom ili stanom;
- obavezni alt tekst za objavljene slike;
- oznaka "koristi se na javnoj stranici" gde je moguce.

## Tehnicki rizici / dug za kasnije

- `global.scss` je veoma velik. Nije blokator, ali dugorocno bi ga trebalo cepati po domenima: layout, forms, public pages, apartment detail, admin.
- Centralni SEO/page-meta sloj je dodat, ali je jos client-side; za bolji share preview kasnije treba prerender/SSR ili drugi build pristup.
- Nema error boundary-ja oko javnog app-a/admina.
- Browser vizuelna provera trenutno zavisi od in-app browser plugin-a; ako plugin ne radi, treba proveravati kroz lokalni browser rucno ili dodati Playwright smoke test kasnije.
- `spisak-stanova` ima zaseban tabelarni prikaz; preostaju filteri i eventualno print/export.
- Local TS fallback data i Supabase seed nisu 1:1 za sve novo dodate slike/tlocrte; admin i baza treba da dobiju bolji media model za crop/hero/comparison/showcase varijante.

## Predlog sledeceg implementacionog batch-a

1. Dodati `inquiryType` tagove i feedback po admin kartici.
2. Dodati pregled/preview za medije i plan za Storage upload.
3. Dodati filtere i/ili print-friendly varijantu tabelarnog spiska.
4. Dodati error boundary za javni app i admin shell.
5. Proveriti i uskladiti Supabase seed/media model sa novim tlocrt varijantama.

## Verifikacija do sada

- `npm.cmd run lint` prolazi.
- `npm.cmd run build` prolazi.
- Uklonjeni neaktivni fajlovi nisu bili importovani.
- `/projekti` ruta je dodata kao redirect na aktuelni projekat.
- `PageMeta` je dodat i javne rute sada imaju title/description u browseru.
- `/spisak-stanova` sada ima zaseban tabelarni prikaz.
- Kontakt modal ima success/error akcije i live feedback.
- Admin upiti imaju link ka stanu/izvoru i eksplicitno cuvanje interne beleske.
