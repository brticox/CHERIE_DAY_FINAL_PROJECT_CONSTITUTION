# 95 — Merged Launch Line: Hosted Activation Evidence & Runbook

**Date:** 2026-07-15
**Branch:** `integration/hosted-launch-merged-20260715`
**HEAD:** `8a04163f1a25715724c2ea134604df3dedb8b7c6`
**PR:** [#3](https://github.com/brticox/CHERIE_DAY_FINAL_PROJECT_CONSTITUTION/pull/3) — OPEN, review-ready, **not merged**
**Scope guardrails:** Production deferred. No prod DB, no prod deploy, no apex DNS change, EDA untouched, Apple disabled, live PayTR disabled.

> No secret values appear in this document by design (OAuth client secret, API keys, service-role keys, webhook secrets, bypass tokens, DSNs).

---

## 1. Executive readiness decision

- **Staging (merged line): code-complete and CI-green; hosted providers partially owner-gated.**
- The merged branch unifies the hosted platform line (Phase 1–3.5) with Phase 4 public commerce and Client Portal Wave 1 into one deployable line. All local + hosted CI gates pass. Public + auth-entry pages render cleanly on the merged preview.
- **Production: NOT ready, NOT launched** (deliberately deferred per owner decision).

---

## 2. Integration branch

| Item | Value |
|---|---|
| Base | `integration/phase-3-5-hosted-completion` (`392950d`) — hosted backend, identity/email, Sentry/Vercel/Supabase hardening, migration set matching Staging (40 applied) |
| Merged in | `phase/client-portal-personalization-engine` (`375540a`) — Phase 4 public commerce + Client Portal Wave 1 |
| New DB migrations | **None** (portal migration set ⊆ Staging's 40) |
| Conflicts resolved | 4 files (customer-facing) — see PR |

## 3. Verification matrix (local + hosted CI @ `8a04163`)

| Gate | Result |
|---|---|
| `tsc --noEmit` | ✅ pass |
| `eslint` (max-warnings=0) | ✅ pass (0 warnings) |
| `vitest run` | ✅ **149/149** |
| `next build` | ✅ pass |
| `npm audit` (high gate) | ✅ exit 0 (3 *moderate* postcss transitive — no breaking downgrade taken) |
| CI · Quality Gate | ✅ run **29415046745** |
| CI · Cross-phase Integration Integrity | ✅ run **29415047190** |
| CI · Vercel | ✅ "Deployment has completed" |

## 4. Vercel deployment

| Item | Value |
|---|---|
| Project | `cherie-day-web` (`prj_NCMWdLqi0GOV4S5iKTdMRAKSIVbB`), team `brticoxs-projects` |
| Merged preview | `dpl_2A23RHnCarFz69BgyBXFiqtz9mGs` — **READY**, `target: null` (Preview) |
| Preview URL | `cherie-day-74yrkbbn0-brticoxs-projects.vercel.app` |
| Production deployment | **None** (`live:false`, Latest Production URL `--`) |
| Production alias | **None** |

## 5. Staging environment matrix (merged-branch preview scope)

| Var | Value / status |
|---|---|
| `APP_ENV` | `staging` ✅ |
| `NEXT_PUBLIC_SITE_URL` | `https://staging.cherieday.eu` ✅ |
| `NEXT_PUBLIC_SUPABASE_URL` | `hdafztkhkyhqziqayerz.supabase.co` (**Staging**, not prod) ✅ |
| `AUTH_APPLE_ENABLED` | `false` ✅ |
| `AUTH_GOOGLE_ENABLED` | override **`true`** added for merged branch (takes effect on next deploy) |
| `AUTH_REDIRECT_ORIGINS` | `https://staging.cherieday.eu,http://localhost:3000` ✅ |
| `PAYTR_TEST_MODE` | `1` (test, not live) ✅ · `PAYTR_REFUND_ENABLED` `false` ✅ |
| `NOTIFICATION_SEND_ENABLED` | replicated to merged branch ✅ |
| `RESEND_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` | present (general Preview) ✅ |
| `RESEND_API_KEY`, `CRON_SECRET`, `PAYMENT_WORKER_SECRET`, `NOTIFICATION_WORKER_SECRET` | **MISSING for merged branch** — pinned to phase-3.5 branch and marked **Vercel “sensitive” (write-only)**, so cannot be copied programmatically. **Owner action required** (see §11). |

## 6. Staging domain mapping

| Host | Currently serves | Notes |
|---|---|---|
| `staging.cherieday.eu` | `dpl_3YYo7…` (`392950d`, phase-3.5) | **Not yet the merged line.** |
| Cutover plan | Repoint to merged deployment **after** the 4 sensitive vars are extended to the merged branch (else email/workers regress). Preserve SSO/noindex/Cloudflare DNS. | |

## 7. Resend — delivery + webhook proof

- Domain `cherieday.eu` **verified**; DKIM ✅; return-path SPF on `send.cherieday.eu` (`v=spf1 include:amazonses.com`, MX `feedback-smtp.eu-west-1.amazonses.com`) ✅.
- Controlled Staging email `f9901a08-2d0d-4703-bc27-03089fb11cdf` — From `CHERIE DAY <hello@cherieday.eu>`, Reply-To `support@cherieday.eu`, TR HTML+text, canonical `cherieday.eu` (no localhost) → **Status: delivered**.
- Webhook persisted in Staging `email_delivery_events`: **`email.sent`** @ 12:23:49.586 and **`email.delivered`** @ 12:23:50.892, two distinct `provider_event_id`s (unique, no duplicates).
- Handler guarantees (code-verified `app/api/webhooks/resend/route.ts` + `lib/notifications/resend-webhook.ts`): svix HMAC-SHA256 constant-time signature, **stale timestamp >300s → reject**, **payload >64KB → 413**, invalid signature → **400**, missing secret → 503, success → 200; duplicate replay → 200 with no duplicate row (`on conflict (provider_event_id) do nothing`); **only `email_id`/type/timestamp stored — no raw body**.
- Raw send was **not** linked to a `notification_outbox` row (direct send, honest note); the RPC still records the delivery events and syncs outbox status for outbox-originated sends.
- ⚠️ **Rotate** the Vercel Protection-Bypass token embedded in the Resend webhook URL (exposed to inspection).

## 8. Browser QA — merged preview (public + auth entry)

| Route | Viewport | Result |
|---|---|---|
| `/` | 1280 & 375 | no overflow, no console errors, `robots: noindex,nofollow`, 0 localhost refs, TR, `lang=tr` |
| `/hesap/giris` | 375 | TR, email+password fields, Google/Apple buttons **rendered but `disabled`** while flags off (correct gating), no overflow, no console errors |
| `/magaza` | 1280 | 33 product links, prices in ₺, reads live Staging Supabase, no overflow, no console errors |

## 9. Sentry

- Org `cherie-day` (region `de.sentry.io`), project **`cherie-day-web`** present. DSN scopes configured in Vercel (`SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`).
- Alert rules + PII scrubbing verification: **owner dashboard** (see §11).

## 10. Supabase Auth — architecture & config matrix

- App uses **native Supabase Google provider** (`supabase.auth.signInWithOAuth({provider:'google'})`); callback `app/auth/callback/route.ts` → `exchangeCodeForSession` → `ensure_current_customer_profile` (provisions profile; **blocks disabled/archived** → `account_blocked`) → identity event → **guest-cart merge** → redirects on `NEXT_PUBLIC_SITE_URL` origin. Only `email/google/apple`; **no staff-creation path**.
- `lib/auth/config.ts` rejects non-HTTPS/localhost origins outside development (no localhost in hosted mail/redirects).
- RPCs present on Staging: `ensure_current_customer_profile`, `record_current_identity_event`. `staff_users` has `auth_user_id`; RLS `{admin_manage_all, staff_read_self}`; `staff_role` includes `superadmin`.

| Supabase Staging setting | Required value | Who sets |
|---|---|---|
| Auth → Providers → Google | enable + Client ID/Secret | **Owner** (dashboard) |
| Google Cloud redirect URI | `https://hdafztkhkyhqziqayerz.supabase.co/auth/v1/callback` | **Owner** (verify) |
| Google Cloud JS origins | `https://staging.cherieday.eu` (+ `http://localhost:3000`) | **Owner** (verify) |
| Google scopes | `openid`, `email`, `profile` only | **Owner** (verify) |
| Auth → URL Config → Site URL | `https://staging.cherieday.eu` | **Owner** |
| Auth → Redirect URLs | `https://staging.cherieday.eu/auth/callback` | **Owner** |
| Auth email templates (TR) + SMTP | TR, staging-origin links | **Owner** (verify) |

## 11. Owner action runbook (to reach 10/10 staging)

1. **Supabase Staging → Auth → Providers → Google:** enable, paste existing Client ID + Client Secret. (Client ID `194515374256-im60pfacnitnndmt9jgjhrjb0ogmlgqq.apps.googleusercontent.com`.)
2. **Supabase Staging → Auth → URL Config:** Site URL `https://staging.cherieday.eu`; add Redirect URL `https://staging.cherieday.eu/auth/callback`.
3. **Vercel → cherie-day-web → Settings → Environment Variables:** for `RESEND_API_KEY`, `CRON_SECRET`, `PAYMENT_WORKER_SECRET`, `NOTIFICATION_WORKER_SECRET`, change Preview scope from branch `integration/phase-3-5-hosted-completion-20260715` to **All Preview branches** (or add the merged branch). No value re-entry needed.
4. **Then** repoint `staging.cherieday.eu` to the merged deployment + redeploy (can be done via CLI once step 3 is complete).
5. **Supabase Auth → Users → Invite** the owner email (e.g. `braayousef12@gmail.com`); accept + verify. Then run the audited link SQL in §12.
6. **Sentry:** create staging alert rules routed to support@/orders@/payments@/legal@ + technical address; confirm PII/cookie/token/email-body/reset-link/payment scrubbing.
7. **Google Cloud:** after Google login proven, rotate the Client Secret; replace in Supabase; delete old; record only rotation + last-4 masked.
8. **Rotate** the Resend webhook Protection-Bypass token (Vercel → Deployment Protection) and update the Resend webhook URL.
9. **Google Workspace Admin (Safari):** classify hello@/support@/orders@/payments@/legal@ (mailbox/alias/group/delegated), verify send-as, external receive, 2SV, finance/legal restriction, no public delegation.

## 12. Admin provisioning — audited link SQL (run AFTER owner auth user exists)

```sql
-- Links the owner's existing Supabase Auth user to staff_users as superadmin.
-- Safe/idempotent; does NOT create the auth user (owner creates via invite).
insert into public.staff_users (auth_user_id, name, email, role, is_active)
select u.id, 'CHERIE DAY Owner', u.email, 'superadmin', true
from auth.users u
where lower(u.email) = lower('OWNER_EMAIL_HERE')
  and not exists (
    select 1 from public.staff_users s where s.auth_user_id = u.id
  );

-- Verify:
select s.email, s.role, s.is_active
from public.staff_users s
join auth.users u on u.id = s.auth_user_id
where lower(s.email) = lower('OWNER_EMAIL_HERE');
```

Post-link checks: `/admin` reachable as superadmin; customer cannot access `/admin`; restricted role cannot mutate finance/audit; customer metadata cannot grant staff role.

## 13. Rollback plan

- **Code:** merged line is additive on a new branch; `main` unchanged. Revert = do not merge PR #3; delete branch. Backup tag `backup/recovery-audit-20260715-145344` + `--all` bundle retained.
- **Staging domain:** if repointed and problematic, re-alias `staging.cherieday.eu` back to `dpl_3YYo7…` (phase-3.5). No DNS change needed (CNAME → Vercel stays).
- **Env:** added vars are Preview/branch-scoped and removable via `vercel env rm`; no prod env touched.
- **DB:** no migrations applied this activation; no rollback needed.

## 14. Not done / owner-gated (honest)

Auth E2E requiring real Google login + Supabase provider/SMTP config; admin provisioning (needs owner auth user); Sentry alert-rule creation; Workspace mailbox admin; Google secret rotation; staging domain cutover (blocked on §11.3). Production launch intentionally deferred.
