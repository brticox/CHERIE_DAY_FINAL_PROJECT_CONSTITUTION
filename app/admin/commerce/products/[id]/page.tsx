import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductForm } from '@/components/admin/product-form';
import { ProductConfiguration } from '@/components/admin/product-configuration';
import { ProductMediaManager } from '@/components/admin/product-media-manager';
import { AdminDate } from '@/components/admin/resource-list';
import { requireCapability } from '@/lib/auth/guards';
import { can } from '@/lib/admin/permissions';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { id } = await params;
  const state = await searchParams;
  const { staff } = await requireCapability('catalog.read', `/admin/commerce/products/${id}`);
  const db = createAdminClient();
  const [
    productQ,
    categoriesQ,
    collectionsQ,
    variantsQ,
    addonsQ,
    fieldsQ,
    tiersQ,
    materialsQ,
    colorsQ,
    productMaterialsQ,
    productColorsQ,
    assetsQ,
    auditQ,
  ] = await Promise.all([
    db.from('products').select('*').eq('id', id).single(),
    db.from('categories').select('id,name').order('name'),
    db.from('collections').select('id,name').order('name'),
    db.from('product_variants').select('*').eq('product_id', id).order('sort_order'),
    db.from('product_addons').select('*').eq('product_id', id).order('sort_order'),
    db
      .from('product_personalization_fields')
      .select('*')
      .eq('product_id', id)
      .order('sort_order'),
    db.from('product_price_tiers').select('*').eq('product_id', id).order('min_qty'),
    db.from('materials').select('id,name_tr').order('sort_order'),
    db.from('colors').select('id,name_tr,hex').order('sort_order'),
    db.from('product_materials').select('material_id').eq('product_id', id),
    db.from('product_colors').select('color_id').eq('product_id', id),
    db
      .from('media_assets')
      .select('id,title,alt_text,url')
      .is('archived_at', null)
      .eq('type', 'image')
      .order('created_at', { ascending: false })
      .limit(200),
    db
      .from('audit_log')
      .select('id,action,created_at,diff')
      .eq('entity_type', 'product')
      .eq('entity_id', id)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);
  const product = productQ.data;
  if (!product) notFound();
  const seo = product.seo_metadata_id
    ? (
        await db
          .from('seo_metadata')
          .select('title,description,canonical_url,schema_type,noindex')
          .eq('id', product.seo_metadata_id)
          .maybeSingle()
      ).data
    : null;
  const readiness = [
    ['Ad', product.name.trim().length >= 3],
    ['Slug', /^[a-z0-9]+(-[a-z0-9]+)*$/.test(product.slug)],
    ['Açıklama', (product.description?.trim().length ?? 0) >= 20],
    [
      'Fiyat',
      !['cart_enabled', 'proof_required_cart', 'digital_checkout'].includes(
        product.behavior_type,
      ) || (product.base_price ?? 0) > 0,
    ],
    ['Medya', product.media_ids.length > 0],
  ] as const;
  return (
    <div className="mx-auto max-w-[1380px] space-y-6 p-4 md:p-7 xl:p-9">
      <header>
        <Link
          href="/admin/commerce/products"
          className="text-sm text-cherie-burgundy hover:underline"
        >
          ← Ürünlere dön
        </Link>
        <div className="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-cherie-brass">
              Ürün kaydı
            </p>
            <h1 className="font-display text-4xl">{product.name}</h1>
          </div>
          {state.saved && (
            <p
              role="status"
              className="rounded-control bg-cherie-success/10 px-4 py-2 text-sm font-semibold text-cherie-success"
            >
              Değişiklikler kaydedildi.
            </p>
          )}
        </div>
      </header>
      <ProductForm
        product={product}
        categories={(categoriesQ.data ?? []).map((x) => ({ id: x.id, label: x.name }))}
        collections={(collectionsQ.data ?? []).map((x) => ({ id: x.id, label: x.name }))}
        canPublish={can(staff.role, 'catalog.publish')}
        error={state.error}
      />
      <ProductMediaManager
        productId={id}
        assets={(assetsQ.data ?? []).map((x) => ({
          id: x.id,
          label: x.title || x.alt_text || 'Başlıksız medya',
          url: x.url,
          alt: x.alt_text,
        }))}
        initialIds={product.media_ids}
      />
      <ProductConfiguration
        productId={id}
        variants={variantsQ.data ?? []}
        addons={addonsQ.data ?? []}
        fields={fieldsQ.data ?? []}
        tiers={tiersQ.data ?? []}
        materials={materialsQ.data ?? []}
        colors={colorsQ.data ?? []}
        selectedMaterials={(productMaterialsQ.data ?? []).map((x) => x.material_id)}
        selectedColors={(productColorsQ.data ?? []).map((x) => x.color_id)}
        seo={seo}
        product={product}
      />
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-card-lg border border-cherie-lace p-5">
          <h2 className="font-display text-2xl">Yayın hazırlığı</h2>
          <ul className="mt-4 space-y-2">
            {readiness.map(([label, ok]) => (
              <li key={label} className="flex items-center justify-between text-sm">
                <span>{label}</span>
                <strong className={ok ? 'text-cherie-success' : 'text-cherie-error'}>
                  {ok ? 'Hazır' : 'Eksik'}
                </strong>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-card-lg border border-cherie-lace p-5">
          <h2 className="font-display text-2xl">Yayın ve değişiklik geçmişi</h2>
          <ol className="mt-4 space-y-3">
            {(auditQ.data ?? []).map((event) => (
              <li key={event.id} className="border-l-2 border-cherie-lace pl-3 text-sm">
                <strong>{event.action}</strong>
                <p className="text-xs text-cherie-soft-ink">
                  <AdminDate value={event.created_at} />
                </p>
              </li>
            ))}
            {!auditQ.data?.length && (
              <li className="text-sm text-cherie-soft-ink">Henüz kayıt yok.</li>
            )}
          </ol>
        </div>
      </section>
    </div>
  );
}
