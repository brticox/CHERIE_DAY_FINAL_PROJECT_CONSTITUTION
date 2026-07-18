import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { OfferingDetail } from '@/components/content/offering-detail';

export const metadata: Metadata = buildMetadata({
  title: 'Fotoğraf | Hatıra — CHERIE DAY',
  description:
    'Bir bakış, bir kare, kalıcı bir an. CHERIE DAY film ekibiyle gününüzü doğal, sinematik fotoğraflarla saklıyoruz.',
  path: `${ROUTES.hatira}/photo`,
});

export default function PhotoPage() {
  return (
    <OfferingDetail
      breadcrumbs={[
        { name: 'Ana Sayfa', path: ROUTES.home },
        { name: 'Hatıra', path: ROUTES.hatira },
        { name: 'Fotoğraf', path: `${ROUTES.hatira}/photo` },
      ]}
      eyebrow="Hatıra"
      title="Bir bakış, bir kare, kalıcı bir an"
      lead="Poz veren değil, yaşanan anları çekiyoruz. Günün doğal akışında, sizi siz yapan detayları sinematik bir gözle kalıcı hâle getiriyoruz."
      highlights={[
        { title: 'Gerçek anlar', body: 'Kurgusuz, yaşanmış kareler; günün asıl duygusu.' },
        { title: 'Sinematik ışık', body: 'Mekânın ve saatin ışığını fotoğrafın diline çeviririz.' },
        { title: 'Özenli düzenleme', body: 'Seçili kareler renk ve ton olarak tek bir dile getirilir.' },
        { title: 'Yüksek çözünürlük', body: 'Baskıya ve albüme uygun, arşivlik dosyalar.' },
      ]}
      priceLabel="Teklif ile"
      primaryCta={{ label: 'Çekim İçin Teklif Al', href: `${ROUTES.teklif}?sourceType=hatira&sourceSlug=photo&sourceLabel=${encodeURIComponent('Fotoğraf')}` }}
      secondaryCta={{ label: 'Diğer Formatlar', href: ROUTES.hatira }}
      note="Fiyat; süre, ekip ve teslim kapsamına göre size özel belirlenir."
    />
  );
}
