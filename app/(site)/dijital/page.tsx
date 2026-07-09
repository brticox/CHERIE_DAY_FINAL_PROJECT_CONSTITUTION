import type { Metadata } from 'next';

import { getDigitalProducts } from '@/lib/data/digital';
import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { formatTRY } from '@/lib/format';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { MediaFrame } from '@/components/commerce/media-frame';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = buildMetadata({
  title: 'Dijital Davetiye & Deneyimler | CHERIE DAY',
  description:
    'Işıkla yazılan davetler: dijital davetiye, web davetiye, QR kart ve daha fazlası.',
  path: ROUTES.dijital,
});

export default async function DijitalPage() {
  const digital = await getDigitalProducts();
  return (
    <div className="cherie-container py-14">
      <Breadcrumbs items={[{ name: 'Ana Sayfa', path: ROUTES.home }, { name: 'Dijital', path: ROUTES.dijital }]} />
      <PageHeader
        eyebrow="Dijital Deneyimler"
        title="Sevginiz artık ışıkla da yazılır"
        lead="Dijital davetiyenizi dakikalar içinde oluşturun, sevdiklerinize tek bir bağlantıyla ulaştırın."
      />
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {digital.map((d) => (
          <div key={d.id} className="overflow-hidden rounded-card border border-cherie-lace bg-cherie-ivory">
            <MediaFrame label={d.name_tr} ratio="aspect-[16/10]" />
            <div className="p-5">
              <Badge tone="muted">Dijital</Badge>
              <h3 className="mt-3 text-h3 text-cherie-ink">{d.name_tr}</h3>
              {d.summary && <p className="mt-1 text-sm text-cherie-soft-ink">{d.summary}</p>}
              <p className="mt-3 text-sm font-medium text-cherie-burgundy">
                {formatTRY(d.base_price) ?? 'Teklif ile'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
