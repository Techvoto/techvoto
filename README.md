# Techvoto LMS — consolidated source

This repository contains the React/Vite frontend and Django REST backend. The intended hosting split is Vercel (static frontend) and Render (Django API + Celery worker). Actual production hostnames are intentionally not configured until verified.

## Repository layout

- `frontend/` — React 19, TypeScript, Vite, React Router, SWR, HeroUI.
- `backend/` — Django REST API, authentication, courses, assessments, live classes, payments, engagement and support.
- `.github/workflows/` — frontend and backend quality gates (run by GitHub Actions when this folder is pushed to a repository).
- `docs/` — project assumptions, deployment, browser support, security rotation and validation status.

## Local development

### Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\\Scripts\\activate
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Set a local SECRET_KEY; keep real secrets out of source control.
python manage.py migrate
python manage.py test
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm ci
cp .env.example .env.local
npm run dev
```

The Vite development server listens on port 3000 and proxies `/api` to `VITE_PROXY_TARGET` (default `http://localhost:8000`).

## Quality commands

```bash
cd frontend
npm test
npm run lint
npm run typecheck
npm run build

cd ../backend
python manage.py makemigrations --check --dry-run
python manage.py check
python manage.py test
```

`npm run lint` is currently a targeted TypeScript-AST source guard, not a full ESLint configuration. The complete frontend and backend checks must pass in CI before release.

## Deployment overview

1. Configure the verified HTTPS Render API origin as Vercel's `VITE_API_URL` build environment variable.
2. Configure exact backend `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, `FRONTEND_URL`, cookie policy, database, Redis, SMTP, Paystack and optional JaaS secrets in Render's secret/environment settings.
3. Prefer frontend and API custom subdomains on the same registrable domain for Safari-compatible cookie authentication.
4. Run `backend/release.sh` as Render's pre-deploy migration command. Run a separate Celery background worker using the `worker` Procfile command.
5. Complete the release checklist in `docs/DEPLOYMENT_VERCEL_RENDER.md` and `docs/PROJECT_STATUS.md`.

Do not deploy with guessed hostnames, example credentials, or unrotated credentials from the supplied export. No production deployment is included in this handoff.
