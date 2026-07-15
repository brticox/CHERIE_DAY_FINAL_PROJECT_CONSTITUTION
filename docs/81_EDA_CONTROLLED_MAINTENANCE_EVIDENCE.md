# EDA Controlled Maintenance Evidence

Date: 2026-07-15 (Europe/Istanbul)

## Decision

The maintenance window was **not started**. EDA was never paused, no resume call was required, and customer-visible downtime caused by this work was zero.

## Mandatory capacity proof

Supabase's current billing documentation grants two active Free projects and states that paused projects do not count toward the limit. Current active projects are:

1. `EDA` — `opntjknemukwzkpyalbn`
2. `CHERIE DAY` — `rkvubnuwfuocoevayhcd`

If EDA were paused and `CHERIE DAY Staging` created, the active slots would be CHERIE DAY and Staging. Resuming EDA would require a third active Free project. Supabase does not promise or permit that state. This matches prohibited outcome B/C in the Phase 3.5 control plan, so pausing was unsafe.

References:

- https://supabase.com/docs/guides/platform/billing-on-supabase
- https://supabase.com/docs/guides/platform/billing-faq
- https://supabase.com/docs/guides/platform/free-project-pausing

## Backup revalidation

- encrypted snapshot: `/Users/albarayousef/Desktop/CHERIE_DAY_EDA_BACKUP_20260715-075200/eda-logical-backup.json.enc`
- SHA-256: `505f80393394ac1a3eb24b87b5db94118530948e07ac6ba1b6904b7e38812f67`
- encryption/decryption: verified
- captured schema columns: 16
- captured application rows: 6
- Auth inventory rows: 1
- Storage buckets/objects: 0/0
- Edge Functions: 0
- Vault secret-name entries: 0

The recovery procedure remains in `docs/78_EDA_PAUSE_AND_RECOVERY_MANIFEST.md`.

## Live integrity after decision

- Supabase status: `ACTIVE_HEALTHY`
- application rows: 6; latest timestamp remains `2026-06-22T10:43:45.159105Z`
- Auth users: 1
- Storage buckets/objects: 0/0
- `https://edaokullari.com/`: HTTP 200, redirects normally to `www`
- `https://www.edaokullari.com/`: HTTP 200
- schema/data mutation: none
- pause/resume API calls: none
- measured maintenance downtime: 0 seconds

Exact unblock: upgrade the Supabase organization before attempting to create a third active project. Do not use a pause-first experiment.
