import Link from 'next/link';

import type { Department, Product } from '@/lib/data/types';
import { ROUTES } from '@/lib/data/routes';
import { formatTRY, productBehaviorBadge, productionTimeLabel } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { MediaFrame } from './media-frame';
import { ProductOptions } from './product-options';
import { BadgeCheck, Clock3, ShieldCheck } from 'lucide-react';

/**
 * Read-only product detail (docs/13 product SEO, docs/26 commerce rules).
 * CTAs are PLACEHOLDERS — no cart/checkout/customization logic in Phase 3.
 */
export function ProductDetail({
  product,
  department,
}: {
  product: Product;
  department: Department | null;
}) {
  const price = formatTRY(product.base_price);
  const productPath = `${ROUTES.magaza}/${product.department_slug}/${product.slug}`;
  const isQuote = product.behavior_type === 'quote_required';
  const isAppointment = product.behavior_type === 'inquiry_only';
  const intakeBase = isQuote
    ? ROUTES.teklif
    : isAppointment
      ? ROUTES.randevu
      : ROUTES.iletisim;
  const intakeParams = new URLSearchParams({
    sourceType: 'product',
    sourceSlug: product.slug,
    sourceLabel: product.name,
    sourcePath: productPath,
  });
  const primaryLabel = isQuote
    ? 'Teklif Al'
    : isAppointment
      ? 'Randevu Al'
      : 'Ürün Hakkında Sor';

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(24rem,0.92fr)] lg:gap-16">
      {/* Hero media */}
      <div className="space-y-4">
        <MediaFrame
          label={product.name}
          src={product.media?.[0]?.url}
          alt={product.media?.[0]?.alt_text ?? product.name}
          ratio="aspect-[4/5]"
          className="relative"
        />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <MediaFrame
              key={i}
              label={product.name}
              src={product.media?.[i + 1]?.url}
              alt={
                product.media?.[i + 1]?.alt_text ?? `${product.name} — görünüm ${i + 2}`
              }
              ratio="aspect-square"
              className="relative"
            />
          ))}
        </div>
      </div>

      {/* Information */}
      <div className="lg:sticky lg:top-28 lg:h-fit">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="burgundy">{productBehaviorBadge(product.behavior_type)}</Badge>
          {product.collection_slug && (
            <Link
              href={`${ROUTES.koleksiyonlar}/${product.collection_slug}`}
              className="inline-flex min-h-11 min-w-11 items-center text-xs text-cherie-brass hover:text-cherie-burgundy"
            >
              {product.collection_slug} koleksiyonu
            </Link>
          )}
        </div>

        <h1 className="text-h1 mt-4 text-balance text-cherie-ink">{product.name}</h1>
        {product.description && (
          <p className="mt-4 max-w-xl text-lg leading-8 text-cherie-soft-ink">
            {product.description}
          </p>
        )}

        <p className="cherie-price mt-6 font-display text-4xl text-cherie-burgundy">
          {price ?? 'Teklif ile'}
        </p>

        <div className="mt-6 grid gap-3 border-y border-cherie-lace py-5 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          <TrustItem
            Icon={BadgeCheck}
            label={
              product.proof_required ? 'Tasarım onaylı üretim' : 'Özenle hazırlanan seçim'
            }
          />
          <TrustItem
            Icon={Clock3}
            label={
              productionTimeLabel(product.production_time_days) ??
              'Süre ekipçe netleştirilir'
            }
          />
          <TrustItem Icon={ShieldCheck} label="Fiyat sunucuda doğrulanır" />
        </div>

        <ProductOptions
          product={product}
          intakePath={intakeBase}
          baseParams={intakeParams.toString()}
          primaryLabel={primaryLabel}
        />

        {/* Information sections */}
        <dl className="mt-8 space-y-5 rounded-card-lg border border-cherie-lace bg-cherie-ivory/70 p-5 text-sm">
          {product.material_story && <Row term="Malzeme">{product.material_story}</Row>}
          {(product.materials?.length ?? 0) > 0 && (
            <Row term="Materyaller">
              {product.materials?.map((item) => item.name_tr).join(', ')}
            </Row>
          )}
          {(product.colors?.length ?? 0) > 0 && (
            <Row term="Renkler">
              <span className="flex flex-wrap gap-2">
                {product.colors?.map((color) => (
                  <span
                    key={color.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-cherie-lace px-2.5 py-1 text-xs"
                  >
                    {color.hex && (
                      <span
                        className="size-3 rounded-full border border-black/10"
                        style={{ backgroundColor: color.hex }}
                      />
                    )}
                    {color.name_tr}
                  </span>
                ))}
              </span>
            </Row>
          )}
          {product.is_personalizable && (
            <Row term="Kişiselleştirme">Bu ürün size özel kişiselleştirilebilir.</Row>
          )}
          {(product.personalization_fields?.length ?? 0) > 0 && (
            <Row term="İstenen bilgiler">
              {product.personalization_fields
                ?.map((field) => `${field.label}${field.required ? ' *' : ''}`)
                .join(', ')}
            </Row>
          )}
          {product.proof_required && (
            <Row term="Tasarım Onayı">
              Bu ürün Tasarım Onayı ile üretilir. Onayınızdan sonra üretim başlar.
            </Row>
          )}
          {productionTimeLabel(product.production_time_days) && (
            <Row term="Üretim Süresi">
              {productionTimeLabel(product.production_time_days)}
            </Row>
          )}
          {product.delivery_note && <Row term="Teslimat">{product.delivery_note}</Row>}
          {product.return_note && <Row term="İade">{product.return_note}</Row>}
          {department && (
            <Row term="Departman">
              <Link
                href={`${ROUTES.magaza}/${department.slug}`}
                className="inline-flex min-h-11 min-w-11 items-center text-cherie-burgundy hover:underline"
              >
                {department.name_tr}
              </Link>
            </Row>
          )}
        </dl>
      </div>
    </div>
  );
}

function Row({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[130px_1fr] sm:gap-4">
      <dt className="font-semibold text-cherie-ink">{term}</dt>
      <dd className="text-cherie-soft-ink">{children}</dd>
    </div>
  );
}

function TrustItem({ Icon, label }: { Icon: typeof ShieldCheck; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs leading-5 text-cherie-soft-ink">
      <Icon className="size-4 shrink-0 text-cherie-brass" strokeWidth={1.6} />
      <span>{label}</span>
    </div>
  );
}
