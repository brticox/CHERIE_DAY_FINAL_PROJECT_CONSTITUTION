# P1 — Admin catalog changes now reach the public storefront (core fix live-proven; 1 step outstanding)

**Date:** 2026-07-17 · Branch `integration/reconciled-canonical-20260716`
**Served:** `staging.cherieday.eu` → `5feb7a8` (Preview `dpl_GZSEtRXYMRFiSkujpmWAvp6TkGHc`, region **fra1**)
No secrets in this document. Production untouched · PR #5 not merged · Apple=false · Live PayTR=false.

## The three real root causes (found by live diagnosis, not assumption)

1. **Admin revalidated only `/admin/**`.** Product actions called `revalidatePath(productPath(id))` where `productPath = /admin/commerce/products/${id}` — the public `/magaza/**` was never invalidated.
2. **The PDP never rendered post-build products.** `generateStaticParams` + no `dynamicParams` made Vercel serve a **prerendered static 404** for any slug absent at build time (`x-nextjs-prerender: 1` on a cache MISS). The page component never ran, so *no data-layer fix could ever surface a new product*. Setting `dynamicParams = true` did **not** change it.
3. **The PDP derived its product from a cached list.** `getProductBySlug` scanned `getProducts({department})`, whose `unstable_cache` entry is keyed separately from the listing's `getProducts(filters)` — so it could serve a stale `null` even while the listing showed the product.

## The fix
- **`lib/data/catalog-cache.ts`** — one typed `CATALOG_TAG`; `cachedCatalogRead()` wraps every public catalog read (departments, categories, collections, products → search/sitemap/homepage inherit it); `revalidateCatalog()` = `revalidateTag`; `revalidateStorefrontPaths()` / `revalidateProductPaths(dept, slugs)` for exact-path eviction.
- **Every catalog mutation** calls `revalidateCatalog()` + the exact product path (save/publish/archive/restore/duplicate/SEO/variant/addon/personalization/tier/taxonomy/media, media metadata/archive, inventory). `saveProduct` passes the **previous slug** on rename so both URLs are evicted.
- **PDP is `force-dynamic`** (like the department listing, which works because it reads `searchParams`) and resolves via a **direct `products_public` query by slug** — never a cached list.
- **`POST /api/internal/catalog/revalidate`** (bearer, `CATALOG_WORKER_SECRET`, optional `{paths}`) for out-of-band eviction (e.g. a future Supabase catalog webhook).
- **Perf:** **functions pinned to `fra1`**, co-located with Supabase `eu-central-1` — this is the entire measured win. `getProductBySlug` is also wrapped in React `cache()`, but that is defence-in-depth with **no measured query or latency benefit** (see correction below).

## Live proof on staging.cherieday.eu (fresh fixture, created AFTER deploy)
| # | Step | Result |
|---|---|---|
| 1 | New published product, **never-requested slug**, first-ever GET — no redeploy, no revalidation | **200** ✓ |
| 2 | Title | `[TEST] Canlı Kanıt Ürünü — SİLİNECEK \| **Cherry Seal** \| CHERIE DAY Ürün Evi` ✓ |
| 3 | Collection **display name** (P3 fix — was the raw slug `cherry-seal`) | **Cherry Seal** ✓ |
| 4 | Variant / add-on / personalization | all rendered ✓ |
| 5 | Price tier | `{"min_qty":12,"unit_price":1090}` in payload → applied by `product-options.tsx` ✓ |
| 6 | Media | rendered via next/image against the Supabase host (confirms the P0 `remotePatterns` fix at runtime) ✓ |
| 7 | **Slug change** → new slug | **200** instantly ✓ |
| 8 | Slug change → old slug | **404** ✓ |
| 9 | **Unpublish** | PDP **404** + removed from listing ✓ |
| 10 | **Republish** | **200**, no stale 404 ✓ |
| 11 | **Delete** + `revalidateCatalog` | PDP 404; listing + homepage cleared ✓ |
| 12 | Cleanup | **0 TEST rows · 48 published products · 0 media · 0 variants** ✓ |

## Performance assessment (the regression was found AND fixed)
| Stage | Warm avg TTFB |
|---|---|
| force-dynamic, `iad1` functions, duplicate resolution | **1.548 s** |
| + React `cache()` dedupe (**no query change — see correction below**) | 1.417 s |
| + **`fra1` co-location** (final) | **0.588 s** |
| Reference: `/magaza` static/CDN page | 0.577 s |
| Reference: `/magaza/[department]` dynamic listing | 0.296 s |

- **Queries/PDP request:** **11**, both with and without React `cache()` (5 product/category/department/collection/media + 6 commerce detail).
  - **CORRECTION (measured 2026-07-17, supersedes the earlier "was ~22" claim):** the "~22 → ~11" reduction **never happened and was never measured**. Measured via `pg_stat_statements` call deltas around single warm requests against two live deployments hitting the same staging DB: **`edb2596` (no `cache()`) = 11 queries · `1ac801b` (with `cache()`) = 11 queries — identical.** Next.js already dedupes the identical PostgREST fetch GETs issued by `generateMetadata` and the page component within one render pass, so `cache()` is defence-in-depth, not a perf win. This is consistent with `5feb7a8`'s own finding that `cache()` moved TTFB only 1.548 s → 1.417 s while `fra1` moved it to 0.588 s — **the entire win is co-location, none of it is query count.**
