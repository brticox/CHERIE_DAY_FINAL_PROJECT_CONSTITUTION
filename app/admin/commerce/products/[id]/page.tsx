import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, CircleAlert } from 'lucide-react';
import { ProductForm } from '@/components/admin/product-form';
import { ProductConfiguration } from '@/components/admin/product-configuration';
import { ProductMediaManager } from '@/components/admin/product-media-manager';
import { AdminDate } from '@/components/admin/resource-list';
import { AdminPageHeader, AdminStatus } from '@/components/admin/admin-workspace';
import { adminEventLabel } from '@/lib/admin/presentation';
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
  const { staff } = await requireCapability(
    'catalog.read',
    `/admin/commerce/products/${id}`,
  );
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
    ['Adres kısa adı', /^[a-z0-9]+(-[a-z0-9]+)*$/.test(product.slug)],
    ['Açıklama', (product.description?.trim().length ?? 0) >= 20],
    [
      'Fiyat',
      !['cart_enabled', 'proof_required_cart', 'digital_checkout'].includes(
        product.behavior_type,
      ) || (product.base_price ?? 0) > 0,
    ],
    ['Medya', product.media_ids.length > 0],
  ] as const;
  const readinessScore = Math.round(
    (readiness.filter(([, ready]) => ready).length / readiness.length) * 100,
  );
  return (
    <div className="mx-auto max-w-[1480px] space-y-7 p-4 md:p-7 xl:p-9">
      <Link
        href="/admin/commerce/products"
        className="inline-flex min-h-11 items-center text-sm font-semibold text-cherie-burgundy"
      >
        ← Ürünlere dön
      </Link>
      <AdminPageHeader
        eyebrow="Ürün çalışma alanı"
        title={product.name}
        description={`Yayın hazırlığı %${readinessScore}. İçerik, ticaret, medya ve bulunabilirlik kararlarını tek akışta yönetin.`}
        action={
          <div className="flex flex-col items-end gap-2">
            <AdminStatus value={product.archived_at ? 'archived' : product.status} />
            <span className="text-sm font-semibold tabular-nums text-cherie-burgundy">
              %{readinessScore} hazır
            </span>
          </div>
        }
      />
      {state.saved && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-card border border-cherie-success/25 bg-cherie-success/10 p-4 text-sm font-semibold text-cherie-success"
        >
          <CheckCircle2 className="size-4" aria-hidden="true" />
          Değişiklikler güvenle kaydedildi.
        </p>
      )}
      <nav
        aria-label="Ürün düzenleme bölümleri"
        className="sticky top-20 z-20 -mx-1 overflow-x-auto bg-cherie-ivory/95 px-1 py-3 backdrop-blur"
      >
        <div className="flex min-w-max gap-2">
          {[
            ['#kimlik', 'Kimlik'],
            ['#ticaret', 'Ticaret'],
            ['#medya', 'Medya'],
            ['#secenekler', 'Seçenekler'],
            ['#siniflandirma', 'Malzeme ve renk'],
            ['#seo', 'Arama görünümü'],
            ['#hazirlik', 'Hazırlık ve geçmiş'],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="inline-flex min-h-11 items-center rounded-full border border-cherie-lace bg-white/70 px-4 text-sm font-semibold text-cherie-soft-ink hover:border-cherie-brass hover:text-cherie-burgundy"
            >
              {label}
            </a>
          ))}
        </div>
      </nav>
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
      <section id="hazirlik" className="grid scroll-mt-28 gap-6 lg:grid-cols-2">
        <div className="admin-surface p-5 md:p-7">
          <p className="admin-eyebrow">07 · Son kontrol</p>
          <h2 className="mt-1 font-display text-3xl">Yayın hazırlığı</h2>
          <p className="mt-2 text-sm text-cherie-soft-ink">
            Tamamlanan gereksinimler: {readiness.filter(([, ready]) => ready).length}/
            {readiness.length}
          </p>
          <ul className="mt-4 space-y-2">
            {readiness.map(([label, ok]) => (
              <li
                key={label}
                className="flex min-h-11 items-center justify-between gap-3 border-t border-cherie-lace py-2 text-sm first:border-t-0"
              >
                <span className="flex items-center gap-2">
                  {ok ? (
                    <CheckCircle2
                      className="size-4 text-cherie-success"
                      aria-hidden="true"
                    />
                  ) : (
                    <CircleAlert
                      className="size-4 text-cherie-warning"
                      aria-hidden="true"
                    />
                  )}
                  {label}
                </span>
                <strong className={ok ? 'text-cherie-success' : 'text-cherie-warning'}>
                  {ok ? 'Hazır' : 'Tamamlanmalı'}
                </strong>
              </li>
            ))}
          </ul>
        </div>
        <div className="admin-surface p-5 shadow-none md:p-7">
          <p className="admin-eyebrow">Değişiklik izi</p>
          <h2 className="mt-1 font-display text-3xl">Yayın ve değişiklik geçmişi</h2>
          <ol className="mt-4 space-y-3">
            {(auditQ.data ?? []).map((event) => (
              <li key={event.id} className="border-l-2 border-cherie-lace pl-3 text-sm">
                <strong>{adminEventLabel(event.action)}</strong>
                <p className="text-xs text-cherie-soft-ink">
                  <AdminDate value={event.created_at} />
                </p>
              </li>
            ))}
            {!auditQ.data?.length && (
              <li className="rounded-control bg-cherie-paper/55 p-4 text-sm leading-6 text-cherie-soft-ink">
                Bu ürün için henüz değişiklik kaydı oluşmadı. İlk kaydetme işlemi burada
                tarihçeye eklenecek.
              </li>
            )}
          </ol>
        </div>
      </section>
    </div>
  );
}
