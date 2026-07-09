import type { Metadata } from 'next';
import Link from 'next/link';

import { getPortfolio } from '@/lib/data/editorial';
import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { MediaFrame } from '@/components/commerce/media-frame';

export const metadata: Metadata = buildMetadata({
  title: 'Hatıra — Fotoğraf & Film | CHERIE DAY',
  description:
    'Gerçek bahçelerde, gerçek hikâyeler. Fotoğraf, film ve kısa anlatılarla anlarınızı saklıyoruz.',
  path: ROUTES.hatira,
});

const HATIRA_TYPES = [
  { slug: 'photo', title: 'Fotoğraf', desc: 'Bir bakış, bir kare, kalıcı bir an.' },
  { slug: 'film', title: 'Film', desc: 'Gününüz, sinematik bir anlatıya dönüşür.' },
  { slug: 'drone', title: 'Drone', desc: 'Bahçeye yukarıdan bakan bir gözle.' },
  { slug: 'reels', title: 'Reels', desc: 'Kısa, hızlı, paylaşılası anlar.' },
  { slug: 'love-story', title: 'Love Story', desc: 'İkinizin hikâyesi, kendi diliyle.' },
  { slug: 'event-trailer', title: 'Etkinlik Filmi', desc: 'Günün özeti, bir fragman gibi.' },
];

export default async function HatiraPage() {
  const portfolio = await getPortfolio();
  return (
    <div className="cherie-container py-14">
      <Breadcrumbs items={[{ name: 'Ana Sayfa', path: ROUTES.home }, { name: 'Hatıra', path: ROUTES.hatira }]} />
      <PageHeader
        eyebrow="Hatıra Evi"
        title="Gerçek bahçelerde, gerçek hikâyeler yeşerdi"
        lead="CHERIE DAY film ekibiyle anlarınızı fotoğraf, film ve kısa anlatılarla saklıyoruz."
      />

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {HATIRA_TYPES.map((t) => (
          <div key={t.slug} className="rounded-card border border-cherie-lace bg-cherie-ivory p-4">
            <MediaFrame label={t.title} ratio="aspect-[16/10]" />
            <h3 className="mt-4 text-h3 text-cherie-ink">{t.title}</h3>
            <p className="mt-1 text-sm text-cherie-soft-ink">{t.desc}</p>
          </div>
        ))}
      </div>

      {portfolio.length > 0 && (
        <section className="mt-16">
          <h2 className="text-h3 text-cherie-ink">Seçilmiş Projeler</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {portfolio.map((p) => (
              <div key={p.id} className="rounded-card border border-cherie-lace bg-cherie-ivory p-4">
                <MediaFrame label={p.title} ratio="aspect-[4/3]" />
                <h3 className="mt-3 font-medium text-cherie-ink">{p.title}</h3>
                <p className="mt-1 text-sm text-cherie-soft-ink">
                  {[p.event_type, p.city].filter(Boolean).join(' · ')}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="mt-12 text-sm text-cherie-soft-ink">
        Çekim planlamak için{' '}
        <Link href={ROUTES.teklif} className="text-cherie-burgundy hover:underline">Teklif Al</Link>{' '}
        adımından bize ulaşabilirsiniz.
      </p>
    </div>
  );
}
