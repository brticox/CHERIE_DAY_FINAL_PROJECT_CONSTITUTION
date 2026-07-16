import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it, vi } from 'vitest';

// next/cache is not available in the node test runtime; hoist stable spies so we
// can assert exactly how the catalog cache layer tags reads and invalidates.
const { revalidateTag, unstableCache } = vi.hoisted(() => ({
  revalidateTag: vi.fn(),
  unstableCache: vi.fn((fn: unknown) => fn),
}));
vi.mock('next/cache', () => ({
  revalidateTag,
  unstable_cache: unstableCache,
}));

import { CATALOG_TAG, cachedCatalogRead, revalidateCatalog } from '@/lib/data/catalog-cache';

afterEach(() => vi.clearAllMocks());

const repoFile = (rel: string) =>
  readFileSync(fileURLToPath(new URL(`../${rel}`, import.meta.url)), 'utf8');

describe('public catalog cache tag layer', () => {
  it('uses one stable, well-known catalog tag', () => {
    expect(CATALOG_TAG).toBe('catalog');
  });

  it('revalidateCatalog invalidates exactly the catalog tag, once', () => {
    revalidateCatalog();
    expect(revalidateTag).toHaveBeenCalledTimes(1);
    expect(revalidateTag).toHaveBeenCalledWith('catalog');
  });

  it('cachedCatalogRead tags the read with the catalog tag and namespaces the key', async () => {
    const impl = vi.fn(async (a: number, b: number) => a + b);
    const wrapped = cachedCatalogRead(['products'], impl);

    expect(unstableCache).toHaveBeenCalledTimes(1);
    const [passedFn, keyParts, opts] = unstableCache.mock.calls[0] as [
      unknown,
      string[],
      { tags: string[] },
    ];
    expect(passedFn).toBe(impl);
    expect(keyParts).toEqual(['catalog', 'products']);
    expect(opts).toEqual({ tags: ['catalog'] });

    // The wrapper preserves the reader's signature and result (args fold into the
    // cache key, so different arguments stay distinct entries under the same tag).
    await expect(wrapped(2, 3)).resolves.toBe(5);
    expect(impl).toHaveBeenCalledWith(2, 3);
  });
});

describe('every public catalog read is cache-tagged', () => {
  it('wraps departments, categories, collections, products and PDP detail', () => {
    const src = repoFile('lib/data/catalog.ts');
    for (const key of [
      "['departments']",
      "['categories']",
      "['collections']",
      "['products']",
      "['product-by-slug']",
    ]) {
      expect(src).toContain(`cachedCatalogRead(\n  ${key},`);
    }
  });
});

describe('every catalog mutation invalidates the public storefront (P1 regression guard)', () => {
  // If a new catalog-mutating action is added without revalidateCatalog(), the
  // storefront would silently serve stale content again — the exact P1 defect.
  const mutationActionFiles = [
    'app/admin/commerce/products/actions.ts',
    'app/admin/media/actions.ts',
    'app/admin/commerce/inventory/actions.ts',
  ];

  it.each(mutationActionFiles)('%s calls revalidateCatalog()', (rel) => {
    const src = repoFile(rel);
    expect(src).toContain("from '@/lib/data/catalog-cache'");
    expect(src).toContain('revalidateCatalog()');
  });

  it('products actions invalidate on every public-affecting mutation', () => {
    const src = repoFile('app/admin/commerce/products/actions.ts');
    // save, lifecycle(publish/archive/restore), seo, add-option, delete-option,
    // taxonomy, media, duplicate — at least 8 invalidation points.
    const calls = src.match(/revalidateCatalog\(\)/g) ?? [];
    expect(calls.length).toBeGreaterThanOrEqual(8);
  });
});
