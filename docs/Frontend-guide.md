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
- Supabase JS client

## Architecture

- Public app and admin live in same React/Vite project.
- Admin routes live under `/admin`.
- Keep code modular by feature: layout, pages, project data, forms, admin.
- Local TypeScript data is acceptable during UI build, but shape it like future Supabase rows.
- Do not add a separate backend/CMS layer in v1.

## Supabase usage

Required frontend environment:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_PUBLIC_SITE_URL`

Keep these documented in `mim-invest-frontend/.env.example`. Server-only values
belong in Supabase secrets and `supabase/.env.example`, not in Vite.

`VITE_PUBLIC_SITE_URL` is the canonical public origin used by `PageMeta` for
canonical, Open Graph, Twitter and JSON-LD URLs. It should match
`robots.txt`/`sitemap.xml`; default/fallback is `https://mimgradnja.rs`.

Direct public reads:

- published projects
- published units
- public media/PDF metadata
- published construction updates / timeline data

Current v1 fallback rule:

- public apartment/project pages render local TypeScript fallback data immediately;
- Supabase refreshes content when it is configured and responds quickly;
- slow public/admin reads must not leave the UI stuck on multi-minute loading states.

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
- Lead forms should use local inline validation before network submit: `noValidate`, field-level `aria-invalid`/`aria-describedby`, clear error copy and focus on the first invalid field.
- Phone links should keep formatted visible text, but use `contactPhoneHref` or `createPhoneHref(phone)` for normalized `tel:` href values.
- Cards should be simple, scannable, and not nested inside other cards.
- Mobile must have no horizontal scroll, overlap, or clipped button text.
- Public images should use dimensions when asset size is known; use `fetchPriority="high"` only for priority hero/LCP candidates, and use `loading="lazy"` plus `decoding="async"` for below-fold imagery where it does not affect first paint.
- Avoid generic SaaS hero sections, loud gradients, heavy decoration.
- Garage parking and storage units must be shown as separate paid options, not as freebies or included apartment features.

## Admin UX

Admin navigation v1:

- Prijava
- Pregled
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
- per-card feedback for save/upload/delete actions
- guardrails for published media: published images need alt text
- no false optimistic state when Supabase persistence fails

## Quality gates

Run these before handing off a larger UI/admin/Supabase-facing change:

```powershell
npm.cmd run quality
git diff --check
```

`quality` runs `audit:surface`, lint, production build and dependency audit.

When `.env.local` points to a real Supabase project, also run:

```powershell
npm.cmd run smoke:supabase:readonly
```

This is intentionally not part of `quality`, because it needs network access and
real Supabase env values. It performs only read/preflight checks and must not
submit public forms.

When production media metadata should already be in Supabase, run the stricter
read-only launch check:

```powershell
npm.cmd run smoke:supabase:launch
```

It fails if `project_media` has no published rows.

For admin-auth and protected admin data regression checks, run the optional
admin smoke only when a real test/admin account is available through local,
ignored environment values:

```powershell
$env:SUPABASE_ADMIN_EMAIL="admin@example.com"
$env:SUPABASE_ADMIN_PASSWORD="..."
npm.cmd run smoke:supabase:admin
```

The same values can live in ignored `.env.admin.local`. Never commit admin
credentials or add them to public `VITE_` variables. This check is intentionally
not part of `quality`, because it signs into Supabase Auth and reads protected
admin tables.

By default this admin smoke is read-only. It can process controlled test leads
only when local/ignored test selectors and
`SUPABASE_ADMIN_SMOKE_PROCESS_TEST_LEADS="true"` are set explicitly.

For the full launch checklist, use `docs/pre-production-runbook.md`.

`audit:surface` checks the public/admin surface for common regressions:

- unreachable source files;
- unreferenced public assets;
- missing environment templates or missing required environment key names;
- internal hard-reload `<a href="/...">` links in React source;
- missing image alt text;
- temporary debug markers;
- suspicious encoding/mojibake artifacts, mixed Latin/Cyrillic text in the same line, and raw `tel:` href values;
- exact sitemap canonical URL set, robots canonical rules and PageMeta coverage for active page files;
- route contract consistency between `Project-spec.md`, `AppRouter.tsx`,
  project canonical metadata and legacy apartment redirects;
- shared Supabase form rate-limit wiring.
- Supabase schema hardening for default Data API grants and public media read access.
- Database documentation drift for important schema fields/tables such as
  `land_acquisition_page`, email delivery kind/sent timestamp and text-based
  inquiry context.
- Project content model consistency: local apartment stacks must remain five
  stacks / 15 canonical apartment numbers, aligned with `Project-spec.md`.
- UX guardrails for skip links/main targets, header dropdown Escape handling,
  admin login `noindex,nofollow`, explicit admin login labels and 44px consent
  touch targets, autofill/input hints on lead forms, contact modal busy-state
  announcements, and `prefers-reduced-motion` support on animated public pages.
- JSX guardrails: every native `<button>` must explicitly set `type`, and every
  native `<form>` must handle `onSubmit`.
- icon-only native buttons must expose an accessible name through visible text,
  `aria-label`, `aria-labelledby`, or `title`.
- native form controls must have accessible names through wrapping labels,
  `htmlFor`/`id`, `aria-label`, or `aria-labelledby`.
- native `<a target="_blank">` links must include `rel="noopener noreferrer"`.
- package manifest sanity: runtime dependencies must be imported, build-only
  packages such as `sass` stay in `devDependencies`, and packages are not
  duplicated across dependency groups.
- presence of the optional read-only, launch and admin Supabase smoke scripts.

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
