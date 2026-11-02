# Frontend remediation decisions

## D-001 — Use backend-managed HttpOnly JWT cookies

**Decision:** The browser frontend does not read, persist, or transmit refresh/access token values in JavaScript. It uses credentialed requests and the backend's `techvoto_access` / `techvoto_refresh` cookies.

**Evidence:** The backend source export contains `apps/users/cookies.py`, `CookieJWTAuthentication`, `CsrfCookieView`, `LoginView`, `RegisterView`, `CookieTokenRefreshView`, and `LogoutView`. Login/register return a user object and set HttpOnly cookies; refresh rotates cookies and returns a status body; logout blacklists the cookie token and clears cookies.

**Consequences:** All unsafe requests must obtain and send a CSRF token. Cross-origin deployments require credentialed CORS, trusted CSRF origins, and compatible cookie SameSite/Secure/domain settings. Same-origin reverse proxy is preferred.

## D-002 — Do not invent the production API origin

**Decision:** Leave the deployment destination unresolved until the actual API hostname or hosting rewrite configuration is provided. Document the required `/api/*` rewrite or build-time `VITE_API_URL` configuration.

**Reason:** The supplied archive and backend export do not establish a production API hostname. Hardcoding a guessed destination would create a false production configuration.

## D-003 — Serialize refreshes across tabs where supported

**Decision:** Use the browser Web Locks API to serialize refresh requests across tabs and retain a same-tab promise guard. If Web Locks is unavailable, fail closed and do not attempt automatic refresh. The browser must reauthenticate after session expiry. This is a deliberate browser-support restriction until the backend offers a safe cross-tab refresh protocol.

## D-004 — Reacquire CSRF state after authentication transitions

**Decision:** Clear the in-memory masked CSRF token after successful login and registration, then reacquire it from `GET /api/auth/csrf/` before publishing the new session to the UI.

**Evidence:** The supplied backend `LoginView` and `RegisterView` are protected by `csrf_protect`, set HttpOnly auth cookies, and do not call Django's `rotate_token()` or `django.contrib.auth.login()`. The CSRF endpoint returns a masked token from Django `get_token()`. Reacquisition is retained to remain correct if the backend begins rotating CSRF state later.

## D-005 — Preserve unknown session state on transient failures

**Decision:** Only an API 401 is treated as confirmed unauthenticated. Network failures, 429, 5xx and unexpected statuses propagate as errors; the UI presents retry/recovery rather than redirecting to login.

**Reason:** A service outage is not evidence that the user's cookie session is invalid. A cached, confirmed `{ user: null }` remains signed out even if a later background revalidation fails.

## D-006 — Recheck session after acquiring cross-tab refresh lock

**Decision:** Under the Web Lock, call `auth/me/` before refreshing. If it succeeds, another tab has already rotated the shared cookies and the late-401 request can be retried without another rotation.

**Backend fallback finding:** `CookieTokenRefreshView` catches an invalid/blacklisted refresh token and returns 200 only when the access cookie in that request is still valid. If that access cookie is expired, it clears both auth cookies and returns 401. Therefore the backend fallback is not fully safe for simultaneous expired-access refreshes in browsers without Web Locks. No backend changes were made. The frontend now refuses automatic refresh without Web Locks instead of relying on that insufficient fallback.


## D-007 — Fail closed when cross-tab refresh coordination is unavailable

**Decision:** Do not run a rotating refresh request in a browser that lacks Web Locks.

**Reason:** A localStorage/BroadcastChannel lease is not a robust substitute for an atomic browser lock: tabs can crash, leases can expire during a slow request, and stale owners can overlap. A fail-closed restriction avoids silently risking refresh-token rotation races.

**Release implication:** The owner’s supported browser generations are above the published Web Locks implementation baselines (Chrome 69, Edge 79, Firefox 96, Safari/iOS Safari 15.4). The feature is still detected at runtime and requires a secure context. If a browser/runtime unexpectedly lacks `navigator.locks.request`, it may authenticate but must fail closed at refresh and require reauthentication. The no-lock path is covered by a regression test; real-device matrix verification remains a release gate.

## D-008 — Test the API transport through an injectable production module

**Decision:** Keep the browser API module as a thin binding around a dependency-injected transport so Node tests exercise the same CSRF, credentials, refresh and retry implementation used in production.
