import Link from 'next/link';
import { CheckCircle2, Clock3, ReceiptText, ShieldAlert } from 'lucide-react';

import type { CustomerPaymentResult } from '@/lib/payments/status';
import { formatTRY } from '@/lib/format';
import { Button } from '@/components/ui/button';

export function PaymentResult({
  result,
  expected,
}: {
  result: CustomerPaymentResult | null;
  expected: 'success' | 'failed' | 'pending';
}) {
  const paid = result?.paymentStatus === 'paid';
  const failed = ['failed', 'cancelled'].includes(result?.paymentStatus ?? '');
  const state = paid ? 'paid' : failed ? 'failed' : 'pending';
  const content =
    state === 'paid'
      ? {
          Icon: CheckCircle2,
          eyebrow: 'Ödeme doğrulandı',
          title: 'Siparişiniz güvenle alındı',
          lead: 'Ödeme sağlayıcısının imzalı bildirimi doğrulandı. Siparişiniz hesabınızda hazır.',
          tone: 'text-cherie-success bg-cherie-success/10',
        }
      : state === 'failed'
        ? {
            Icon: ShieldAlert,
            eyebrow: 'Ödeme tamamlanmadı',
            title: 'Kartınızdan doğrulanmış bir tahsilat yok',
            lead: 'Sağlayıcı işlemi başarısız veya iptal olarak bildirdi. Yeni bir ödeme denemesi için destek ekibimizle iletişime geçebilirsiniz.',
            tone: 'text-cherie-error bg-cherie-error/10',
          }
        : {
            Icon: Clock3,
            eyebrow: 'Doğrulama bekleniyor',
            title:
              expected === 'success'
                ? 'Yönlendirme tamamlandı; bildirim bekleniyor'
                : 'Ödeme sonucu kontrol ediliyor',
            lead: 'Kartınızdan tahsilat yapılmış veya işlem henüz bankada bekliyor olabilir. Lütfen doğrulama tamamlanmadan yeniden ödeme yapmayın; sistem sonucu güvenle kontrol ediyor.',
            tone: 'text-cherie-warning bg-cherie-warning/10',
          };
  const { Icon } = content;
  return (
    <section className="cherie-page-glow cherie-container py-16 md:py-24">
      <div className="cherie-surface mx-auto max-w-2xl rounded-card-lg p-6 text-center sm:p-10">
        <span
          className={`mx-auto grid size-16 place-items-center rounded-full ${content.tone}`}
        >
          <Icon className="size-8" strokeWidth={1.5} />
        </span>
        <p className="cherie-kicker mt-7">{content.eyebrow}</p>
        <h1 className="text-h1 mt-4 text-balance text-cherie-ink">{content.title}</h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-cherie-soft-ink">
          {content.lead}
        </p>
        {result && (
          <dl className="mt-8 grid gap-4 rounded-card border border-cherie-lace bg-cherie-paper/60 p-5 text-left sm:grid-cols-2">
            <div>
              <dt className="text-xs text-cherie-soft-ink">Sipariş numarası</dt>
              <dd className="mt-1 font-semibold text-cherie-ink">{result.orderNumber}</dd>
            </div>
            <div>
              <dt className="text-xs text-cherie-soft-ink">Tutar</dt>
              <dd className="cherie-price mt-1 font-semibold text-cherie-ink">
                {formatTRY(result.totalAmount)}
              </dd>
            </div>
          </dl>
        )}
        {!result && (
          <p className="mt-7 rounded-control bg-cherie-mist px-4 py-3 text-sm text-cherie-soft-ink">
            Bu bağlantıda hesabınıza ait doğrulanabilir bir sipariş bulunamadı.
          </p>
        )}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {result && (
            <Button asChild>
              <Link href={`/hesap/siparisler/${result.orderNumber}`}>
                <ReceiptText /> Siparişi görüntüle
              </Link>
            </Button>
          )}
          <Button asChild variant="secondary">
            <Link href="/iletisim">Destek ekibine yaz</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
