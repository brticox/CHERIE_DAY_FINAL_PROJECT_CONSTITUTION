import type { Metadata } from 'next';
import Link from 'next/link';

import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';

export const metadata: Metadata = buildMetadata({
  title: 'Yardım Merkezi | CHERIE DAY',
  description: 'Sipariş takibi, teslimat, tasarım onayı, iade ve dijital teslimat hakkında yardım.',
  path: ROUTES.yardim,
});

const TOPICS = [
  { title: 'Siparişim', desc: 'Sipariş durumunuzu takip edin.', href: ROUTES.siparisTakip },
  { title: 'Teslimat & Kargo', desc: 'Türkiye içi teslimat süreçleri.', href: `${ROUTES.kurumsal}/teslimat` },
  { title: 'Tasarım Onayı', desc: 'Kişiselleştirilmiş ürünlerde süreç.', href: `${ROUTES.kurumsal}/kisisellestirilmis-urun-sartlari` },
  { title: 'İade & İptal', desc: 'İade koşulları ve adımları.', href: `${ROUTES.kurumsal}/iade-iptal` },
  { title: 'Ödeme', desc: 'Güvenli ödeme ve seçenekler.', href: `${ROUTES.kurumsal}/mesafeli-satis` },
  { title: 'Hizmet & Rezervasyon', desc: 'Rezervasyon ve ön ödeme koşulları.', href: `${ROUTES.kurumsal}/hizmet-rezervasyon-sartlari` },
];

export default function YardimPage() {
  return (
    <div className="cherie-container py-14">
      <Breadcrumbs items={[{ name: 'Ana Sayfa', path: ROUTES.home }, { name: 'Yardım', path: ROUTES.yardim }]} />
      <PageHeader
        eyebrow="Yardım"
        title="Bahçenin kapısı her zaman açık"
        lead="Aradığınız konuyu seçin; bulamazsanız bize danışmaktan çekinmeyin."
      />
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TOPICS.map((t) => (
          <Link
            key={t.title}
            href={t.href}
            className="group rounded-card border border-cherie-lace bg-cherie-ivory p-6 transition-colors duration-card ease-cherie hover:border-cherie-burgundy"
          >
            <h3 className="text-h3 text-cherie-ink group-hover:text-cherie-burgundy">{t.title}</h3>
            <p className="mt-1 text-sm text-cherie-soft-ink">{t.desc}</p>
          </Link>
        ))}
      </div>
      <p className="mt-10 text-sm text-cherie-soft-ink">
        Bir sorunuz mu var?{' '}
        <Link href={ROUTES.iletisim} className="text-cherie-burgundy hover:underline">İletişime geçin</Link>.
      </p>
    </div>
  );
}
