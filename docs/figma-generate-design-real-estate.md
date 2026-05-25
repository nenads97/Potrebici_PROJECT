# FIGMA_DESIGN_BRIEF.md

## AI context

Design target: premium real estate website for M & M Gradnja, project Heroja Pinkija 13, Novi Sad.

## Must communicate

- Brand: M & M Gradnja.
- Project: Heroja Pinkija 13.
- Location: Novi Sad, Telep/Liman 5 context.
- Status: construction in progress.
- Structure: PO + P + 3.
- Construction start: 2026-03-16.
- Planned completion: 2027-11-15.
- Main CTA: ask about apartment/unit.
- Secondary CTA: offer land/old house.

## Tone

- modern
- minimal
- warm
- premium
- calm
- trustworthy
- real-estate focused, not SaaS-like

Avoid:

- loud gradients
- cluttered cards
- excessive icons
- decorative blobs
- fake-photo claims
- text overlap on mobile
- oversized rounded marketing cards

## Design tokens

Use existing design system tokens if present. Otherwise:

```txt
bg #f8f6f1
surface #eee8df
muted-surface #ddd4ca
ink #1d1c19
ink-muted #625f58
accent #b6925f
accent-dark #80633b
forest #4f675e
slate #343b45
clay #b36a4c
border rgba(29, 28, 25, 0.12)
white #ffffff
radius 6-8px
letter-spacing 0
```

## Required public sections

1. Header
   - logo, nav, contact CTA.
   - compact mobile nav.

2. Hero
   - H1 `Heroja Pinkija 13`.
   - status/location copy.
   - CTAs: `Pogledaj stanove`, `Kontaktiraj investitora`.
   - project stats.
   - image/render/gallery area.

3. Project/latest info
   - construction status.
   - apartment availability summary.
   - planned completion.

4. Apartment availability
   - filters: status, structure, later floor.
   - statuses need text + color.
   - cards show code, floor, area, structure, status, CTA.

5. Building structure
   - PO: storage + garage.
   - P: commercial spaces + business apartments.
   - 1-3: residential floors.
   - yard parking.

6. Location
   - Telep/Liman 5, bus line 12, Lidl, Laza Kostic school, Kej/Ribarac/Sodros, planned bridge toward Fruska gora.
   - avoid overpromising.

7. Construction timeline
   - start, foundations/structure, interior works, planned completion.

8. Land acquisition preview
   - `Kupujemo placeve`.
   - visual hint: land/access road/future development.
   - CTAs: details and contact.
   - do not overpower apartment sales.

9. Contact form/CTA
   - visible labels.
   - single column on mobile.
   - no backend implementation text in UI.

10. Footer
   - minimal brand/contact/project info.

## Figma workflow rules

- Use auto layout.
- Desktop 1440, tablet 834, mobile 390.
- Use components for buttons/cards/badges/inputs if available.
- Use variables/tokens instead of hardcoded styles.
- Build sections in order.
- Validate screenshots after major sections.
- Ensure no horizontal scroll or overlap on mobile.
- Keep buttons stable and readable.

## Ready prompt

Create a premium real-estate website design for `Heroja Pinkija 13` by `M & M Gradnja` in Novi Sad. Include hero, project info, apartment availability, building structure, location, construction timeline, land acquisition preview, contact form, and footer. Use warm neutral premium styling, stable responsive layouts, readable apartment cards, text+color statuses, and no generic SaaS visual language.
