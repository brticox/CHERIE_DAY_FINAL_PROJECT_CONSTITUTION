import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { OfferingDetail } from '@/components/content/offering-detail';

export const metadata: Metadata = buildMetadata({
  title: 'Reels | Hatıra — CHERIE DAY',
  description:
    'Kısa, hızlı, paylaşılası anlar. Sosyal medyada gününüzü anlatan, ritmi yüksek kısa videolar.',
  path: `${ROUTES.hatira}/reels`,
});

export default function ReelsPage() {
  return (
    <OfferingDetail
      breadcrumbs={[
        { name: 'Ana Sayfa', path: ROUTES.home },
        { name: 'Hatıra', path: ROUTES.hatira },
        { name: 'Reels', path: `${ROUTES.hatira}/reels` },
      ]}
      eyebrow="Hatıra"
      title="Kısa, hızlı, paylaşılası anlar"
      lead="Günün enerjisini birkaç saniyeye sığdıran, dikey ekrana özel kısa videolar. Kutlamanızı sıcağı sıcağına paylaşmak isteyenler için."
      highlights={[
        { title: 'Dikey format', body: 'Reels ve Stories için doğru orana özel kurgu.' },
        { title: 'Ritmi yüksek', body: 'Müzikle uyumlu, dinamik bir anlatım.' },
        { title: 'Hızlı teslim', body: 'Paylaşım heyecanını korumak için öncelikli kurgu seçeneği.' },
      ]}
      priceLabel="Teklif ile"
      primaryCta={{ label: 'Reels İçin Teklif Al', href: `${ROUTES.teklif}?sourceType=hatira&sourceSlug=reels&sourceLabel=Reels` }}
      secondaryCta={{ label: 'Diğer Formatlar', href: ROUTES.hatira }}
      note="Genellikle fotoğraf veya film hizmetiyle birlikte tercih edilir; kapsam teklifte belirlenir."
    />
  );
}
