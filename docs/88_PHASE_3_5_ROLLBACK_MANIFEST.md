# Phase 3.5 Rollback Manifest

> Current provider-specific rollback order is in `docs/93_PHASE_3_5_WORKERS_CI_E2E_AND_ROLLBACK.md`; never apply either manifest to EDA or the Production-candidate project.

Date: 2026-07-15 (Europe/Istanbul)

## Git

- restore source SHA from `refs/backup/phase-3-5-hosted-completion-20260715-083745`
- offline recovery bundle: `/Users/albarayousef/Desktop/CHERIE_DAY_PHASE_3_5_GIT_BACKUP_20260715-083745.bundle`
- do not reset or clean the separate dirty Phase 4 worktree

## EDA and Supabase

- EDA was not paused, resumed, deleted, or mutated; no provider rollback is required
- encrypted backup: `/Users/albarayousef/Desktop/CHERIE_DAY_EDA_BACKUP_20260715-075200/eda-logical-backup.json.enc`
- verified SHA-256: `505f80393394ac1a3eb24b87b5db94118530948e07ac6ba1b6904b7e38812f67`
- separate owner-only key remains outside the repository
- failed Staging creation allocated no project and requires no deletion
- CHERIE DAY Production-candidate was untouched

## Vercel, Cloudflare, Resend, Sentry, and Google

- Vercel: no project, deployment, domain, or environment mutation; no rollback
- Cloudflare: no DNS/rule mutation; restore from the timestamped zone export only if a later authorized change fails
- Resend: no webhook/API-key/email mutation; no rollback
- Sentry: no project/event/alert mutation; no rollback
- Google: no OAuth/provider mutation; no rollback

## Forward rollback gates

If a later run creates Staging, rollback order is: disable OAuth/email/worker execution, remove the Staging domain from Vercel, remove only the exact new Cloudflare `staging` record, delete only the new Resend Staging webhook/key if dedicated, archive the Staging Sentry project if created, and pause/delete the isolated Staging project only with explicit owner approval. Never apply those steps to EDA or the Production-candidate project.
