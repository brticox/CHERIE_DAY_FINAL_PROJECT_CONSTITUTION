import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { OfferingDetail } from '@/components/content/offering-detail';

export const metadata: Metadata = buildMetadata({
  title: 'Drone Çekimi | Hatıra — CHERIE DAY',
  description:
    'Bahçeye yukarıdan bakan bir gözle. Mekânı ve kalabalığı bütün olarak gösteren, gününüze genişlik katan hava çekimleri.',
  path: `${ROUTES.hatira}/drone`,
});

export default function DronePage() {
  return (
    <OfferingDetail
      breadcrumbs={[
        { name: 'Ana Sayfa', path: ROUTES.home },
        { name: 'Hatıra', path: ROUTES.hatira },
        { name: 'Drone', path: `${ROUTES.hatira}/drone` },
      ]}
      eyebrow="Hatıra"
      title="Bahçeye yukarıdan bakan bir gözle"
      lead="Mekânın bütününü, kalabalığın sıcaklığını ve manzarayı tek bir kareye sığdıran hava çekimleri. Filminize genişlik, fotoğraflarınıza yeni bir bakış açısı katar."
      highlights={[
        { title: 'Geniş açı', body: 'Mekânı ve kalabalığı bütün olarak gösteren kareler.' },
        { title: 'Filmle bütünlük', body: 'Hava görüntüleri yer çekimleriyle aynı dilde kurgulanır.' },
        { title: 'Manzara vurgusu', body: 'Bahçe, kıyı ya da şehrin dokusunu öne çıkarır.' },
      ]}
      priceLabel="Teklif ile"
      primaryCta={{ label: 'Drone İçin Teklif Al', href: `${ROUTES.teklif}?sourceType=hatira&sourceSlug=drone&sourceLabel=Drone` }}
      secondaryCta={{ label: 'Diğer Formatlar', href: ROUTES.hatira }}
      note="Drone çekimi hava koşulları ve mekânın uçuş izinlerine bağlıdır; uygunluğu birlikte değerlendiririz."
    />
  );
}
