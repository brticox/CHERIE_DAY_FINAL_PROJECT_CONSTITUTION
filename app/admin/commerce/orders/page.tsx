import Link from 'next/link';
import { AlertTriangle, PackageCheck, ReceiptText, Truck } from 'lucide-react';

import { formatTRY } from '@/lib/format';
import { orderStatusLabel, paymentStatusLabel } from '@/lib/orders/presentation';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/lib/supabase/database.types';
import { SavedOrderViews } from '@/components/admin/saved-order-views';
import { requireStaff } from '@/lib/auth/guards';

type OrderRow = Database['public']['Tables']['orders']['Row'];
export const dynamic = 'force-dynamic';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; payment?: string; view?: string }>;
}) {
  await requireStaff('/admin/commerce/orders');
  const filters = await searchParams;
  let orders: OrderRow[] = [];
  let unavailable = false;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { data, error } = await createAdminClient()
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    orders = (data ?? []) as OrderRow[];
    unavailable = Boolean(error);
  } else unavailable = true;

  orders = orders.filter(
    (order) =>
      (!filters.q ||
        order.order_number.toLowerCase().includes(filters.q.toLowerCase())) &&
      (!filters.status || order.status === filters.status) &&
      (!filters.payment || order.payment_status === filters.payment) &&
      (!filters.view ||
        filters.view !== 'action' ||
        ['pending_payment', 'revision_requested', 'quality_check'].includes(
          order.status,
        )),
  );
  const active = orders.filter(
    (order) => !['completed', 'cancelled', 'refunded'].includes(order.status),
  );
  const production = orders.filter((order) =>
    ['in_production', 'quality_check', 'packed'].includes(order.status),
  );
  const shipping = orders.filter((order) =>
    ['shipped', 'delivered'].includes(order.status),
  );

  return (
    <div className="space-y-8 p-5 md:p-8">
      <header>
        <p className="text-xs uppercase tracking-[.18em] text-cherie-brass">
          Ticaret operasyonu
        </p>
        <h1 className="mt-2 font-display text-4xl">Siparişler</h1>
        <p className="mt-2 text-sm text-cherie-soft-ink">
          Ödemeden teslimata kadar son 100 siparişin operasyon görünümü.
        </p>
      </header>
      <section className="grid gap-4 sm:grid-cols-3">
        <Metric icon={ReceiptText} label="Aktif sipariş" value={active.length} />
        <Metric icon={PackageCheck} label="Üretim / kalite" value={production.length} />
        <Metric icon={Truck} label="Kargo / teslimat" value={shipping.length} />
      </section>
      <form className="grid gap-3 rounded-card-lg border border-cherie-lace bg-white/60 p-4 md:grid-cols-5">
        <input
          name="q"
          defaultValue={filters.q}
          placeholder="Sipariş no ara"
          className="cherie-field"
        />
        <select
          name="status"
          defaultValue={filters.status ?? ''}
          className="cherie-field"
        >
          <option value="">Tüm durumlar</option>
          {[
            'pending_payment',
            'paid',
            'in_design',
            'proof_sent',
            'revision_requested',
            'proof_approved',
            'in_production',
            'quality_check',
            'packed',
            'shipped',
            'delivered',
            'completed',
            'cancelled',
          ].map((x) => (
            <option key={x} value={x}>
              {orderStatusLabel(x as Database['public']['Enums']['order_status'])}
            </option>
          ))}
        </select>
        <select
          name="payment"
          defaultValue={filters.payment ?? ''}
          className="cherie-field"
        >
          <option value="">Tüm ödemeler</option>
          {[
            'pending',
            'paid',
            'failed',
            'cancelled',
            'refunded',
            'partially_refunded',
          ].map((x) => (
            <option key={x} value={x}>
              {paymentStatusLabel(x as Database['public']['Enums']['payment_status'])}
            </option>
          ))}
        </select>
        <select name="view" defaultValue={filters.view ?? ''} className="cherie-field">
          <option value="">Standart görünüm</option>
          <option value="action">Aksiyon gerekenler</option>
        </select>
        <button className="cherie-button-primary">Filtrele</button>
      </form>
      <SavedOrderViews />
      {unavailable ? (
        <Notice />
      ) : orders.length === 0 ? (
        <Empty />
      ) : (
        <div className="overflow-hidden rounded-card-lg border border-cherie-lace bg-cherie-ivory shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-cherie-paper text-xs uppercase tracking-wide text-cherie-soft-ink">
                <tr>
                  <th className="px-5 py-4">Sipariş</th>
                  <th className="px-5 py-4">Durum</th>
                  <th className="px-5 py-4">Ödeme</th>
                  <th className="px-5 py-4">Tutar</th>
                  <th className="px-5 py-4">Tarih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cherie-lace/70">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-cherie-paper/40">
                    <td className="px-5 py-4">
                      <Link
                        className="font-semibold text-cherie-burgundy hover:underline"
                        href={`/admin/commerce/orders/${order.id}`}
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-5 py-4">{orderStatusLabel(order.status)}</td>
                    <td className="px-5 py-4">
                      {paymentStatusLabel(order.payment_status)}
                    </td>
                    <td className="cherie-price px-5 py-4 font-semibold">
                      {formatTRY(Number(order.total_amount))}
                    </td>
                    <td className="px-5 py-4 text-xs text-cherie-soft-ink">
                      {new Intl.DateTimeFormat('tr-TR', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                        timeZone: 'Europe/Istanbul',
                      }).format(new Date(order.created_at))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ReceiptText;
  label: string;
  value: number;
}) {
  return (
    <article className="rounded-card-lg border border-cherie-lace bg-cherie-ivory p-5 shadow-sm">
      <Icon className="size-5 text-cherie-burgundy" strokeWidth={1.6} />
      <p className="mt-5 text-xs text-cherie-soft-ink">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </article>
  );
}
function Notice() {
  return (
    <div className="rounded-card-lg border border-cherie-warning/30 bg-cherie-warning/10 p-5 text-sm">
      <AlertTriangle className="mr-2 inline size-4" />
      Sipariş veritabanı bu ortamda yapılandırılmamış.
    </div>
  );
}
function Empty() {
  return (
    <div className="rounded-card-lg border border-dashed border-cherie-lace bg-cherie-paper/50 px-6 py-14 text-center">
      <h2 className="font-display text-2xl">Henüz sipariş yok</h2>
      <p className="mt-2 text-sm text-cherie-soft-ink">
        İlk ödeme denemesi siparişi oluşturduğunda burada görünecek.
      </p>
    </div>
  );
}
