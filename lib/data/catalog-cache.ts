import { revalidateTag, unstable_cache } from 'next/cache';

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
  revalidateTag(CATALOG_TAG);
}
