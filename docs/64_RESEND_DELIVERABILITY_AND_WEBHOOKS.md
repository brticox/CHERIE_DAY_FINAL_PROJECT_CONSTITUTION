# CHERIE DAY — Resend Deliverability and Webhooks

Connected Resend result: **no domains found**. No DNS change or live send was made.

## DNS change gate

After the authoritative domain is confirmed, the owner must export the exact Resend verification records and current Cloudflare DNS. Review current record, proposed record, TTL, conflict and rollback before writing anything. Preserve Google Workspace MX. Maintain one SPF strategy; do not publish competing SPF TXT records. Add Resend DKIM exactly as issued. Begin DMARC in monitored mode only after every legitimate sender aligns; enforcement requires a separate business approval.

## Runtime contract

- `RESEND_API_KEY` and `RESEND_WEBHOOK_SECRET` are server-only.
- Production sending additionally requires a verified sender and webhook secret.
- Preview stays capture-only or uses a designated recipient override; production rejects overrides.
- The endpoint is `/api/webhooks/resend`, accepts at most 64 KiB, verifies Svix ID/timestamp/signature with a five-minute tolerance, and stores no raw body.
- Supported events: sent, delivered, delivery delayed, bounced, complained, failed and suppressed.
- `provider_event_id` is unique for replay safety. Status updates match the stored Resend message ID.

Bounce, complaint and failure states appear in notification operations. Suppression policy and deletion/retention duration require privacy-owner approval before production.

Owner validation: verify the domain in Resend; create the webhook for the production URL; subscribe to the supported events; send one designated staging message; replay the same event; confirm one delivery-event row and the expected Turkish admin state.

Reference: [Resend event types](https://resend.com/docs/webhooks/event-types) and [webhook verification](https://resend.com/docs/dashboard/receiving/introduction#how-can-i-make-sure-that-its-resend-whos-sending-me-webhooks).
