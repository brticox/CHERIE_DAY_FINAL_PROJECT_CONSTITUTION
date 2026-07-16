'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { requireStaff } from '@/lib/auth/guards';
import { can } from '@/lib/admin/permissions';
import { revalidateCatalog } from '@/lib/data/catalog-cache';
import { adminProductSchema } from '@/lib/validation/admin-product';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import type { Json } from '@/lib/supabase/database.types';

const productPath = (id: string) => `/admin/commerce/products/${id}`;

async function audit(
  staffId: string,
  action: string,
  entityId: string,
  diff: Record<string, unknown> = {},
) {
  await createAdminClient()
    .from('audit_log')
    .insert({
      staff_user_id: staffId,
      action,
      entity_type: 'product',
      entity_id: entityId,
      diff: diff as Json,
    });
}

export async function saveProduct(formData: FormData) {
  const { staff } = await requireStaff('/admin/commerce/products');
  if (!can(staff.role, 'catalog.write'))
    redirect('/admin/commerce/products?error=permission');
  const idValue = String(formData.get('id') ?? '');
  const existing = idValue
    ? (
        await createAdminClient()
          .from('products')
          .select('status')
          .eq('id', idValue)
          .maybeSingle()
      ).data
    : null;
  const status = existing?.status ?? 'draft';
  const parsed = adminProductSchema.safeParse({
    id: formData.get('id') || undefined,
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    category_id: formData.get('category_id') || null,
    collection_id: formData.get('collection_id') || null,
    behavior_type: formData.get('behavior_type'),
    base_price: formData.get('base_price') || null,
    stock_mode: formData.get('stock_mode'),
    production_time_days: formData.get('production_time_days') || null,
    proof_required: formData.get('proof_required') === 'on',
    is_personalizable: formData.get('is_personalizable') === 'on',
    status,
  });
  if (!parsed.success)
    redirect(
      `/admin/commerce/products/${formData.get('id') || 'new'}?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? 'Doğrulama hatası')}`,
    );
  const { id, ...input } = parsed.data;
  const db = createAdminClient();
  const { data: collision } = await db
    .from('products')
    .select('id')
    .eq('slug', input.slug)
    .neq('id', id ?? '00000000-0000-0000-0000-000000000000')
    .maybeSingle();
  if (collision)
    redirect(
      `/admin/commerce/products/${id || 'new'}?error=${encodeURIComponent('Bu slug başka bir üründe kullanılıyor.')}`,
    );
  const before = id
    ? (
        await db
          .from('products')
          .select('name,slug,status,base_price,behavior_type')
          .eq('id', id)
          .maybeSingle()
      ).data
    : null;
  const mutation = id
    ? db.from('products').update(input).eq('id', id).select('id').single()
    : db.from('products').insert(input).select('id').single();
  const { data, error } = await mutation;
  if (error || !data)
    redirect(
      `/admin/commerce/products/${id || 'new'}?error=${encodeURIComponent(error?.message ?? 'Ürün kaydedilemedi')}`,
    );
  await db.from('audit_log').insert({
    staff_user_id: staff.id,
    action: id ? 'product.updated' : 'product.created',
    entity_type: 'product',
    entity_id: data.id,
    diff: {
      before,
      after: {
        name: input.name,
        slug: input.slug,
        status: input.status,
        base_price: input.base_price,
        behavior_type: input.behavior_type,
      },
    },
  });
  revalidatePath('/admin/commerce/products');
  revalidateCatalog();
  redirect(`/admin/commerce/products/${data.id}?saved=1`);
}

