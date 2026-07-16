# P1 Fix — Admin catalog edits now revalidate the public storefront

**Date:** 2026-07-16 · Branch `integration/reconciled-canonical-20260716`
Closes the P1 from `03_api_verification_and_cache_finding.md`. No secrets here.

## Root cause (recap)
Storefront PDP + homepage are ISR/full-route cached; admin product actions
revalidated only `/admin/**`. So published/edited/unpublished products did not
reach the public PDP/homepage without a redeploy. A second, deeper cause:
a slug requested before its product exists caches a `notFound()` as a
prerendered 404 that the broad cache tag cannot evict.

## Design (centralized, typed — no scattered revalidatePath)
`lib/data/catalog-cache.ts`:
- **`CATALOG_TAG`** + **`cachedCatalogRead()`** — every public catalog read
  (departments, categories, collections, products, PDP commerce detail) is
  wrapped with `unstable_cache` under one tag. Search, sitemap and homepage
  sections inherit it. Thrown `PublicDataSourceError`s propagate, never cached.
- **`revalidateCatalog()`** — `revalidateTag(CATALOG_TAG)`: busts the Data Cache
  and every tag-associated route (static listings, homepage, search, sitemap,
  and any PDP previously served as 200).
- **`revalidateStorefrontPaths()` / `revalidateProductPaths(dept, slugs)`** —
  exact-path `revalidatePath` for a product's PDP, the only mechanism that
  evicts an on-demand-cached `notFound()` (new or renamed product; both new and
  previous slug).

Wired into **every** catalog mutation (`revalidateCatalog()` + exact PDP path
where a specific product is known): product save / publish / archive / restore /
duplicate / SEO / variant / addon / personalization / price-tier add+delete /
taxonomy / media set, media metadata / archive, and inventory adjustment.

`POST /api/internal/catalog/revalidate` (bearer, `CATALOG_WORKER_SECRET`) also
accepts `{ paths: string[] }` so an operator or a future Supabase catalog
webhook can evict exact routes out-of-band.

## Verification
**Gates (local):** typecheck ✓ · lint 0 ✓ · **233 unit tests** ✓ (new
`tests/catalog-cache.test.ts`: tag contract, exact-path helpers, and a mutation
coverage guard) · build ✓ · **Playwright commerce E2E ✓** (real product image →
pricing → customization → cart 201 → checkout 200 — no regression).

**Live on `staging.cherieday.eu` (temporary fixture, created + deleted):**
| Behaviour | Result |
|---|---|
| No regression (home/listing/PDP/login) | 200 ✓ |
| Internal revalidate route auth | 401 (no/bad bearer) / 200 ✓ |
| `revalidateTag` busts Data Cache (fixture appears in dynamic dept listing) | ✓ |
| New product PDP on fresh build (cold cache) | 200 ✓ |
| Unpublish → revalidate → PDP | 404, removed from listing ✓ |
| Re-publish previously-served path → stale 404 → revalidate → PDP | 200 (title/variant/addon/personalization rendered) ✓ |
| Slug change → old path revalidated | old → 404 ✓ |
| Fixture deleted → revalidate → PDP | 404 ✓ (storefront healthy) |

**Unit-tested + Next-documented, live demo pending a deploy:** exact-path
eviction of a slug that was **only ever a 404** (never served 200) — the
`revalidateProductPaths` path the admin create/publish/rename actions call. The
mechanism is Next.js's documented exact-path `revalidatePath`; the admin actions
are unit-verified to call it with the correct `/magaza/[dept]/[slug]` paths.

## Deploy status (honest)
Commits `e0a5645` (fix), `4089eeb` (revalidate endpoint), `2dabad3` (404
patterns), `a7b0b90` (exact-path + admin wiring), `5a03ea2` (.vercelignore) are
pushed. **`staging.cherieday.eu` currently serves `2dabad3`** (tag + pattern
version — the broad fix is live). The final exact-path build (`a7b0b90`/`5a03ea2`)
did **not** deploy: the Vercel plan's **daily deployment limit** was reached
today (git-integration builds stopped being created; CLI `vercel deploy` times
out / hit the 100 MB upload cap before `.vercelignore` was fixed). This is an
infrastructure limit, not a code issue — a single deploy once the limit resets
(or by the owner) promotes the exact-path build. Production untouched; PR #5 not
merged.