- **Root cost was network, not queries:** functions ran `iad1` while Supabase is `eu-central-1` (`x-vercel-id: fra1::iad1::…`). Now `fra1::fra1::…`.
- **Cache-Control:** `private, no-cache, no-store` → **no CDN caching** of PDPs; every view hits the origin. Acceptable now that warm TTFB (0.588 s) matches the CDN-cached homepage (0.577 s).
- **Scale risk:** ~11 uncached queries per PDP view. Fine at launch volume; if PDP traffic grows, revisit ISR or collapse the resolution into one RPC. **No serious regression at current scale.**

## Email chain — proven up to the Resend boundary
`business event → outbox → cron → worker` is **VERIFIED live**: inserting a consultation fired the DB trigger → outbox row (`appointment_requested`, `template_key: appointment-requested`, `status: queued`, idempotency key) → worker `claimed:1, sent:1` → **repeat `claimed:0, sent:0` (no double-send)**. pg_cron dispatch is live (6× HTTP 200 in 30 min) using the Vault bearer.

**BLOCKED — real Resend delivery + `delivered` webhook:** the outbox row recorded `provider: "capture"` (no-op transport) because the canonical branch has **no `RESEND_API_KEY`** (Vercel write-only var, scoped only to `codex/…` and `phase-3-5/…`) and `NOTIFICATION_SEND_ENABLED=false`. Owner action: add `RESEND_API_KEY` to `integration/reconciled-canonical-20260716` and set `NOTIFICATION_SEND_ENABLED=true`, then the same chain completes through Resend → signed webhook → `email_delivery_events`.

## Independent re-verification (second session, 2026-07-17 13:20–13:45)

A second session re-ran the live test **independently** against `staging.cherieday.eu`, with
its own fixture (`ZZ TEST P1 Revalidation Fixture`, dept `davetiye`, collection Maison Rouge).

**Served-SHA proof:** the alias record resolved `staging.cherieday.eu` → the deployment under
test, and that deployment's `/_next/static` chunk hashes matched the local build byte-for-byte
(`1255-1f8779ad37ed4cce.js`), so the served build is provably the commit under test — first
`1ac801b`, now `5feb7a8` (`fra1::fra1` confirmed live).

Independently reproduced ✓:
| Step | Result |
|---|---|
| Warm 404 on a never-seen slug **before** the product existed | 404, `x-vercel-cache: MISS`, `no-store` — proves the PDP is genuinely dynamic, **not** a prerendered static 404 |
| Insert published product by direct SQL → first GET | **200 with no revalidation and no redeploy** — the warmed 404 did **not** stick |
| Title | `… \| **Maison Rouge** \| CHERIE DAY Ürün Evi` — collection **name**, not slug ✓ |
| Variant / add-on / personalization / price tier | all present in payload ✓ |
| Slug change | old URL **404**, new URL **200**, instantly ✓ |
| Unpublish | PDP **404**, stable across repeats ✓ |
| Sitemap | 200, 123 URLs (73 product). Uses `getProducts()`, **never** `getProductBySlug` → **no sitemap regression** ✓ |
| Metadata | renders correctly on real PDPs → **no metadata regression** ✓ |
| Query explosion / duplicate requests | **none** — 11 queries/request, unchanged by removing the nested `unstable_cache` ✓ |

**Not verified by this session (2 gaps):**
1. **Tag + exact-path revalidation was never triggered here** — `CATALOG_WORKER_SECRET` is a
   Vercel *sensitive* variable and is unreadable to the session. Consequently the
   **"listing sees the new product" step failed** in this run: the SQL-inserted product never
   appeared in `/magaza/davetiye`. This is **expected, not a bug** — the listing route is
   dynamic but reads the tag-cached `getProducts()`, and a direct SQL insert bypasses the
   `revalidateCatalog()` that a real admin mutation calls in-process. It remains **unproven
   live from this session** that the trigger clears the listing.
2. **Delete + final revalidation + "zero TEST rows" were not performed by this session.**

**Test-integrity caveat:** a **concurrent agent** was operating on the same working directory,
branch and staging DB during this run. Its cleanup deleted **both** its own fixture **and this
session's** (a `name ilike '%TEST%'` sweep) mid-test, and it committed `5feb7a8`/`19e232c` on
top of the in-flight work. The step-12 end state (**0 TEST rows · 48 products · 0 variants ·
0 media**) is therefore **that agent's cleanup**, and the two sessions' fixtures are confounded
in it. The independently reproduced rows above were all captured **before** the deletion.

## Verdict
**P1: the core defect is live-proven fixed** — a post-build product's PDP resolves 200 with no
redeploy and no revalidation; slug change and unpublish take effect immediately; no query,
metadata or sitemap regression from the direct-query refactor (all independently reproduced
above). **P3 CLOSED** (collection display name in PDP title).

**Remaining before an unqualified P1 CLOSED:** trigger `POST /api/internal/catalog/revalidate`
(tag + exact `paths`) with the owner-held `CATALOG_WORKER_SECRET` and observe the department
listing pick up a new product and drop a deleted one — the one step no session has reproduced
without the concurrent-agent confound.
