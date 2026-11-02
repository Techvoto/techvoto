# Browser support and Web Locks behavior

## Supported target

The project owner specified current and previous two major releases of:

- Chrome desktop and Android Chrome
- Microsoft Edge
- Firefox desktop
- Safari on macOS and iOS

Internet Explorer is excluded. Keep the Vite build target and browser tests aligned with this policy; do not infer support for legacy browsers from a successful TypeScript build.

## Web Locks API

The authentication transport feature-detects `navigator.locks` and `navigator.locks.request`. Web Locks is available in secure contexts and is supported from Chrome 69, Edge 79, Firefox 96, Safari 15.4, iOS Safari 15.4 and Chrome for Android 69. Those implementation baselines are older than the owner's current/previous-two-major target, so the target browsers are expected to support it. HTTPS is required in production; localhost is treated as a secure development context.

Sources:
- MDN Web Locks API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API
- Can I use — Web Locks: https://caniuse.com/wf-web-locks

## Safe behavior when unavailable

The backend rotates and blacklists refresh tokens. A fallback based on a non-atomic localStorage/BroadcastChannel lease is not safe against tab crashes, stale leases or slow network requests. If `navigator.locks.request` is missing, the frontend refuses automatic refresh and surfaces a reauthentication path. Do not replace this with an unlocked refresh request. This restriction is intentionally fail-closed.

## Test status

- Dependency-free unit tests cover the no-Web-Locks path and assert that no refresh request is sent.
- A browser harness in `frontend/tests/browser/` exercises lock serialization between two same-origin iframes. `run_web_locks.py` runs it in Chromium, Firefox and WebKit; the root frontend workflow installs those engines and executes the harness.
- The browser binaries are not installed in this handoff environment. A local Chromium 144 binary is present but its headless launch timed out; the Playwright browser download is unavailable. Therefore no real-browser pass is claimed here.
- Edge, Safari app, iOS Safari and Android Chrome are not directly available in this environment. Chromium/Firefox/WebKit CI is a useful engine smoke test, not a replacement for the owner's exact current/previous-two-major desktop and mobile device matrix. Those checks remain release gates.

## Manual matrix (release gate)

For each target browser/device, verify:

1. `navigator.locks.request` exists on HTTPS.
2. Two tabs with an expired access cookie trigger only one refresh rotation.
3. A late 401 in the second tab probes `/api/auth/me/` and reuses the refreshed session.
4. No-Web-Locks simulation refuses refresh and offers reauthentication; it never sends an unlocked refresh request.
5. Login, registration, page reload, logout, CSRF-protected POST, file download and session recovery work.
6. With Safari tracking prevention enabled, cookies remain first-party under the configured same-site custom-domain topology.

Record exact browser version, OS/device, result and failure evidence in the release report. Browser-version support data: https://caniuse.com/wf-web-locks.
