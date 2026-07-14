import type { Metadata } from 'next';
import Link from 'next/link';
import { ClipboardList, Truck, PenTool, RefreshCw } from 'lucide-react';

import { HELP_EMAILS } from '@/lib/data/help';
import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = buildMetadata({
  title: 'Siparişim Hakkında Yardım | CHERIE DAY',
  description:
    'Siparişinizin durumu, teslimatı, tasarım onayı veya değişiklik talebi için ne yapmanız gerektiğini adım adım anlattık.',
  path: `${ROUTES.yardim}/siparisim`,
});

const SITUATIONS = [
  {
    Icon: ClipboardList,
    title: 'Durumunu öğrenmek istiyorum',
    body: 'Hesabınızdaki “Siparişlerim” sayfasında her siparişin güncel durumunu ve varsa kargo takibini görebilirsiniz.',
    href: ROUTES.hesap + '/siparisler',
    cta: 'Siparişlerime Git',
  },
  {
    Icon: PenTool,
    title: 'Tasarımımı onaylamam gerekiyor',
    body: 'Kişiye özel ürünlerde üretim, tasarım onayınızla başlar. Bekleyen onaylarınızı hesabınızdan görüntüleyin.',
    href: ROUTES.hesap + '/tasarim-onaylari',
    cta: 'Tasarım Onaylarım',
  },
  {
    Icon: Truck,
    title: 'Teslimat süresini merak ediyorum',
    body: 'Teslimat süresi, ürünün üretim süresi ile kargo süresinin toplamıdır. Ayrıntılar teslimat sayfasında.',
    href: `${ROUTES.kurumsal}/teslimat`,
    cta: 'Teslimat Koşulları',
  },
  {
    Icon: RefreshCw,
    title: 'Değişiklik veya iade istiyorum',
    body: 'Standart ürünlerde iade hakkınız saklıdır; kişiye özel ürünlerde koşullar farklıdır. İnceleyip size dönelim.',
    href: `${ROUTES.kurumsal}/iade-iptal`,
    cta: 'İade & İptal',
  },
];

export default function SiparisimPage() {
  return (
    <div className="cherie-container py-14 md:py-20">
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'Yardım', path: ROUTES.yardim },
          { name: 'Siparişim', path: `${ROUTES.yardim}/siparisim` },
        ]}
      />
      <PageHeader
        eyebrow="Yardım"
        title="Siparişinizle ilgili ne yapmak istiyorsunuz?"
        lead="Aşağıdan durumunuza en yakın başlığı seçin; sizi doğru yere yönlendirelim. Acele bir konuysa doğrudan sipariş ekibimize yazabilirsiniz."
      />

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {SITUATIONS.map(({ Icon, title, body, href, cta }) => (
          <div
            key={title}
            className="flex flex-col rounded-card-lg border border-cherie-lace bg-cherie-ivory p-6"
          >
            <span className="grid size-11 place-items-center rounded-full border border-cherie-lace bg-cherie-paper/60 text-cherie-brass">
              <Icon className="size-5" strokeWidth={1.6} />
            </span>
            <h2 className="text-h3 mt-4 text-cherie-ink">{title}</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-cherie-soft-ink">{body}</p>
            <Link
              href={href}
              className="mt-5 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-cherie-burgundy hover:underline"
            >
              {cta} →
            </Link>
          </div>
        ))}
      </div>

      <section className="mt-12 rounded-card-lg border border-cherie-lace bg-cherie-paper/40 p-8">
        <h2 className="text-h3 text-cherie-ink">Sipariş ekibimize yazın</h2>
        <p className="mt-2 max-w-xl text-sm text-cherie-soft-ink">
          Siparişinizle ilgili her konuda buradayız. E-postanıza sipariş
          numaranızı eklerseniz size daha hızlı dönebiliriz.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <a href={`mailto:${HELP_EMAILS.orders}`}>{HELP_EMAILS.orders}</a>
          </Button>
          <Button asChild variant="secondary">
            <Link href={ROUTES.iletisim}>İletişim Formu</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
