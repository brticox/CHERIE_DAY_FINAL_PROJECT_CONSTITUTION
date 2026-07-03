# Critical Gaps

Only blocking or high-risk gaps are listed here.

## 1. Asset Package Is Not Build-Ready

The repository contains reference images and source SVGs, but not the final hero implementation assets required by `03_HERO_CINEMATIC_SYSTEM.md`.

Missing build targets include:

- `hero/wedding-background-loop.webm`
- `hero/wedding-background-poster.jpg`
- `hero/layer-invitation-card.webp`
- `hero/layer-envelope.webp`
- `hero/layer-wax-seal.webp`
- `hero/layer-ribbon-burgundy.webp`
- `hero/layer-ribbon-champagne.webp`
- `hero/layer-qr-card.webp`
- `hero/layer-cherries.webp`
- `hero/layer-ring-box.webp`
- `hero/layer-lace.webp`
- `hero/layer-petals.webp`
- `hero/layer-light-particles.webp` or equivalent CSS/canvas implementation

Current images are references, not production transparent DOM layers.

## 2. Local Temporary Asset Paths Remain In Source Documents

**Status: RESOLVED in source docs.**

`03_HERO_CINEMATIC_SYSTEM.md` and `05_ASSET_MANIFEST.md` previously referenced files in:

- `/Users/albarayousef/Downloads/...`
- `/Users/albarayousef/Desktop/٣٢٢.png`
- `/var/folders/.../codex-clipboard-...png`

Those references have been replaced with repository-local paths under `assets/hero-source` and `assets/brand-source`.

## 3. Route Naming Conflict: `/journal` vs `/rehber`

**Status: RESOLVED in source docs.**

The canonical MVP editorial route is now `/rehber` and `/rehber/[article-slug]`. `/journal` is future-only as a possible English alias or redirect.

## 4. Missing Referenced Source Files

**Status: RESOLVED in source docs.**

References to `FILES_TO_UPDATE.md` and `PROJECT_AUDIT_REPORT.md` have been removed or replaced by `16_PRE_BUILD_FREEZE.md` and the audit handoff prompt.

## 5. Commerce Legal/Payment Decisions Are Deferred

The documents mention KVKK consent, PayTR, iyzico, Stripe, invoices, shipping, refunds, and return/cancellation policy pages, but no final launch decision exists.

Before Turkey-only commerce build, CHERIE DAY needs:

- provider account details: iyzico/PayTR merchant terms, AMEX availability, foreign-issued card enablement for Turkey-only orders, 3DS/installment rules,
- tax/invoice model,
- KVKK/privacy consent model,
- distance sales terms,
- returns/cancellation policy,
- shipping carrier/rules,
- proof approval legal wording,
- terms acceptance storage.

## 6. MVP Boundary Is Too Porous

**Status: PARTIALLY RESOLVED.**

`16_PRE_BUILD_FREEZE.md` now freezes MVP as public site + full Turkey-only commerce + CMS/CRM/admin operations. International commerce and live digital tools remain out of MVP scope.

The first build must be frozen as:

- public cinematic Maison site,
- CMS-driven public pages,
- Product House commerce,
- customer accounts,
- cart / `Seçimlerim`,
- Turkey-only checkout/payment,
- order tracking,
- proof approval,
- support flows,
- Hayalini Tasarla and quote flows,
- admin CMS + CRM + commerce operations.

## 7. RLS Is Directional, Not Implementation-Complete

`08_DATA_MODEL_AND_CMS_SCHEMA.md` defines good security intent but not concrete policies, migrations, storage policies, service-role boundaries, or public views in enough detail for implementation without interpretation.

This is high risk because the project explicitly includes private leads, internal suppliers, costs, assignments, and future client data.

## 8. Brand SVGs Need Final Selection And Cleanup

**Status: PARTIALLY RESOLVED.**

`17_BRAND_ASSET_MAP.md` now defines canonical roles:

- `logo.svg` = primary wordmark,
- `CDD.svg` = monogram,
- `stamp.svg` = stamp/seal,
- `logooo.svg` = non-canonical legacy/source candidate.

Remaining work: optimize SVGs, create favicon/social/email/invoice exports, verify aspect ratios, and preserve geometry.

## 9. Final Folder Is Polluted By An External Plugin Repository

**Status: RESOLVED in current folder state.**

The folder previously contained `ui-ux-pro-max-skill/`, a 20MB external UI/UX plugin/skill repository with approximately 519 files, including:

- its own `.git` directory,
- plugin manifests,
- CLI package files,
- workflows,
- generated datasets,
- demo projects,
- screenshots,
- skills and references unrelated to CHERIE DAY.

This directly contradicts `00_READ_ME_FIRST.md`, which says old agent/skill files were intentionally excluded. It also compromises the idea of this folder as a clean final project constitution.

This folder is no longer present in the current root. `16_PRE_BUILD_FREEZE.md` now explicitly excludes external skill/plugin/archive folders from the constitution.
