import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';

/**
 * Single source of truth for public-storefront catalog caching.
 *
 * Every public catalog read (products, PDP commerce detail, departments,
 * categories, collections — and therefore search, the sitemap and homepage
 * product sections that build on them) is wrapped with {@link cachedCatalogRead}
 * so its result, and any statically rendered route that consumed it, is tagged
 * with {@link CATALOG_TAG}.
 *
 * Any admin mutation that changes catalog data calls {@link revalidateCatalog}
 * exactly once. That invalidates every tagged surface together, so a newly
 * published product, a price/title/media edit, a slug change, or an unpublish
 * takes effect on the public storefront immediately — no redeploy, and no
 * scattered per-path revalidation to keep in sync.
 */
export const CATALOG_TAG = 'catalog';

/**
 * Wrap a public catalog reader so its output is cached and tagged for on-demand
 * invalidation. `keyParts` disambiguates readers that share the tag; the
 * reader's own arguments are folded into the cache key automatically.
 *
 * The wrapped reader must not read request state (cookies/headers) — the public
 * catalog client is an anonymous, session-less Supabase client, which satisfies
 * this. Thrown `PublicDataSourceError`s are propagated, never cached, so a real
 * runtime outage still fails loudly instead of being frozen.
 */
export function cachedCatalogRead<A extends unknown[], R>(
  keyParts: readonly string[],
  fn: (...args: A) => Promise<R>,
): (...args: A) => Promise<R> {
  return unstable_cache(fn, ['catalog', ...keyParts], { tags: [CATALOG_TAG] });
}

/**
 * Invalidate every public catalog surface (listings, PDP, homepage sections,
 * collections, search, sitemap). Call once after any successful catalog
 * mutation from a Server Action or Route Handler.
 */
export function revalidateCatalog(): void {
  // Busts the tagged Data Cache and every route that rendered a tagged read:
  // the static homepage/listings, search results, the sitemap, and any PDP that
  // was previously served as 200 (all tag-associated). The dynamic department
  // listings render per-request and are always fresh.
  revalidateTag(CATALOG_TAG);
}

/**
 * Clear specific storefront routes by exact path. Required to evict an
 * on-demand-cached `notFound()` (a product URL requested before it was
 * published, or a slug's previous path after a rename) — a broad tag cannot
 * reach those entries, but an exact-path revalidation can.
 */
export function revalidateStorefrontPaths(paths: readonly string[]): void {
  for (const path of paths) revalidatePath(path);
}

/**
 * Build and clear the public PDP path(s) for a product. Pass every slug the
 * product has had this mutation (new + previous on a rename) so both the live
 * and the now-stale URL are evicted.
 */
export function revalidateProductPaths(
  departmentSlug: string,
  productSlugs: readonly string[],
): void {
  if (!departmentSlug) return;
  revalidateStorefrontPaths(
    productSlugs
      .filter(Boolean)
      .map((slug) => `/magaza/${departmentSlug}/${slug}`),
  );
}
