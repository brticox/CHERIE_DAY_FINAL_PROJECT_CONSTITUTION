# P0 Reconciliation & Hosted Staging Validation — 2026-07-18

## Scope and non-negotiable controls

This report covers branch reconciliation from the approved canonical baseline through local launch-critical validation. It does **not** claim hosted acceptance. No production project, production database, production deployment, live PayTR configuration, owner account, or superadmin account was used or modified.

The reconciliation branch was created in an isolated worktree so source-worktree untracked artifacts were never reused or removed.

## Baseline and topology

| Item | Evidence |
| --- | --- |
| Canonical branch | `integration/reconciled-canonical-20260716` |
| Canonical SHA | `69692a13f0c66222028e7324243712ada8e08efd` |
| Reconciliation branch | `integration/p0-reconciliation-20260718` |
| Reconciliation tip | `0179a74` |
| Original P0 commits reachable from source branch | `b91df39`, `725ef83`, `8f27b4f`, `a68650b` — all verified reachable |
| Reconciliation method | Cherry-picked the four P0 commits onto the exact canonical SHA; no merge of the canonical branch and no semantic conflicts |
| Source-worktree untracked items preserved | `artifacts/`, prior executive report, `supabase/.branches/`, and `test-results/` |

Baseline tooling observed before isolation: Node `v22.16.0`, npm `10.9.2`, Supabase CLI `2.109.1`, Playwright `1.61.1`. The clean worktree shell resolved Node `v22.11.0` and npm `10.9.0`; `npm ci` completed but emitted package-engine warnings because two packages require Node `>=22.12.0`. Local build and test gates still completed. Hosted runtime version remains unverified.

## Forensic review and reconciliation decisions

| Original P0 commit | Domains | Decision | Evidence and outcome |
| --- | --- | --- | --- |
| `b91df39` — inventory and admin integrity | inventory reservation, RLS/capabilities, dashboards, notification RPCs, legal public projection | **Amended by follow-up** `0179a74` | The original row-lock design atomically decremented stock, recorded holds, released cancellation/expiry, handled a late paid callback, protected the cleanup RPC, and exposed exact finance aggregates only to capability-approved staff. A real 100-way reservation test then revealed a FK `KEY SHARE` → `FOR UPDATE` deadlock. The additive migration changes only the reservation/expiry lock mode to `FOR NO KEY UPDATE`, preserving serialization without incompatible lock upgrade. No existing migration was edited. |
| `725ef83` — checkout and legal journeys | legal projection, checkout authority, safe auth return, public CMS visibility | **Accepted unchanged** | Checkout reads only current, approved, published, lawyer-reviewed legal version rows and fails closed if any required contract is absent. The final payable total is derived server-side in minor units; UI withholds the final amount until shipping is selected. `safeNextPath` rejects external, protocol-relative, control-character, API, and auth paths while preserving valid internal checkout routes. CMS visibility parses only expected fields and falls back safely. |
| `8f27b4f` — consent, analytics, accessibility | versioned consent, event validation, mobile nav, WCAG | **Amended by follow-up** `8469577` | Client-side consent correctly defaults optional categories off and prevents optional scripts before local consent. Review found that the server originally trusted a browser-written consent session reference. The follow-up makes the consent endpoint issue an HttpOnly receipt only after appending server evidence; analytics looks up the latest evidence by that receipt and rejects unknown, withdrawn, malformed, or outdated consent. The mobile dialog is portalled, traps keyboard focus, closes on Escape, restores focus, and passed local axe acceptance. |
| `a68650b` — operation queue pagination | production, proofs, shipments | **Accepted unchanged** | The reviewed pages gate before queries, use exact filtered counts and bounded server ranges, retain deterministic ordering, and render safe empty/unavailable states. No client-side caps remain in those queues. |

### Follow-up changes

