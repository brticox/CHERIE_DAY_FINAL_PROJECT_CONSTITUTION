import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { OfferingDetail } from '@/components/content/offering-detail';

export const metadata: Metadata = buildMetadata({
  title: 'Dijital Davetiye | CHERIE DAY',
  description:
    'Işıkla yazılan davet: kişiye özel dijital davetiyenizi hazırlayın, sevdiklerinize tek bir bağlantıyla ulaştırın. Mobil uyumlu, güncellenebilir, hızlı.',
  path: `${ROUTES.dijital}/dijital-davetiye`,
});

export default function DijitalDavetiyePage() {
  return (
    <OfferingDetail
      breadcrumbs={[
        { name: 'Ana Sayfa', path: ROUTES.home },
        { name: 'Dijital', path: ROUTES.dijital },
        { name: 'Dijital Davetiye', path: `${ROUTES.dijital}/dijital-davetiye` },
      ]}
      eyebrow="Dijital"
      title="Sevginiz, artık ışıkla da yazılır"
      lead="Kişiye özel dijital davetiyenizi dakikalar içinde hazırlayın; tek bir bağlantıyla, herkese aynı anda ulaşın. Kağıt kadar zarif, ekran kadar hızlı."
      highlights={[
        { title: 'Anında paylaşım', body: 'WhatsApp, e-posta ya da bağlantı — davetiniz saniyeler içinde ulaşır.' },
        { title: 'Kişiye özel tasarım', body: 'İsim, tarih, mekân ve renkleri koleksiyon diliyle uyumlu kurar.' },
        { title: 'Her ekrana uyumlu', body: 'Telefon, tablet ve bilgisayarda aynı zarafetle görüntülenir.' },
        { title: 'Güncellenebilir', body: 'Bir detay değişirse davetiyeniz yeni bağlantı gerektirmeden güncellenir.' },
      ]}
      steps={[
        { title: 'Şablonu seçin', body: 'Koleksiyonlarımızdan size en yakın tonu belirleyin.' },
        { title: 'Detayları girin', body: 'Bilgilerinizi paylaşın; biz zarif bir düzene yerleştirelim.' },
        { title: 'Onaylayın & paylaşın', body: 'Son hâlini onaylayın, bağlantıyı sevdiklerinize iletin.' },
      ]}
      priceLabel="250 ₺’den başlayan"
      primaryCta={{ label: 'Dijital Davetiyeleri Gör', href: `${ROUTES.magaza}/dijital-davetiye` }}
      secondaryCta={{ label: 'Özel Tasarım İçin Teklif', href: ROUTES.teklif }}
      faqs={[
        { q: 'Ne kadar sürede hazır olur?', a: 'Hazır şablonlar çok kısa sürede tamamlanır. Kişiye özel tasarımlarda süre, onay adımına göre değişir.' },
        { q: 'Davetiyeyi sonradan düzenleyebilir miyim?', a: 'Küçük düzeltmeler için bize yazmanız yeterli; kapsamına göre değerlendirir, bağlantınızı güncelleriz.' },
        { q: 'Basılı davetiyeyle birlikte alabilir miyim?', a: 'Elbette. Basılı ve dijital davetiyeyi aynı koleksiyon diliyle, uyumlu bir bütün olarak hazırlayabiliriz.' },
      ]}
      note="Dijital ürünlerde fiziksel kargo yoktur; davetiyeniz bir bağlantı olarak size ulaşır."
    />
  );
}
