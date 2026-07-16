import 'server-only';

import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import {
  addMinor,
  minorToTryDecimal,
  multiplyMinor,
  percentageOfMinor,
  tryToMinor,
} from '@/lib/payments/money';
import type { Database, Json } from '@/lib/supabase/database.types';
import type { AddCartItemInput } from '@/lib/validation/cart';

const CART_COOKIE = 'cherie_cart';
const COOKIE_AGE = 60 * 60 * 24 * 30;
const ALLOWED_BEHAVIORS = new Set(['cart_enabled', 'proof_required_cart']);

type CartRow = Database['public']['Tables']['carts']['Row'];
type CartItemRow = Database['public']['Tables']['cart_items']['Row'];
type ProductVariantRow = Database['public']['Tables']['product_variants']['Row'];

export class CartError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

export function cartConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

async function owner(createGuest = false) {
  if (!cartConfigured()) {
    throw new CartError(
      'service_unavailable',
      'Seçimlerim şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.',
      503,
    );
  }
  const cookieStore = await cookies();
  const sessionClient = await createClient();
  const { data } = await sessionClient.auth.getUser();
  const admin = createAdminClient();
  let customerId: string | null = null;
  if (data.user) {
    const { data: customer } = await admin
      .from('customers')
      .select('id')
      .eq('auth_user_id', data.user.id)
      .maybeSingle();
    customerId = (customer?.id as string | undefined) ?? null;
  }

  let rawToken = cookieStore.get(CART_COOKIE)?.value;
  if (!rawToken && createGuest && !customerId) {
    rawToken = randomBytes(32).toString('base64url');
    cookieStore.set(CART_COOKIE, rawToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: COOKIE_AGE,
    });
  }
  return {
    admin,
    userId: data.user?.id ?? null,
    customerId,
    tokenHash: rawToken ? hashToken(rawToken) : null,
  };
}

async function findOrCreateCart(create = false) {
  const context = await owner(create);
  let query = context.admin.from('carts').select('*').eq('status', 'active');
  query = context.customerId
    ? query.eq('customer_id', context.customerId)
    : context.tokenHash
      ? query.eq('anonymous_token_hash', context.tokenHash)
      : query.eq('id', '00000000-0000-0000-0000-000000000000');
  const { data: existing } = await query.maybeSingle();
  if (existing) return { ...context, cart: existing as CartRow };
  if (!create) return { ...context, cart: null };

  const { data: created, error } = await context.admin
    .from('carts')
    .insert({
      customer_id: context.customerId,
      anonymous_token_hash: context.customerId ? null : context.tokenHash,
      status: 'active',
      currency: 'TRY',
    })
    .select('*')
    .single();
  if (error || !created)
    throw new CartError('cart_create_failed', 'Seçimleriniz başlatılamadı.', 502);
  return { ...context, cart: created as CartRow };
}

export async function getCart() {
  const context = await findOrCreateCart(false);
  if (!context.cart) return { id: null, items: [], total: 0, totalMinor: 0, count: 0 };
  const { data, error } = await context.admin
    .from('cart_items')
    .select('*')
    .eq('cart_id', String(context.cart.id))
    .order('created_at');
  if (error) throw new CartError('cart_read_failed', 'Seçimleriniz okunamadı.', 502);
  const items = (data ?? []) as CartItemRow[];
  const active = items.filter((item) => !item.removed_at);
  const totalMinor = active.reduce(
    (sum, item) =>
      addMinor(
        sum,
        tryToMinor(String(item.total_price_snapshot ?? 0), { allowZero: true }),
      ),
    0,
  );
  return {
    id: context.cart.id,
    items,
    count: active.reduce((sum, item) => sum + Number(item.quantity), 0),
    total: Number(minorToTryDecimal(totalMinor)),
    totalMinor,
  };
}