| Commit | Why it existed | Why the solution is safe | Proof |
| --- | --- | --- | --- |
| `8469577` — server consent receipts | The analytics API accepted a client-controlled consent cookie/session reference, so pseudonymous evidence could be fabricated. | Browser local storage still gates UI behavior. The server now generates the only identifier it trusts, stores the append-only decision, sets an HttpOnly same-site receipt, and reads the latest stored decision before inserting analytics. No legal text, marketing SDK, RLS policy, or production configuration changed. | `tests/consent-server-receipt.test.ts`, 284 unit tests, typecheck, lint, consent browser suite. |
| `0179a74` — reservation FK deadlock | A new real contention test proved concurrent inserts could deadlock while upgrading FK `KEY SHARE` locks to `FOR UPDATE`. | `FOR NO KEY UPDATE` still conflicts with concurrent stock writers and therefore serializes reservations, but is compatible with the pre-existing FK key-share lock. It is an additive, forward-only migration; financial/release/paid-state behavior is untouched. | Fresh local migration replay, original reservation integrity SQL, and 100 parallel reservation attempts: exactly 25 successful holds from 25 available units; no negative stock and no orphan order items. |

## Migration review

Migration order is monotonic and safe for an already-migrated environment:

1. `20260718101350_atomic_inventory_reservations.sql`
2. `20260718101837_first_party_consent_analytics.sql`
3. `20260718103954_authoritative_dashboard_revenue.sql`
4. `20260718104923_fix_notification_rpc_execution_boundary.sql`
5. `20260718105254_restore_legal_public_projection_access.sql`
6. `20260718110000_fix_inventory_reservation_fk_lock_deadlock.sql`

The final migration is additive and replaces only two database functions. No migration resets data, relaxes RLS, grants browser roles new writes, changes payment amounts, or deletes production data.

## Clean local validation evidence

All commands below ran in the isolated reconciliation worktree against localhost only where a database was involved.

| Gate | Result |
| --- | --- |
| Locked install | `npm ci --ignore-scripts`: passed; audit reported 0 vulnerabilities; Node engine warnings recorded above |
| Clean migration replay | `supabase db reset`: passed through all migrations including `20260718110000` |
| Unit suite | `npm test`: **28 files, 284 tests passed** |
| Static checks | `npm run typecheck`, `npm run lint`, and `git diff --check`: passed |
| Database security/finance suite | Phase 2 permissions/RLS, Phase 3 payment integrity, identity email, review moderation, inventory adjustment, original inventory-reservation integrity, and dashboard aggregate SQL: passed |
| Payment concurrency | `npm run test:phase3:burst`: **100 concurrent duplicate callbacks: PASS** |
| Reservation concurrency | `npm run test:inventory:reservation-burst`: **100 attempts / 25 available / 25 reserved / stock 0 / rejected item rows rolled back** |
| Browser: customer cart and checkout | Product, personalization, cart, checkout total, and legal confirmation: **1 expected, 0 unexpected** |
| Browser: auth lifecycle | Local confirmation and recovery lifecycle: Playwright `.last-run.json` reports `passed` |
| Browser: consent, accessibility, mobile navigation | **14 expected, 0 unexpected**; includes no pre-consent third-party analytics requests, malformed-consent fail-safe, visual checks, axe serious/critical checks on `/` and `/magaza`, portal placement, Escape, focus restoration, and mobile focus behavior |
| Production build | Fresh `.next` output isolated from prior dev/test artifacts; `npm run build` generated `BUILD_ID`, build, prerender, routes, and manifest artifacts |
| Dependency audit | `npm run security:audit`: **0 vulnerabilities** at high production threshold |

## Hosted staging identity gate

Expected project references supplied for this validation:

| Intended environment | Expected reference |
| --- | --- |
| Staging | `hdafztkhkyhqziqayerz` |
| Production | `rkvubnuwfuocoevayhcd` |

Result: **blocked before any hosted write**.

Evidence:

- `supabase projects list` returned `LegacyPlatformAuthRequiredError`: no Supabase access token is available.
- The isolated worktree has no `supabase/.temp/project-ref`; therefore no locally linked remote can be proven.
- The isolated worktree has no `.vercel/project.json`; a Preview deployment cannot be bound to a known project safely.
- No staging identity signal was obtained, so the required three independent signals were impossible to establish.

Consequences: no hosted migration history/schema diff/backup, no remote migration application, no preview deployment, no Preview→Staging fixture, no hosted browser acceptance, and no production comparison were attempted. This is intentional fail-closed behavior.

## Remaining blockers and retest plan

