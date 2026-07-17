import {
  departments as seedDepartments,
  collections as seedCollections,
  products as seedProducts,
} from '@/content/seed/catalog';
import { getPublicClient } from '@/lib/supabase/public';
import { cachedCatalogRead } from './catalog-cache';
import { failPublicData, localSeedFallback, readPublic } from './source';
import type {
  Category,
  Collection,
  Department,
  Product,
  ProductAddon,
  ProductAttribute,
  ProductPersonalizationField,
  ProductMedia,
  ProductPriceTier,
  ProductVariant,
} from './types';

export type ProductSort = 'featured' | 'price-asc' | 'price-desc' | 'production';
export type ProductQuery = {
  department?: string;
  collection?: string;
  category?: string;
  search?: string;
  stock?: Product['stock_mode'];
  behavior?: Product['behavior_type'];
  sort?: ProductSort;
  limit?: number;
};

// ---- Departments -----------------------------------------------------------
export const getDepartments = cachedCatalogRead(
  ['departments'],
  async function getDepartments(): Promise<Department[]> {
    return readPublic<Department>('departments_public', seedDepartments, {
      order: 'sort_order',
    });
  },
);

export async function getDepartmentBySlug(slug: string): Promise<Department | null> {
  const all = await getDepartments();
  return all.find((d) => d.slug === slug) ?? null;
}

export const getCategories = cachedCatalogRead(
  ['categories'],
  async function getCategories(departmentSlug?: string): Promise<Category[]> {
  const supabase = getPublicClient();
  if (!supabase) return localSeedFallback('categories_public', []);
  const [categoryResult, departmentResult] = await Promise.all([
    supabase.from('categories_public').select('*').order('sort_order'),
    supabase.from('departments_public').select('id, slug'),
  ]).catch((error) => failPublicData('categories_public', 'query_failed', error));
  const failed = [categoryResult, departmentResult].find((result) => result.error);
  if (failed?.error) failPublicData('categories_public', 'query_failed', failed.error);
  const categories = categoryResult.data;
  const departments = departmentResult.data;
  const departmentById = new Map(
    ((departments ?? []) as unknown as { id: string; slug: string }[]).map((row) => [
      row.id,
      row.slug,
    ]),
  );
  return ((categories ?? []) as unknown as Category[])
    .map((category) => ({
      ...category,
      department_slug: category.department_id
        ? (departmentById.get(category.department_id) ?? null)
        : null,
    }))
    .filter((category) => !departmentSlug || category.department_slug === departmentSlug);
  },
);

// ---- Collections -----------------------------------------------------------
export const getCollections = cachedCatalogRead(
  ['collections'],
  async function getCollections(): Promise<Collection[]> {
    return readPublic<Collection>('collections_public', seedCollections, {
      order: 'sort_order',
    });
  },
);

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  const all = await getCollections();
  return all.find((c) => c.slug === slug) ?? null;
}

// ---- Products --------------------------------------------------------------
function filterSeed(list: Product[], q?: ProductQuery): Product[] {
  let out = list;
  if (q?.department) out = out.filter((p) => p.department_slug === q.department);
  if (q?.collection) out = out.filter((p) => p.collection_slug === q.collection);
  if (q?.category) out = out.filter((p) => p.category_slug === q.category);
  if (q?.stock) out = out.filter((p) => p.stock_mode === q.stock);
  if (q?.behavior) out = out.filter((p) => p.behavior_type === q.behavior);
  if (q?.search) {
    const needle = q.search.toLocaleLowerCase('tr');
    out = out.filter((p) =>
      `${p.name} ${p.description ?? ''}`.toLocaleLowerCase('tr').includes(needle),
    );
  }
  if (q?.sort === 'price-asc')
    out = [...out].sort(
      (a, b) => (a.base_price ?? Infinity) - (b.base_price ?? Infinity),
    );
  if (q?.sort === 'price-desc')
    out = [...out].sort((a, b) => (b.base_price ?? -1) - (a.base_price ?? -1));
  if (q?.sort === 'production')
    out = [...out].sort(
      (a, b) =>
        (a.production_time_days ?? Infinity) - (b.production_time_days ?? Infinity),
    );
  if (q?.limit) out = out.slice(0, q.limit);
  return out;
}

