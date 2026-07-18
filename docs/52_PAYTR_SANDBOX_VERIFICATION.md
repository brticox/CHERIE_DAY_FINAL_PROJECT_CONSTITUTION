# PayTR Sandbox Verification

## Current evidence

No authorized PayTR test merchant ID/key/salt was present during Phase 3. No live endpoint
was called and no sandbox result is claimed. Real PayTR sandbox verification is therefore
an external launch blocker.

Local evidence uses deterministic official-contract cryptographic vectors and the guarded
provider simulator. Run `PAYTR_SIMULATOR_SECRET=<local-secret> npm run payment:simulate --
success`. Supported scenarios include success, failure, invalid signature, wrong amount,
wrong currency, unknown order, missing/malformed fields, oversized body, duplicate,
conflict, delayed delivery and concurrency burst. Simulation refuses production.

## Authorized sandbox procedure

1. Use a disposable/staging Supabase project and PayTR test merchant credentials only.
2. Set `PAYTR_TEST_MODE=1`, an HTTPS staging site/callback URL and no production customer data.
3. Record sanitized correlation ID, merchant order ID, expected kuruş, provider result,
   payment/order/event/audit/outbox snapshots and result-page state.
4. Exercise success, decline, invalid card, 3DS failure, abandon, delayed/duplicate callback,
   provider timeout, return-without-callback and callback-without-return.
5. Verify callback responds plain `OK`, secrets are absent from logs, and duplicate delivery
   creates one financial transition/notification.
6. Query payment status through the isolated adapter for pending cases. Do not auto-apply an
   ambiguous response.
7. Test full and partial refund with the PayTR test refund API and retain sanitized evidence.

Production enablement additionally requires HTTPS, live-only credentials, worker secret,
simulators disabled, recipient override removed, alert routing tested and an approved
rollback/incident owner. Never paste merchant key/salt into evidence.