| Severity | Owner | Required fix | Required retest |
| --- | --- | --- | --- |
| P0 | Supabase staging project administrator / release owner | Provide access limited to staging project `hdafztkhkyhqziqayerz` and enough read-only project metadata to prove identity with three signals. Do not provide production credentials. | Record project ref, display name, region/organization, current migration history, and linked URL; explicitly prove it differs from `rkvubnuwfuocoevayhcd`. |
| P0 | Release owner / Vercel project administrator | Provide the approved preview-project binding and Preview→Staging environment mapping, with PayTR/Apple production credentials absent or disabled. | Deploy this exact reconciliation SHA only to Preview; record deployment URL/ID/SHA and prove its backend points to the verified staging project. |
| P1 operational | Runtime owner | Align clean validation Node runtime to `>=22.12.0` (the baseline shell had `22.16.0`; the clean worktree shell exposed `22.11.0`). | Repeat locked install, typecheck, unit tests, production build, and hosted Preview smoke on the selected runtime. |

After the P0 access blockers are resolved, perform the remaining hosted phases in order: read-only identity proof; staging-only migration history/schema parity and backup metadata; missing migration application only if proven needed; controlled fixture acceptance and cleanup; deployed Preview desktop/mobile journeys; final migration-history drift check and smoke test.

## Verdict

**NOT SAFE TO MERGE INTO CANONICAL**

Reason: local reconciliation and launch-critical validation are green, but the required staging identity proof and all hosted-staging/Preview acceptance are unperformed because no non-production access or project binding is available. This is an engineering-ready local branch, not evidence of hosted readiness and not authorization for public launch.

## Hosted staging continuation — 2026-07-18

This section supersedes the former statement that staging access was unavailable. It does not supersede the final verdict.

### Identity and production exclusion

The connected Supabase integration listed both named projects. The selected target was proven as Staging by five independent signals: ref `hdafztkhkyhqziqayerz`; display name `CHERIE DAY Staging`; API host `https://hdafztkhkyhqziqayerz.supabase.co`; database host `db.hdafztkhkyhqziqayerz.supabase.co`; and organization/region `wqtfqhzywcnktkakaqvz` / `eu-central-1`. Production was explicitly identified as the separate ref `rkvubnuwfuocoevayhcd`, named `CHERIE DAY`. No command or integration call used that production ref.

The Vercel integration identified team `brticoxs-projects` and project `cherie-day-web` (`prj_NCMWdLqi0GOV4S5iKTdMRAKSIVbB`) through read-only discovery only. No Vercel deployment was created.

### Hosted migration parity and application

Before application, Staging history ended at `20260718100000_kvkk_self_service`. The following six local reconciled migrations were absent; no extra remote P0 migration was present:

- `20260718101350_atomic_inventory_reservations`
- `20260718101837_first_party_consent_analytics`
- `20260718103954_authoritative_dashboard_revenue`
- `20260718104923_fix_notification_rpc_execution_boundary`
- `20260718105254_restore_legal_public_projection_access`
- `20260718110000_fix_inventory_reservation_fk_lock_deadlock`

All six were applied once, in order, to **Staging only**, with successful responses. Post-application history contains all six under hosted applied versions `20260718121025` through `20260718121145`. No reset, delete, production migration, or migration-file edit occurred.

Post-application read-only metadata verifies that `inventory_reservations` and `analytics_events` exist, both internal reservation functions are `SECURITY DEFINER` but not executable by `PUBLIC`, `anon`, or `authenticated`, cleanup is service-role-only, and the dashboard/notification RPCs reject anonymous execution. `legal_documents` and `legal_document_versions` have no anonymous grant; the deliberately filtered `legal_documents_public` projection alone is anonymous-readable. Its `security_invoker=false` setting is an intentional compatibility design because the base legal tables remain inaccessible to anonymous users; it remains an advisor warning to track, not a permission widening.

Types were regenerated from Staging for comparison only and not committed. Supabase advisor output includes pre-existing public-view `security_definer_view` and multiple-permissive-policy findings; this continuation did not remediate unrelated historic findings. The new P0 objects' grants/policies matched the reviewed migration contract.

### Remaining hosted blockers

The following required phases were not performed and therefore remain merge blockers: full temporary-fixture/RLS/RPC/inventory/payment acceptance, hosted concurrency execution, Preview deployment of the reviewed SHA, Preview-to-Staging fixture binding proof, Preview environment binding and Node-runtime verification, deployed desktop/mobile browser acceptance, and final hosted cleanup/schema-diff proof.

**NOT SAFE TO MERGE INTO CANONICAL**

Reason: Staging schema parity and migration application are complete, but no Preview deployment or hosted acceptance suite has yet proven the deployed runtime, environment isolation, or customer journeys. Production remains untouched.