export async function addCartItem(input: AddCartItemInput) {
  const context = await findOrCreateCart(true);
  const admin = context.admin;
  const { data: product } = await admin
    .from('products')
    .select('*')
    .eq('id', input.productId)
    .eq('status', 'published')
    .maybeSingle();
  if (!product)
    throw new CartError('product_unavailable', 'Bu ürün artık sunulmuyor.', 409);
  if (!ALLOWED_BEHAVIORS.has(String(product.behavior_type))) {
    throw new CartError(
      'quote_required',
      'Bu ürün teklif veya görüşme ile hazırlanır; sepete eklenemez.',
      409,
    );
  }
  if (product.stock_mode === 'unavailable') {
    throw new CartError('out_of_stock', 'Bu ürün şu anda kullanılamıyor.', 409);
  }

  let variant: ProductVariantRow | null = null;
  if (input.variantId) {
    const { data } = await admin
      .from('product_variants')
      .select('*')
      .eq('id', input.variantId)
      .eq('product_id', input.productId)
      .eq('status', 'active')
      .maybeSingle();
    variant = data ?? null;
    if (!variant)
      throw new CartError(
        'invalid_variant',
        'Seçtiğiniz seçenek artık kullanılamıyor.',
        409,
      );
    if (
      product.stock_mode === 'in_stock' &&
      variant.stock_quantity !== null &&
      variant.stock_quantity !== undefined &&
      Number(variant.stock_quantity) < input.quantity
    ) {
      throw new CartError(
        'insufficient_stock',
        'Seçtiğiniz adet mevcut stoktan fazla.',
        409,
      );
    }
  } else {
    const { count } = await admin
      .from('product_variants')
      .select('id', { count: 'exact', head: true })
      .eq('product_id', input.productId)
      .eq('status', 'active');
    if (count)
      throw new CartError('variant_required', 'Lütfen bir ürün seçeneği belirleyin.');
  }

  const { data: fields } = await admin
    .from('product_personalization_fields')
    .select('*')
    .eq('product_id', input.productId)
    .order('sort_order');
  const personalizationSnapshot: { [key: string]: Json | undefined } = {};
  for (const field of fields ?? []) {
    const value = input.personalization[String(field.id)];
    const empty =
      value === undefined || value === null || value === '' || value === false;
    if (field.required && field.field_type === 'file' && input.uploadIds.length === 0) {
      throw new CartError('file_required', `${field.label} dosyası zorunludur.`);
    }
    if (field.required && empty && field.field_type !== 'file') {
      throw new CartError('personalization_required', `${field.label} alanı zorunludur.`);
    }
    if (!empty && field.field_type === 'select') {
      const options = Array.isArray(field.options) ? field.options.map(String) : [];
      if (!options.includes(String(value))) {
        throw new CartError('invalid_personalization', `${field.label} seçimi geçersiz.`);
      }
    }
    if (!empty && field.field_type === 'checkbox' && typeof value !== 'boolean') {
      throw new CartError('invalid_personalization', `${field.label} seçimi geçersiz.`);
    }
    if (!empty && field.field_type === 'number' && typeof value !== 'number') {
      throw new CartError('invalid_personalization', `${field.label} değeri geçersiz.`);
    }
    if (!empty) personalizationSnapshot[String(field.id)] = { label: field.label, value };
  }

  const { data: addonRows } = input.addonIds.length
    ? await admin
        .from('product_addons')
        .select('*')
        .in('id', input.addonIds)
        .eq('status', 'published')
    : { data: [] };
  const addons = (addonRows ?? []).filter(
    (addon) => !addon.product_id || addon.product_id === input.productId,
  );
  if (addons.length !== input.addonIds.length)
    throw new CartError('invalid_addon', 'Bir veya daha fazla ek seçenek geçersiz.');

  const { data: tierRows } = await admin
    .from('product_price_tiers')
    .select('*')
    .eq('product_id', input.productId)
    .lte('min_qty', input.quantity)
    .order('min_qty', { ascending: false });
  const tier = (tierRows ?? []).find(
    (row) => !row.variant_id || row.variant_id === input.variantId,
  );
  let unitPriceMinor: number;
  try {
    unitPriceMinor = tryToMinor(
      String(tier?.unit_price ?? variant?.price ?? product.base_price),
    );
  } catch {
    throw new CartError(
      'price_unavailable',
      'Bu ürün için geçerli fiyat bulunamadı.',
      409,
    );
  }
  const baseTotalMinor = multiplyMinor(unitPriceMinor, input.quantity);
  const addonTotalMinor = addons.reduce(
    (sum, addon) =>
      addMinor(
        sum,
        addon.price_type === 'percentage'
          ? percentageOfMinor(baseTotalMinor, String(addon.price))
          : tryToMinor(String(addon.price), { allowZero: true }),
      ),
    0,
  );
  const totalMinor = addMinor(baseTotalMinor, addonTotalMinor);
  const unitPrice = Number(minorToTryDecimal(unitPriceMinor));
  const baseTotal = Number(minorToTryDecimal(baseTotalMinor));
  const addonTotal = Number(minorToTryDecimal(addonTotalMinor));
  const total = Number(minorToTryDecimal(totalMinor));

  if (input.uploadIds.length) {
    const { data: uploads } = await admin
      .from('customer_uploads')
      .select('id')
      .in('id', input.uploadIds)
      .eq('cart_id', String(context.cart!.id));
    if ((uploads?.length ?? 0) !== input.uploadIds.length)
      throw new CartError('invalid_upload', 'Dosya sahipliği doğrulanamadı.', 403);
  }

  const { data: item, error } = await admin
    .from('cart_items')
    .insert({
      cart_id: context.cart!.id,
      product_id: input.productId,
      variant_id: input.variantId ?? null,
      quantity: input.quantity,
      personalization_json: personalizationSnapshot,
      selected_addons_json: addons.map((addon) => ({
        id: addon.id,
        name: addon.name_tr,
        price: addon.price,
        price_type: addon.price_type,
      })),
      uploaded_file_ids: input.uploadIds,
      unit_price_snapshot: unitPrice,
      total_price_snapshot: total,
      requires_proof: Boolean(product.proof_required),
      product_snapshot: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: variant?.sku ?? product.sku,
        variant: variant
          ? { id: variant.id, title: variant.title, option_values: variant.option_values }
          : null,
        production_time_days: product.production_time_days,
      },
      price_breakdown_json: {
        unit_price: unitPrice,
        quantity: input.quantity,
        tier_min_qty: tier?.min_qty ?? null,
        base_total: baseTotal,
        addon_total: addonTotal,
        total,
        currency: 'TRY',
        priced_at: new Date().toISOString(),
      },
    })
    .select('*')
    .single();
  if (error || !item)
    throw new CartError('item_create_failed', 'Ürün seçiminize eklenemedi.', 502);
  return item;
}

