# CHERIE DAY — Phases 01–03 Integration Manifest

Status: pre-integration draft

Integration branch: `integration/phases-01-03-20260714`

Canonical base: `4704c5952d361c256ccd4d64e7dc782f7bd61e58`

Prepared: 2026-07-14 (Europe/Istanbul)

This manifest is the zero-loss ledger for the Phase 1, Phase 2, Admin Excellence,
Admin Visual Revolution, and Phase 3 integration gate. It must be finalized only
after the migration reset, complete test suite, authenticated browser matrix, and
zero-loss audit have passed.

## Verified source references

| Source | Verified HEAD | Relationship to canonical base |
|---|---|---|
| `origin/main` | `ab33c3ccc5912b5d191339b8828c0cdd7f059065` | Root baseline |
| `phase/01-launch-blockers-20260714` | `fdab8d6166b9b54dac142ff6cebe63206b661a72` | Exact ancestor |
| `phase/02-admin-control-center-20260714` | `aef87d3108bb910da839e1a4b8aa355056a9d205` | Exact ancestor and Phase 3 fork point |
| `phase/02-admin-excellence-20260714` | `91fbd7593a10a03d57bb37a00895977882c5cfeb` | Exact ancestor |
| `phase/02-admin-visual-revolution-20260714` | `4704c5952d361c256ccd4d64e7dc782f7bd61e58` | Canonical base |
| `phase/03-payment-security-20260714` | `0d0fcf9d1bbb243fcded6d795125d429c5eced3b` | Six commits forked from `aef87d3` |

## Canonical strategy

1. Retain the Visual Revolution HEAD as the presentation and authorization base.
2. Do not replay Phase 1, Control Center, or Admin Excellence: their commits are
   already present with identical hashes in the canonical base.
3. Merge Phase 3 with `--no-ff` so all six financial commits and their boundaries
   remain auditable.
4. Resolve semantic—not merely textual—overlap in a separate integration commit:
   financial/domain behavior comes from Phase 3; admin presentation comes from
   Visual Revolution; authorization uses the strictest server and RLS checks.
5. Preserve every historical migration. Add corrective forward migrations only if
   an empty local database reset proves one is required.

## Unique commits to integrate

| Commit | Subject | Required preservation |
|---|---|---|
| `bdb6c9c` | PayTR cryptographic vectors and money invariants | Exact integer-money and crypto behavior |
| `ec17795` | Atomic financial state and hardened callbacks | Callback validation, replay convergence, audit trail |
| `88288c7` | Reconciliation and refund operations | Permissioned refunds, simulator, reconciliation, notifications |
| `b851e10` | SQL/RLS and concurrent replay verification | CI and local SQL/burst tests |
| `c77e248` | Financial operations and incident runbooks | Phase 3 documents 51–56 |
| `0d0fcf9` | Payment-event history performance index | Migration index retained |

## Intentionally skipped replays

| Source range | Reason |
|---|---|
| Phase 1: `6fb5cdc..fdab8d6` | Already an exact ancestor of the canonical base |
| Phase 2 Control Center: `060c9b1..aef87d3` | Already an exact ancestor of the canonical base |
| Admin Excellence: `7fda349..91fbd75` | Already an exact ancestor of the canonical base |
| Visual Revolution: `d4ed575..4704c59` | Forms the canonical base; not replayed |

No duplicate-equivalent patch IDs were found between the 19 post-`aef87d3`
Visual/Excellence commits and the six Phase 3 commits. No commits were reordered.

## Overlap and conflict risk register

| Zone | Classification | Protected precedence | Expected integration work |
|---|---|---|---|
| Git file overlap | Automatic safe | Preserve both histories | No common changed paths after `aef87d3` |
| `/admin/finance/**` vs `/admin/commerce/payments|refunds` | Manual semantic merge | Phase 3 behavior; Visual presentation | Select canonical routes, preserve redirects, remove no behavior |
| Finance read/mutation guards | Manual semantic merge | Strictest capability/RLS behavior | Reuse central capability gate; retain Phase 3 mutation restrictions |
| Payment/callback/refund domain | Phase 3 precedence | Financial truth | Do not rewrite domain logic during UI adaptation |
| Admin shell/navigation/primitives | Visual precedence | Maison Control and Turkish UI | Add canonical finance destinations without regressing hierarchy |
| Notification outbox | Integration adapter | Phase 1 durability + Phase 3 events | Prove exactly-once enqueue across callback/refund paths |
| Order payment/refund presentation | Integration adapter | Phase 3 state + Turkish mappings | Add missing status mappings; preserve next-action semantics |
| Database migrations | Automatic chronological append, then audit | All valid migrations | Retain shared chain and append `20260714120317` |
| Generated database types | Manual verification | Final reset schema | Regenerate locally and review RPC Args/Returns |
| Tests and CI | Additive | Preserve every assertion | Consolidate inventories; add only missing cross-phase boundaries |
| Public homepage/hero/services | No-touch regression zone | Phase 1 presentation | Hash and browser comparison only |
| Evidence and docs | Additive | Preserve every phase | New integration evidence directory; no overwrite |

## Protected behavior ledger

- Phase 1 legal publication lifecycle, consent snapshots, durable outbox,
  retry/idempotency, Turkish templates, and notification operations.
- Phase 2 admin routes, operations workflows, service-role boundary checks,
  capability gating, and SQL/RLS verification.
- Admin Excellence role-adaptive navigation/dashboard, uploader behavior, command
  palette, order cockpit, and evidence.
- Visual Revolution Maison Control system, Turkish visible admin copy, responsive
  records/forms, accessibility, and all existing screenshots.
- Phase 3 PayTR verification, integer kuruş model, callbacks, rate limiting,
  reconciliation, refund invariants, audit records, RLS, simulator, SQL tests,
  CI workflow, runbooks, and performance index.

## Validation plan

1. Review merge tree and every Phase 3 file after the history merge.
2. Audit route, capability, RLS, migration, notification, legal, and order-state
   integration boundaries.
3. Regenerate database types only after an empty local reset succeeds.
4. Run typecheck, zero-warning lint, full Vitest, dependency audit, production
   build, migration reset, all Phase 1/2/3 SQL suites, callback burst, simulator,
   and cross-phase tests.
5. Run authenticated role/route/viewport browser QA and compare public/admin
   baselines before publishing integrated screenshots.
6. Re-run ancestry, migration, test, route, evidence, and source-worktree audits;
   then replace this draft status with final verified results.

## Finalization ledger

The following fields remain deliberately pending until verification is complete:

- Integrated HEAD and created commits: pending
- Merge/conflict resolutions: pending
- Migration reset and generated types: pending
- Unit/SQL/RLS/concurrency/simulator totals: pending
- Authenticated browser and visual regression evidence: pending
- Zero-loss proof and external blockers: pending
