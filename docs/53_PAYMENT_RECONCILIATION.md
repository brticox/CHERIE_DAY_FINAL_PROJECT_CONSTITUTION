# Payment Reconciliation

The bounded `detect_payment_discrepancies(batch, age_minutes)` job detects stuck pending
payments and locally paid records without valid applied provider evidence. Callback amount
mismatches, orphan merchant IDs and refund failures create cases during ingestion. A unique
fingerprint makes repeated jobs idempotent.

Run the authenticated internal reconciliation endpoint from one trusted worker using
`PAYMENT_WORKER_SECRET`. It is distributed-rate-limited and processes at most 500 records.
Default pending grace is 45 minutes; checkout expiry does not prove payment failure.

Each case records type, severity, order/payment/refund, expected amount, provider reference,
redacted evidence, last check and recommended action. Admin finance pages expose open cases,
review assignment and notes. Resolution requires an active admin and creates immutable audit.

Review procedure:

1. Locate by merchant order ID and correlation ID; do not search by sensitive card data.
2. Compare immutable callback evidence and PayTR status/report evidence.
3. If provider says paid but local is not, preserve evidence and escalate; do not use generic
   admin mutation. Apply only a separately reviewed recovery function/migration.
4. If local says paid without provider proof, contain fulfillment and escalate before changing
   state or contacting the customer.
5. Mark investigating/resolved/dismissed with factual notes and evidence provenance.

Monitor counts by type/severity, oldest pending age, callback RPC failures, unapplied events
and refund failures. Alert on any critical case and sustained high-severity growth.
