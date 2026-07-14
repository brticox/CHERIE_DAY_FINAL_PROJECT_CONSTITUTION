import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { OfferingDetail } from '@/components/content/offering-detail';

export const metadata: Metadata = buildMetadata({
  title: 'QR Kart | CHERIE DAY',
  description:
    'Küçük bir kare, koca bir davet. QR kartınız misafirinizi davetinize, menünüze ya da anı albümünüze tek dokunuşla yönlendirir.',
  path: `${ROUTES.dijital}/qr`,
});

export default function QrPage() {
  return (
    <OfferingDetail
      breadcrumbs={[
        { name: 'Ana Sayfa', path: ROUTES.home },
        { name: 'Dijital', path: ROUTES.dijital },
        { name: 'QR Kart', path: `${ROUTES.dijital}/qr` },
      ]}
      eyebrow="Dijital"
      title="Küçük bir kare, koca bir davet"
      lead="Basılı kartın zarafeti ile dijitalin pratikliği bir arada. QR kartınız misafirinizi davetinize, menünüze ya da paylaşılan anı albümüne tek dokunuşla götürür."
      highlights={[
        { title: 'Davete yönlendirme', body: 'Kartı okutan misafir doğrudan dijital davetinize ulaşır.' },
        { title: 'Menü & albüm', body: 'Masadaki menüye ya da ortak fotoğraf albümüne bağlanır.' },
        { title: 'Baskıya hazır', body: 'Masa kartı, davetiye ya da karşılama alanında zarifçe kullanılır.' },
        { title: 'Koleksiyonla uyum', body: 'Tasarımı, seçtiğiniz koleksiyonun tonuyla hazırlanır.' },
      ]}
      priceLabel="150 ₺’den başlayan"
      primaryCta={{ label: 'QR Kartları Gör', href: `${ROUTES.magaza}/qr-kart` }}
      secondaryCta={{ label: 'Dijital Davetiyeye Bak', href: `${ROUTES.dijital}/dijital-davetiye` }}
      faqs={[
        { q: 'QR kod nereye yönlendiriliyor?', a: 'Davetiyenize, menünüze veya paylaşılan bir albüme — ihtiyacınıza göre birlikte belirleriz.' },
        { q: 'Basılı ürünlere ekleyebilir misiniz?', a: 'Evet. QR’ı masa kartı, davetiye veya karşılama panosu gibi basılı ürünlere yerleştirebiliriz.' },
      ]}
      note="Dijital yönlendirme içeren bir üründür; baskı seçenekleri sipariş sırasında netleşir."
    />
  );
}
