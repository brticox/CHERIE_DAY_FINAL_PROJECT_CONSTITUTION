# CI Identity Harness Fix Evidence

Date: 2026-07-15 (Europe/Istanbul)

## Root cause

Hosted Cross-phase Integration run `29390270991` failed at `supabase/tests/identity_email_services.sql:32`. The synthetic test set the JWT JSON in `request.jwt.claims`, while the disposable-Postgres `auth.uid()` shim correctly reads `request.jwt.claim.sub`. Production code, migrations, and RLS policies were not defective.

## Exact correction

- file: `supabase/tests/identity_email_services.sql`
- commit: `b7eba08c581fe09b75b0aa50941c04ea5379aa89`
- change: set `request.jwt.claim.sub` to the existing synthetic authenticated user's UUID
- assertions removed/skipped: none
- RLS or production changes: none

## Local evidence

- full migration replay: pass
- identity/email SQL: pass
- core RLS suite: pass
- Phase 1 legal/notification SQL: pass
- Phase 2 permissions/operations SQL: pass
- Phase 3 financial/refund/reconciliation SQL: pass
- 100 concurrent duplicate callbacks: pass
- Vitest: 16 files, 129 tests passed
- typecheck: pass
- lint: pass
- Next.js build: pass under Node 22.16.0

The initial Node 22.11.0 shell did not satisfy Vite's current engine floor. Reinstalling the lockfile and using the available Node 22.16.0 runtime resolved the local environment mismatch without changing package manifests or lockfiles.

## Hosted evidence

- corrected SHA: `b7eba08c581fe09b75b0aa50941c04ea5379aa89`
- Cross-phase Integration Integrity run `29390771839`: pass
- Quality Gate run `29390771825`: pass
- PR: draft `#1`; not merged

Rollback: revert commit `b7eba08`. That would restore the known CI harness failure and is not recommended.
