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
  // Busts the tagged Data Cache and every route that rendered a tagged read
  // (listings, homepage sections, search, sitemap, and successfully-rendered
  // PDPs).
  revalidateTag(CATALOG_TAG);
  // A full-route-cached `notFound()` (a product URL visited before it was
  // published, or after an unpublish/slug change) is NOT tag-associated, so the
  // tag alone leaves a stale 404. Clear the storefront's dynamic route patterns
  // by path — targeted to the catalog surfaces only, never a full-site purge.
  for (const route of PUBLIC_CATALOG_ROUTE_PATTERNS) {
    revalidatePath(route, 'page');
  }
}

/**
 * Dynamic storefront route patterns whose full-route cache (including cached
 * `notFound()` 404s) must be dropped on a catalog change. Kept in one place so
 * the set stays complete and auditable rather than scattered across actions.
 */
const PUBLIC_CATALOG_ROUTE_PATTERNS = [
  '/magaza/[department]',
  '/magaza/[department]/[product-slug]',
  '/magaza/koleksiyon/[collection-slug]',
  '/magaza/etkinlik/[event-slug]',
  '/koleksiyonlar/[slug]',
] as const;
