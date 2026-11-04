# Techvoto frontend: visual revamp (v2)

Scope: presentation only. Routes, API calls, auth, payments, state and tests are unchanged.

## Design system
- Tokens live in `tailwind.config.ts` (light and dark): cool slate neutrals, one indigo accent, 8/10/14px radii, hairline borders, layered shadows.
- `src/index.css` holds the shared primitives: `.panel`, `.surface-brand`, `.band`, `.glow`, `.bg-grid`, `.eyebrow`, `.display`, `.lift`, `.prose-tv`.
- No hard-coded brand colours in pages. Components use theme tokens (`bg-content1`, `text-default-500`, `border-divider`, `text-primary`), so dark mode and future rebrands need no page edits.
- Typography: Inter Variable only (no new dependency, lockfile untouched).

## Reworked
Navbar, footer, app shell (grouped sidebar, active indicator, account card, mobile drawer), auth split layout, page header,
stat cards (tones), course cards (links, not pseudo-buttons), live cards (date tile), empty/error states, verify banner,
Home, Catalog, Course detail (sticky purchase card), Dashboard, Instructor and Admin overview, Certificates, certificate
verification, Profile, Contact, Notifications, 404, Player sidebar.

## Fixed
- `AppLayout` destructured `sessionError` and never used it. With `noUnusedLocals: true` this fails `npm run typecheck`.
  It now feeds the session-recovery message.
- `/#how` and `/#live` navbar links had no matching section ids on the home page.
- Removed negative-margin full-bleed hacks; home is full-width, other site pages use the standard container.

## Verify before release
    npm ci && npm run typecheck && npm test && npm run lint && npm run build
