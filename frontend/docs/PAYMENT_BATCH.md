# Payment lifecycle batch — isolated review patch

## Scope

This patch changes only the browser's payment-return verification experience. It does not modify authentication, API transport, backend payment handling, Paystack configuration, billing/refund operations, or production deployment configuration.

## Changes

- `CheckoutVerify` previously converted exhaustion of ten polling attempts into a terminal `failed` UI state, even when the backend had returned `pending` or requests had failed transiently. The backend's verification endpoint can return HTTP 202 with `status: pending` while Paystack/webhook confirmation is unresolved.   The new behavior treats only explicit backend `success` as success and explicit `failed` as failure; pending, unknown, and transient request errors remain inconclusive. After the ten-attempt polling window, it shows a recoverable pending state with manual recheck and a billing link, and warns the learner not to pay again while a prior transaction is being confirmed.
- Expanded frontend payment/refund types and status presentation to match the supplied backend choices: payment `refund_pending` / `refund_failed`, and refund request `processing` / `failed`. Billing, admin payments, and admin refund filters now display these states instead of indexing missing color-map entries or omitting them from filters.

## Tests

- `node --test tests/*.test.mjs` — 4 passed, 0 failed, exit 0.
- Source syntax transpilation and real-browser/API contract tests remain outstanding; the test suite covers the payment verification decision helper only.
- `npm test` script added to run this focused suite.
- Typecheck/build/browser-backend verification are not claimed; dependency installation is blocked in this workspace.

## Review boundary

This patch is intentionally separate from the Batch 1 authentication patch. Merge/review independently. Real Paystack sandbox, webhook delivery, duplicate checkout, refund initiation/settlement, and browser integration remain outside this frontend-only patch.
