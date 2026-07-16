# CHERIE DAY — Identity and Transactional Communication Closure

Status date: 2026-07-16  
Scope: Staging only. Production, live PayTR and Apple remain out of scope.

## 1. Architecture

The launch contract is:

`validated business mutation → immutable business/audit event → notification outbox → bounded worker claim → canonical Turkish template → Resend → signed webhook → delivery timeline → Admin recovery → Sentry escalation`

Critical transactional messages never depend on marketing consent. Marketing events remain catalogued but are explicitly separated and not connected to the transactional worker.

## 2. Canonical inventory

- Canonical events: **101**, unique by event key.
- Required launch templates: **53**.
- Total renderable template keys: **90** (required launch inventory plus retained operational aliases).
- Every template renders both HTML and plain text.
- Every canonical event records trigger, source, recipient, sender, Reply-To route, classification, template key, deduplication contract, retry/suppression policy, Admin owner, Sentry policy, consent basis, retention and connection state.
- Source of truth: `lib/notifications/catalog.ts`.

Connection states are intentionally honest:

- `connected`: a current database/business trigger exists;
- `provider_managed`: Supabase Auth owns the send and must be configured in the hosted dashboard;
- `implemented_not_yet_triggered`: catalog/template/policy exists, but no business mutation currently emits it.

## 3. Sender and human routing

Automated transport is Resend. Google SMTP is not used by the application.

| Family | Sender | Reply-To / staff owner |
|---|---|---|
| Authentication and account | CHERIE DAY via the verified application sender | support |
| Orders, proofs, production, shipment | CHERIE DAY via the verified application sender | orders |
| Payments, refunds, reconciliation | CHERIE DAY via the verified application sender | payments |
| Contact, quote, appointment | CHERIE DAY via the verified application sender | hello |
| Privacy and legal | CHERIE DAY via the verified application sender | legal |

Sender and Reply-To values are configuration-owned; no customer or Admin free-text value can become a sender. Staff routing is category-aware. Production recipient override is rejected. Staging sends fail closed unless the resolved recipient is in `NOTIFICATION_STAGING_RECIPIENT_ALLOWLIST`.

## 4. Email design system

The email renderer uses reusable header, hidden preheader, greeting, hero message, status/reference panel, minimum 44px CTA, concierge footer and plain-text renderer. It uses the committed public CHERIE DAY logo asset, a 620px table-compatible paper surface, inline styles, email-safe fonts, Turkish copy, canonical environment links and no tracking pixel.

The Admin template catalog renders only fixed fixture data inside a sandboxed preview. It cannot accept an arbitrary recipient and cannot send mail.

## 5. Outbox, delivery and recovery

The hardened outbox adds correlation, environment, sender/Reply-To routing, delivery/suppression/review/cancellation timestamps and last provider-event time. The existing unique idempotency key remains the deduplication boundary.

Retry policy:

1. Initial send: immediate.
2. Retry 1: +5 minutes.
3. Retry 2: +30 minutes.
4. Retry 3: +2 hours.
5. Retry 4: +12 hours.
6. Exhaustion or permanent failure: manual review plus staff escalation.

Resend webhooks are signature-checked, limited to a five-minute request window, replay-protected by provider event ID and linked by provider message ID. Unknown message IDs are retained for reconciliation but do not mutate an outbox row. Event-time and severity precedence prevent an older delayed/sent event from overwriting a later delivered or permanent-failure state.

Bounce, complaint and provider suppression create a SHA-256 recipient suppression record; the raw address is not stored in the suppression table. New customer outbox rows for that recipient are marked suppressed before claim. Suppressed messages cannot be manually retried.

Admin mutations are capability-gated, database-role-checked and appended to the audit log. Supported operations are safe retry, cancel queued/review messages and mark for review. Message detail shows a masked recipient/provider identifier and a status timeline; it never shows message bodies, raw provider payloads or arbitrary recipient controls.

## 6. Authentication closure

- Registration and recovery derive callback URLs from the validated canonical auth configuration; hosted flows cannot fall back to localhost.
- Registration requires name, valid email, matching password and KVKK acknowledgement.
- Password policy is at least 12 characters with lowercase, uppercase, number and special character.
- Recovery request responses remain identical for existing and missing accounts to reduce enumeration.
- A successful password change requests global sign-out and instructs the customer to sign in with the new password.
- Google remains the only enabled social provider in scope. Apple remains disabled.

Hosted end-to-end registration, confirmation and reset are not complete until custom SMTP and the Supabase Auth templates/security notices are enabled and a real Safari cycle succeeds.

## 7. Customer preference boundary

Customers may control marketing and optional reminders only. They may not disable security, legal, payment or fulfilment-critical communication. The current preference table is present, but the complete customer-facing preference mutation contract remains a launch blocker and must not be reported as complete.

## 8. Receipt and invoice boundary

The payment receipt template is a verified payment/order summary only. It explicitly does **not** claim to be a legal invoice. No e-invoice/e-archive provider has been selected or authorized in this scope; legal invoice issuance remains an owner/legal decision.

## 9. Hosted provider audit snapshot

Pre-activation observations from the authenticated Safari audit:

- Supabase Staging project is healthy; Google and email providers are enabled, Apple disabled.
- Custom SMTP is disabled; default Auth email is limited and unsuitable for launch.
- Supabase Auth security-notification toggles are disabled and hosted templates remain default.
- Resend domain, DKIM and return-path SPF records are verified; DMARC policy and branded tracking domain are not proven.
- Google Workspace has active hello, support, orders and payments users; no Groups were present. The legal identity and alias/delegation model are not proven.
- The Sentry organization has no configured alert rules.
- The current `staging.cherieday.eu` deployment predates the unified closure branch and must be replaced before E2E.

These are blockers, not completed claims.

## 10. Staging activation order

1. Rotate the exposed staging Vercel protection-bypass credential and install the replacement in the Resend webhook URL.
2. End/rotate the exposed Google Admin reauthentication session proof.
3. Create a domain-scoped Resend sending key and transfer it directly into Supabase custom SMTP without chat, logs, screenshots or repository storage.
4. Enable and configure Supabase custom SMTP, sender, rate limits, Auth templates and security notifications.
5. Set password policy in hosted Auth to match the application contract.
6. Confirm the legal Workspace identity and role-based access/delegation model; run the harmless internal routing matrix.
7. Apply the reviewed migration to Supabase Staging only and run database advisors.
8. Deploy the unified branch, map only `staging.cherieday.eu`, then execute Safari auth/delivery/Admin E2E.
9. Create the 12 required Staging Sentry alert rules and send scrubbed test events.

## 11. Secret rotation register (identifiers only)

| Credential/session identifier | Reason | Required action | Value recorded? |
|---|---|---|---|
| Staging Vercel protection-bypass credential used by the Resend webhook | Exposed through authenticated provider UI accessibility output during recovery audit | Rotate, replace webhook query credential, verify signed delivery, revoke old value | No |
| Google Admin reauthentication/session proof | Exposed through authenticated browser accessibility output during recovery audit | End session/sign out and reauthenticate before privileged Workspace changes | No |

No credential value, reset link, mailbox message identifier, customer body or provider payload is recorded in this document.

## 12. Verification evidence

Completed locally on the unified branch:

- clean database rebuild through every migration;
- PostgreSQL schema lint: no errors;
- signed webhook/replay tests;
- live local SQL state-precedence, replay and suppression scenario;
- TypeScript check;
- ESLint with zero warnings;
- 210 automated tests passing;
- Next.js optimized production build, including Admin delivery detail and template preview routes.

Hosted and browser evidence must be appended only after the Staging activation steps above succeed.
