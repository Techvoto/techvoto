# Deployment plan — Vercel frontend + Render backend

This is a configuration guide, not a completed production deployment. Actual hostnames remain unresolved and are intentionally not hardcoded.

## Vercel (frontend)

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm ci`
- Required environment variable: `VITE_API_URL` = the verified HTTPS origin of the Render Django API (no trailing slash required).
- The Vercel Vite config fails the Vercel build when `VITE_API_URL` is missing. This prevents a misleading deploy that sends `/api/*` to the SPA host.
- `vercel.json` serves the SPA fallback for client routes but deliberately excludes `/api/*`.

## Render (backend)

- Root directory: `backend`
- Build command: `./build.sh`
- Pre-deploy command: `./release.sh` (applies committed migrations after the build is ready; Render requires a paid web-service plan for pre-deploy commands). If the selected plan lacks this feature, arrange a controlled migration step before traffic is switched; do not silently omit migrations.
- Start command: `gunicorn techvoto.wsgi:application --bind 0.0.0.0:$PORT --workers 3 --timeout 120`
- Health check: `/api/health/`
- Create a separate Background Worker using `celery -A techvoto worker -l INFO --concurrency=2` and the required shared environment.
- Use PostgreSQL. Configure a shared Redis cache for throttle counters and a separate Redis broker/database for Celery. Configure durable media storage; Render local filesystem storage is not durable across deploys unless a persistent disk is attached.

## Required backend environment

Set in Render's secret/environment settings using actual verified origins and newly rotated secrets:

- `DEBUG=False`, fresh `SECRET_KEY`, `ALLOWED_HOSTS`
- `DATABASE_URL` (PostgreSQL)
- `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, `FRONTEND_URL`
- `AUTH_COOKIE_SECURE=True`, reviewed `AUTH_COOKIE_SAMESITE`, and only-if-needed `AUTH_COOKIE_DOMAIN`
- `NUM_PROXIES` based on the observed trusted proxy chain; default 1 assumes direct browser-to-Render API calls
- `CACHE_URL` (shared Redis or configured database cache), `CELERY_BROKER_URL` (separate Redis DB/instance), `CELERY_RESULT_BACKEND`
- SMTP settings and `DEFAULT_FROM_EMAIL`
- Paystack live secret only when ready, plus webhook URL `/api/payments/webhook/`
- JaaS/Jitsi app ID, key ID and private-key file path only if live classes are enabled
- `SENTRY_DSN` and `VITE_SENTRY_DSN` if monitoring is enabled

## Cookie topology — important for Safari

Default Vercel `vercel.app` and Render `onrender.com` origins are cross-site. Cross-site cookie requests require `SameSite=None; Secure`, credentialed CORS and an exact CSRF trusted origin. However, WebKit blocks third-party cookies by default; setting `SameSite=None` alone does not make a cross-site cookie session reliable in Safari.

Prefer custom domains under the same registrable domain, such as `app.<your-domain>` and `api.<your-domain>`, or a verified same-origin reverse proxy. This allows first-party/same-site cookie behavior and is the recommended topology for the stated Safari support target. Once hostnames are known, verify the `Origin`, `Set-Cookie`, cookie `Domain`, `SameSite`, `Secure`, CORS and CSRF behavior in each supported browser.

References:
- WebKit Tracking Prevention: https://webkit.org/tracking-prevention/
- MDN third-party cookies: https://developer.mozilla.org/en-US/docs/Web/Privacy/Guides/Third-party_cookies

## Release order

1. Confirm and rotate exposed credentials; revoke the old values.
2. Verify custom domains and DNS/TLS; decide same-site topology.
3. Set Vercel `VITE_API_URL` and Render host/CORS/CSRF/cookie variables.
4. Provision PostgreSQL, Redis cache, Celery broker/worker, SMTP and durable media.
5. Run CI and the full browser matrix.
6. Verify Paystack sandbox checkout, webhook signature, duplicate delivery, refunds and settlement.
7. Verify JaaS live class token/join/attendance if enabled.
8. Run a staging smoke test, review logs/monitoring, obtain explicit release approval, then deploy.
