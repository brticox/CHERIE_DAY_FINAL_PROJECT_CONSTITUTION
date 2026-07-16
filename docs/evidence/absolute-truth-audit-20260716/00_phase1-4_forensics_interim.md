# CHERIE DAY — Absolute Truth Audit — Interim Forensics (Phases 1–4)

Status: IN PROGRESS. Read-only. No merges, deploys, migrations, or hosted mutations performed.
Scope of this document: Phase 1 (repository forensics), Phase 2 (canonical branch), and the parts of
Phase 3/4 (migration parity, Vercel deployment identity) reachable with local git + Supabase MCP + Vercel MCP
read access. Phases 5–20 are NOT covered here — see "What remains" at the end.

## 1. Repository state — VERIFIED

```
Current branch : integration/reconciled-canonical-20260716
HEAD            : 3d1e72e31872fb76064079d2a7003412dc45dfa3
origin/main     : ab33c3ccc5912b5d191339b8828c0cdd7f059065  (main is NOT canonical — stale, pre-reconciliation)
origin tracking : origin/integration/reconciled-canonical-20260716 == HEAD (no ahead/behind drift)
Working tree    : clean except 3 known untracked runtime-junk dirs (artifacts/, supabase/.branches/, test-results/)
Stash           : 8 old entries, all on abandoned phase/02-* branches, none on the canonical line
```

This matches the memory of the 2026-07-16 reconciliation session exactly: no drift since that session closed.
**HEAD `3d1e72e` is confirmed still the tip of the canonical line, pushed, clean.**

## 2. Branch/worktree map — VERIFIED

6 live worktrees, one per major workstream:

| Worktree path | Branch | HEAD |
|---|---|---|
| `CHERIE_DAY_FINAL_PROJECT_CONSTITUTION` (this one) | `integration/reconciled-canonical-20260716` | `3d1e72e` |
| `CHERIE_DAY_ADMIN_VISUAL_REVOLUTION_20260714` | `phase/02-admin-visual-revolution-20260714` | `4704c59` |
| `CHERIE_DAY_IDENTITY_EMAIL_SERVICES_20260714` | `integration/phase-3-5-hosted-completion-20260715` | `d4aa812` |
| `CHERIE_DAY_INTEGRATION_PHASES_01_03_20260714` | `integration/phases-01-03-20260714` | `9fc0a18` |
| `CHERIE_DAY_PHASE3_PAYMENT_SECURITY_20260714` | `phase/03-payment-security-20260714` | `0d0fcf9` |
| `CHERIE_DAY_PLATFORM_INTEGRITY_20260715` | `integration/platform-integrity-admin-orchestration-20260715` | `96268d7` |

Plus 22 additional local branches (11 `backup/*` snapshots, `codex/identity-email-staging-closure-20260716`,
`integration/hosted-launch-merged-20260715`, several superseded `integration/*` and `phase/*` lines, and 2
`rescue/*` points). None of these are ahead of the canonical branch in a way that matters — the 2026-07-16
reconciliation session already walked this graph and pulled the two live workstreams (identity/email line +
uncommitted admin/notification/PayTR delta) into `integration/reconciled-canonical-20260716`. Not re-litigated
here; see [[reconciliation-canonical-branch-20260716]] memory for the full commit-level accounting.

**`main` (`ab33c3c`) is stale** — it predates the reconciliation and lacks all Phase 2 admin ops, Phase 3
financial integrity, identity/email services, and the 4 commits closing out review moderation / inventory /
notification coverage / PayTR-only decision. Do not treat `main` as source of truth for anything.

## 3. Canonical branch recommendation — VERIFIED (reaffirmed, unchanged)

**Canonical: `integration/reconciled-canonical-20260716` @ `3d1e72e`.**

- Broadest verified feature set (identity/email closure + admin/notification/inventory/review/PayTR delta).
- No uncommitted work outstanding on it (working tree clean).
- Pushed to origin, no local/remote divergence.
- No new reconciliation branch is required — this session's forensics found no additional commits on other
  branches that postdate the reconciliation and aren't already included.

**Not yet true of this branch: it has never been deployed.** See §5.

## 4. Migration parity — PARTIAL, with one confirmed gap and one confirmed CRITICAL gap

Local migrations on canonical HEAD: **45 files**, latest = `20260716090155_complete_transactional_notification_coverage.sql`.

### Staging (`hdafztkhkyhqziqayerz`) — PARTIAL

Hosted staging has **40 applied migrations**, latest = `harden_transactional_email_operations`
(local equivalent: `20260716061410_harden_transactional_email_operations.sql`).

**Staging is missing the last 4 local migrations** — same gap memory already flagged, reconfirmed fresh today:
- `20260716070646_review_moderation_operations.sql`
- `20260716081338_inventory_adjustment_operations.sql`
- `20260716082134_admin_workspace_query_indexes.sql`
- `20260716090155_complete_transactional_notification_coverage.sql`

Cosmetic note: hosted migration `version` timestamps (e.g. `20260715055612`) don't match the local
unprefixed filenames (`0001_init_extensions_enums.sql` etc.) — the Supabase CLI assigned synthetic sequential
timestamps ~2–4s apart when these were originally applied. Not a functional risk, but it means "diff by
filename" and "diff by version" give different-looking output; verified by content/name matching instead.

### Production (`rkvubnuwfuocoevayhcd`) — CRITICAL GAP, confirmed fresh (not just from memory)

Hosted production has only **26 applied migrations**, latest = `fix_payment_idempotency_lookup`
(local equivalent: `20260712144339_fix_payment_idempotency_lookup.sql`).

