# AGENTS.md

# Important

Always read AGENTS.md before generating code.
Follow architecture, naming, styling, and design rules strictly.
Prefer consistency over creativity.

## Project context

This is a modern real estate presentation website for M & M Gradnja.

The website represents residential construction projects in Novi Sad and should primarily serve as a professional presentation and apartment sales platform.

Main project page:

`/src/views/pages/projects/HerojaPinkija13/HerojaPinkija13Page.tsx`

Home page:
`/src/views/pages/HomePage.tsx`

The Heroja Pinkija 13 project represents a residential building currently under construction at the beginning of Telep in Novi Sad.

The website should look modern, elegant, trustworthy, premium, and sales-oriented.

The website should also contain a dedicated section/page for land acquisition:

`/kupujemo-placeve`

This section should present M & M Gradnja as a company interested in purchasing attractive land plots for future residential projects in Novi Sad and surrounding areas.

The tone should remain professional, modern, and trustworthy.

---

# Tech stack

- React
- Vite
- TypeScript
- SCSS
- React Router

Potential future integrations:

- Umbraco CMS
- .NET backend
- PostgreSQL
- Docker
- Railway hosting

---

# Architecture

Use clean frontend architecture.

Recommended structure:

src/
app/
router/
providers/

pages/
home/
projects/
land-acquisition/

features/
projects/
components/
data/
types/

    land-acquisition/
      components/
      data/
      types/

shared/
components/
layouts/
styles/
utils/
types/

---

# Design direction

The website should use a modern premium real estate style.

Use:

- large whitespace
- elegant typography
- soft shadows
- rounded corners
- modern cards
- clean sections
- large visual blocks
- responsive layouts
- premium but minimal styling

Preferred palette:

- white
- off-white
- dark gray
- black
- beige/gold accent colors

Avoid:

- overly colorful UI
- flashy animations
- cluttered layouts
- generic template feeling

The site should feel custom-made and premium.

---

# Coding rules

- Use TypeScript strictly.
- Use functional React components.
- Keep components modular and reusable.
- Avoid massive JSX files.
- Split sections into separate components.
- Keep styling organized.
- Avoid hardcoded large text blocks inside components.
- Store long content in separate data files when appropriate.
- Use semantic HTML.
- Use accessible forms and buttons.
- Use one H1 per page.
- Use logical H2/H3 hierarchy.
- Make everything responsive.
- Prefer readable code over overly clever abstractions.
- Avoid unnecessary dependencies.

---

# Routing

Use simple React Router structure.

Avoid:

- complex route generators
- overengineered routing systems
- unnecessary protected routes

Keep routing clean and explicit.

Example:

- /
- /projekti
- /projekti/heroja-pinkija-13
- /kupujemo-placeve
- /kontakt

---

# Providers

Use a simple AppProviders pattern for future scalability.

Example future usage:

- ThemeProvider
- React Query Provider
- Auth Provider
- Toast Provider

Do not overengineer providers initially.

---

# Styling

Use SCSS.

Recommended structure:

shared/styles/
global.scss
variables.scss
mixins.scss
typography.scss
utilities.scss

Prefer BEM-style naming.

Example:

project-hero
project-hero**content
project-hero**title

Avoid deeply nested selectors, maximum 4 words.

---

# Heroja Pinkija 13 page

The page should contain:

1. Hero section
2. Project intro
3. Location section
4. Available apartments
5. Project advantages
6. Investor section
7. Construction progress gallery
8. CTA section
9. Contact form

Main selling points:

- Attractive location
- Beginning of Telep
- Modern apartments
- Nearby city center connection
- Nearby nature
- Functional layouts
- Trustworthy investor
- Building under construction

Important location details:

- Heroja Pinkija 13
- Novi Sad
- Telep
- Bus line 12
- Lidl nearby
- Gimnazija Laza Kostić nearby
- Quay and parks nearby
- Future bridge connection toward Fruška gora

---

# Land acquisition section

The website should also contain a modern section/page for land acquisition.

Route:
`/kupujemo-placeve`

Purpose:
Present M & M Gradnja as a company interested in purchasing attractive land for future residential developments.

This section should:

- build trust
- feel professional
- encourage contact submissions

Suggested content:

- headline
- short introduction
- benefits of cooperation
- types of land being considered
- contact CTA
- inquiry form

Tone:

- professional
- direct
- trustworthy
- investor-oriented

Suggested messaging examples:

- "M & M Gradnja razmatra atraktivne lokacije za buduće stambene projekte."
- "Pružite nam mogućnost da na vašem zemljištu izgradimo moderan stambeni kompleks."

---

# Dummy data

Until backend integration is ready, use dummy data.

Apartment object example:

- id
- code
- floor
- area
- structure
- orientation
- status

Statuses:

- available
- reserved
- sold

---

# Accessibility

- Forms must have labels.
- Buttons must have visible hover states.
- Images must have alt text.
- Apartment statuses should not rely only on colors.
- Ensure readable contrast.

---

# Performance

- Optimize images.
- Avoid unnecessary rerenders.
- Lazy load large sections/images if needed.
- Keep bundle size reasonable.

---

# Final goal

The website should feel like a serious premium real estate presentation for a modern investor in Novi Sad.

It should create trust, clearly present projects, highlight location advantages, and naturally guide users toward contacting the investor.
