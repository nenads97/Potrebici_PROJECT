# Figma Generate Design Brief - Real Estate Gallery Site

## Goal

Create a premium real-estate gallery website design for the residential project:

- Project: Heroja Pinkija 13
- Location: Heroja Pinkija 13, Novi Sad, Telep
- Investor: M & M Gradnja
- Building structure: PO + P + 3
- Construction start: March 16, 2026
- Planned completion: November 15, 2027

The design must help buyers quickly understand the project, view latest construction and sales information, scan apartment availability, and contact the investor.

Primary conversion action:

Ask about an available apartment or unit.

## Design Direction

The visual tone should be:

- modern
- minimal
- warm
- premium
- elegant
- calm
- trustworthy
- real-estate focused, not SaaS-like

Avoid:

- generic landing-page hero blocks
- loud gradients
- excessive icons
- cluttered apartment cards
- heavy decorative shapes
- hardcoded colors if design system tokens exist
- rounded oversized marketing cards inside cards
- text overlap on mobile

## Figma Best-Practice Requirements

Use the `figma-generate-design` workflow section by section.

Before drawing manually:

1. Search existing design system components.
2. Search variables for colors, spacing, radius, and borders.
3. Search text styles for headings, body, captions, and labels.
4. Use component instances for buttons, inputs, cards, badges, navigation, tabs, and form controls when available.
5. Use variables/tokens instead of hardcoded hex values and spacing whenever possible.
6. Build a wrapper frame first, then append each section inside it.
7. Validate each section with screenshots before moving to the next section.

Frame targets:

- Desktop: 1440px wide
- Tablet: 834px wide
- Mobile: 390px wide

Use auto layout throughout:

- Page wrapper: vertical, centered, fixed width on desktop, hug height
- Sections: full width, constrained inner content
- Cards: stable min height, no layout shift
- Filters: wrap on mobile
- Header: sticky-style composition, compact mobile behavior

## Suggested Design Tokens

If the design system has equivalent tokens, use them. Otherwise create local variables with these names and values.

Colors:

```scss
site/bg: #f8f6f1
site/surface: #eee8df
site/muted-surface: #ddd4ca
site/ink: #1d1c19
site/ink-muted: #625f58
site/accent: #b6925f
site/accent-dark: #80633b
site/forest: #4f675e
site/slate: #343b45
site/clay: #b36a4c
site/border: rgba(29, 28, 25, 0.12)
site/white: #ffffff
```

Spacing:

```txt
space/4: 4
space/8: 8
space/12: 12
space/16: 16
space/24: 24
space/32: 32
space/48: 48
space/64: 64
space/80: 80
```

Radii:

```txt
radius/6: 6
radius/8: 8
```

Typography:

```txt
Display: 72 / 0.98 / 700
H1 Mobile: 42 / 1.05 / 700
H2: 44 / 1.08 / 650
H3: 20 / 1.25 / 650
Body Large: 19 / 1.65 / 400
Body: 16 / 1.65 / 400
Label: 13 / 1.2 / 700
```

Use letter spacing 0.

## Screen Structure

### 1. Header

Purpose:
Give immediate brand recognition and simple navigation.

Content:

- Logo: M & M Gradnja
- Nav items: Informacije, Galerija, Stanovi, Lokacija, Kontakt
- CTA: Posalji upit

Layout:

- Desktop: logo left, nav centered, CTA right
- Mobile: compact logo mark, CTA right, nav wraps below
- Background should feel translucent/off-white, not heavy

Best practices:

- Use button component for CTA if available
- Keep nav text small and calm
- Avoid tall header on desktop

### 2. Hero

Purpose:
Immediately communicate project, location, status, and primary action.

Content:

- Eyebrow: Izgradnja u toku
- H1: Heroja Pinkija 13
- Lead: Moderan stambeno-poslovni objekat na pocetku Telepa, osmisljen za miran zivot uz brzu vezu sa gradom.
- CTA 1: Pogledaj stanove
- CTA 2: Kontaktiraj investitora
- Meta cards:
  - Pocetak gradnje: 16. mart 2026.
  - Planirani zavrsetak: 15. novembar 2027.
  - Struktura objekta: PO + P + 3

Visual:

