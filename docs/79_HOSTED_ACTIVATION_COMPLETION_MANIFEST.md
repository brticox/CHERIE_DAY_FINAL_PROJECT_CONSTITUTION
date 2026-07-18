# Hosted Activation Continuation Manifest

> Superseded (2026-07-15): the earlier capacity blocker was resolved by the owner’s EDA pause. Current hosted resources and remaining consent-gated actions are in `docs/90_PHASE_3_5_CURRENT_HOSTED_STATE.md` through `docs/94_PHASE_3_5_FINAL_READINESS_DECISION.md`.

Date: 2026-07-15 (Europe/Istanbul)

## Executive verdict

Hosted activation was safely resumed and audited, but cannot complete in this run. The only project that could free the Supabase Free-plan slot, EDA, is a live dependency and was correctly left active. Consequently no isolated `CHERIE DAY Staging` project can be created, and downstream Staging deployment, migrations, webhook delivery, Sentry events, OAuth, and browser E2E cannot be truthfully executed.

## Recovery baseline

- recovered commit: `86ae035dc53204271e193f9877eb776a6bc85664`
- continuation branch: `integration/hosted-platform-activation-completion-20260715`
- backup ref: `refs/backup/hosted-platform-activation-completion-20260715-074611`
- verified Git bundle: `/Users/albarayousef/Desktop/CHERIE_DAY_HOSTED_GIT_BACKUP_20260715-074611.bundle`
- other worktrees and their untracked work were not modified
- Production deployment, Apple, Google, transactional email, and live PayTR remain disabled

## Provider snapshot

| Provider | Verified state | Mutation in this continuation |
| --- | --- | --- |
| GitHub | repo admin access; remote only had `main` at audit | continuation branch created locally; push follows this evidence commit |
| Supabase | Free org; EDA and CHERIE DAY active; one unrelated project inactive | read-only audit and encrypted EDA export; no pause/delete/schema mutation |
| Vercel | team connected; no `cherie-day-web`; EDA production project confirmed | none |
| Cloudflare | active authoritative zone `74e8535e39b23167e5efef60e4c3797a` | none; DNS preserved |
| Resend | domain `9ee62771-b1fc-48c4-b1b8-b128074fa460` verified/send-enabled; zero webhooks/emails | none |
| Sentry | available skill is read-only and no `SENTRY_AUTH_TOKEN` is configured | none |
| Google | no connected Google Cloud console capability | none; disabled |
| Apple | no connected Apple Developer capability | none; disabled |

## DNS and mail safety

Public nameservers resolve to Cloudflare. Google Workspace MX and DKIM, Google verification, Resend DKIM, and Resend return-path MX/SPF remain present. Apex and `www` continue to Squarespace. No `staging` record was invented, no duplicate SPF was added, and no HSTS preload, broad cache, WAF challenge, or registrar change was made.

## Environment and secret scope

No hosted secret was copied or printed. `.env.local` remains uncommitted. Staging and Preview require separate Supabase credentials; server-only service-role, Resend, worker, cron, payment, and Sentry secrets must never use `NEXT_PUBLIC_`. `AUTH_GOOGLE_ENABLED=false`, `AUTH_APPLE_ENABLED=false`, `PAYTR_TEST_MODE=true`, and notification sending must remain fail-closed until Staging exists.

## Hosted CI evidence

Draft PR `#1` targets `integration/hosted-platform-activation-20260714` from the continuation branch. The approved identity harness correction is commit `b7eba08c581fe09b75b0aa50941c04ea5379aa89`.

- Quality Gate run `29390152255`: passed (`lint`, typecheck, unit tests, build, dependency audit).
- Cross-phase Integration Integrity run `29390152284`: failed in `supabase/tests/identity_email_services.sql:32` before the callback burst and audit steps.
- Root cause: the identity test sets JSON `request.jwt.claims`, while the vanilla-Postgres `auth.uid()` shim reads `request.jwt.claim.sub`; `ensure_current_customer_profile()` therefore raises `authentication required`.

This was an existing test-harness mismatch, not a production or RLS defect. The correction sets `request.jwt.claim.sub` to the same synthetic UUID already present in `request.jwt.claims`; it removes no assertion and changes no migration or policy. Local migration replay, identity, RLS, Phase 1–3 SQL, 100-way callback concurrency, 129 Vitest tests, typecheck, lint, and build passed. Hosted Integration run `29390771839` and Quality run `29390771825` both passed on the exact correction SHA.

## Rollback

- Git: restore from the bundle or backup ref; do not reset other worktrees.
- EDA: no provider rollback is needed because it was not paused or mutated; recover data from the encrypted snapshot only if required.
- DNS/Resend/Vercel/Sentry: no continuation mutation occurred.

## Exact unblock and next step

Supabase's Free plan permits two active projects and excludes only paused projects from the quota. Creating Staging while EDA is paused would consume both active slots with CHERIE DAY and Staging, so EDA could not be safely resumed as a third active project. No maintenance window was started. Upgrade organization `wqtfqhzywcnktkakaqvz` before creating Staging. Production, Apple, Google Production, Production email, and real money remain not approved.
