# Phase 3.5 Hosted Resource Snapshot

> Historical snapshot: the post-activation resource inventory is now `docs/90_PHASE_3_5_CURRENT_HOSTED_STATE.md`.

Date: 2026-07-15 (Europe/Istanbul)

## Supabase

| Name | ID/ref | Region | Status | Protection |
| --- | --- | --- | --- | --- |
| EDA | `opntjknemukwzkpyalbn` | `eu-west-1` | `ACTIVE_HEALTHY` | protected; no mutation |
| CHERIE DAY | `rkvubnuwfuocoevayhcd` | `eu-central-1` | `ACTIVE_HEALTHY` | Production-candidate; untouched |
| brticox's Project | `aimdbqytagsthvhmrkkd` | `ap-southeast-1` | `INACTIVE` | unrelated; untouched |
| CHERIE DAY Staging | not allocated | requested `eu-central-1` | creation rejected | no partial resource |

Organization `wqtfqhzywcnktkakaqvz` remains Free. The provider reported project price `$0/month`, but owner `brticox` has reached the two-active-project quota.

## Vercel

- team: `brticoxs-projects` (`team_t9hkoLttwqGnT6OrdiqgcZxv`)
- existing projects: six unrelated projects
- `cherie-day-web`: absent
- Staging deployment/domain/protection: absent
- Production promotion: not performed

## Cloudflare

- account: `227ae33df6eba383550e55046edbf9a4`
- zone: `cherieday.eu` (`74e8535e39b23167e5efef60e4c3797a`)
- status/type/plan: active/full/Free Website
- authoritative nameservers: `armfazh.ns.cloudflare.com`, `christina.ns.cloudflare.com`
- DNS records: 16
- apex and `www`: existing Squarespace targets preserved
- Google Workspace: five MX records plus verification and DKIM preserved
- Resend: DKIM plus return-path MX/SPF preserved
- DMARC: absent; no record was invented
- `staging.cherieday.eu`: absent because Vercel has supplied no target

## Resend

- domain: `cherieday.eu` (`9ee62771-b1fc-48c4-b1b8-b128074fa460`)
- region/status: `eu-west-1`, verified, send-enabled
- webhooks: zero
- Staging send: not attempted because protected Staging does not exist
- Production delivery: not enabled by this mission

## GitHub, Sentry, and Google

- GitHub repository: `brticox/CHERIE_DAY_FINAL_PROJECT_CONSTITUTION`
- PR #1: open, draft, unmerged
- GitHub hosted credentials: none configured
- Sentry project/events/alerts: not created; connected access is insufficient
- Google OAuth client/provider: not created; connected access is unavailable
- Google and Apple application flags remain disabled
