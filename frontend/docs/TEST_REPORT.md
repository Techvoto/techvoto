# Frontend remediation test report

Date: 2026-11-02. The authentication/session and payment lifecycle workstreams are integrated in this source tree; their review patch files remain separate.

## Executed checks

- [x] `npm test` — **25 passed, 0 failed, exit 0**. Includes auth/session/API transport tests and payment verification-state tests.
- [x] `npm run lint` — **passed, exit 0**. The custom TypeScript-AST source guard checked 74 TypeScript files. This is not ESLint or a full style-rule configuration.
- [x] `python -m compileall -q backend` — passed for backend source syntax only.
- [x] ZIP/source hygiene — `.env`, SQLite database, private JaaS key, nested bundle and generated caches excluded from final source package.

## Blocked / not run

- [ ] `npm ci --ignore-scripts --no-audit --no-fund --fetch-retries=0 --fetch-timeout=20000` — failed with npm `Exit handler never called!`; dependency install did not complete.
- [ ] `npm run typecheck` — failed with `TS2688: Cannot find type definition file for 'vite/client'` because dependencies are unavailable.
- [ ] `npm run build` — failed at the same TypeScript prerequisite; Vite production bundling did not start.
- [ ] Django `manage.py test`, `check`, and `makemigrations --check --dry-run` — not run because Django and the requirements are not installed in this environment.
- [ ] Browser matrix — not completed. A local Chromium 144 binary exists but the headless smoke launch timed out in this container; Edge, Firefox, Safari, iOS Safari and Android Chrome are not available. `tests/browser/` contains a two-iframe Web Locks smoke harness for the supported device matrix.
- [ ] GitHub Actions — workflows are now at repository root, but no connected repository/CI runner was available to execute them.
- [ ] Live Django cookie/CORS/CSRF integration, Paystack sandbox/webhook/refund settlement, SMTP, JaaS, Render/Vercel staging and production deployment — not run.

## API transport test boundary

`tests/api-client.test.mjs` imports the production `src/lib/api-client.mjs` transport module and uses a deterministic fake fetch plus simulated Web Locks. It verifies CSRF bootstrap/header, credentials, login CSRF reacquisition, refresh probe/rotation/retry, transient errors, multipart requests, late 401 and concurrency. It does not exercise a real browser cookie jar, Django middleware or cross-origin CORS. The no-Web-Locks test verifies the fail-closed behavior and asserts that no refresh request is sent.

## Backend source review

The latest supplied backend export supersedes the earlier export. It includes committed assessment/payment migrations. `QuizSubmitView` enforces the quiz time limit plus grace period; `AssignmentViewSet.submit` rejects submissions after `due_at` unless `allow_late` is enabled. A quiz expiry regression test exists; no separate assignment deadline regression test was found. The export's `note.txt` saying the deadline patch is yet to be added is stale and has been removed from the consolidated source.

## Release decision

This handoff is **not production-release approved**. Typecheck/build, Django tests/migration checks, real-browser matrix, production host/cookie settings, credential rotation and provider integrations must pass before release. See root `docs/` for the complete gates.