- Large editorial gallery mosaic on the right
- Use image placeholders that imply:
  - render fasade
  - gradiliste
  - spratne osnove
  - lokacija

Important:

- Do not claim placeholder visuals are real photos.
- If real render/photos are available later, the layout should support replacing placeholders with images.

Desktop layout:

- 2 columns
- Left: copy and actions
- Right: 2-column visual mosaic
- Key stats below or aligned under hero content

Mobile layout:

- Copy first
- Actions full width
- Meta cards stacked
- Gallery tiles stacked

### 3. Latest Information

Purpose:
Show that the project is active and regularly updated.

Cards:

1. Gradiliste
   - Title: Objekat je u fazi izgradnje
   - Body: Pregled projekta je pripremljen za redovno objavljivanje novih informacija, fotografija i statusa radova.

2. Stanovi
   - Title: Dostupni su upiti za stanove po spratovima
   - Body: U ponudi su garsonjere, dvosobni i trosobni stanovi, sa jasnim statusom: slobodan, rezervisan ili prodat.

3. Plan
   - Title: Planirani zavrsetak je 15. novembar 2027.
   - Body: Timeline prikazuje najvaznije faze gradnje i daje kupcima jednostavan pregled razvoja projekta.

Best practices:

- Cards should be calm and readable
- Use badge/tag component for category if available
- Keep equal heights on desktop

### 4. Gallery

Purpose:
Make the website feel like a gallery/news hub for construction progress and sales.

Gallery categories:

- Render fasade
- Gradiliste
- Spratne osnove
- Lokacija
- Enterijer
- Parking i ostave

Card content:

- Image/visual area
- Category tag
- Title
- Meta description

Best practices:

- Use a 3-column grid on desktop
- Use 2 columns on tablet
- Use 1 column on mobile
- Image aspect ratios must remain stable
- No text should overlap visual content unless placed on a strong readable scrim

### 5. Apartment Availability

Purpose:
This is the main sales section.

Header:

- Eyebrow: Prodaja stanova
- H2: Dostupnost po spratu i strukturi
- Supporting text: Statusi su prikazani tekstualno i bojom radi lakseg skeniranja.

Filters:

- Floor: Svi spratovi, 1. sprat, 2. sprat, 3. sprat
- Structure: Sve strukture, Studio, Dvosoban, Trosoban
- Status: Svi statusi, Slobodni, Rezervisani, Prodati

Apartment card fields:

- Code: S1-01
- Status badge: Slobodan / Rezervisan / Prodat
- Area: 36.8 m2
- Structure: Studio / Dvosoban / Trosoban
- Floor
- Orientation
- Short description
- CTA: Upit za ovaj stan

Status colors:

- Available: green semantic, readable label
- Reserved: amber semantic, readable label
- Sold: muted red/clay semantic, readable label

Best practices:

- Do not rely only on color for status.
- Use text labels inside badges.
- Apartment cards should be scannable, not decorative.
- CTA should be visible but not aggressive.
- Mobile cards should stack cleanly with no horizontal scroll.

### 6. Building Structure

Purpose:
Explain object organization clearly.

Cards:

- PO: Podrum
  - 15 ostava
  - 13 garaznih parking mesta

- P: Prizemlje
  - 2 poslovna prostora
  - 3 poslovna apartmana

- 1-3: Stambeni spratovi
  - 5 stanova po spratu
  - Studio, dvosobni i trosobni stanovi

- Dv.: Dvoriste
  - 10 spoljasnjih parking mesta
  - Mirniji pristup objektu

Best practices:

- Use concise level markers
- Avoid overly complex floor diagrams at this stage
- Layout should be easy to scan

### 7. Location

Purpose:
Explain why the location is attractive without overpromising.

Content:

- H2: Heroja Pinkija 13, Novi Sad
- Body: Pocetak Telepa je praktican izbor za kupce koji zele mirniji stambeni ambijent, ali i brzu vezu sa centrom, skolama, trgovinom i rekreativnim zonama uz Dunav.

Tags:

- pocetak Telepa
- linija 12 ka centru
- Lidl u blizini
- Gimnazija Laza Kostic u blizini
- Kej, Ribarac, Sodros i parkovi
- planirana veza prema Fruskoj gori