export async function updateCartItem(
  itemId: string,
  quantity?: number,
  restore?: boolean,
) {
  const context = await findOrCreateCart(false);
  if (!context.cart) throw new CartError('not_found', 'Seçim bulunamadı.', 404);
  const { data: existing } = await context.admin
    .from('cart_items')
    .select('*')
    .eq('id', itemId)
    .eq('cart_id', String(context.cart.id))
    .maybeSingle();
  if (!existing) throw new CartError('not_found', 'Seçim bulunamadı.', 404);
  if (restore) {
    const { data } = await context.admin
      .from('cart_items')
      .update({ removed_at: null })
      .eq('id', itemId)
      .select('*')
      .single();
    return data;
  }
  if (!quantity) throw new CartError('quantity_required', 'Geçerli bir adet girin.');
  const input: AddCartItemInput = {
    productId: String(existing.product_id),
    variantId: existing.variant_id ? String(existing.variant_id) : null,
    quantity,
    personalization: Object.fromEntries(
      Object.entries(
        (existing.personalization_json ?? {}) as Record<string, { value?: unknown }>,
      ).map(([id, entry]) => [id, entry?.value as string | number | boolean]),
    ),
    addonIds: ((existing.selected_addons_json ?? []) as { id: string }[]).map(
      (addon) => addon.id,
    ),
    uploadIds: (existing.uploaded_file_ids ?? []) as string[],
  };
  const replacement = await addCartItem(input);
  await context.admin.from('cart_items').delete().eq('id', itemId);
  return replacement;
}

