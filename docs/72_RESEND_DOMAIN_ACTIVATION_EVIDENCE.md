# CHERIE DAY — Resend Domain Activation Evidence

Resource: `cherieday.eu` (`9ee62771-b1fc-48c4-b1b8-b128074fa460`), region `eu-west-1`, status `verified`, sending enabled, receiving disabled, open/click tracking disabled.

No mail has been sent because a dedicated Staging API key still requires action-time owner confirmation. Staging webhook `ffdd45ac-26b3-41d1-8c8c-65500f7a184e` exists, its signing secret is stored only in Vercel Preview, and the protected route is reachable through the dedicated Vercel automation bypass.

The Staging webhook endpoint is:

- `https://staging.cherieday.eu/api/webhooks/resend`

It subscribes to `email.sent`, `email.delivered`, `email.delivery_delayed`, `email.bounced`, `email.complained`, `email.failed`, and `email.suppressed`. The implementation verifies Svix signatures, rejects stale replays, caps payload size, and records only delivery metadata.

Staging sender: `CHERIE DAY <hello@cherieday.eu>` with `[STAGING]` subject prefix and one owner-controlled recipient. Reply-To addresses are `support`, `orders`, `payments`, `legal`, and `hello` at the same domain. Production transactional sending remains disabled. Workspace mailbox/alias/group status remains unverified because Workspace Admin access is unavailable.
