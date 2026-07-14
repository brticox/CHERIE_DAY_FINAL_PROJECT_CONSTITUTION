import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { OfferingDetail } from '@/components/content/offering-detail';

export const metadata: Metadata = buildMetadata({
  title: 'Love Story | Hatıra — CHERIE DAY',
  description:
    'İkinizin hikâyesi, kendi diliyle. Düğün öncesi çekilen, size özel bir anlatı; davetinizde ve web sitenizde de yaşar.',
  path: `${ROUTES.hatira}/love-story`,
});

export default function LoveStoryPage() {
  return (
    <OfferingDetail
      breadcrumbs={[
        { name: 'Ana Sayfa', path: ROUTES.home },
        { name: 'Hatıra', path: ROUTES.hatira },
        { name: 'Love Story', path: `${ROUTES.hatira}/love-story` },
      ]}
      eyebrow="Hatıra"
      title="İkinizin hikâyesi, kendi diliyle"
      lead="Düğünden önce, sizi siz yapan yerlerde çekilen kısa bir anlatı. Davetinizin girişinde, web sitenizde ya da gecenin açılışında güzel bir ilk söz olur."
      highlights={[
        { title: 'Size özel senaryo', body: 'Hikâyenizi dinler, size yakışan sade bir kurgu kurarız.' },
        { title: 'Anlamlı mekânlar', body: 'Sizin için değerli yerlerde, rahat bir çekim.' },
        { title: 'Çok amaçlı kullanım', body: 'Web sitesi, dijital davetiye ve gece açılışında kullanılabilir.' },
      ]}
      priceLabel="Teklif ile"
      primaryCta={{ label: 'Love Story İçin Teklif Al', href: `${ROUTES.teklif}?sourceType=hatira&sourceSlug=love-story&sourceLabel=${encodeURIComponent('Love Story')}` }}
      secondaryCta={{ label: 'Düğün Web Sitesi', href: `${ROUTES.dijital}/dugun-web-sitesi` }}
      note="Düğün öncesi planlanır; tarih ve mekân için erken görüşmek en rahatıdır."
    />
  );
}
