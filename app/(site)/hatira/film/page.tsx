import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { OfferingDetail } from '@/components/content/offering-detail';

export const metadata: Metadata = buildMetadata({
  title: 'Film | Hatıra — CHERIE DAY',
  description:
    'Gününüz, sinematik bir anlatıya dönüşür. Düğün ve kutlama filminizi duyguyu koruyan bir kurguyla hazırlıyoruz.',
  path: `${ROUTES.hatira}/film`,
});

export default function FilmPage() {
  return (
    <OfferingDetail
      breadcrumbs={[
        { name: 'Ana Sayfa', path: ROUTES.home },
        { name: 'Hatıra', path: ROUTES.hatira },
        { name: 'Film', path: `${ROUTES.hatira}/film` },
      ]}
      eyebrow="Hatıra"
      title="Gününüz, sinematik bir anlatıya dönüşür"
      lead="Bir günün telaşını değil, duygusunu anlatan bir film. Sesleri, bakışları ve o küçük anları bir hikâyenin ritmiyle bir araya getiriyoruz."
      highlights={[
        { title: 'Hikâye kurgusu', body: 'Günün akışını, duyguyu koruyan bir anlatıya dönüştürürüz.' },
        { title: 'Sinematik görüntü', body: 'Işık, kadraj ve hareketle film diline sadık kalırız.' },
        { title: 'Doğal ses', body: 'Yeminler, kahkahalar ve konuşmalar filmin kalbini oluşturur.' },
        { title: 'Uzun & kısa kurgu', body: 'Hem tam film hem paylaşılası bir özet teslim edilir.' },
      ]}
      priceLabel="Teklif ile"
      primaryCta={{ label: 'Film İçin Teklif Al', href: `${ROUTES.teklif}?sourceType=hatira&sourceSlug=film&sourceLabel=Film` }}
      secondaryCta={{ label: 'Diğer Formatlar', href: ROUTES.hatira }}
      note="Süre, ekip ve teslim kapsamı gününüze göre değişir; fiyat teklifle netleşir."
    />
  );
}
