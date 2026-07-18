import Link from 'next/link';
import { AlertTriangle, PackageCheck, ReceiptText, Truck } from 'lucide-react';

import { formatTRY } from '@/lib/format';
import { orderStatusLabel, paymentStatusLabel } from '@/lib/orders/presentation';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/lib/supabase/database.types';
import { SavedOrderViews } from '@/components/admin/saved-order-views';
import { requireCapability } from '@/lib/auth/guards';
import { AdminPagination } from '@/components/admin/pagination';

type OrderRow = Database['public']['Tables']['orders']['Row'];
const PAGE_SIZE = 50;
export const dynamic = 'force-dynamic';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; payment?: string; view?: string; page?: string }>;
}) {
  await requireCapability('orders.read', '/admin/commerce/orders');
  const filters = await searchParams;
  let orders: OrderRow[] = [];
  let total = 0;
  let activeCount = 0;
  let productionCount = 0;
  let shippingCount = 0;
  let unavailable = false;
  const page = Math.max(1, Number.parseInt(filters.page ?? '1', 10) || 1);
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createAdminClient();
    let query = admin
      .from('orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });
    if (filters.q) query = query.ilike('order_number', `%${safe(filters.q)}%`);
    if (filters.status) query = query.eq('status', filters.status as OrderRow['status']);
    if (filters.payment)
      query = query.eq('payment_status', filters.payment as OrderRow['payment_status']);
    if (filters.view === 'action')
      query = query.in('status', ['pending_payment', 'revision_requested', 'quality_check']);

    const [list, active, production, shipping] = await Promise.all([
      query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1),
      admin
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .not('status', 'in', '(completed,cancelled,refunded)'),
      admin
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .in('status', ['in_production', 'quality_check', 'packed']),
      admin
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .in('status', ['shipped', 'delivered']),
    ]);
    orders = (list.data ?? []) as OrderRow[];
    total = list.count ?? 0;
    activeCount = active.count ?? 0;
    productionCount = production.count ?? 0;
    shippingCount = shipping.count ?? 0;
    unavailable = Boolean(list.error || active.error || production.error || shipping.error);
  } else unavailable = true;

  return (
    <div className="space-y-8 p-5 md:p-8">
      <header>
        <p className="text-xs uppercase tracking-[.18em] text-cherie-brass">
          Ticaret operasyonu
        </p>
        <h1 className="mt-2 font-display text-4xl">Siparişler</h1>
        <p className="mt-2 text-sm text-cherie-soft-ink">
          Ödemeden teslimata kadar tüm siparişlerin sayfalı operasyon görünümü.
        </p>
      </header>
      <section className="grid gap-4 sm:grid-cols-3">
        <Metric icon={ReceiptText} label="Aktif sipariş" value={activeCount} />
        <Metric icon={PackageCheck} label="Üretim / kalite" value={productionCount} />
        <Metric icon={Truck} label="Kargo / teslimat" value={shippingCount} />
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
      <AdminPagination
        path="/admin/commerce/orders"
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        query={{ q: filters.q, status: filters.status, payment: filters.payment, view: filters.view }}
        label="Sipariş sayfalama"
      />
    </div>
  );
}

const safe = (value: string) => value.replace(/[,%]/g, '').slice(0, 80);

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
