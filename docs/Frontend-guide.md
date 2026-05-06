# FRONTEND_GUIDE.md

## 1. Frontend overview

The frontend is a modern, responsive real estate website for the residential project:

**Heroja Pinkija 13, Novi Sad**

The goal of the frontend is to present the building clearly, highlight the location value, show available units and make it easy for potential buyers to contact the investor.

The frontend should be built with:

- React
- Vite
- TypeScript
- SCSS
- shadcn/ui
- Framer Motion
- lucide-react

The application should be clean, elegant, buyer-focused and easy to maintain.

---

## 2. Frontend goals

The main frontend goals are:

- present the project in a premium and trustworthy way
- help users quickly understand the building structure
- make apartment availability easy to scan
- make contact actions visible and accessible
- keep the codebase modular and reusable
- avoid hardcoded repeated content
- prepare the frontend for future API integration

The most important user action is:

**Ask about an available apartment or unit.**

---

## 3. Design direction

The design should feel:

- modern
- minimal
- warm
- premium
- calm
- elegant
- trustworthy

The website should look like a serious real estate presentation, not like a generic SaaS landing page.

Use:

- lots of whitespace
- large project images or renders
- clean typography
- warm neutral colors
- soft shadows
- subtle borders
- clear cards
- strong but tasteful call-to-action sections

Avoid:

- too many colors
- aggressive animations
- generic landing page blocks
- corporate/SaaS look
- cluttered apartment cards
- too many icons
- heavy gradients
- unnecessary visual noise

Preferred visual reference:

- modenagradnja.com style direction
- elegant real estate presentation
- warm premium residential tone

---

## 4. Color palette

Use SCSS variables for global colors.

```scss
$site-bg: #f9f8f6;
$site-surface: #efe9e3;
$site-muted: #d9cfc7;
$site-accent: #c9b59c;
$site-text: #1f1f1f;
$site-text-muted: #6f6a64;
$site-border: rgba(31, 31, 31, 0.12);
$site-white: #ffffff;
```
