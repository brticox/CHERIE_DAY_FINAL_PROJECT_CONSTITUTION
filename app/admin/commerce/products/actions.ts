'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { requireStaff } from '@/lib/auth/guards';
import { can } from '@/lib/admin/permissions';
import { adminProductSchema } from '@/lib/validation/admin-product';
import { createAdminClient } from '@/lib/supabase/admin';

export async function saveProduct(formData: FormData) {
  const { staff } = await requireStaff('/admin/commerce/products');
  if (!can(staff.role, 'catalog.write')) redirect('/admin/commerce/products?error=permission');
  const status = String(formData.get('status') ?? 'draft');
  if (status === 'published' && !can(staff.role, 'catalog.publish')) redirect('/admin/commerce/products?error=publish_permission');
  const parsed = adminProductSchema.safeParse({
    id: formData.get('id') || undefined,
    name: formData.get('name'), slug: formData.get('slug'), description: formData.get('description'),
    category_id: formData.get('category_id') || null, collection_id: formData.get('collection_id') || null,
    behavior_type: formData.get('behavior_type'), base_price: formData.get('base_price') || null,
    stock_mode: formData.get('stock_mode'), production_time_days: formData.get('production_time_days') || null,
    proof_required: formData.get('proof_required') === 'on', is_personalizable: formData.get('is_personalizable') === 'on', status,
  });
  if (!parsed.success) redirect(`/admin/commerce/products/${formData.get('id') || 'new'}?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? 'Doğrulama hatası')}`);
  const { id, ...input } = parsed.data;
  const db = createAdminClient();
  const before = id ? (await db.from('products').select('name,slug,status,base_price,behavior_type').eq('id', id).maybeSingle()).data : null;
  const mutation = id ? db.from('products').update(input).eq('id', id).select('id').single() : db.from('products').insert(input).select('id').single();
  const { data, error } = await mutation;
  if (error || !data) redirect(`/admin/commerce/products/${id || 'new'}?error=${encodeURIComponent(error?.message ?? 'Ürün kaydedilemedi')}`);
  await db.from('audit_log').insert({ staff_user_id: staff.id, action: id ? 'product.updated' : 'product.created', entity_type: 'product', entity_id: data.id, diff: { before, after: { name: input.name, slug: input.slug, status: input.status, base_price: input.base_price, behavior_type: input.behavior_type } } });
  revalidatePath('/admin/commerce/products');
  redirect(`/admin/commerce/products/${data.id}?saved=1`);
}

export async function duplicateProduct(formData: FormData) {
  const { staff } = await requireStaff('/admin/commerce/products');
  if (!can(staff.role, 'catalog.write')) redirect('/admin/commerce/products?error=permission');
  const id = String(formData.get('id'));
  const db = createAdminClient();
  const { data: source } = await db.from('products').select('*').eq('id', id).single();
  if (!source) redirect('/admin/commerce/products?error=not_found');
  const suffix = Date.now().toString().slice(-6);
  const { data, error } = await db.from('products').insert({
    name: `${source.name} — Kopya`, slug: `${source.slug}-kopya-${suffix}`, status: 'draft',
    category_id: source.category_id, collection_id: source.collection_id,
    collection_set_id: source.collection_set_id, description: source.description,
    motif: source.motif, material_story: source.material_story, materials: source.materials,
    packaging_notes: source.packaging_notes, occasion_type: source.occasion_type,
    object_type: source.object_type, brand_motif_tags: source.brand_motif_tags,
    is_personalizable: source.is_personalizable, proof_required: source.proof_required,
    gift_wrapping_available: source.gift_wrapping_available,
    personalization_options: source.personalization_options, behavior_type: source.behavior_type,
    base_price: source.base_price, currency: source.currency, sku: source.sku,
    stock_mode: source.stock_mode, production_time_days: source.production_time_days,
    price_band: source.price_band, internal_cost: source.internal_cost,
    return_note: source.return_note, delivery_note: source.delivery_note,
    media_ids: source.media_ids, seo_metadata_id: source.seo_metadata_id,
    sort_order: source.sort_order,
  }).select('id').single();
  if (error || !data) redirect('/admin/commerce/products?error=duplicate');
  await db.from('audit_log').insert({ staff_user_id: staff.id, action: 'product.duplicated', entity_type: 'product', entity_id: data.id, diff: { source_id: id } });
  redirect(`/admin/commerce/products/${data.id}?saved=1`);
}
