import Link from 'next/link';

import type { Department, Product } from '@/lib/data/types';
import { ROUTES } from '@/lib/data/routes';
import {
  formatTRY,
  productBehaviorBadge,
  productPrimaryCta,
  productionTimeLabel,
} from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MediaFrame } from './media-frame';

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

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {/* Hero media */}
      <div className="space-y-4">
        <MediaFrame label={product.name} ratio="aspect-[4/5]" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <MediaFrame key={i} label={product.name} ratio="aspect-square" />
          ))}
        </div>
      </div>

      {/* Information */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="burgundy">{productBehaviorBadge(product.behavior_type)}</Badge>
          {product.collection_slug && (
            <Link
              href={`${ROUTES.koleksiyonlar}/${product.collection_slug}`}
              className="text-xs text-cherie-brass hover:text-cherie-burgundy"
            >
              {product.collection_slug} koleksiyonu
            </Link>
          )}
        </div>

        <h1 className="mt-3 text-h2 text-cherie-ink">{product.name}</h1>
        {product.description && (
          <p className="mt-3 text-body-lg text-cherie-soft-ink">{product.description}</p>
        )}

        <p className="mt-5 font-display text-3xl text-cherie-burgundy">
          {price ?? 'Teklif ile'}
        </p>

        {/* CTA placeholders (no real cart in Phase 3) */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" size="lg">{productPrimaryCta(product.behavior_type)}</Button>
          <Button type="button" size="lg" variant="secondary">Favorilere Ekle</Button>
        </div>
        <p className="mt-2 text-xs text-cherie-soft-ink">
          Sepet ve ödeme adımları bir sonraki aşamada etkinleşecek.
        </p>

        {/* Information sections */}
        <dl className="mt-10 space-y-5 border-t border-cherie-lace pt-6 text-sm">
          {product.material_story && (
            <Row term="Malzeme">{product.material_story}</Row>
          )}
          {product.is_personalizable && (
            <Row term="Kişiselleştirme">Bu ürün size özel kişiselleştirilebilir.</Row>
          )}
          {product.proof_required && (
            <Row term="Tasarım Onayı">
              Bu ürün Tasarım Onayı ile üretilir. Onayınızdan sonra üretim başlar.
            </Row>
          )}
          {productionTimeLabel(product.production_time_days) && (
            <Row term="Üretim Süresi">{productionTimeLabel(product.production_time_days)}</Row>
          )}
          {product.delivery_note && <Row term="Teslimat">{product.delivery_note}</Row>}
          {product.return_note && <Row term="İade">{product.return_note}</Row>}
          {department && (
            <Row term="Departman">
              <Link
                href={`${ROUTES.magaza}/${department.slug}`}
                className="text-cherie-burgundy hover:underline"
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
    <div className="grid grid-cols-[120px_1fr] gap-4">
      <dt className="text-cherie-brass">{term}</dt>
      <dd className="text-cherie-soft-ink">{children}</dd>
    </div>
  );
}
