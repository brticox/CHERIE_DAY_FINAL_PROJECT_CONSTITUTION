import Link from 'next/link';

import type { ServicePackage } from '@/lib/data/types';
import { ROUTES } from '@/lib/data/routes';
import { serviceBehaviorBadge, servicePrimaryCta, servicePriceLabel } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MediaFrame } from '@/components/commerce/media-frame';

/**
 * Read-only service package detail (docs/41, docs/13 service SEO). CTAs are
 * PLACEHOLDERS — no reservation/quote submission logic in Phase 3.
 */
export function ServiceDetail({ service }: { service: ServicePackage }) {
  const servicePath = `${ROUTES.hizmetler}/${service.slug}`;
  const isQuote = service.behavior_type === 'quote_required';
  const intakeBase = isQuote ? ROUTES.teklif : ROUTES.randevu;
  const intakeParams = new URLSearchParams({
    sourceType: 'service',
    sourceSlug: service.slug,
    sourceLabel: service.name,
    sourcePath: servicePath,
  });
  const contactParams = new URLSearchParams(intakeParams);

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <MediaFrame label={service.name} ratio="aspect-[4/5]" />

      <div>
        <Badge tone="burgundy">{serviceBehaviorBadge(service.behavior_type)}</Badge>
        <h1 className="text-h2 mt-3 text-cherie-ink">{service.name}</h1>
        {service.summary && (
          <p className="text-body-lg mt-3 text-cherie-soft-ink">{service.summary}</p>
        )}
        {service.description && (
          <p className="mt-3 text-cherie-soft-ink">{service.description}</p>
        )}

        <p className="mt-5 font-display text-2xl text-cherie-burgundy">
          {servicePriceLabel(service)}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href={`${intakeBase}?${intakeParams.toString()}`}>
              {servicePrimaryCta(service.behavior_type)}
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href={`${ROUTES.iletisim}?${contactParams.toString()}`}>
              Bu Konsepti Konuşalım
            </Link>
          </Button>
        </div>
        <p className="mt-2 text-xs text-cherie-soft-ink">
          Talebiniz hizmet bağlamıyla birlikte ekibimize iletilir.
        </p>

        <dl className="mt-10 space-y-5 border-t border-cherie-lace pt-6 text-sm">
          <Row term="En erken rezervasyon">{service.min_lead_time_days} gün önceden</Row>
          {service.requires_event_date && <Row term="Etkinlik tarihi">Gerekli</Row>}
          {service.requires_venue && <Row term="Mekân bilgisi">Gerekli</Row>}
          <Row term="Şehir uygunluğu">
            <Link
              href={ROUTES.hizmetlerSehir}
              className="text-cherie-burgundy hover:underline"
            >
              Güncel şehir kapsamını kontrol edin
            </Link>
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
