# Phase Three Payment Security

## Verdict

The local payment lifecycle is minor-unit exact, database-idempotent, replay-safe, auditable,
recoverable and permissioned. It is merge-ready after review, but **real money must not flow**
until authorized PayTR sandbox success/refund evidence and operational launch prerequisites
in `52_PAYTR_SANDBOX_VERIFICATION.md` are complete.

## Implementation evidence

- Official PayTR token/callback concatenation, base64 and plain `OK` behavior are captured in
  deterministic known-answer and malformed-input tests.
- Server repricing and integer kuruş eliminate client totals and floating-point drift.
- Atomic SQL locks order/payment/refund state; 100 simultaneous identical callbacks produce
  one event/transition. Paid precedence prevents regression.
- Strict callback parsing, bounded body, safe IP identity, distributed database rate limits,
  redacted structured telemetry and production simulator guards cover abuse boundaries.
- Pending cases remain pending and truthful. Bounded reconciliation detects stuck, orphan,
  mismatched and evidence-deficient records without unsafe auto-correction.
- Full/partial refund request, approval, provider result, retry and cumulative cap are guarded
  by role, confirmation, idempotency and immutable audit.
- Customers cannot read raw financial tables; inactive staff and finance viewers cannot refund.
- A separate CI workflow runs unit/security tests, full migration replay, SQL/RLS and callback
  concurrency tests without provider secrets.

## Verification commands

`npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, and
`npm run security:audit`. With a disposable local PostgreSQL URL: run
`npm run test:phase3:replay`, `npm run test:phase3:db`, then
`npm run test:phase3:burst`.

## Scope and overlap

Work lives on `phase/03-payment-security-20260714` from Phase 2 Control Center commit
`aef87d3108bb910da839e1a4b8aa355056a9d205`. No Claude Phase 2 Excellence file was edited.
New finance routes are isolated under `/admin/finance`; public marketing, admin shell styling,
dashboard layout, design primitives and unrelated CMS/CRM/service code are untouched.

## Launch blockers

1. Authorized PayTR sandbox payment, decline, delayed/duplicate callback, status-query and
   full/partial refund evidence.
2. Staging Supabase Auth/PostgREST E2E and the CI workflow’s first hosted green run.
3. Production keys/secrets, HTTPS callback origin, alert receiver and scheduled reconciliation.
4. Approved refund/cancellation policy, finance owners and incident rehearsal.
5. Dependency/security review and Phase 2 Excellence merge-conflict review before integration.

Phase 4 may begin only after this branch is reviewed and the above external prerequisites have
owners. Phase 3 does not authorize deployment, live credentials, merge or real transactions.