export async function removeCartItem(itemId: string) {
  const context = await findOrCreateCart(false);
  if (!context.cart) throw new CartError('not_found', 'Seçim bulunamadı.', 404);
  const { data } = await context.admin
    .from('cart_items')
    .update({ removed_at: new Date().toISOString() })
    .eq('id', itemId)
    .eq('cart_id', String(context.cart.id))
    .select('id, removed_at')
    .maybeSingle();
  if (!data) throw new CartError('not_found', 'Seçim bulunamadı.', 404);
  return data;
}

export async function mergeGuestCartForCurrentUser() {
  if (!cartConfigured()) return;
  const context = await owner(false);
  if (!context.customerId || !context.tokenHash) return;
  const userClient = await createClient();
  const mergeRpc = userClient.rpc.bind(userClient) as unknown as (
    name: string,
    args: Record<string, unknown>,
  ) => Promise<{ error: { code: string } | null }>;
  const { error } = await mergeRpc('merge_guest_cart_for_current_user', {
    p_token_hash: context.tokenHash,
  });
  if (error)
    throw new CartError(
      'cart_merge_failed',
      'Seçimleriniz hesabınıza aktarılamadı.',
      409,
    );
  const cookieStore = await cookies();
  cookieStore.delete(CART_COOKIE);
}

export async function uploadCartFile(file: File) {
  const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
  if (!allowed.has(file.type))
    throw new CartError(
      'invalid_file_type',
      'JPG, PNG, WEBP veya PDF yükleyebilirsiniz.',
    );
  if (file.size < 1 || file.size > 10 * 1024 * 1024)
    throw new CartError('invalid_file_size', 'Dosya boyutu en fazla 10 MB olabilir.');
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!matchesFileSignature(file.type, bytes)) {
    throw new CartError(
      'invalid_file_content',
      'Dosya içeriği seçilen formatla eşleşmiyor.',
    );
  }
  const context = await findOrCreateCart(true);
  const safeExt = file.type === 'application/pdf' ? 'pdf' : file.type.split('/')[1];
  const ownerFolder = context.userId ?? `guest-${context.tokenHash!.slice(0, 24)}`;
  const path = `${ownerFolder}/${randomUUID()}.${safeExt}`;
  const { error } = await context.admin.storage
    .from('customer-uploads')
    .upload(path, bytes, { contentType: file.type, upsert: false });
  if (error) throw new CartError('upload_failed', 'Dosya yüklenemedi.', 502);
  const { data, error: recordError } = await context.admin
    .from('customer_uploads')
    .insert({
      cart_id: context.cart!.id,
      customer_id: context.customerId,
      anonymous_token_hash: context.customerId ? null : context.tokenHash,
      storage_path: path,
      original_name: file.name.slice(0, 180),
      mime_type: file.type,
      size_bytes: file.size,
    })
    .select('id, original_name, mime_type, size_bytes')
    .single();
  if (recordError || !data) {
    await context.admin.storage.from('customer-uploads').remove([path]);
    throw new CartError('upload_record_failed', 'Dosya kaydı oluşturulamadı.', 502);
  }
  return data;
}

function matchesFileSignature(type: string, bytes: Uint8Array) {
  if (type === 'image/jpeg')
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === 'image/png') {
    const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return bytes.slice(0, 8).every((byte, index) => byte === signature[index]);
  }
  if (type === 'image/webp') {
    return (
      String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
      String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
    );
  }
  if (type === 'application/pdf')
    return String.fromCharCode(...bytes.slice(0, 5)) === '%PDF-';
  return false;
}
