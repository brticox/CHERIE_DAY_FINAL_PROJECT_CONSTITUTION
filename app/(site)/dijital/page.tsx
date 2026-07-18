import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { getDigitalProducts } from '@/lib/data/digital';
import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { formatTRY } from '@/lib/format';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { MediaFrame } from '@/components/commerce/media-frame';
import { Badge } from '@/components/ui/badge';

const DIGITAL_FEATURES = [
  { title: 'Dijital Davetiye', desc: 'Işıkla yazılan, güncellenebilir davet.', href: `${ROUTES.dijital}/dijital-davetiye` },
  { title: 'Düğün Web Sitesi', desc: 'Program, mekân ve RSVP tek bağlantıda.', href: `${ROUTES.dijital}/dugun-web-sitesi` },
  { title: 'QR Kart', desc: 'Davete, menüye ya da albüme tek dokunuş.', href: `${ROUTES.dijital}/qr` },
  { title: 'RSVP', desc: 'Katılım yanıtları zahmetsizce toplanır.', href: `${ROUTES.dijital}/rsvp` },
  { title: 'Misafir Listesi', desc: 'Katılım ve masa notları tek panoda.', href: `${ROUTES.dijital}/misafir-listesi` },
];

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

      <section className="mt-20 border-t border-cherie-lace pt-14">
        <p className="cherie-kicker">Dijital çözümler</p>
        <h2 className="text-h2 mt-3 text-cherie-ink">Her davete uygun bir dijital yol</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {DIGITAL_FEATURES.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="group flex items-start justify-between gap-4 rounded-card border border-cherie-lace bg-cherie-ivory p-6 transition-colors duration-card ease-cherie hover:border-cherie-burgundy"
            >
              <span>
                <span className="block text-h3 text-cherie-ink group-hover:text-cherie-burgundy">
                  {f.title}
                </span>
                <span className="mt-1 block text-sm text-cherie-soft-ink">{f.desc}</span>
              </span>
              <ArrowUpRight className="mt-1 size-5 shrink-0 text-cherie-brass transition-transform duration-control ease-cherie group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
