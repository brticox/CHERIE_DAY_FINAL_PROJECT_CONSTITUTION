# Payment Architecture

## Trust and money model

The browser supplies intent, never price. Checkout reprices catalog, variants, add-ons,
personalization and shipping from server records. All provider, payment, refund and
reconciliation comparisons use signed 64-bit integer kuruş. TRY is the only accepted
currency. Decimal columns remain compatibility projections guarded to equal minor units.

## Lifecycle and boundaries

| Step | Boundary | Durable action | Idempotency / failure behavior |
|---|---|---|---|
| Checkout | `app/(site)/odeme/actions.ts` | validate session, distributed rate limit, reprice | stale price returns to customer; no provider call |
| Attempt | `create_payment_attempt_v2` | lock session/cart, create or reuse order and payment | request key unique; merchant order ID allocated before network |
| Initialize | `lib/payments/orchestrator.ts` | build trusted basket, request PayTR token | existing redirect reused; result recorded atomically |
| Redirect | PayTR iframe | customer leaves the site | redirect is not proof of payment |
| Callback | callback route + `paytr-callback.ts` | strict form validation and HMAC verification | no `OK` until database ingestion commits |
| Ingest | `ingest_paytr_callback` | lock payment/order, append immutable event, transition atomically | provider event unique; paid wins over later failure |
| Notify | database outbox triggers | enqueue committed event | deterministic outbox keys prevent duplicates |
| Recover | internal reconciliation route | bounded pending/discrepancy detection | detection only; ambiguous records require review |
| Refund | finance actions + refund adapter/RPCs | request, approve, submit, record provider result | idempotency key, row locks, cumulative cap |

The SQL functions are the financial state-machine source of truth. TypeScript validates
inputs, invokes provider adapters and presents results; it does not independently mutate
financial states.

## State machines

Payment: `initialized → pending → paid|failed`; `paid → partially_refunded → refunded`.
A verified success may promote a previously failed attempt. A paid payment cannot regress
from a later failure. Refund changes require confirmed provider results.

Order payment state follows the payment in the same transaction. Generic admin order
transitions cannot set `paid` or `refunded`. Operational order states remain under the
existing Phase 2 transition function.

Refund: `requested → approved → processing → completed`. A provider failure remains
`processing` with `provider_status=failed` and an explicit retryable flag. The immutable
provider reference cannot change.

## Callback contract

Only URL-encoded POST bodies below the configured limit and with exactly the supported
fields are accepted. Duplicate keys, unsupported status/currency, malformed integer
amounts, invalid base64 and forged signatures are rejected without internal detail.
PayTR receives the exact plain-text `OK` only for a durable applied, duplicate or reviewed
conflict outcome. Retryable database failures do not receive `OK`.

## Failure-mode map

| Failure | Safe result / recovery |
|---|---|
| Missing or unsafe environment | readiness refuses provider initialization |
| Invalid/expired session, empty cart | attempt rejected before payment creation |
| Stale price | customer sees updated total before payment |
| Duplicate submit/attempt | existing attempt/redirect returned |
| Provider timeout or browser close | remains pending; reconciliation grace applies |
| Callback before redirect, delayed or repeated | event ingestion is order-independent and idempotent |
| Forged/malformed/oversized callback | rejected, redacted telemetry, no state change |
| Amount/currency mismatch | unapplied event plus high-severity discrepancy |
| Unknown merchant ID | orphan discrepancy; never creates a paid order |
| Paid then failure | failure retained as ignored conflict; paid state preserved |
| Failed then verified success | success takes precedence and transitions atomically |
| Database/RPC failure | callback not acknowledged; PayTR retry remains possible |
| Notification enqueue failure | transaction fails or outbox retry handles delivery; no synchronous email |
| Refund timeout/failure | processing/retryable state and discrepancy; never assumes success |
| Reconciliation mismatch | durable case for human review; no ambiguous auto-correction |

## Access, audit and retention

Raw payment/event/refund/audit tables are unavailable to customers. Customers receive a
safe payment-summary RPC for their own orders. Finance viewers may inspect; only active
admins may request/approve/refine finance cases. Service-role functions have explicit
grants. Material actions append to immutable `financial_audit_log` with correlation IDs
and redacted metadata. Never store PAN, CVV, credentials or raw callback secrets. Retain
financial audit and reconciliation records according to the approved accounting/privacy
schedule; deletion requires a separately reviewed retention migration.
