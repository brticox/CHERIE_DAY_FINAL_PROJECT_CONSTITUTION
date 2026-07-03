# OPERATIONS FULFILLMENT SLA LOCK

This file defines operational rules for MVP.

## Lead Response

- Form leads: respond within 1 business day.
- WhatsApp high-intent leads: respond same business day where possible.
- Product/order support: respond within 1 business day.
- Payment failure support: prioritize same business day.

## Order Lifecycle

1. `pending_payment`
2. `paid`
3. `in_design`
4. `proof_sent`
5. `revision_requested`
6. `proof_approved`
7. `in_production`
8. `quality_check`
9. `packed`
10. `shipped`
11. `delivered`
12. `completed`
13. `cancelled`
14. `refunded`

Not every order uses every status.

## Production Timelines

Default estimates:

- standard wax/ribbon/packaging: 3-5 business days,
- simple personalized stationery: 5-7 business days after proof approval,
- invitation sets: 7-14 business days after proof approval,
- bespoke/event stationery: quote-specific,
- digital invitation simple package: 3-5 business days after content collection,
- wedding website: future/inquiry-only in MVP.

## Proof Approval SLA

- CHERIE DAY sends first proof according to product timeline.
- Customer gets 1 included revision.
- Production begins only after approval.
- Revision requests must be stored in `product_proofs`.
- Proof approval timestamp must be stored.

## Fulfillment

- Turkey-only delivery.
- Delivery estimate shown before payment.
- Tracking number shown when available.
- Customer sees safe shipment summary, not internal logistics notes.

## Support Categories

- product question,
- personalization question,
- proof revision,
- payment issue,
- delivery issue,
- return/cancellation request,
- general Maison inquiry.

## Admin Queues

MVP admin needs:

- new leads,
- quote requests,
- paid orders,
- proof waiting,
- revision requested,
- production queue,
- shipping queue,
- support queue,
- refund/cancellation queue.

