import type { Metadata } from 'next';
import Link from 'next/link';
import { ShoppingBag, PenTool, FileText, CalendarClock } from 'lucide-react';

import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = buildMetadata({
  title: 'Nasıl Çalışır — CHERIE DAY',
  description:
    'Keşiften teslimata CHERIE DAY süreci: kişiye özel ürünlerde tasarım onayı, hizmetlerde rezervasyon, teklife dayalı işler. Hangi ürünün nasıl alındığını adım adım anlatıyoruz.',
  path: ROUTES.maisonNasilCalisir,
});

const STEPS = [
  {
    n: '01',
    title: 'Keşfedin',
    body: 'Mağazada ürünlere, showroom’da hizmetlere göz atın. Beğendiklerinizi Seçimlerim’de bir araya getirin.',
  },
  {
    n: '02',
    title: 'Kişiselleştirin',
    body: 'İsim, tarih, renk ve metin gibi detayları ürün sayfasında belirtin. Aklınızdaki tabloyu bizimle paylaşın.',
  },
  {
    n: '03',
    title: 'Onaylayın',
    body: 'Kişiye özel ürünlerde tasarımınızı size gönderiririz. Son söz sizindir; onayınızdan önce üretim başlamaz.',
  },
  {
    n: '04',
    title: 'Üretelim & ulaştıralım',
    body: 'Onaydan sonra ürün özenle hazırlanır ve Türkiye geneline gönderilir. Hizmetlerde kurulumu biz üstleniriz.',
  },
];

const PATHS = [
  {
    Icon: ShoppingBag,
    label: 'Sepete eklenebilir ürün',
    body: 'Hazır seçimler doğrudan sepete eklenir. Fiyat net, süreç hızlıdır.',
    example: 'Nikah şekeri, mum, kutu & paketleme',
  },
  {
    Icon: PenTool,
    label: 'Tasarım onaylı ürün',
    body: 'Kişiye özel baskı işleri. Önce tasarımı onaylarsınız, sonra üretim başlar.',
    example: 'Davetiye, masa kartı, menü',
  },
  {
    Icon: FileText,
    label: 'Teklife dayalı iş',
    body: 'Ölçü, adet veya konsepte göre değişen işler. Size özel bir teklif hazırlarız.',
    example: 'Nişan tepsisi, hatıra albümü, dekor',
  },
  {
    Icon: CalendarClock,
    label: 'Rezervasyonlu hizmet',
    body: 'Tarihe bağlı organizasyonlar. Uygunluğu birlikte netleştirir, gününüzü ayırırız.',
    example: 'Düğün, nişan, doğum günü kurulumu',
  },
];

export default function NasilCalisirPage() {
  return (
    <div className="cherie-container py-14 md:py-20">
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'Maison', path: ROUTES.maison },
          { name: 'Nasıl Çalışır', path: ROUTES.maisonNasilCalisir },
        ]}
      />
      <PageHeader
        eyebrow="Süreç"
        title="Karmaşayı biz üstleniyoruz, karar sizde kalıyor"
        lead="İster tek bir davetiye, ister baştan sona bir düğün olsun; her iş aynı sakin ritimle ilerler. İşte adım adım nasıl çalıştığımız."
      />

      {/* Steps */}
      <ol className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step) => (
          <li key={step.n} className="relative">
            <span className="cd-ghost-index block text-5xl md:text-6xl">{step.n}</span>
            <h2 className="text-h3 mt-3 text-cherie-ink">{step.title}</h2>
            <p className="mt-2 text-sm leading-6 text-cherie-soft-ink">{step.body}</p>
          </li>
        ))}
      </ol>

      {/* Purchasing paths */}
      <section className="mt-20 border-t border-cherie-lace pt-14">
        <p className="cherie-kicker">Dört yol, tek zevk</p>
        <h2 className="text-h2 mt-3 max-w-2xl text-cherie-ink">
          Her ürünün alınma biçimi, sayfasında açıkça yazar
        </h2>
        <p className="mt-3 max-w-2xl text-cherie-soft-ink">
          Bazı ürünler doğrudan sepete gider, bazıları tasarım onayı ya da teklif
          ister. Hangi yolda olduğunuzu asla tahmin etmenize gerek kalmaz.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {PATHS.map(({ Icon, label, body, example }) => (
            <div
              key={label}
              className="rounded-card-lg border border-cherie-lace bg-cherie-ivory p-6"
            >
              <div className="flex items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-full border border-cherie-lace bg-cherie-paper/60 text-cherie-brass">
                  <Icon className="size-5" strokeWidth={1.6} />
                </span>
                <div>
                  <h3 className="font-display text-xl text-cherie-ink">{label}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-cherie-soft-ink">{body}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.12em] text-cherie-brass">
                    Örnek: {example}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust note */}
      <section className="mt-16 rounded-card-lg border border-cherie-lace bg-cherie-paper/40 p-8">
        <h2 className="text-h3 text-cherie-ink">Güvence altında ilerlersiniz</h2>
        <ul className="mt-4 grid gap-3 text-sm text-cherie-soft-ink sm:grid-cols-2">
          <li>• Fiyat, ödeme adımında sunucuda doğrulanır — sürpriz olmaz.</li>
          <li>• Kişiye özel ürünlerde üretim, yalnızca onayınızdan sonra başlar.</li>
          <li>• Üretim süresi her ürün sayfasında açıkça belirtilir.</li>
          <li>• Standart ürünlerde 14 gün içinde iade hakkınız saklıdır.</li>
        </ul>
        <p className="mt-4 text-xs text-cherie-soft-ink">
          Ayrıntılar için{' '}
          <Link
            href={`${ROUTES.kurumsal}/kisisellestirilmis-urun-sartlari`}
            className="text-cherie-burgundy hover:underline"
          >
            kişiselleştirilmiş ürün şartları
          </Link>{' '}
          ve{' '}
          <Link
            href={`${ROUTES.kurumsal}/iade-iptal`}
            className="text-cherie-burgundy hover:underline"
          >
            iade &amp; iptal
          </Link>{' '}
          sayfalarımıza bakabilirsiniz.
        </p>
      </section>

      <section className="mt-14 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href={ROUTES.magaza}>Mağazayı Gez</Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href={ROUTES.teklif}>Teklif Al</Link>
        </Button>
      </section>
    </div>
  );
}
