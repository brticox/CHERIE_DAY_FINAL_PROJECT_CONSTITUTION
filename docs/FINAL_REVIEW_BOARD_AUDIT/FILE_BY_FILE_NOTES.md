# File By File Notes

| File | Purpose | Quality | Conflicts / Risks | Required Action |
|---|---|---:|---|---|
| `00_READ_ME_FIRST.md` | Source-of-truth entry and governing rules. | High | Reading order now includes freeze, asset, and commerce scope files. | Keep current as governing entry. |
| `docs/01_CHERIE_DAY_MASTER_BUILD_BRIEF.md` | Core identity, IA, stack, acceptance criteria. | High | Now reflects `/rehber` and Turkey-only commerce. | Keep aligned with later commerce/legal decisions. |
| `docs/02_CHERIE_DAY_REVOLUTION_BLUEPRINT.md` | Cross-system strategic upgrade. | High | Strong but abstract; implementation agent may overbuild. | Mark internal strategic language vs public copy. |
| `docs/03_HERO_CINEMATIC_SYSTEM.md` | Governing hero spec. | High | Requires assets not present. | Produce final layer kit. |
| `docs/04_IMPLEMENTATION_ROADMAP.md` | Build phases. | Medium-High | Now includes Turkey-only commerce in MVP. | Keep phases disciplined and avoid event portal creep. |
| `docs/05_ASSET_MANIFEST.md` | Asset inventory and requirements. | Medium | Production targets missing. | Produce optimized assets. |
| `docs/06_DEVELOPER_PROMPT.md` | Implementation prompt. | High | Now includes Turkish-only UI and Turkey commerce. | Use together with final handoff prompt. |
| `docs/07_PLATFORM_ARCHITECTURE.md` | Public/admin architecture. | High | Turkey commerce is now core; live digital portal remains future. | Convert to implementation tickets/migrations. |
| `docs/08_DATA_MODEL_AND_CMS_SCHEMA.md` | Supabase/Postgres schema and RLS direction. | High | Policies are directional, not migration-ready. | Write concrete migrations, views, policies, storage rules. |
| `docs/09_COMMERCE_BIBLE.md` | Commerce roadmap and operating model. | High | Full Turkey commerce now defined; provider/legal decisions still open. | Lock iyzico/PayTR/legal/shipping/tax details. |
| `docs/10_DESIGN_LANGUAGE_BIBLE.md` | Visual language and UX rules. | High | Tokens are named but not exact values; fonts undecided. | Freeze color values, fonts, grids, states. |
| `docs/11_COMPONENT_BIBLE.md` | Reusable component plan. | Medium-High | Good component coverage; acceptance criteria are not implementation-specific enough. | Add component specs and responsive states. |
| `docs/12_CONTENT_STRATEGY.md` | Turkish voice, CTA logic, copy rules. | High | Strong voice; needs actual seed copy for MVP pages. | Create page-level copy deck. |
| `docs/13_SEO_BIBLE.md` | SEO, schema, sitemap strategy. | Medium-High | Rehber route is canonical; legal/canonical rules need final launch pass. | Finalize schema and sitemap implementation. |
| `docs/14_CONVERSION_ANALYSIS.md` | Funnel and lead capture strategy. | High | Good flow; needs CRM SLA and confirmation templates. | Define form outputs and follow-up copy. |
| `docs/15_INFORMATION_ARCHITECTURE.md` | Final IA and routes. | High | Includes account, cart, checkout, order tracking, and support routes. | Treat as canonical IA. |
| `assets/brand-source/logo.svg` | Primary wordmark source. | Medium | Large artboard SVG. | Optimize. |
| `assets/brand-source/logooo.svg` | Non-canonical legacy/source candidate. | Low | Name is unclear. | Keep as reference unless promoted. |
| `assets/brand-source/CDD.svg` | Monogram source. | Medium | Large artboard SVG. | Optimize. |
| `assets/brand-source/stamp.svg` | Stamp/wax seal source. | Medium | Large artboard SVG. | Optimize. |
| `assets/hero-source/wedding-garden-background-source.mp4` | Hero video source. | Medium | No poster/WebM/final compression target present. | Export final MP4/WebM/poster. |
| `assets/hero-source/garden-still-reference.png` | Garden still reference. | Medium | Reference only. | Use for poster/art direction if approved. |
| `assets/hero-source/still-life-wax-seal-cherry-ribbon.png` | Still-life reference. | Medium | RGB, no transparency; not a production layer. | Extract/export individual transparent objects if used. |
| `assets/hero-source/envelope-wax-seal-reference.png` | Envelope/seal reference. | Medium | Combined reference, not separated layers. | Export envelope and seal separately. |
| `assets/hero-source/invitation-card-reference.png` | Invitation reference. | Medium | Not final production layer. | Export transparent invitation layer. |
| `assets/hero-source/burgundy-ribbon-reference.png` | Burgundy ribbon reference. | Medium | Not final production layer. | Export transparent ribbon layer. |
| `assets/hero-source/champagne-ribbon-reference.png` | Champagne ribbon reference. | Medium | Not final production layer. | Export transparent ribbon layer. |
| `assets/hero-source/qr-card-reference.png` | QR card reference. | Medium | QR readability/finality unknown. | Export final QR card with non-private placeholder QR. |
| `assets/hero-source/ring-box-reference.png` | Ring box reference. | Medium | Not final production layer. | Export transparent ring box layer. |
| `assets/hero-source/seal.png` | Seal reference. | Medium | Naming unclear versus `stamp.svg`. | Decide whether raster seal is used or SVG stamp governs. |
| `/Users/albarayousef/Documents/ui-ux-pro-max-skill/` | External UI/UX skill reference outside constitution. | Reference only | Useful for UX discipline, token architecture, accessibility, and component state thinking; not CHERIE DAY source of truth. | Keep outside constitution; cite lessons only. |