export async function changeProductLifecycle(
  intent: 'publish' | 'archive' | 'restore',
  formData: FormData,
) {
  const id = String(formData.get('id'));
  const { staff } = await requireStaff(productPath(id));
  const needed = intent === 'publish' ? 'catalog.publish' : 'catalog.write';
  if (!can(staff.role, needed)) redirect(`${productPath(id)}?error=permission`);
  const db = await createClient();
  const rpc = db.rpc.bind(db) as unknown as (
    name: string,
    args: Record<string, unknown>,
  ) => Promise<{ error: { message: string } | null }>;
  const { error } = await rpc(
    intent === 'publish'
      ? 'admin_publish_product'
      : intent === 'archive'
        ? 'admin_archive_product'
        : 'admin_restore_product',
    { p_product_id: id },
  );
  if (error) redirect(`${productPath(id)}?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/admin/commerce/products');
  revalidatePath(productPath(id));
  revalidateCatalog();
  redirect(`${productPath(id)}?saved=1`);
}

export async function saveProductSeo(formData: FormData) {
  const id = String(formData.get('id'));
  const { staff } = await requireStaff(productPath(id));
  if (!can(staff.role, 'catalog.write')) redirect(`${productPath(id)}?error=permission`);
  const db = createAdminClient();
  const payload = {
    title: text(formData, 'seo_title', 160),
    description: text(formData, 'seo_description', 320),
    canonical_url: text(formData, 'canonical_url', 1000),
    schema_type: text(formData, 'schema_type', 80) || 'Product',
    noindex: formData.get('noindex') === 'on',
    entity_type: 'product',
    entity_id: id,
  };
  const { data: product } = await db
    .from('products')
    .select('seo_metadata_id')
    .eq('id', id)
    .single();
  const result = product?.seo_metadata_id
    ? await db
        .from('seo_metadata')
        .update(payload)
        .eq('id', product.seo_metadata_id)
        .select('id')
        .single()
    : await db.from('seo_metadata').insert(payload).select('id').single();
  if (result.error || !result.data)
    redirect(
      `${productPath(id)}?error=${encodeURIComponent(result.error?.message ?? 'SEO kaydedilemedi')}`,
    );
  if (!product?.seo_metadata_id)
    await db.from('products').update({ seo_metadata_id: result.data.id }).eq('id', id);
  await audit(staff.id, 'product.seo.updated', id, { seo_metadata_id: result.data.id });
  revalidatePath(productPath(id));
  revalidateCatalog();
  redirect(`${productPath(id)}?saved=1`);
}

export async function addProductOption(formData: FormData) {
  const id = String(formData.get('id'));
  const kind = String(formData.get('kind'));
  const { staff } = await requireStaff(productPath(id));
  if (!can(staff.role, 'catalog.write')) redirect(`${productPath(id)}?error=permission`);
  const db = createAdminClient();
  let result: { error: { message: string } | null };
  if (kind === 'variant')
    result = await db.from('product_variants').insert({
      product_id: id,
      title: required(formData, 'title', 120),
      sku: text(formData, 'sku', 80),
      price: money(formData, 'price'),
      stock_quantity: integer(formData, 'stock_quantity'),
      status: 'active',
      option_values: {},
    });
  else if (kind === 'addon')
    result = await db.from('product_addons').insert({
      product_id: id,
      name_tr: required(formData, 'title', 120),
      price: money(formData, 'price') ?? 0,
      addon_type: 'other',
      price_type: 'fixed',
      is_optional: true,
      status: 'draft',
    });
  else if (kind === 'personalization')
    result = await db.from('product_personalization_fields').insert({
      product_id: id,
      label: required(formData, 'title', 120),
      field_type: String(formData.get('field_type') || 'text') as
        'text' | 'textarea' | 'date' | 'select' | 'file' | 'number' | 'checkbox',
      required: formData.get('required') === 'on',
      helper_text: text(formData, 'helper_text', 240),
    });
  else if (kind === 'tier')
    result = await db.from('product_price_tiers').insert({
      product_id: id,
      min_qty: integer(formData, 'min_qty') ?? 1,
      unit_price: money(formData, 'unit_price') ?? 0,
    });
  else redirect(`${productPath(id)}?error=invalid_option`);
  if (result.error)
    redirect(`${productPath(id)}?error=${encodeURIComponent(result.error.message)}`);
  await audit(staff.id, `product.${kind}.created`, id);
  revalidatePath(productPath(id));
  revalidateCatalog();
  redirect(`${productPath(id)}?saved=1`);
}

export async function deleteProductOption(formData: FormData) {
  const productId = String(formData.get('product_id'));
  const rowId = String(formData.get('row_id'));
  const kind = String(formData.get('kind'));
  const { staff } = await requireStaff(productPath(productId));
  if (!can(staff.role, 'catalog.write'))
    redirect(`${productPath(productId)}?error=permission`);
  const tables = {
    variant: 'product_variants',
    addon: 'product_addons',
    personalization: 'product_personalization_fields',
    tier: 'product_price_tiers',
  } as const;
  const table = tables[kind as keyof typeof tables];
  if (!table) redirect(`${productPath(productId)}?error=invalid_option`);
  const db = createAdminClient();
  const { error } = await db
    .from(table)
    .delete()
    .eq('id', rowId)
    .eq('product_id', productId);
  if (error)
    redirect(`${productPath(productId)}?error=${encodeURIComponent(error.message)}`);
  await audit(staff.id, `product.${kind}.deleted`, productId, { row_id: rowId });
  revalidatePath(productPath(productId));
  revalidateCatalog();
}

export async function saveProductTaxonomy(formData: FormData) {
  const id = String(formData.get('id'));
  const { staff } = await requireStaff(productPath(id));
  if (!can(staff.role, 'catalog.write')) redirect(`${productPath(id)}?error=permission`);
  const materialIds = formData.getAll('material_ids').map(String);
  const colorIds = formData.getAll('color_ids').map(String);
  const db = createAdminClient();
  const [dm, dc] = await Promise.all([
    db.from('product_materials').delete().eq('product_id', id),
    db.from('product_colors').delete().eq('product_id', id),
  ]);
  if (dm.error || dc.error) redirect(`${productPath(id)}?error=taxonomy_delete`);
  const [im, ic] = await Promise.all([
    materialIds.length
      ? db
          .from('product_materials')
          .insert(materialIds.map((material_id) => ({ product_id: id, material_id })))
      : Promise.resolve({ error: null }),
    colorIds.length
      ? db
          .from('product_colors')
          .insert(colorIds.map((color_id) => ({ product_id: id, color_id })))
      : Promise.resolve({ error: null }),
  ]);
  if (im.error || ic.error) redirect(`${productPath(id)}?error=taxonomy_save`);
  await audit(staff.id, 'product.taxonomy.updated', id, {
    material_ids: materialIds,
    color_ids: colorIds,
  });
  revalidatePath(productPath(id));
  revalidateCatalog();
  redirect(`${productPath(id)}?saved=1`);
}

export async function setProductMedia(formData: FormData) {
  const id = String(formData.get('id'));
  const ids = String(formData.get('media_ids') ?? '')
    .split(',')
    .filter(Boolean);
  const { staff } = await requireStaff(productPath(id));
  if (!can(staff.role, 'catalog.write')) redirect(`${productPath(id)}?error=permission`);
  const db = await createClient();
  const rpc = db.rpc.bind(db) as unknown as (
    name: string,
    args: Record<string, unknown>,
  ) => Promise<{ error: { message: string } | null }>;
  const { error } = await rpc('admin_set_product_media', {
    p_product_id: id,
    p_media_ids: ids,
  });
  if (error) redirect(`${productPath(id)}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(productPath(id));
  revalidateCatalog();
  redirect(`${productPath(id)}?saved=1`);
}

const text = (fd: FormData, key: string, max: number) => {
  const value = String(fd.get(key) ?? '').trim();
  return value ? value.slice(0, max) : null;
};
const required = (fd: FormData, key: string, max: number) => {
  const value = text(fd, key, max);
  if (!value) throw new Error(`${key} gerekli`);
  return value;
};
const money = (fd: FormData, key: string) => {
  const raw = String(fd.get(key) ?? '');
  if (!raw) return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) throw new Error('Geçerli bir tutar girin.');
  return value;
};
const integer = (fd: FormData, key: string) => {
  const raw = String(fd.get(key) ?? '');
  if (!raw) return null;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0)
    throw new Error('Geçerli bir tam sayı girin.');
  return value;
};

