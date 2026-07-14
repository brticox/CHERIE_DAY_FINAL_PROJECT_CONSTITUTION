# CHERIE DAY — Resend Domain Activation Evidence

Created resource: `cherieday.eu` (`9ee62771-b1fc-48c4-b1b8-b128074fa460`), region `eu-west-1`, sending enabled, receiving disabled, tracking disabled, TLS opportunistic.

Status: `not_started`. No mail has been sent and no webhook has been created because neither Staging URL nor DNS verification is available.

When DNS verification completes, create two separately secret-scoped webhooks:

- `https://staging.cherieday.eu/api/webhooks/resend`
- `https://cherieday.eu/api/webhooks/resend`

Subscribe to `email.sent`, `email.delivered`, `email.delivery_delayed`, `email.bounced`, `email.complained`, `email.failed`, and `email.suppressed`. The implementation already verifies Svix signatures, rejects stale replays, caps payload size, and records only delivery metadata.

Production sender: `CHERIE DAY <hello@cherieday.eu>`. Reply-To addresses are `support`, `orders`, `payments`, `legal`, and `hello` at the same domain. Workspace mailbox/alias/group status remains unverified because Workspace Admin access is unavailable.
