# FRONTEND_GUIDE.md

## AI context

Frontend is the public website plus small admin panel for M & M Gradnja / Heroja Pinkija 13.

## Stack

- React
- Vite
- TypeScript
- SCSS
- Framer Motion
- lucide-react
- shadcn/ui only where it fits existing UI
- Supabase JS client

## Architecture

- Public app and admin live in same React/Vite project.
- Admin routes live under `/admin`.
- Keep code modular by feature: layout, pages, project data, forms, admin.
- Local TypeScript data is acceptable during UI build, but shape it like future Supabase rows.
- Do not add a separate backend/CMS layer in v1.

## Supabase usage

Direct public reads:

- published projects
- published units
- published page sections
- public media/PDF metadata

Protected admin reads/writes:

- project/unit content
- apartment statuses
- inquiries and land offers
- media/PDF metadata
- uploads to Storage

Edge Functions only:

- contact form submit
- apartment inquiry submit
- land offer submit
- server validation
- spam/rate limiting
- email sending
- email delivery logging

Never expose in browser:

- Supabase service role key
- email provider key
- privileged admin secrets

## UI rules

- Match existing warm premium real estate style.
- Use existing global SCSS tokens/classes before inventing new patterns.
- Use lucide icons when icons are needed.
- Buttons must have stable dimensions and clear focus states.
- Forms need visible labels.
- Cards should be simple, scannable, and not nested inside other cards.
- Mobile must have no horizontal scroll, overlap, or clipped button text.
- Avoid generic SaaS hero sections, loud gradients, heavy decoration.

## Admin UX

Admin navigation v1:

- Prijava
- Upiti za stanove
- Upiti za placeve
- Stanovi i statusi
- Projekat
- Slike i PDF fajlovi

Admin priorities:

- fast status changes
- readable inquiry lists
- clear `new/contacted/closed` workflow
- short internal notes
- simple content/file updates

## Current visual tokens

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
