# Frontend remediation changelog

## 2026-11-02 — Batch 1: authentication and API session handling

- Replaced localStorage refresh-token handling with the backend's HttpOnly cookie session contract.
- Added CSRF token acquisition from `GET /api/auth/csrf/` and `X-CSRFToken` on unsafe requests.
- Included browser credentials on API requests.
- Initially implemented cookie-based refresh and Web Locks cross-tab serialization. The later final review follow-up below supersedes the initial no-Web-Locks backend-fallback behavior with a fail-closed restriction.
- Updated login, registration, logout, and session restoration for `{ user }` responses and cookie-owned tokens.
- Cleared SWR cache on login/registration to prevent cross-account cache reuse.
- Updated authentication and deployment documentation.

No production deployment was performed. No backend source was modified.

## 2026-11-02 — Batch 1 review follow-up: CSRF, session recovery and regression tests

- After successful login and registration, clear the in-memory masked CSRF token and reacquire it before marking the new session active. If acquisition is temporarily unavailable, leave the cache empty so the next unsafe request retries.
- Verified the supplied backend `LoginView` and `RegisterView`: neither calls Django `rotate_token()` or `django.contrib.auth.login()`. The frontend reacquisition is retained as a safe compatibility measure if the backend later rotates CSRF state.
- Added explicit `loading`, `authenticated`, `unauthenticated`, and `unknown` session states. Only a confirmed 401 maps to signed-out; network, 429 and 5xx errors remain unknown and have retry UI.
- Refresh coordination now probes `auth/me/` after obtaining the Web Lock. If another tab already refreshed the shared HttpOnly cookies, the late-401 tab retries its original request without rotating again.
- Added dependency-free Node regression tests and an `npm test` script. 12 tests pass.
- Documented the backend fallback limitation for simultaneous refreshes when Web Locks are unavailable and the access cookie is expired.
- `npm ci` remains blocked by DNS/network errors reaching `registry.npmjs.org`; typecheck and build remain blocked by missing `vite/client` in the incomplete dependency tree.

No payment code was changed. No backend code was changed. No production deployment was performed.


## 2026-11-02 — Batch 1 final review follow-up

- Extracted the production API transport into `src/lib/api-client.mjs`; `src/lib/api.ts` now binds it to browser `fetch`, the in-memory CSRF cache and Web Locks.
- Added API-client integration tests for CSRF bootstrap/header, credentials, login CSRF reacquisition, refresh probe/rotation/retry, refresh 401, transient 503, multipart, late 401, concurrent calls and the no-Web-Locks restriction.
- Changed the no-Web-Locks path to fail closed. The backend's concurrent-refresh fallback is not sufficient for expired access cookies. Browsers without Web Locks are not approved for automatic refresh until a safe backend coordination protocol exists.
- Added a TypeScript AST source-guard lint command and a GitHub Actions workflow for `npm ci`, tests, lint, typecheck and production build. This guard is deliberately narrow and is not a substitute for ESLint.
- Test suite currently passes 21 tests. Dependency installation, semantic typecheck and production build remain blocked by unavailable npm registry access and incomplete `node_modules`.

No backend code or production deployment was performed. Real-browser/backend integration remains outstanding.


## 2026-11-02 — Consolidated project handoff

- Integrated the separately reviewed payment lifecycle patch into the authentication-reviewed frontend tree; the combined Node test suite passes 25 tests.
- Reconstructed backend from the latest supplied export and preserved its current migrations, including assessment 0004 and payment 0003.
- Added Vercel build-time `VITE_API_URL` fail-fast validation and excluded `/api/*` from the SPA fallback.
- Split Render build and pre-deploy migration steps (`build.sh` and `release.sh`); corrected stale backend deployment notes and the Vite-vs-Next proxy assumption.
- Moved frontend CI to the repository root and added backend CI. Added browser support, two-context Web Locks smoke harness, deployment, source provenance and credential-rotation documentation.
- Production origins remain unset; credentials remain operationally unverified. Dependency installation failed in this workspace, so frontend typecheck/build and Django runtime tests remain outstanding.

No production deployment was performed.
