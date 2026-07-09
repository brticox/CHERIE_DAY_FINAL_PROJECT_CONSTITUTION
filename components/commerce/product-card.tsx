import Link from 'next/link';

import { ROUTES } from '@/lib/data/routes';
import type { Product } from '@/lib/data/types';
import { formatTRY, productBehaviorBadge } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { MediaFrame } from './media-frame';

export function ProductCard({ product }: { product: Product }) {
  const price = formatTRY(product.base_price);
  return (
    <Link
      href={`${ROUTES.magaza}/${product.department_slug}/${product.slug}`}
      className="group block"
    >
      <div className="relative">
        <MediaFrame label={product.name} />
        <Badge tone="brass" className="absolute left-3 top-3">
          {productBehaviorBadge(product.behavior_type)}
        </Badge>
      </div>
      <h3 className="mt-3 text-sm font-medium text-cherie-ink group-hover:text-cherie-burgundy">
        {product.name}
      </h3>
      <p className="mt-1 text-sm text-cherie-soft-ink">
        {price ?? 'Teklif ile'}
      </p>
    </Link>
  );
}
