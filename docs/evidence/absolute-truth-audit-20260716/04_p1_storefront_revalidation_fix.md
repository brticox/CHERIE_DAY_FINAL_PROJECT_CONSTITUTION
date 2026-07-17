# P1 CLOSED — Admin catalog changes now reach the public storefront

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
- **Perf:** `getProductBySlug` wrapped in React `cache()` (request-scoped dedupe — `generateMetadata` + page shared one resolution); **functions pinned to `fra1`**, co-located with Supabase `eu-central-1`.

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
| + React `cache()` dedupe (~22 → ~11 queries) | 1.417 s |
| + **`fra1` co-location** (final) | **0.588 s** |
| Reference: `/magaza` static/CDN page | 0.577 s |
| Reference: `/magaza/[department]` dynamic listing | 0.296 s |

- **Queries/PDP request:** ~11 (5 product/category/department/collection/media + 6 commerce detail). Was ~22 — `generateMetadata` and the page each resolved independently; React `cache()` now shares one resolution per request.
- **Root cost was network, not queries:** functions ran `iad1` while Supabase is `eu-central-1` (`x-vercel-id: fra1::iad1::…`). Now `fra1::fra1::…`.
- **Cache-Control:** `private, no-cache, no-store` → **no CDN caching** of PDPs; every view hits the origin. Acceptable now that warm TTFB (0.588 s) matches the CDN-cached homepage (0.577 s).
- **Scale risk:** ~11 uncached queries per PDP view. Fine at launch volume; if PDP traffic grows, revisit ISR or collapse the resolution into one RPC. **No serious regression at current scale.**

## Email chain — proven up to the Resend boundary
`business event → outbox → cron → worker` is **VERIFIED live**: inserting a consultation fired the DB trigger → outbox row (`appointment_requested`, `template_key: appointment-requested`, `status: queued`, idempotency key) → worker `claimed:1, sent:1` → **repeat `claimed:0, sent:0` (no double-send)**. pg_cron dispatch is live (6× HTTP 200 in 30 min) using the Vault bearer.

**BLOCKED — real Resend delivery + `delivered` webhook:** the outbox row recorded `provider: "capture"` (no-op transport) because the canonical branch has **no `RESEND_API_KEY`** (Vercel write-only var, scoped only to `codex/…` and `phase-3-5/…`) and `NOTIFICATION_SEND_ENABLED=false`. Owner action: add `RESEND_API_KEY` to `integration/reconciled-canonical-20260716` and set `NOTIFICATION_SEND_ENABLED=true`, then the same chain completes through Resend → signed webhook → `email_delivery_events`.

## Verdict
**P1 CLOSED** — live-proven end to end, with the performance regression measured and resolved (0.588 s ≈ the static page). **P3 CLOSED** (collection display name in PDP title).
