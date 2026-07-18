# EDA Pause and Recovery Manifest

> Current-state correction (2026-07-15): the owner has since paused EDA. It is protected and must not be modified or resumed by this work. Backup checksum remains verified; see `docs/90_PHASE_3_5_CURRENT_HOSTED_STATE.md`.

Date: 2026-07-15 (Europe/Istanbul)

## Verdict

EDA was fully inspected and backed up, but it was **not paused**. It is unrelated to CHERIE DAY, yet it is an active dependency of the public EDA school website. Pausing it would break a live submission workflow and violate the mission's dependency safety gate.

## Project identity and activity

- Supabase project/ref: `opntjknemukwzkpyalbn`
- organization: `brticox's Org` (`wqtfqhzywcnktkakaqvz`), Free plan
- region: `eu-west-1`
- status after audit: `ACTIVE_HEALTHY`
- created: `2026-05-03T00:47:37.164971Z`
- Postgres: `17.6.1.111`
- database size: `11,078,803` bytes
- Auth users: `1`
- Storage buckets/objects/bytes: `0 / 0 / 0`
- Edge Functions: `0`
- installed extensions: `plpgsql`, `pgcrypto`, `uuid-ossp`, `supabase_vault`, `pg_stat_statements`
- public schema: one RLS-enabled `applications` table
- application rows: `6`; first `2026-05-04`, latest `2026-06-22`
- scheduled jobs: none (`pg_cron` is not installed)

No customer values, tokens, phone numbers, email addresses, child details, or secret values are recorded in this repository.

## Active dependency

Vercel project `eda-anaokulu-website` (`prj_EAXzlVectovCv2uCT3YTJtGqfRSp`) has ready Production deployments and serves `edaokullari.com` plus `www.edaokullari.com`. Its linked private GitHub repository is `brticox/eda-anaokulu-website`. The Supabase table stores parent/child application submissions, demonstrating a live operational dependency even though repository code search did not expose the private environment reference.

## Backup evidence

- encrypted logical recovery snapshot: `/Users/albarayousef/Desktop/CHERIE_DAY_EDA_BACKUP_20260715-075200/eda-logical-backup.json.enc`
- separate owner-only key: `/Users/albarayousef/Desktop/CHERIE_DAY_EDA_BACKUP_20260715-075200/eda-backup.key`
- encrypted snapshot SHA-256: `505f80393394ac1a3eb24b87b5db94118530948e07ac6ba1b6904b7e38812f67`
- verified contents: complete `public` columns, constraints, indexes, RLS policies, triggers, grants, functions, all six application rows, one Auth metadata inventory row, Vault secret-name inventory, and project/storage/function inventory

The connected Supabase MCP does not expose database credentials or a provider backup download endpoint, and the local CLI is not authenticated. The encrypted logical snapshot is therefore the complete safe export available through connected permissions. Supabase retains the active source project unchanged.

## Recovery procedure

1. Keep the encrypted snapshot and key separate and owner-only.
2. Decrypt with `openssl enc -d -aes-256-cbc -pbkdf2 -iter 250000` using the key file.
3. Create a replacement Supabase project on Postgres 17.
4. Recreate the `public` schema from the captured schema objects and validate RLS/grants.
5. Restore all application rows and verify the row count and timestamps.
6. Recreate the single Auth user through supported Supabase Admin APIs; do not restore sessions or refresh tokens.
7. Point the EDA website to the replacement, test form submission and administration, and only then consider pausing the original.

## Pause consequences and rollback

Pausing now would make the EDA application backend unavailable and could lose new school applications. No pause API call was made, so no restore action is required. If a future verified migration permits pausing, Supabase Free projects must be restored within the provider's 90-day window; otherwise use the encrypted snapshot and provider downloadable backup.
