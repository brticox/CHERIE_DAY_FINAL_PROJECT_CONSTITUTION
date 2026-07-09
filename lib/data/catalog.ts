import {
  departments as seedDepartments,
  collections as seedCollections,
  products as seedProducts,
} from '@/content/seed/catalog';
import { getPublicClient } from '@/lib/supabase/public';
import { readPublic } from './source';
import type { Collection, Department, Product } from './types';

// ---- Departments -----------------------------------------------------------
export async function getDepartments(): Promise<Department[]> {
  return readPublic<Department>('departments_public', seedDepartments, { order: 'sort_order' });
}

export async function getDepartmentBySlug(slug: string): Promise<Department | null> {
  const all = await getDepartments();
  return all.find((d) => d.slug === slug) ?? null;
}

// ---- Collections -----------------------------------------------------------
export async function getCollections(): Promise<Collection[]> {
  return readPublic<Collection>('collections_public', seedCollections, { order: 'sort_order' });
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  const all = await getCollections();
  return all.find((c) => c.slug === slug) ?? null;
}

// ---- Products --------------------------------------------------------------
type ProductQuery = { department?: string; collection?: string; limit?: number };

function filterSeed(list: Product[], q?: ProductQuery): Product[] {
  let out = list;
  if (q?.department) out = out.filter((p) => p.department_slug === q.department);
  if (q?.collection) out = out.filter((p) => p.collection_slug === q.collection);
  if (q?.limit) out = out.slice(0, q.limit);
  return out;
}

export async function getProducts(q?: ProductQuery): Promise<Product[]> {
  const supabase = getPublicClient();
  if (!supabase) return filterSeed(seedProducts, q);

  try {
    // Resolve category→department and collection slug maps (views lack these).
    const [cats, deps, cols, rows] = await Promise.all([
      supabase.from('categories_public').select('id, department_id, slug'),
      supabase.from('departments_public').select('id, slug'),
      supabase.from('collections_public').select('id, slug'),
      supabase.from('products_public').select('*'),
    ]);
    if (rows.error || !rows.data) return filterSeed(seedProducts, q);

    const catRows = (cats.data ?? []) as unknown as Record<string, unknown>[];
    const depRows = (deps.data ?? []) as unknown as Record<string, unknown>[];
    const colRows = (cols.data ?? []) as unknown as Record<string, unknown>[];

    const depById = new Map(depRows.map((d) => [String(d.id), String(d.slug)]));
    const depByCat = new Map(
      catRows.map((c) => [String(c.id), depById.get(String(c.department_id)) ?? '']),
    );
    const colById = new Map(colRows.map((c) => [String(c.id), String(c.slug)]));

    const mapped: Product[] = (rows.data as unknown as Record<string, unknown>[]).map((r) => ({
      id: String(r.id),
      name: String(r.name),
      slug: String(r.slug),
      department_slug: depByCat.get(r.category_id as string) ?? '',
      collection_slug: r.collection_id ? (colById.get(r.collection_id as string) ?? null) : null,
      description: (r.description as string) ?? null,
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
    }));
    return filterSeed(mapped, q);
  } catch {
    return filterSeed(seedProducts, q);
  }
}

export async function getProductBySlug(
  department: string,
  slug: string,
): Promise<Product | null> {
  const list = await getProducts({ department });
  return list.find((p) => p.slug === slug) ?? null;
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const list = await getProducts({ department: product.department_slug });
  return list.filter((p) => p.id !== product.id).slice(0, limit);
}