export const getProducts = cachedCatalogRead(
  ['products'],
  async function getProducts(q?: ProductQuery): Promise<Product[]> {
  const supabase = getPublicClient();
  if (!supabase) return filterSeed(localSeedFallback('products_public', seedProducts), q);

  // Resolve category→department and collection slug maps (views lack these).
  const [cats, deps, cols, rows, media] = await Promise.all([
    supabase.from('categories_public').select('id, department_id, slug'),
    supabase.from('departments_public').select('id, slug'),
    supabase.from('collections_public').select('id, slug'),
    supabase.from('products_public').select('*'),
    supabase.from('product_media_public').select('*').order('sort_order'),
  ]).catch((error) => failPublicData('catalog', 'query_failed', error));

  const failed = [cats, deps, cols, rows, media].find((result) => result.error);
  if (failed?.error) failPublicData('catalog', 'query_failed', failed.error);
  if (!rows.data || rows.data.length === 0) return [];

  const catRows = (cats.data ?? []) as unknown as Record<string, unknown>[];
  const depRows = (deps.data ?? []) as unknown as Record<string, unknown>[];
  const colRows = (cols.data ?? []) as unknown as Record<string, unknown>[];

  const depById = new Map(depRows.map((d) => [String(d.id), String(d.slug)]));
  const depByCat = new Map(
    catRows.map((c) => [String(c.id), depById.get(String(c.department_id)) ?? '']),
  );
  const colById = new Map(colRows.map((c) => [String(c.id), String(c.slug)]));
  const mediaRows = (media.data ?? []) as unknown as (ProductMedia & {
    product_id: string;
  })[];

  const mapped: Product[] = (rows.data as unknown as Record<string, unknown>[]).map(
    (r) => ({
      id: String(r.id),
      name: String(r.name),
      slug: String(r.slug),
      department_slug: depByCat.get(r.category_id as string) ?? '',
      collection_slug: r.collection_id
        ? (colById.get(r.collection_id as string) ?? null)
        : null,
      description: (r.description as string) ?? null,
      category_slug: catRows.find((c) => String(c.id) === String(r.category_id))?.slug as
        string | undefined,
      category_name: catRows.find((c) => String(c.id) === String(r.category_id))?.name as
        string | undefined,
      material_story: (r.material_story as string) ?? null,
      behavior_type: r.behavior_type as Product['behavior_type'],
      base_price: (r.base_price as number) ?? null,
      currency: (r.currency as string) ?? 'TRY',
      stock_mode: (r.stock_mode as Product['stock_mode']) ?? 'made_to_order',
      production_time_days: (r.production_time_days as number) ?? null,
      price_band: (r.price_band as Product['price_band']) ?? null,
      proof_required: Boolean(r.proof_required),
      is_personalizable: Boolean(r.is_personalizable),
      return_note: (r.return_note as string) ?? null,
      delivery_note: (r.delivery_note as string) ?? null,
      media_ids: (r.media_ids as string[]) ?? [],
      sku: (r.sku as string) ?? null,
      gift_wrapping_available: Boolean(r.gift_wrapping_available),
      media: mediaRows.filter((item) => item.product_id === String(r.id)),
    }),
  );
  return filterSeed(mapped, q);
  },
);

// Intentionally NOT wrapped in its own cache layer. `getProducts` (which it
// reads) is already cache-tagged, and the PDP's full-route cache holds the
// rendered page. Giving this its own `unstable_cache` created a nested cache
// whose stale `null` (a slug requested before its product was published)
// survived `revalidateTag`, so an exact-path revalidation regenerated the route
// but still resolved to notFound(). Reading the shared `getProducts` cache
// directly keeps this consistent with the listing on every regeneration.
export async function getProductBySlug(
  department: string,
  slug: string,
): Promise<Product | null> {
  const list = await getProducts({ department });
  const product = list.find((p) => p.slug === slug) ?? null;
  return product ? loadProductCommerceDetails(product) : null;
}

async function loadProductCommerceDetails(product: Product): Promise<Product> {
  const supabase = getPublicClient();
  if (!supabase) return product;
  const [variants, tiers, addons, fields, colors, materials] = await Promise.all([
    supabase
      .from('product_variants_public')
      .select('*')
      .eq('product_id', product.id)
      .order('sort_order'),
    supabase
      .from('product_price_tiers_public')
      .select('*')
      .eq('product_id', product.id)
      .order('min_qty'),
    supabase
      .from('product_addons_public')
      .select('*')
      .or(`product_id.eq.${product.id},product_id.is.null`)
      .order('sort_order'),
    supabase
      .from('product_personalization_fields_public')
      .select('*')
      .eq('product_id', product.id)
      .order('sort_order'),
    supabase
      .from('product_colors_public')
      .select('*')
      .eq('product_id', product.id)
      .order('sort_order'),
    supabase
      .from('product_materials_public')
      .select('*')
      .eq('product_id', product.id)
      .order('sort_order'),
  ]).catch((error) => failPublicData('product-commerce-details', 'query_failed', error));
  const failed = [variants, tiers, addons, fields, colors, materials].find(
    (result) => result.error,
  );
  if (failed?.error)
    failPublicData('product-commerce-details', 'query_failed', failed.error);
  return {
    ...product,
    variants: (variants.data ?? []) as unknown as ProductVariant[],
    price_tiers: (tiers.data ?? []) as unknown as ProductPriceTier[],
    addons: (addons.data ?? []) as unknown as ProductAddon[],
    personalization_fields: (fields.data ??
      []) as unknown as ProductPersonalizationField[],
    colors: (colors.data ?? []) as unknown as ProductAttribute[],
    materials: (materials.data ?? []) as unknown as ProductAttribute[],
  };
}

export async function getRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  const list = await getProducts({ department: product.department_slug });
  return list.filter((p) => p.id !== product.id).slice(0, limit);
}
