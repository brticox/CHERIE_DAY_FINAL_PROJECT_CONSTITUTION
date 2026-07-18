# CHERIE DAY — Hosted Services Activation Manifest

Date: 2026-07-14 (Europe/Istanbul)

Canonical production domain: `cherieday.eu`.

## Proven baseline

- Branch: `integration/identity-email-services-20260714`.
- Commit: `9cee61b40346ddcf9af2f1deefa2bdcc37cd7a3f`.
- Backup bundle: `/Users/albarayousef/Desktop/CHERIE_DAY_BACKUPS/hosted-services-activation-20260714T220000Z.bundle`.
- Backup ref: `refs/backups/hosted-services-activation-20260714T220000Z`.
- GitHub: `brticox/CHERIE_DAY_FINAL_PROJECT_CONSTITUTION`, default branch `main`, admin access confirmed.

## Current hosted verdict

The production domain is owner-confirmed, but hosted activation is **blocked**: its authoritative DNS remains Squarespace, while the connected Cloudflare account has no zones and lacks permission to create one. No Vercel CHERIE DAY project or non-production Supabase project exists. The existing Supabase CHERIE DAY project is healthy but its migration history is behind this branch and must not be used as Staging.

## Changes made

- created the non-delivery Resend domain resource `cherieday.eu` in `eu-west-1`; it remains `not_started` until DNS verification;
- added local environment guards: `staging` is an explicit application environment, non-production is noindex, auth/API routes are no-store, and the two internal workers are Vercel-Cron-compatible;
- added a deployment-only `vercel.json` schedule. It does not run until a Vercel Production deployment exists and `CRON_SECRET` is configured.

## Prohibited until Staging proves safe

Production deployment, provider flags, real payment activation, transactional email sending, Cloudflare proxy/WAF/HSTS changes, and any production data use.

## Rollback

Revert the hosted-preparation commit. Delete the unverified Resend domain only after preserving its verification record manifest. Do not remove Squarespace DNS or Google Workspace MX.
