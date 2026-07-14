import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { OfferingDetail } from '@/components/content/offering-detail';

export const metadata: Metadata = buildMetadata({
  title: 'Düğün Web Sitesi | CHERIE DAY',
  description:
    'Programdan yol tarifine, RSVP’den galeriye; misafirlerinizi tek bir bağlantıda buluşturan zarif bir düğün web sitesi.',
  path: `${ROUTES.dijital}/dugun-web-sitesi`,
});

export default function DugunWebSitesiPage() {
  return (
    <OfferingDetail
      breadcrumbs={[
        { name: 'Ana Sayfa', path: ROUTES.home },
        { name: 'Dijital', path: ROUTES.dijital },
        { name: 'Düğün Web Sitesi', path: `${ROUTES.dijital}/dugun-web-sitesi` },
      ]}
      eyebrow="Dijital"
      title="Bir bağlantı, kutlamanızın bütün hikâyesi"
      lead="Misafirleriniz programı, mekânı ve yol tarifini tek bir yerde bulsun; katılımlarını da oradan iletsin. Davetiyenizle aynı estetik dilde, size özel tek sayfa."
      highlights={[
        { title: 'Program & mekân', body: 'Günün akışı, adres ve yol tarifi net biçimde bir arada.' },
        { title: 'RSVP toplama', body: 'Katılım yanıtları tek tıkla gelsin, sayım kendiliğinden ilerlesin.' },
        { title: 'Fotoğraf galerisi', body: 'Hikâyenizi anlatan seçili kareler, zarif bir düzende.' },
        { title: 'Koleksiyonla uyum', body: 'Renk ve tipografi, davetiyenizle aynı dünyadan konuşur.' },
      ]}
      steps={[
        { title: 'İçeriği paylaşın', body: 'Program, mekân ve görselleri bize iletin.' },
        { title: 'Tasarımı onaylayın', body: 'Size özel hazırlanan sayfayı gözden geçirin.' },
        { title: 'Yayına alın', body: 'Bağlantıyı davetiyenizle birlikte paylaşın.' },
      ]}
      priceLabel="900 ₺’den başlayan"
      primaryCta={{ label: 'Teklif Al', href: ROUTES.teklif }}
      secondaryCta={{ label: 'Dijital Davetiyeye Bak', href: `${ROUTES.dijital}/dijital-davetiye` }}
      faqs={[
        { q: 'Kendi alan adımı kullanabilir miyim?', a: 'Bağlantı seçenekleri ve alan adı tercihleri için teklif aşamasında birlikte netleştirelim.' },
        { q: 'RSVP yanıtlarını nasıl görürüm?', a: 'Gelen katılım yanıtları düzenli biçimde size iletilir; misafir listenizi tek yerden takip edebilirsiniz.' },
      ]}
      note="Bu ürün kişiye özel hazırlandığından tasarım onayınızla üretilir; süre onay adımına göre değişir."
    />
  );
}
