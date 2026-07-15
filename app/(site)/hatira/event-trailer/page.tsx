import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { OfferingDetail } from '@/components/content/offering-detail';

export const metadata: Metadata = buildMetadata({
  title: 'Etkinlik Filmi | Hatıra — CHERIE DAY',
  description:
    'Günün özeti, bir fragman gibi. Kutlamanızın en güzel anlarını kısa, etkileyici bir tanıtım filmine dönüştürüyoruz.',
  path: `${ROUTES.hatira}/event-trailer`,
});

export default function EventTrailerPage() {
  return (
    <OfferingDetail
      breadcrumbs={[
        { name: 'Ana Sayfa', path: ROUTES.home },
        { name: 'Hatıra', path: ROUTES.hatira },
        { name: 'Etkinlik Filmi', path: `${ROUTES.hatira}/event-trailer` },
      ]}
      eyebrow="Hatıra"
      title="Günün özeti, bir fragman gibi"
      lead="Uzun filmi beklemeden paylaşabileceğiniz, kısa ve etkileyici bir tanıtım. Kutlamanızın ruhunu bir dakikaya sığdıran, ilk gösterime hazır bir özet."
      highlights={[
        { title: 'Kısa & etkileyici', body: 'En güçlü anlar, akıcı bir ritimde bir araya gelir.' },
        { title: 'Hızlı paylaşım', body: 'Tam film hazır olmadan önce ilk özet elinizde olur.' },
        { title: 'Kurumsal & özel', body: 'Düğün, nişan ya da kurumsal etkinlik için uyarlanır.' },
      ]}
      priceLabel="Teklif ile"
      primaryCta={{ label: 'Etkinlik Filmi İçin Teklif Al', href: `${ROUTES.teklif}?sourceType=hatira&sourceSlug=event-trailer&sourceLabel=${encodeURIComponent('Etkinlik Filmi')}` }}
      secondaryCta={{ label: 'Diğer Formatlar', href: ROUTES.hatira }}
      note="Genellikle film hizmetinin bir parçası olarak sunulur; kapsam teklifte netleşir."
    />
  );
}
