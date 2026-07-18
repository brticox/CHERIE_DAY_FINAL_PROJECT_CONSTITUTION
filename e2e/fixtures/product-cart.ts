import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const E2E = {
  email: 'product-cart-e2e@cherie.test',
  password: 'Cherie-E2E-2026!',
  productId: 'ec000000-0000-4000-8000-000000000001',
  mediaId: 'ec000000-0000-4000-8000-000000000002',
  standardVariantId: 'ec000000-0000-4000-8000-000000000003',
  premiumVariantId: 'ec000000-0000-4000-8000-000000000004',
  addonId: 'ec000000-0000-4000-8000-000000000005',
  fieldId: 'ec000000-0000-4000-8000-000000000006',
  tierId: 'ec000000-0000-4000-8000-000000000007',
  slug: 'e2e-gercek-urun-akisi',
  name: 'E2E Gerçek Ürün Akışı',
  storagePath: 'e2e/product-cart-real-image.webp',
} as const;

const LEGAL_STATE_PATH = path.join(process.cwd(), 'test-results/e2e-legal-state.json');
const execFileAsync = promisify(execFile);

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Local Supabase E2E environment is not configured.');
  const host = new URL(url).hostname;
  if (host !== '127.0.0.1' && host !== 'localhost') {
    throw new Error('Product/cart E2E fixtures are restricted to local Supabase.');
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function must<T extends { error: { message: string } | null }>(promise: PromiseLike<T>, label: string) {
  const result = await promise;
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result;
}

export async function setupProductCartFixture() {
  const db = admin();
  await cleanupProductCartFixture(db);

  const categoryResult = await db
    .from('categories')
    .select('id,department_id,departments!inner(slug,status)')
    .eq('status', 'published')
    .eq('departments.status', 'published')
    .order('sort_order')
    .limit(1)
    .single();
  if (categoryResult.error || !categoryResult.data) throw new Error(`E2E category: ${categoryResult.error?.message ?? 'missing'}`);

  const image = await readFile(path.join(process.cwd(), 'public/home/hero/posters/poster-desktop-1280.webp'));
  await must(
    db.storage.from('public-media').upload(E2E.storagePath, image, { contentType: 'image/webp', upsert: true }),
    'E2E image upload',
  );
  const imageUrl = db.storage.from('public-media').getPublicUrl(E2E.storagePath).data.publicUrl;

  await must(db.from('media_assets').insert({
    id: E2E.mediaId, bucket: 'public-media', storage_path: E2E.storagePath, url: imageUrl,
    alt_text: 'Gerçek depolama görseli ile ürün akışı doğrulaması', type: 'image',
    tags: ['e2e', 'product-cart'], linked_entity_type: 'product', linked_entity_id: E2E.productId,
    is_public: true,
  }), 'E2E media row');
  await must(db.from('products').insert({
    id: E2E.productId, category_id: categoryResult.data.id, name: E2E.name, slug: E2E.slug,
    description: 'Supabase verisi, gerçek Storage görseli, varyant, ek seçim ve kişiselleştirmeyi uçtan uca doğrulayan izole ürün.',
    behavior_type: 'proof_required_cart', base_price: 1000, currency: 'TRY', stock_mode: 'in_stock',
    production_time_days: 7, proof_required: true, is_personalizable: true,
    media_ids: [E2E.mediaId], status: 'published', published_at: new Date().toISOString(),
  }), 'E2E product');
  await must(db.from('product_variants').insert([
    { id: E2E.standardVariantId, product_id: E2E.productId, title: 'Standart', sku: 'E2E-STANDARD', price: 1250, stock_quantity: 50, status: 'active', sort_order: 0 },
    { id: E2E.premiumVariantId, product_id: E2E.productId, title: 'Premium', sku: 'E2E-PREMIUM', price: 1500, stock_quantity: 50, status: 'active', sort_order: 1 },
  ]), 'E2E variants');
  await must(db.from('product_addons').insert({
    id: E2E.addonId, product_id: E2E.productId, name_tr: 'Kadife Hediye Kutusu', addon_type: 'gift_wrap',
    price: 100, price_type: 'fixed', is_optional: true, status: 'published', sort_order: 0,
  }), 'E2E addon');
  await must(db.from('product_personalization_fields').insert({
    id: E2E.fieldId, product_id: E2E.productId, label: 'Çift isimleri', field_type: 'text',
    required: true, helper_text: 'Örnek: Ada & Deniz', sort_order: 0,
  }), 'E2E personalization');
  await must(db.from('product_price_tiers').insert({
    id: E2E.tierId, product_id: E2E.productId, variant_id: E2E.premiumVariantId, min_qty: 2, unit_price: 1400,
  }), 'E2E price tier');

  const created = await db.auth.admin.createUser({
    email: E2E.email, password: E2E.password, email_confirm: true,
    user_metadata: { name: 'E2E Müşteri' },
  });
  if (created.error || !created.data.user) throw new Error(`E2E user: ${created.error?.message ?? 'missing'}`);
  const customer = await db.from('customers').select('id').eq('auth_user_id', created.data.user.id).maybeSingle();
  if (customer.error) throw new Error(`E2E customer lookup: ${customer.error.message}`);
  if (!customer.data) {
    await must(db.from('customers').insert({ auth_user_id: created.data.user.id, name: 'E2E Müşteri', email: E2E.email, status: 'active' }), 'E2E customer');
  }

  const legal = await db
    .from('legal_document_versions')
    .select('id,lifecycle_state,approval_status,needs_lawyer_review,content_hash,published_at,effective_from,body,source_metadata,legal_documents!inner(doc_key)')
    .eq('is_current', true)
    .in('legal_documents.doc_key', ['kvkk_aydinlatma', 'on_bilgilendirme', 'mesafeli_satis']);
  if (legal.error || (legal.data?.length ?? 0) !== 3) throw new Error(`E2E legal versions: ${legal.error?.message ?? 'missing'}`);
  await mkdir(path.dirname(LEGAL_STATE_PATH), { recursive: true });
  await writeFile(LEGAL_STATE_PATH, JSON.stringify(legal.data, null, 2), 'utf8');
  for (const version of legal.data ?? []) {
    const ready = version.lifecycle_state === 'published' && version.approval_status === 'approved'
      && !version.needs_lawyer_review && Boolean(version.content_hash) && Boolean(version.published_at)
      && Boolean(version.effective_from) && (version.body as { placeholder?: boolean } | null)?.placeholder !== true;
    if (ready) continue;
    const body = {
      placeholder: false,
      text: 'Yalnızca yerel E2E doğrulaması için kullanılan izole sözleşme metnidir.',
    };
    await must(db.from('legal_document_versions').update({
      lifecycle_state: 'published', approval_status: 'approved', needs_lawyer_review: false,
      published_at: new Date().toISOString(), body,
      content_hash: createHash('sha256').update(JSON.stringify(body)).digest('hex'),
      effective_from: new Date().toISOString().slice(0, 10),
      source_metadata: { source: 'local-product-cart-e2e' },
    }).eq('id', version.id), 'E2E legal readiness');
  }
}

export async function cleanupProductCartFixture(existing?: SupabaseClient) {
  const db = existing ?? admin();
  await restoreLegalState();
  const users = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (users.error) throw new Error(`E2E users cleanup: ${users.error.message}`);
  for (const user of users.data.users.filter((candidate) => candidate.email === E2E.email)) {
    const customer = await db.from('customers').select('id').eq('auth_user_id', user.id).maybeSingle();
    if (customer.data) {
      await db.from('consent_records').delete().eq('customer_id', customer.data.id);
      await db.from('checkout_sessions').delete().eq('customer_id', customer.data.id);
      await db.from('carts').delete().eq('customer_id', customer.data.id);
      await db.from('customers').delete().eq('id', customer.data.id);
    }
    await db.auth.admin.deleteUser(user.id);
  }
  await db.from('products').delete().eq('slug', E2E.slug);
  await db.from('media_assets').delete().eq('id', E2E.mediaId);
  await db.storage.from('public-media').remove([E2E.storagePath]);
}

export function e2eAdmin() { return admin(); }

async function restoreLegalState() {
  let rows: Array<Record<string, unknown>>;
  try { rows = JSON.parse(await readFile(LEGAL_STATE_PATH, 'utf8')) as Array<Record<string, unknown>>; }
  catch { return; }
  const databaseUrl = process.env.E2E_DATABASE_URL;
  if (!databaseUrl || !/127\.0\.0\.1|localhost/.test(databaseUrl)) {
    throw new Error('Local E2E database URL is required to restore legal fixture state.');
  }
  const assignments = rows.map((row) => `
    update public.legal_document_versions set
      lifecycle_state=${sql(row.lifecycle_state)},
      approval_status=${sql(row.approval_status)},
      needs_lawyer_review=${Boolean(row.needs_lawyer_review)},
      content_hash=${sql(row.content_hash)},
      published_at=${sql(row.published_at)}::timestamptz,
      effective_from=${sql(row.effective_from)}::date,
      body=${sql(JSON.stringify(row.body))}::jsonb,
      source_metadata=${sql(JSON.stringify(row.source_metadata))}::jsonb
    where id=${sql(row.id)}::uuid;`).join('\n');
  await execFileAsync('psql', [databaseUrl, '-v', 'ON_ERROR_STOP=1', '-c',
    `set session_replication_role=replica;${assignments}set session_replication_role=origin;`]);
  await rm(LEGAL_STATE_PATH, { force: true });
}

function sql(value: unknown) {
  if (value == null) return 'null';
  return `'${String(value).replaceAll("'", "''")}'`;
}