**Production is missing 19 migrations** — everything from `20260714082126_phase2_admin_operations.sql`
onward: all of Phase 2 admin operations, Phase 3 financial integrity, identity/email services foundation,
Phase 3.5 hardening, and all 4 of the final workstream-B commits (review moderation, inventory, indexes,
notification coverage).

**Important distinction for this report:** the Supabase dashboard will show this project as `ACTIVE_HEALTHY`
(it woke from inactivity between 2026-07-15 and today). That is a *compute* status, not a *schema* status.
Do not let "ACTIVE_HEALTHY" be read as "production is ready" — the schema is 19 migrations and roughly 5 days
of work behind canonical. **Production must not be targeted for launch without a full migration replay.**

Not yet done in this pass: row-level diff of RLS policies / triggers / functions between local canonical and
each hosted project (Phase 3's deeper checklist — duplicate policy names, trigger recursion, etc.). That
requires `get_advisors` + schema introspection per project, not yet run.

## 5. Hosted deployment identity (Vercel) — VERIFIED, and this is a launch-relevant surprise

Vercel project `cherie-day-web` (`prj_NCMWdLqi0GOV4S5iKTdMRAKSIVbB`, team `team_t9hkoLttwqGnT6OrdiqgcZxv`):

- **`domains: []`** — the Vercel project currently has **no domain attached at all.** Not `staging.cherieday.eu`,
  not `cherieday.eu`. `"live": false` at the project level.
- Latest deployment (`dpl_2WPFiLnN8SveygRaecxEeTnPEVj2`, READY) is commit `1a638e9` — **`fix(auth): stabilize
  password recovery across deploys`**, on branch `codex/identity-email-staging-closure-20260716`. This is
  Workstream A's HEAD, i.e. the branch the reconciliation session used as its *base* before layering
  Workstream B's 11 commits on top.
- **No deployment exists anywhere in the last 20 for `integration/reconciled-canonical-20260716` (`3d1e72e`).**
  The canonical branch determined in §3 has never been built or deployed by Vercel. It exists only in git.
- All 20 most recent deployments have `"target": null` (Preview-type; none are marked Production).
- History confirms the PR trail from memory: PR #2 (`phase-3-5-hosted-completion`), PR #3
  (`hosted-launch-merged`, includes the `4913608` "rebuild merged staging with Google auth enabled" deploy),
  and now PR #4 (`codex/identity-email-staging-closure-20260716`) — the most recently deployed line, but it is
  Workstream A alone, not the reconciled canonical branch.

**Implication:** whatever `staging.cherieday.eu` currently resolves to (if anything) is NOT proven by this
data to be any specific one of these deployments — the domain isn't attached at the Vercel project level at
all right now, so DNS may be pointed elsewhere, unset, or stale. This needs direct resolution (Phase 4/8
browser check) rather than inference from the Vercel API, and is flagged here as **NOT VERIFIED** rather than
assumed from the prior session's activation notes, which described `staging.cherieday.eu` as still serving an
older `392950d` build under a *different* prior domain-attachment state that may since have changed.

## 6. Decision-table entries this pass can already answer

| Question | Answer | Evidence |
|---|---|---|
| Is the repository safely reconciled? | **YES** | §1–3; clean tree, single canonical HEAD, no divergence |
| Is there one canonical launch line? | **YES** | `integration/reconciled-canonical-20260716` @ `3d1e72e` |
| Do all local migrations replay? | CONDITIONAL — reported clean in the 2026-07-16 reconciliation session on this exact HEAD; not re-run this pass (no code/migration drift since, so not re-verified fresh — recommend re-running `supabase db reset` before treating as current evidence if more than a few days pass) | [[reconciliation-canonical-branch-20260716]] |
| Does Hosted Staging match the canonical schema? | **NO** | §4 — 4 migrations behind |
| Can Production launch happen now? | **NO** | §4 — 19 migrations behind, and §5 — canonical branch never deployed, no domain attached at the Vercel project |

## 7. What remains (Phases 3 cont'd, 5–20)

Not attempted in this pass, in rough order of what's cheap vs. expensive to close next:

- **Cheap, local, next:** Phase 5 build/test baseline (typecheck/lint/test — memory says these passed on this
  exact HEAD; a fresh re-run is cheap confirmation, not yet re-executed this pass since HEAD is unchanged).
  Phase 3 continued: RLS/trigger/function diff per hosted project via `get_advisors`.
- **Medium, needs live browser:** Phase 6–11 (public site route inventory, product/media readiness, cart/
  checkout, auth, customer portal) — requires the Browser pane against whatever `staging.cherieday.eu` (or a
  fresh Vercel preview of the canonical branch, since none exists yet) actually serves.
- **Needs owner/credentials I don't have in this session:** Phase 4 continued (Cloudflare DNS — no Cloudflare
  MCP tool connected in this session; Google Workspace mailbox security state; Resend domain/webhook detail
  beyond what the Resend-like MCP exposes — not yet queried), Phase 12–13 (transactional email chain,
  Workspace mailboxes), Phase 9 Safari-specific testing (this environment's browser tools are Chromium-based).
- **Large, many tool calls:** Phases 14–20 (security, performance, accessibility, SEO, visual/luxury review
  across 8 breakpoints, operational rehearsal, readiness scoring) — genuinely require dozens more tool calls
  each and, for the visual/luxury phase, a live deployed target to look at (which per §5 doesn't yet exist for
  the canonical branch).

This document will be extended in place as later phases complete, rather than restarted.
