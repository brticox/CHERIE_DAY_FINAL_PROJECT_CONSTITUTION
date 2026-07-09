import Link from 'next/link';

import { ROUTES } from '@/lib/data/routes';
import type { ServicePackage } from '@/lib/data/types';
import { serviceBehaviorBadge, servicePriceLabel } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { MediaFrame } from '@/components/commerce/media-frame';

export function ServiceCard({ service }: { service: ServicePackage }) {
  return (
    <Link
      href={`${ROUTES.hizmetler}/${service.slug}`}
      className="group overflow-hidden rounded-card border border-cherie-lace bg-cherie-ivory transition-colors duration-card ease-cherie hover:border-cherie-burgundy"
    >
      <MediaFrame label={service.name} ratio="aspect-[16/10]" />
      <div className="p-5">
        <Badge tone="muted">{serviceBehaviorBadge(service.behavior_type)}</Badge>
        <h3 className="mt-3 text-h3 text-cherie-ink group-hover:text-cherie-burgundy">
          {service.name}
        </h3>
        {service.summary && <p className="mt-1 text-sm text-cherie-soft-ink">{service.summary}</p>}
        <p className="mt-3 text-sm font-medium text-cherie-burgundy">
          {servicePriceLabel(service)}
        </p>
      </div>
    </Link>
  );
}