export async function duplicateProduct(formData: FormData) {
  const { staff } = await requireStaff('/admin/commerce/products');
  if (!can(staff.role, 'catalog.write'))
    redirect('/admin/commerce/products?error=permission');
  const id = String(formData.get('id'));
  const db = createAdminClient();
  const { data: source } = await db.from('products').select('*').eq('id', id).single();
  if (!source) redirect('/admin/commerce/products?error=not_found');
  const suffix = Date.now().toString().slice(-6);
  const { data, error } = await db
    .from('products')
    .insert({
      name: `${source.name} — Kopya`,
      slug: `${source.slug}-kopya-${suffix}`,
      status: 'draft',
      category_id: source.category_id,
      collection_id: source.collection_id,
      collection_set_id: source.collection_set_id,
      description: source.description,
      motif: source.motif,
      material_story: source.material_story,
      materials: source.materials,
      packaging_notes: source.packaging_notes,
      occasion_type: source.occasion_type,
      object_type: source.object_type,
      brand_motif_tags: source.brand_motif_tags,
      is_personalizable: source.is_personalizable,
      proof_required: source.proof_required,
      gift_wrapping_available: source.gift_wrapping_available,
      personalization_options: source.personalization_options,
      behavior_type: source.behavior_type,
      base_price: source.base_price,
      currency: source.currency,
      sku: source.sku,
      stock_mode: source.stock_mode,
      production_time_days: source.production_time_days,
      price_band: source.price_band,
      internal_cost: source.internal_cost,
      return_note: source.return_note,
      delivery_note: source.delivery_note,
      media_ids: source.media_ids,
      seo_metadata_id: source.seo_metadata_id,
      sort_order: source.sort_order,
    })
    .select('id')
    .single();
  if (error || !data) redirect('/admin/commerce/products?error=duplicate');
  await db.from('audit_log').insert({
    staff_user_id: staff.id,
    action: 'product.duplicated',
    entity_type: 'product',
    entity_id: data.id,
    diff: { source_id: id },
  });
  revalidateCatalog();
  redirect(`/admin/commerce/products/${data.id}?saved=1`);
}
