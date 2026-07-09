import type { ServiceCity, ServicePackage } from '@/lib/data/types';
import { serviceBehaviorBadge, servicePrimaryCta, servicePriceLabel } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MediaFrame } from '@/components/commerce/media-frame';

/**
 * Read-only service package detail (docs/41, docs/13 service SEO). CTAs are
 * PLACEHOLDERS — no reservation/quote submission logic in Phase 3.
 */
export function ServiceDetail({
  service,
  cities,
}: {
  service: ServicePackage;
  cities: ServiceCity[];
}) {
  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <MediaFrame label={service.name} ratio="aspect-[4/5]" />

      <div>
        <Badge tone="burgundy">{serviceBehaviorBadge(service.behavior_type)}</Badge>
        <h1 className="mt-3 text-h2 text-cherie-ink">{service.name}</h1>
        {service.summary && (
          <p className="mt-3 text-body-lg text-cherie-soft-ink">{service.summary}</p>
        )}
        {service.description && (
          <p className="mt-3 text-cherie-soft-ink">{service.description}</p>
        )}

        <p className="mt-5 font-display text-2xl text-cherie-burgundy">
          {servicePriceLabel(service)}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" size="lg">{servicePrimaryCta(service.behavior_type)}</Button>
          <Button type="button" size="lg" variant="secondary">Bu Konsepti Konuşalım</Button>
        </div>
        <p className="mt-2 text-xs text-cherie-soft-ink">
          Rezervasyon ve teklif adımları bir sonraki aşamada etkinleşecek.
        </p>

        <dl className="mt-10 space-y-5 border-t border-cherie-lace pt-6 text-sm">
          <Row term="En erken rezervasyon">{service.min_lead_time_days} gün önceden</Row>
          {service.requires_event_date && <Row term="Etkinlik tarihi">Gerekli</Row>}
          {service.requires_venue && <Row term="Mekân bilgisi">Gerekli</Row>}
          <Row term="Şehir kapsamı">
            {cities.map((c) => c.city_name).join(' · ') || 'Şehir bilgisi yakında'}
          </Row>
        </dl>
      </div>
    </div>
  );
}

function Row({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-4">
      <dt className="text-cherie-brass">{term}</dt>
      <dd className="text-cherie-soft-ink">{children}</dd>
    </div>
  );
}
