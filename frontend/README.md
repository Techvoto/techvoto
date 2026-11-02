# Techvoto web (Vite + React + TypeScript)

Replaces the Next.js frontend. Same screens, same API, same design system (HeroUI + Tailwind).

## Run

```bash
cp .env.example .env
npm ci
npm run dev          # http://localhost:3000, proxies /api to http://localhost:8000
npm run typecheck    # tsc --noEmit
npm test            # dependency-free auth/session + payment verification tests
npm run build        # typecheck + production build into dist/
```

The Django backend already allows `http://localhost:3000`, so nothing changes there for local work.

## What changed from the Next version

| Next.js | Now |
|---|---|
| `app/api/auth/*` and `app/api/proxy/*` route handlers | Removed. The browser talks to Django directly (`src/lib/api.ts`). |
| httpOnly cookies set by Next | Django sets HttpOnly access and refresh cookies; the frontend sends credentials and an in-memory CSRF token (`src/lib/csrf.ts`). |
| `middleware.js` route protection | `AppLayout` / `RoleGate` in `src/layouts/layouts.tsx` (redirects to `/login?next=...`). |
| File-based routing | `src/router.tsx` (React Router, every page lazy-loaded as its own chunk). |
| `metadata` / `sitemap.js` / `robots.js` | `useTitle()` hook, `index.html`, `public/robots.txt`. |
| `next/font` | `@fontsource-variable/inter` (self-hosted). |
| `<a href={fileUrl(...)}>` downloads | `DownloadButton` fetches with the auth header and saves a blob (files are permission-checked). |

## Deploying

The intended architecture is a Vercel static SPA plus a Render Django API. Set Vercel's `VITE_API_URL` build variable to the verified HTTPS API origin. The Vercel Vite config fails the Vercel build if this value is missing, and `vercel.json` excludes `/api/*` from the SPA fallback so API requests cannot silently receive `index.html`.

The actual production origins are unresolved and are not hardcoded. See the root `docs/DEPLOYMENT_VERCEL_RENDER.md` for Render build/pre-deploy/worker settings, cookie topology and release gates. Prefer same-site custom frontend/API domains for Safari-compatible cookie authentication.

## Authentication and API connectivity

The frontend uses the backend's cookie-based JWT contract:

- `GET /api/auth/csrf/` obtains a CSRF token and sets Django's CSRF cookie.
- `POST /api/auth/login/` and `POST /api/auth/register/` return `{ user }`; the backend sets the HttpOnly `techvoto_access` and `techvoto_refresh` cookies.
- Authenticated requests include cookies. Unsafe methods include `X-CSRFToken`.
- `POST /api/auth/token/refresh/` rotates cookies; tokens are not read from or written to JavaScript storage.
- `POST /api/auth/logout/` blacklists the refresh cookie and clears the auth cookies.
- After successful login or registration, the client clears and reacquires the in-memory CSRF token before the next unsafe request.
- A temporary failure from `auth/me/` (network, 429, or 5xx) leaves session status unknown and shows a retry action; only a confirmed 401 is treated as signed out.

Refresh calls are shared within a tab and use the Web Locks API across tabs. After acquiring the lock, the client probes `auth/me/` so a late 401 can reuse cookies already rotated by another tab. If Web Locks are unavailable, the client fails closed rather than risking a rotating-refresh race; users can sign in again, but automatic refresh is not supported in those browsers until a backend-side coordination protocol is verified.

For production, prefer a same-origin `/api/*` reverse proxy. If `VITE_API_URL` points to a different origin, configure Django `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, and `CORS_ALLOW_CREDENTIALS=True`; the frontend origin and API must also have a cookie-compatible site/domain arrangement. For genuinely cross-site deployments, configure `AUTH_COOKIE_SAMESITE=None`, `AUTH_COOKIE_SECURE=True`, and the appropriate cookie domain only after validating the deployment topology. Do not expose refresh tokens to JavaScript.

`vercel.json` contains only the SPA fallback and intentionally does not invent an API destination. On Vercel, set `VITE_API_URL` to the verified API origin and configure credentialed CORS and CSRF on Django. `/api/*` is excluded from the SPA fallback.

User content is rendered through `react-markdown`; the app has no `dangerouslySetInnerHTML` usage.
