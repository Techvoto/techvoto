# Frontend deployment

The current intended deployment is Vercel for the static Vite frontend and Render for the Django API. Exact production hostnames are unresolved and must not be guessed.

- Configure Vercel root directory `frontend`, build command `npm run build`, output `dist`, install `npm ci`.
- Set `VITE_API_URL` to the verified HTTPS Render API origin. Vercel builds fail fast if this is missing.
- `/api/*` is excluded from the Vercel SPA fallback.
- Configure exact credentialed CORS and CSRF trusted origins on Django. Prefer custom app/API subdomains under the same registrable domain for Safari-compatible cookies.
- Configure Render `backend` root directory, `./build.sh` build command, `./release.sh` pre-deploy migration command, and a separate Celery background worker.

See `../docs/DEPLOYMENT_VERCEL_RENDER.md`, `../docs/BROWSER_SUPPORT.md` and `../docs/SECURITY_ROTATION.md` for release requirements.

No deployment has been performed.
