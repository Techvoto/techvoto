# Project status and assumptions

Status vocabulary: **Confirmed** = explicitly supplied by the project owner or directly present in the supplied source; **Inferred** = a safe working assumption based on the source/hosting architecture; **Unresolved** = requires external verification or an operator decision.

## Confirmed

- The newly attached `bundle.txt` is the latest backend source and supersedes the earlier backend export.
- Hosting intent is Vercel for the frontend and Render for the Django backend.
- Production frontend and API URLs are not yet verified. No hostname has been invented or hardcoded.
- Credential rotation is operationally unverified. Affected categories: database credentials, Django `SECRET_KEY`, Paystack secret, and JaaS/Jitsi keypair.
- Browser target is current and previous two major releases of Chrome, Edge, Firefox and Safari, including iOS Safari and Android Chrome. Internet Explorer is excluded.
- Web Locks must be feature-detected. If unavailable, the frontend must not use an unsafe automatic refresh fallback.
- Authentication and payment changes are kept separate in the review patch artifacts, although both are integrated into this combined source tree.

## Inferred working assumptions

- The frontend is a static Vite SPA, not a Next.js server-rendered application.
- The default deployment path is browser-to-Render API using a Vercel build-time `VITE_API_URL`; a Vercel API proxy is not configured.
- For direct browser-to-Render traffic, `NUM_PROXIES=1` is the starting assumption. Verify the actual forwarded-header chain before release and adjust it if a proxy/rewrite is introduced.
- Same-site custom domains (for example, `app.<your-domain>` and `api.<your-domain>`) are the recommended deployment topology for cookie authentication across Safari and other browsers.

## Unresolved release gates

- Exact Vercel frontend URL, Render API URL, Render service name/region/plan and custom-domain ownership.
- Confirmation that all exposed credential categories have been rotated and old credentials revoked.
- Production PostgreSQL, Redis cache, Celery broker, SMTP, durable media storage and monitoring configuration.
- Final cookie topology: same-site subdomains/reverse proxy versus cross-site Vercel/Render defaults.
- Real-browser testing on the supported current/previous-two-major matrix, including mobile Safari and Android Chrome.
- Backend Django tests, migrations consistency check, deploy checks and frontend typecheck/build in a dependency-enabled CI runner.
- Paystack sandbox/webhook/refund end-to-end verification and JaaS live-class verification.
- Authorized repository CI run and release approval. No deployment has been performed.