## Final Hosted Preview & Staging acceptance gate — 2026-07-18

This gate was resumed from the exact requested reconciliation SHA
`c2f45d93148897f5aba0a169497a8228addf67fe` on
`integration/p0-reconciliation-20260718`. At the start and end of this gate,
the worktree was clean. No production ref, URL, credentials, deployment,
database, or payment endpoint was read or changed.

### Phase 0: release and tooling evidence

| Check | Evidence | Result |
| --- | --- | --- |
| Exact source | Branch `integration/p0-reconciliation-20260718`; `HEAD` is exactly `c2f45d93148897f5aba0a169497a8228addf67fe` | Pass |
| Staging migration state | The preceding staging-only continuation records all six reconciled migrations, including `20260718110000_fix_inventory_reservation_fk_lock_deadlock`, as applied once | Pass (historical hosted evidence) |
| Production exclusion | Only the distinct Staging ref `hdafztkhkyhqziqayerz` was used for prior hosted work; this gate made no production call | Pass |
| Tool versions | Node `v22.11.0`; npm `10.9.0`; Supabase CLI `2.109.1`; Vercel CLI `50.28.0`; Playwright `1.61.1` | Blocked for runtime requirement |
| Hosted project | Vercel project `cherie-day-web` (`prj_NCMWdLqi0GOV4S5iKTdMRAKSIVbB`) reports framework `nextjs`, runtime selector `22.x`, and no live target | Partial only |

The acceptance gate requires a Preview Node runtime at or above `22.12.0`.
The inspected shell resolves `22.11.0`, while the hosting project reports only
the non-specific selector `22.x`; neither establishes the exact deployed
runtime. The repository has no `.vercel/project.json` binding and no local
environment file beyond `.env.example`.

### Phase 1: Preview-environment isolation

The available authenticated hosting interface exposes project and deployment
metadata but not a Preview-only environment-variable listing. A local
`vercel env ls --scope brticoxs-projects` fails closed because this worktree
is not linked to a Vercel project. No attempt was made to link it, pull secrets,
create a deployment, or infer values from a different environment.

Therefore the following mandatory assertions are **unproven**, not assumed:

- Preview `NEXT_PUBLIC_SUPABASE_URL` and anon key target only Staging ref
  `hdafztkhkyhqziqayerz`.
- Preview server credentials (including service-role capability) belong only to
  the same Staging project.
- PayTR is disabled or configured strictly for test mode, and Apple sign-in is
  disabled for this acceptance run.
- Preview callback, return, webhook, and app URLs are non-production URLs.
- No Preview value contains the production ref `rkvubnuwfuocoevayhcd`, a
  production Supabase host, or live PayTR material.

The project record's `live: false` and `latestDeployment.target: null` are
consistent with a non-production deployment, but are not a substitute for
the required variable-level proof.

### Decision and remaining acceptance work

No Preview deployment was created, deliberately. The gate explicitly requires
environment proof before deploy, and the deploy interface does not expose a
safe target/environment contract that could prove a Preview-only deployment.
Consequently there is no deployment URL or ID, no Preview-to-Staging marker,
no hosted fixtures, no hosted browser run, no hosted cleanup, and no final
schema-drift comparison to claim.

Required release-owner evidence before resuming:

1. Read-only Preview environment inventory (names and safe classifications,
   never values) for `cherie-day-web`, proving the Staging-only backend and
   non-live payment/auth/callback configuration above.
2. A Preview-only deployment binding for this exact SHA, including its
   deployment ID/URL, branch, commit SHA, target, and exact Node runtime
   `>=22.12.0`.
3. Staging-only test credentials and an approved fixture/cleanup method for
   the full hosted acceptance matrix. Production must remain excluded.

Once those conditions are supplied, rerun the acceptance phases in order:
binding marker, legal/inventory/payment/RLS/RPC acceptance, customer browser
journeys and axe/resilience checks, fixture cleanup, final migration-history
comparison, and post-cleanup smoke.

## Final gate verdict

**NOT SAFE FOR NEXT PHASE / NOT SAFE TO MERGE**

Local reconciliation and the prior Staging-only migration application remain
valid evidence. They do not prove that a deployed Preview receives only
Staging credentials, has a compliant Node runtime, or preserves the
launch-critical journeys in the hosted runtime. Automatic merging is not
authorized by this gate; release approval must follow a complete evidence
record.
