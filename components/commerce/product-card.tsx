import Link from 'next/link';

import { ROUTES } from '@/lib/data/routes';
import type { Product } from '@/lib/data/types';
import { formatTRY, productBehaviorBadge, productionTimeLabel } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { MediaFrame } from './media-frame';
import { FavoriteButton } from './favorite-button';
import { ArrowUpRight, Clock3 } from 'lucide-react';

export function ProductCard({ product }: { product: Product }) {
  const price = formatTRY(product.base_price);
  return (
    // `group relative` hosts the navigation Link and the save control as
    // SIBLINGS. The save button is not inside the Link, so tapping it can never
    // trigger navigation (it also stops propagation defensively).
    <div className="group relative">
      <Link
        href={`${ROUTES.magaza}/${product.department_slug}/${product.slug}`}
        className="block rounded-card-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <div className="relative overflow-hidden rounded-card-lg bg-cherie-paper">
          <MediaFrame
            label={product.name}
            src={product.media?.[0]?.url}
            alt={product.media?.[0]?.alt_text ?? product.name}
            className="relative border-0 transition duration-card ease-cherie group-hover:scale-[1.015]"
          />
          <Badge tone="brass" className="absolute left-3 top-3">
            {productBehaviorBadge(product.behavior_type)}
          </Badge>
          <span className="absolute bottom-3 right-3 grid size-10 translate-y-2 place-items-center rounded-full bg-cherie-ivory text-cherie-burgundy opacity-0 shadow-card transition duration-card ease-cherie group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight className="size-4" />
          </span>
        </div>
        <h3 className="mt-4 text-base font-semibold leading-snug text-cherie-ink transition-colors group-hover:text-cherie-burgundy">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center justify-between gap-2 border-t border-cherie-lace/70 pt-3">
          <p className="cherie-price text-sm font-bold text-cherie-burgundy">
            {price ?? 'Teklif ile'}
          </p>
          <p className="flex items-center gap-1 text-right text-[11px] text-cherie-soft-ink">
            <Clock3 className="size-3" />
            {product.stock_mode === 'unavailable'
              ? 'Şu an sunulmuyor'
              : productionTimeLabel(product.production_time_days)}
          </p>
        </div>
      </Link>
      <div className="absolute right-3 top-3">
        <FavoriteButton productId={product.id} productName={product.name} variant="card" />
      </div>
    </div>
  );
}
