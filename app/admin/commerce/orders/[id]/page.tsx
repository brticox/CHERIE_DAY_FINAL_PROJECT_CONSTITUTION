import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, PackageCheck } from 'lucide-react';

import { formatTRY } from '@/lib/format';
import { jsonText } from '@/lib/orders/customer';
import { orderStatusLabel, paymentStatusLabel } from '@/lib/orders/presentation';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/lib/supabase/database.types';
import { transitionOrderAction } from './actions';

type OrderRow = Database['public']['Tables']['orders']['Row'];
type ItemRow = Database['public']['Tables']['order_items']['Row'];
const NEXT: Partial<
  Record<
    Database['public']['Enums']['order_status'],
    Database['public']['Enums']['order_status'][]
  >
> = {
  pending_payment: ['paid', 'cancelled'],
  paid: ['in_design', 'cancelled', 'refunded'],
  in_design: ['proof_sent', 'cancelled'],
  proof_sent: ['revision_requested', 'proof_approved', 'cancelled'],
  revision_requested: ['in_design'],
  proof_approved: ['in_production'],
  in_production: ['quality_check'],
  quality_check: ['in_production', 'packed'],
  packed: ['shipped'],
  shipped: ['delivered'],
  delivered: ['completed'],
};
export const dynamic = 'force-dynamic';

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ transition?: string }>;
}) {
  const { id } = await params;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)
    notFound();
  const admin = createAdminClient();
  const [{ data: rawOrder }, { data: rawItems }] = await Promise.all([
    admin.from('orders').select('*').eq('id', id).maybeSingle(),
    admin.from('order_items').select('*').eq('order_id', id).order('created_at'),
  ]);
  if (!rawOrder) notFound();
  const order = rawOrder as OrderRow;
  const items = (rawItems ?? []) as ItemRow[];
  const feedback = (await searchParams).transition;
  return (
    <div className="space-y-8 p-5 md:p-8">
      <Link
        href="/admin/commerce/orders"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-cherie-burgundy"
      >
        <ArrowLeft className="size-4" />
        Siparişlere dön
      </Link>
      <header className="flex flex-col gap-4 border-b border-cherie-lace pb-7 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[.18em] text-cherie-brass">
            Sipariş operasyonu
          </p>
          <h1 className="mt-2 font-display text-4xl">{order.order_number}</h1>
          <p className="mt-2 text-sm text-cherie-soft-ink">
            {orderStatusLabel(order.status)} · {paymentStatusLabel(order.payment_status)}
          </p>
        </div>
        <p className="cherie-price font-display text-3xl text-cherie-burgundy">
          {formatTRY(Number(order.total_amount))}
        </p>
      </header>
      {feedback && (
        <p className="rounded-control bg-cherie-paper p-3 text-sm">
          {feedback === 'success'
            ? 'Sipariş durumu güncellendi.'
            : 'Durum değiştirilemedi; geçiş kuralını ve gerekli onayları kontrol edin.'}
        </p>
      )}
      <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
        <section className="rounded-card-lg border border-cherie-lace bg-cherie-ivory p-6">
          <h2 className="font-display text-2xl">Ürünler</h2>
          <div className="mt-4 divide-y divide-cherie-lace">
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-[1fr_auto] gap-3 py-4">
                <div>
                  <p className="font-semibold">
                    {jsonText(item.product_snapshot, 'name', 'CHERIE DAY ürünü')}
                  </p>
                  <p className="text-sm text-cherie-soft-ink">{item.quantity} adet</p>
                </div>
                <p className="cherie-price font-semibold">
                  {formatTRY(Number(item.total_price))}
                </p>
              </div>
            ))}
          </div>
        </section>
        <aside className="space-y-6">
          <section className="rounded-card-lg border border-cherie-lace bg-cherie-ivory p-6">
            <h2 className="flex items-center gap-2 font-display text-2xl">
              <PackageCheck className="size-5 text-cherie-brass" />
              Sonraki adım
            </h2>
            {(NEXT[order.status] ?? []).length ? (
              <form action={transitionOrderAction} className="mt-5 space-y-4">
                <input type="hidden" name="orderId" value={order.id} />
                <label className="block text-sm font-semibold" htmlFor="status">
                  Yeni durum
                </label>
                <select id="status" name="status" className="cherie-field">
                  {(NEXT[order.status] ?? []).map((status) => (
                    <option key={status} value={status}>
                      {orderStatusLabel(status)}
                    </option>
                  ))}
                </select>
                <label className="block text-sm font-semibold" htmlFor="detail">
                  Müşteriye görünen not
                </label>
                <textarea
                  id="detail"
                  name="detail"
                  maxLength={1000}
                  className="cherie-field min-h-24"
                />
                <button className="min-h-11 w-full rounded-control bg-cherie-burgundy px-4 text-sm font-semibold text-white">
                  Durumu güncelle
                </button>
              </form>
            ) : (
              <p className="mt-4 text-sm text-cherie-soft-ink">
                Bu sipariş için sıradaki operasyon adımı bulunmuyor.
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