Visual:

- Stylized map card
- Marker: Heroja Pinkija 13
- Secondary markers: Centar, Kej

Best practices:

- Do not use a fake detailed map that implies exact geography.
- Make the visual explicitly stylized.
- Keep copy elegant and restrained.

### 8. Construction Timeline

Purpose:
Give buyers confidence and context.

Items:

- 16.03.2026. - Pocetak izgradnje
- 2026. - Temelji i konstrukcija
- 2027. - Unutrasnji radovi
- 15.11.2027. - Planirani zavrsetak

Best practices:

- Use timeline states: done, active, upcoming
- Use subtle markers, not loud progress bars
- On mobile, stack items vertically

### 9. Contact CTA / Form

Purpose:
Convert interest into inquiry.

Copy:

- Eyebrow: Kontakt
- H2: Zatrazite dostupnost ili dodatne informacije
- Body: Forma je pripremljena za opste upite i upite za konkretan stan.

Fields:

- Ime i prezime
- Telefon
- Email
- Interesovanje
- Poruka
- Submit: Posalji upit

Best practices:

- Every input must have a visible label.
- Use accessible contrast.
- On mobile, all fields are single column.
- Do not make the form visually heavier than the content.

### 10. Footer

Content:

- M & M Gradnja logo
- Short trust statement
- Project name
- Address
- Contact link

Best practices:

- Minimal footer
- Use darker slate only if contrast is clean
- Do not add unnecessary columns

## Figma Generation Steps

Use this sequence:

1. Create page/frame named `Heroja Pinkija 13 - Real Estate Website`.
2. Create desktop frame: `Desktop / Heroja Pinkija 13 / 1440`.
3. Create mobile frame: `Mobile / Heroja Pinkija 13 / 390`.
4. Search/import design system components:
   - button
   - card
   - badge
   - input
   - textarea
   - select
   - nav item
   - tag/chip
5. Search/import variables:
   - background
   - surface
   - text
   - border
   - accent
   - spacing
   - radius
6. Search/import styles:
   - display heading
   - section heading
   - body
   - label
   - card shadow
7. Build one section at a time inside the wrapper.
8. Return node IDs after every created section.
9. Screenshot and validate after every major section.
10. Create mobile adaptation after desktop structure is validated.

## Validation Checklist

Before considering the design done:

- One clear H1
- Primary CTA visible in first viewport
- Hero makes the project name and location obvious
- Gallery is visible and feels central to the site
- Apartment availability is easy to scan
- Statuses use both text and color
- Contact form labels are visible
- Mobile has no horizontal scroll
- Text does not overlap cards, images, buttons, or form fields
- Buttons have stable dimensions
- Cards do not shift when content changes
- Visuals do not imply fake real photos
- Color palette feels warm and premium but not one-note beige
- Design system components/tokens are used wherever available

## Ready-To-Use Prompt

Create a premium real-estate gallery website screen in Figma for `Heroja Pinkija 13`, a residential and mixed-use building by `M & M Gradnja` at `Heroja Pinkija 13, Novi Sad, Telep`.

Design a modern, minimal, warm, trustworthy sales-focused website. The page must show latest construction information, a project gallery, apartment availability, building structure, location highlights, construction timeline, and contact form.

Use Figma best practices: auto layout, reusable component instances, design system variables, text styles, spacing tokens, stable card dimensions, accessible contrast, responsive desktop and mobile frames, and section-by-section validation. Avoid generic SaaS landing page styling, loud gradients, clutter, fake photo claims, and mobile text overlap.

The first viewport must clearly show:

- M & M Gradnja brand
- `Heroja Pinkija 13`
- `Izgradnja u toku`
- location context: Novi Sad / Telep
- CTAs: `Pogledaj stanove` and `Kontaktiraj investitora`
- gallery-style visual mosaic for render, construction progress, floor plans, and location
- construction start: `16. mart 2026.`
- planned completion: `15. novembar 2027.`
- building structure: `PO + P + 3`

Use warm neutral colors with dark ink, muted surfaces, gold/beige accent, forest green status accents, slate footer, and subtle borders. Use gallery cards and apartment cards that are clean, scannable, and sales-oriented.
