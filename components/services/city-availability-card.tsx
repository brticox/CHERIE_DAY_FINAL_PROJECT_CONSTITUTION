import Link from 'next/link';

import { ROUTES } from '@/lib/data/routes';
import type { ServiceCity } from '@/lib/data/types';
import { Badge } from '@/components/ui/badge';

const FEE_LABELS: Record<ServiceCity['travel_fee_model'], string> = {
  none: 'Ulaşım katkısı yok',
  fixed: 'Sabit ulaşım katkısı',
  per_km: 'Mesafeye göre ulaşım',
  quote: 'Ulaşım teklife göre',
};

export function CityAvailabilityCard({
  city,
  packageCount,
}: {
  city: ServiceCity;
  packageCount?: number;
}) {
  return (
    <Link
      href={`${ROUTES.hizmetlerSehir}/${city.city_slug}`}
      className="group block rounded-card border border-cherie-lace bg-cherie-ivory p-5 transition-colors duration-card ease-cherie hover:border-cherie-burgundy"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-h3 text-cherie-ink group-hover:text-cherie-burgundy">
          {city.city_name}
        </h3>
        <Badge tone="muted">{FEE_LABELS[city.travel_fee_model]}</Badge>
      </div>
      {city.notes_tr && <p className="mt-2 text-sm text-cherie-soft-ink">{city.notes_tr}</p>}
      {typeof packageCount === 'number' && (
        <p className="mt-3 text-sm text-cherie-brass">{packageCount} hizmet mevcut</p>
      )}
    </Link>
  );
}
