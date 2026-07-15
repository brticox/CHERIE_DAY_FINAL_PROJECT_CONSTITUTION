import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, CalendarCheck, Info } from 'lucide-react';

import { ROUTES } from '@/lib/data/routes';
import { HELP_EMAILS } from '@/lib/data/help';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Ön Ödeme (Depozito)',
  robots: { index: false, follow: false },
};

/**
 * Deposit guidance landing (presentation only). This page explains what a
 * reservation deposit is and routes the customer to their reservation and to
 * payments support — it does NOT implement or alter any payment orchestration
 * (that domain, lib/payments + app/api/payments, is owned by the payment agent).
 */
export default async function DepositGuidancePage({
  params,
}: {
  params: Promise<{ 'reservation-number': string }>;
}) {
  const { 'reservation-number': number } = await params;

  return (
    <div className="cherie-container py-14 md:py-20">
      <PageHeader
        eyebrow="Ödeme"
        title="Rezervasyon ön ödemesi"
        lead={`${number} numaralı rezervasyonunuzun tarihini kesinleştirmek için bir ön ödeme (depozito) adımı bulunuyor.`}
      />

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        <Info3 Icon={CalendarCheck} title="Tarihinizi ayırır" body="Ön ödeme, gününüzü sizin adınıza kesinleştirir ve planlamayı başlatır." />
        <Info3 Icon={ShieldCheck} title="Güvenli tahsilat" body="Ödeme, güvenli altyapı üzerinden alınır; tutar sunucuda doğrulanır." />
        <Info3 Icon={Info} title="Kalanı sonra" body="Bakiye, teklifinizde belirtilen koşullara göre ilerleyen adımlarda tamamlanır." />
      </div>

      <div className="mt-10 rounded-card-lg border border-cherie-lace bg-cherie-paper/40 p-6 md:p-8">
        <h2 className="text-h3 text-cherie-ink">Ödeme bağlantınız hazır olduğunda</h2>
        <p className="mt-2 max-w-2xl text-sm text-cherie-soft-ink">
          Ön ödeme bağlantınız rezervasyonunuza tanımlanır. Rezervasyon
          sayfanızdan güvenle ilerleyebilir, koşulları teklifinizde
          görebilirsiniz. Bir sorunuz olursa ödeme ekibimiz yanınızda.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href={`${ROUTES.hesap}/rezervasyonlar`}>Rezervasyonlarıma Git</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <a href={`mailto:${HELP_EMAILS.payments}`}>Ödeme Ekibine Yaz</a>
          </Button>
        </div>
        <p className="mt-4 text-xs text-cherie-soft-ink">
          Ön ödeme ve iade koşulları için{' '}
          <Link
            href={`${ROUTES.kurumsal}/hizmet-rezervasyon-sartlari`}
            className="text-cherie-burgundy hover:underline"
          >
            Hizmet & Rezervasyon Şartları
          </Link>
          ’na göz atabilirsiniz.
        </p>
      </div>
    </div>
  );
}

function Info3({
  Icon,
  title,
  body,
}: {
  Icon: typeof ShieldCheck;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-card border border-cherie-lace bg-cherie-ivory p-5">
      <Icon className="size-5 text-cherie-brass" strokeWidth={1.6} />
      <h3 className="mt-3 font-medium text-cherie-ink">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-cherie-soft-ink">{body}</p>
    </div>
  );
}
