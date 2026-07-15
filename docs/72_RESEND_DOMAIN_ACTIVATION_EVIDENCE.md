# CHERIE DAY — Resend Domain Activation Evidence

Resource: `cherieday.eu` (`9ee62771-b1fc-48c4-b1b8-b128074fa460`), region `eu-west-1`, status `verified`, sending enabled, receiving disabled, open/click tracking disabled.

No mail has been sent and no webhook has been created. DNS is verified, but the Staging endpoint does not exist; creating a webhook or sending now would not provide valid end-to-end evidence.

After the protected Staging deployment exists, create the Staging webhook only:

- `https://staging.cherieday.eu/api/webhooks/resend`

Subscribe to `email.sent`, `email.delivered`, `email.delivery_delayed`, `email.bounced`, `email.complained`, `email.failed`, and `email.suppressed`. The implementation already verifies Svix signatures, rejects stale replays, caps payload size, and records only delivery metadata.

Staging sender: `CHERIE DAY <hello@cherieday.eu>` with `[STAGING]` subject prefix and one owner-controlled recipient. Reply-To addresses are `support`, `orders`, `payments`, `legal`, and `hello` at the same domain. Production transactional sending remains disabled. Workspace mailbox/alias/group status remains unverified because Workspace Admin access is unavailable.
