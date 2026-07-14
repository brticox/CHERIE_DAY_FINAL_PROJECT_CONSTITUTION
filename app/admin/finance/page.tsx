import Link from 'next/link';

import { requireFinanceRead } from '@/lib/payments/finance-auth';

export default async function Page() {
  await requireFinanceRead();
  const links = [
    ['/admin/finance/payments', 'Ödemeler', 'Callback ve finansal durum kanıtı'],
    ['/admin/finance/reconciliation', 'Uzlaştırma', 'Açık farklar ve insan incelemesi'],
    ['/admin/finance/refunds', 'İadeler', 'Talep, onay, sağlayıcı sonucu'],
  ] as const;
  return (
    <div className="space-y-8 p-5 md:p-8">
      <header>
        <p className="text-xs uppercase tracking-[.18em] text-cherie-brass">
          Finans kontrolü
        </p>
        <h1 className="mt-2 font-display text-4xl">Ödeme güvenliği</h1>
        <p className="mt-3 max-w-2xl text-sm text-cherie-soft-ink">
          Sağlayıcı kanıtı, uzlaştırma ve iadeler birbirinden ayrı, denetlenebilir iş
          akışlarıdır.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        {links.map(([href, title, detail]) => (
          <Link
            key={href}
            href={href}
            className="rounded-card-lg border border-cherie-lace bg-cherie-ivory p-6"
          >
            <h2 className="font-display text-2xl">{title}</h2>
            <p className="mt-2 text-sm text-cherie-soft-ink">{detail}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
