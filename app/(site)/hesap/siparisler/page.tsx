import type { Metadata } from 'next';
import Link from 'next/link';
import { PackageOpen, ReceiptText } from 'lucide-react';

import { formatTRY } from '@/lib/format';
import { getCustomerOrders } from '@/lib/orders/customer';
import {
  orderStatusLabel,
  orderTone,
  paymentStatusLabel,
} from '@/lib/orders/presentation';

export const metadata: Metadata = { title: 'Siparişlerim' };

export default async function Page() {
  const orders = await getCustomerOrders();
  return (
    <div className="cherie-container py-12 md:py-16">
      <p className="cherie-kicker">Hesabım</p>
      <h1 className="text-h1 mt-3">Siparişlerim</h1>
      <p className="mt-3 max-w-2xl text-cherie-soft-ink">
        Ödeme, tasarım onayı, üretim ve teslimat yolculuğunuz tek yerde.
      </p>

      {orders.length === 0 ? (
        <div className="mt-10 rounded-card-lg border border-dashed border-cherie-lace bg-cherie-paper/45 px-6 py-16 text-center">
          <PackageOpen className="mx-auto size-8 text-cherie-brass" strokeWidth={1.5} />
          <h2 className="mt-5 font-display text-2xl">Henüz bir siparişiniz yok</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-cherie-soft-ink">
            Hikâyenize eşlik edecek ilk parçayı mağazamızdan seçebilirsiniz.
          </p>
          <Link
            href="/magaza"
            className="mt-6 inline-flex min-h-11 items-center rounded-control bg-cherie-burgundy px-5 text-sm font-semibold text-white"
          >
            Mağazayı keşfet
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/hesap/siparisler/${order.order_number}`}
              className="group grid gap-5 rounded-card-lg border border-cherie-lace bg-cherie-ivory p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-card md:grid-cols-[1fr_auto] md:items-center"
            >
              <div className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-cherie-paper text-cherie-burgundy">
                  <ReceiptText className="size-5" strokeWidth={1.6} />
                </span>
                <div>
                  <p className="font-semibold text-cherie-ink">{order.order_number}</p>
                  <p className="mt-1 text-sm text-cherie-soft-ink">
                    {new Intl.DateTimeFormat('tr-TR', {
                      dateStyle: 'long',
                      timeZone: 'Europe/Istanbul',
                    }).format(new Date(order.created_at))}
                    {' · '}
                    {order.item_count} ürün
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <Status tone={orderTone(order.status)}>
                      {orderStatusLabel(order.status)}
                    </Status>
                    <Status tone={orderTone(order.payment_status)}>
                      {paymentStatusLabel(order.payment_status)}
                    </Status>
                  </div>
                </div>
              </div>
              <p className="cherie-price text-xl font-semibold text-cherie-burgundy">
                {formatTRY(Number(order.total_amount))}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Status({ children, tone }: { children: React.ReactNode; tone: string }) {
  const color =
    tone === 'success'
      ? 'bg-cherie-success/10 text-cherie-success'
      : tone === 'error'
        ? 'bg-cherie-error/10 text-cherie-error'
        : 'bg-cherie-warning/10 text-cherie-warning';
  return (
    <span className={`rounded-full px-2.5 py-1 font-semibold ${color}`}>{children}</span>
  );
}
