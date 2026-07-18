# Transactional Notification Architecture

## Delivery path

Business transaction → database trigger/explicit enqueue → `notification_outbox` → protected worker → template renderer → capture or Resend transport → delivery state. Enqueue and the state transition share one database transaction where existing workflows permit it. Unique `idempotency_key` values suppress callback, action and worker duplicates.

The worker is `POST /api/internal/notifications/process` with `Authorization: Bearer $NOTIFICATION_WORKER_SECRET` (or `INTERNAL_CRON_SECRET`). It claims at most 20 due rows using `FOR UPDATE SKIP LOCKED`, increments attempts, records a lock owner and recovers processing locks older than 15 minutes.

## States and retry policy

`queued` → `processing` → `sent`; temporary failures become `retry_scheduled`; non-retryable or exhausted jobs become `permanently_failed`; operators may later use `cancelled`. Baseline delays are 1m, 5m, 20m, 1h and 6h plus up to 20% jitter. Invalid/missing recipients and unknown templates fail permanently. Timeouts, rate limits and 5xx provider failures retry. Provider messages and errors are redacted to 500 characters.

## Provider and environment

Resend is isolated behind `EmailTransport`. Local/CI default to `CaptureTransport`, which renders and marks delivery without network email. Production rejects `NOTIFICATION_RECIPIENT_OVERRIDE`.

Required for live sending: `APP_ENV=production`, `NOTIFICATION_SEND_ENABLED=true`, `RESEND_API_KEY`, `NOTIFICATION_FROM_EMAIL`, `NOTIFICATION_FROM_NAME`, `NOTIFICATION_REPLY_TO_EMAIL`, `NOTIFICATION_STAFF_EMAILS`, worker secret, Supabase service credentials and `NEXT_PUBLIC_SITE_URL`. Domain verification and SPF/DKIM/DMARC remain external.

## Event-to-template matrix

| Producer | Customer | Staff | Idempotency |
|---|---|---|---|
| intake insert (`contact`, `appointment`, `quote`, `dream`) | `intake_*_received` | `staff_new_*` | `intake_received:<lead>:<audience>` |
| order insert | `payment_pending` / `order_received` | — | `order_received:<order>:customer` |
| paid order event | `order_status_paid` | `staff_paid` | `order_status:<order>:<state>:<event>[:staff]` |
| order/proof/production/shipment transition | `order_status_<state>` | approval/revision staff templates | order event identity |
| verified failed payment event | `order_status_failed` | `staff_payment_failed` | `payment_failed:<payment>:<provider-event>[:staff]` |
| exhausted notification | — | `staff_notification_permanently_failed` | `notification_failed:<outbox>:staff` |

Refund templates are ready but only fire when a real order transition produces those states. Deadline/shipment-exception triggers are intentionally absent because no reliable event source exists.

## Template inventory and preview

The catalog in `lib/notifications/templates` includes account welcome (not wired while Supabase owns auth), four intake acknowledgements, order/payment/proof/production/packing/shipment/delivery/cancellation/refund states and operational staff alerts. Every template produces subject, preheader, escaped table-safe HTML and plain text. No remote image is needed for meaning.

Run `npm run email:preview`, then open `artifacts/email-previews/index.html`. It creates HTML and text samples for every registered template without sending email.

## Operations and privacy

`/admin/marketing/notifications` is gated to active admin/operations/commerce/support roles. It shows states, template/channel, redacted recipient, aggregate, attempts, truncated provider ID, times and redacted error; payload bodies are not exposed. Transactional and operational categories do not consult marketing opt-out. No marketing producer exists.

## Deployment checklist

1. Apply both Phase 1 migrations to staging and run `npm run test:phase1:db` against that disposable database.
2. Configure verified Resend sender and staff aliases; keep sending disabled for the first migration smoke test.
3. Call the worker from an authenticated cron at least once per minute; alert on non-2xx and `permanently_failed` growth.
4. Generate previews, approve copy, then enable sending to a designated test inbox through preview override.
5. Remove override, verify production readiness, enable live sending, inspect provider IDs and delivery failures.
