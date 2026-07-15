import Link from 'next/link';

import type { Collection, Department, Product } from '@/lib/data/types';
import { ROUTES } from '@/lib/data/routes';
import { formatTRY, productBehaviorBadge, productionTimeLabel } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { ProductGallery } from './product-gallery';
import { ProductOptions } from './product-options';
import { BadgeCheck, Clock3, ShieldCheck } from 'lucide-react';

/**
 * Product decision environment (docs/13 product SEO, docs/26 commerce rules,
 * docs Phase 4D). Media uses the honest ProductGallery; the CTA/cart behaviour
 * lives in ProductOptions (server-validated). This component stays read-only.
 */
export function ProductDetail({
  product,
  department,
  collection,
}: {
  product: Product;
  department: Department | null;
  collection?: Collection | null;
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
      {/* Media */}
      <ProductGallery
        name={product.name}
        media={product.media ?? []}
        palette={collection?.palette ?? []}
        materialStory={product.material_story}
      />

      {/* Information */}
      <div className="lg:sticky lg:top-28 lg:h-fit">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="burgundy">{productBehaviorBadge(product.behavior_type)}</Badge>
          {product.collection_slug && (
            <Link
              href={`${ROUTES.koleksiyonlar}/${product.collection_slug}`}
              className="inline-flex min-h-11 min-w-11 items-center text-xs text-cherie-brass hover:text-cherie-burgundy"
            >
              {collection?.name ?? product.collection_slug} koleksiyonu
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

        {/* Reassurance */}
        <section className="mt-8">
          <h2 className="text-h3 text-cherie-ink">Merak edilenler</h2>
          <div className="mt-4 divide-y divide-cherie-lace border-y border-cherie-lace">
            {reassuranceFaqs(product).map((faq, i) => (
              <details key={i} className="group py-3.5">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-medium text-cherie-ink [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <span className="text-cherie-brass transition-transform duration-control ease-cherie group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-2 text-sm leading-6 text-cherie-soft-ink">{faq.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-4 text-xs text-cherie-soft-ink">
            Başka bir sorunuz mu var?{' '}
            <Link href={ROUTES.iletisim} className="text-cherie-burgundy hover:underline">
              Bize danışın
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}

function reassuranceFaqs(product: Product): { q: string; a: string }[] {
  const faqs: { q: string; a: string }[] = [];

  if (product.behavior_type === 'quote_required') {
    faqs.push({
      q: 'Fiyat nasıl belirleniyor?',
      a: 'Bu ürün ölçü, adet ve konsepte göre değiştiğinden size özel bir teklif hazırlıyoruz. “Teklif Al” adımından detayları paylaşmanız yeterli.',
    });
  } else if (product.behavior_type === 'inquiry_only') {
    faqs.push({
      q: 'Nasıl sipariş veririm?',
      a: 'Bu parça için önce sizinle bir görüşme planlıyor, ihtiyaçlarınızı birlikte netleştiriyoruz. “Randevu Al” ile başlayabilirsiniz.',
    });
  } else {
    faqs.push({
      q: 'Gördüğüm fiyatı mı öderim?',
      a: 'Evet. Fiyat, seçimlerinizle birlikte hem sepete eklerken hem ödeme adımında sunucuda doğrulanır; sürpriz olmaz.',
    });
  }

  if (product.proof_required) {
    faqs.push({
      q: 'Baskıdan önce tasarımı görebilir miyim?',
      a: 'Evet. Kişiye özel ürünlerde tasarımı onayınıza sunarız; onaylamadan üretim başlamaz.',
    });
  } else if (product.is_personalizable) {
    faqs.push({
      q: 'Ürünü kişiselleştirebilir miyim?',
      a: 'Evet. İstenen bilgileri sipariş sırasında girebilir, ürünü size özel hâle getirebilirsiniz.',
    });
  }

  const production = productionTimeLabel(product.production_time_days);
  if (production) {
    faqs.push({
      q: 'Ne kadar sürede hazır olur?',
      a: `${production}. Kişiye özel ürünlerde bu süre, tasarım onayınızdan sonra başlar.`,
    });
  }

  if (product.return_note) {
    faqs.push({ q: 'İade koşulları nedir?', a: product.return_note });
  }

  return faqs.slice(0, 4);
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
