import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, PackageCheck } from 'lucide-react';
import { AdminStatus } from '@/components/admin/admin-workspace';
import { adminEventLabel, adminValueLabel } from '@/lib/admin/presentation';
import { roleLabel } from '@/lib/admin/permissions';

import { formatTRY } from '@/lib/format';
import { jsonText } from '@/lib/orders/customer';
import {
  orderStatusLabel,
  orderTone,
  paymentStatusLabel,
  productionStatusLabel,
  proofStatusLabel,
  shipmentStatusLabel,
} from '@/lib/orders/presentation';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireCapability } from '@/lib/auth/guards';
import type { Database } from '@/lib/supabase/database.types';
import { transitionOrderAction, updateOrderOperations } from './actions';

type OrderRow = Database['public']['Tables']['orders']['Row'];
type ItemRow = Database['public']['Tables']['order_items']['Row'];
type ProofRow = Database['public']['Tables']['product_proofs']['Row'];
type ProductionRow = Database['public']['Tables']['production_jobs']['Row'];
type ShipmentRow = Database['public']['Tables']['shipments']['Row'];
type PaymentRow = Database['public']['Tables']['payments']['Row'];
type EventRow = Database['public']['Tables']['order_status_events']['Row'];
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
  await requireCapability('orders.read', `/admin/commerce/orders/${id}`);
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)
    notFound();
  const admin = createAdminClient();
  const [
    { data: rawOrder },
    { data: rawItems },
    { data: rawProofs },
    { data: rawProduction },
    { data: rawShipments },
    { data: rawPayments },
    { data: rawEvents },
    notifications,
    audit,
    staffRows,
  ] = await Promise.all([
    admin.from('orders').select('*').eq('id', id).maybeSingle(),
    admin.from('order_items').select('*').eq('order_id', id).order('id'),
    admin
      .from('product_proofs')
      .select('*')
      .eq('order_id', id)
      .order('created_at', { ascending: false }),
    admin.from('production_jobs').select('*').eq('order_id', id).order('created_at'),
    admin
      .from('shipments')
      .select('*')
      .eq('order_id', id)
      .order('created_at', { ascending: false }),
    admin
      .from('payments')
      .select('*')
      .eq('order_id', id)
      .order('created_at', { ascending: false }),
    admin
      .from('order_status_events')
      .select('*')
      .eq('order_id', id)
      .order('created_at', { ascending: false }),
    admin
      .from('notification_outbox')
      .select(
        'id,event_type,status,channel,provider,attempts,last_error,created_at,sent_at',
      )
      .eq('order_id', id)
      .order('created_at', { ascending: false })
      .limit(50),
    admin
      .from('audit_log')
      .select('id,action,created_at,diff')
      .eq('entity_type', 'order')
      .eq('entity_id', id)
      .order('created_at', { ascending: false })
      .limit(50),
    admin.from('staff_users').select('id,name,role').eq('is_active', true).order('name'),
  ]);
  if (!rawOrder) notFound();
  const order = rawOrder as OrderRow;
  const items = (rawItems ?? []) as ItemRow[];
  const proofs = (rawProofs ?? []) as ProofRow[];
  const production = (rawProduction ?? []) as ProductionRow[];
  const shipments = (rawShipments ?? []) as ShipmentRow[];
  const payments = (rawPayments ?? []) as PaymentRow[];
  const events = (rawEvents ?? []) as EventRow[];
  const feedback = (await searchParams).transition;
  const riskCount =
    Number(order.payment_status !== 'paid') +
    Number(
      items.some((item) => item.requires_proof) &&
        !proofs.some((proof) => proof.status === 'approved'),
    ) +
    Number(
      production.some(
        (job) =>
          job.due_at && new Date(job.due_at) < new Date() && job.status !== 'completed',
      ),
    ) +
    Number(shipments.some((shipment) => shipment.status === 'returned'));
  const nextStatus = (NEXT[order.status] ?? [])[0];
  const commandSignals = [
    { label: 'Sipariş', value: orderStatusLabel(order.status), status: order.status },
    {
      label: 'Sıradaki adım',
      value: nextStatus ? orderStatusLabel(nextStatus) : 'İşlem gerekmiyor',
      status: nextStatus ?? 'completed',
    },
    {
      label: 'Risk',
      value: riskCount ? `${riskCount} konu` : 'Risk yok',
      status: riskCount ? 'blocked' : 'passed',
    },
    {
      label: 'Ödeme',
      value: paymentStatusLabel(order.payment_status),
      status: order.payment_status,
    },
    {
      label: 'Tasarım',
      value: proofs[0] ? proofStatusLabel(proofs[0].status) : 'Kayıt yok',
      status: proofs[0]?.status ?? 'pending',
    },
    {
      label: 'Üretim',
      value: production[0] ? productionStatusLabel(production[0].status) : 'Başlamadı',
      status: production[0]?.status ?? 'pending',
    },
    {
      label: 'Kargo',
      value: shipments[0] ? shipmentStatusLabel(shipments[0].status) : 'Hazırlanmadı',
      status: shipments[0]?.status ?? 'pending',
    },
  ];
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
          <p className="admin-eyebrow">Sipariş operasyonu</p>
          <h1 className="admin-page-title mt-2 break-all">{order.order_number}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusChip
              tone={orderTone(order.status)}
              label={orderStatusLabel(order.status)}
            />
            <StatusChip
              tone={orderTone(order.payment_status)}
              label={paymentStatusLabel(order.payment_status)}
              subtle
            />
          </div>
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
      <section
        aria-label="Sipariş komuta özeti"
        className="overflow-hidden rounded-card-lg bg-cherie-velvet text-white shadow-lift"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {commandSignals.map((signal, index) => (
            <div
              key={signal.label}
              className={`min-h-28 p-4 ${index > 0 ? 'border-t border-white/10 sm:border-l sm:border-t-0' : ''}`}
            >
              <p className="text-[11px] font-bold uppercase tracking-[.14em] text-cherie-brass">
                {signal.label}
              </p>
              <p className="mt-3 text-sm font-semibold leading-5 text-white">
                {signal.value}
              </p>
              <div className="mt-3">
                <AdminStatus value={signal.status} />
              </div>
            </div>
          ))}
        </div>
      </section>
      <div className="grid gap-8 lg:grid-cols-[1.618fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-card-lg border border-cherie-lace bg-cherie-ivory p-6">
            <h2 className="font-display text-2xl">Ürünler</h2>
            <div className="mt-4 divide-y divide-cherie-lace">
              {items.length === 0 ? (
                <p className="py-4 text-sm text-cherie-soft-ink">
                  Bu siparişte kayıtlı ürün kalemi bulunmuyor.
                </p>
              ) : (
                items.map((item) => (
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
                ))
              )}
            </div>
          </section>
          <OperationalSection title="Ödeme" empty="Ödeme kaydı yok">
            {payments.map((payment) => (
              <Row
                key={payment.id}
                label={`${payment.provider} · ${paymentStatusLabel(payment.status)}`}
                value={`${formatTRY(Number(payment.amount))}${payment.masked_card ? ` · ${payment.masked_card}` : ''}`}
              />
            ))}
          </OperationalSection>
          <OperationalSection title="Tasarım onayları" empty="Prova kaydı yok">
            {proofs.map((proof) => (
              <Row
                key={proof.id}
                label={`v${proof.version} · ${proofStatusLabel(proof.status)}`}
                value={proof.customer_comment ?? 'Müşteri notu yok'}
              />
            ))}
          </OperationalSection>
          <OperationalSection title="Üretim" empty="Üretim işi oluşturulmadı">
            {production.map((job) => (
              <Row
                key={job.id}
                label={productionStatusLabel(job.status)}
                value={
                  job.due_at ? `Termin ${adminDate(job.due_at)}` : 'Termin belirlenmedi'
                }
              />
            ))}
          </OperationalSection>
          <OperationalSection title="Kargo" empty="Gönderi oluşturulmadı">
            {shipments.map((shipment) => (
              <Row
                key={shipment.id}
                label={`${shipment.carrier_name ?? 'Kargo belirlenmedi'} · ${shipmentStatusLabel(shipment.status)}`}
                value={shipment.tracking_number ?? 'Takip numarası yok'}
              />
            ))}
          </OperationalSection>
          <OperationalSection title="Denetim zaman çizelgesi" empty="Durum olayı yok">
            {events.map((event) => (
              <Row
                key={event.id}
                label={`${orderStatusLabel(event.from_status ?? order.status)} → ${orderStatusLabel(event.to_status)}`}
                value={`${adminDate(event.created_at)}${event.detail_tr ? ` · ${event.detail_tr}` : ''}`}
              />
            ))}
          </OperationalSection>
        </div>
        <aside className="space-y-6">
          <section className="rounded-card-lg border border-cherie-brass/40 bg-white/70 p-6 shadow-card">
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
                <button className="min-h-11 w-full rounded-control bg-cherie-burgundy px-4 text-sm font-semibold text-white transition-colors hover:bg-cherie-cherry">
                  Durumu güncelle
                </button>
              </form>
            ) : (
              <p className="mt-4 text-sm text-cherie-soft-ink">
                Bu sipariş için sıradaki operasyon adımı bulunmuyor. Mevcut durum:{' '}
                {orderStatusLabel(order.status)}.
              </p>
            )}
          </section>
          <section className="rounded-card-lg border border-cherie-lace bg-cherie-ivory p-6">
            <h2 className="font-display text-2xl">Sorumlu ve notlar</h2>
            <form action={updateOrderOperations} className="mt-4 grid gap-3">
              <input type="hidden" name="orderId" value={order.id} />
              <label className="grid gap-2 text-sm font-bold">
                Sorumlu
                <select
                  name="assigned_staff_id"
                  defaultValue={order.assigned_staff_id ?? ''}
                  className="cherie-field"
                >
                  <option value="">Atanmadı</option>
                  {(staffRows.data ?? []).map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name} · {roleLabel(person.role)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold">
                İç not
                <textarea
                  name="internal_note"
                  defaultValue={order.internal_note ?? ''}
                  maxLength={4000}
                  className="cherie-field"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Müşteri notu
                <textarea
                  name="customer_note"
                  defaultValue={order.customer_note ?? ''}
                  maxLength={2000}
                  className="cherie-field"
                />
              </label>
              <button className="cherie-button-primary">
                Operasyon kaydını güncelle
              </button>
            </form>
          </section>
          <section className="rounded-card-lg border border-cherie-lace bg-cherie-ivory p-6">
            <h2 className="font-display text-2xl">Risk uyarıları</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {order.payment_status !== 'paid' && (
                <li className="text-cherie-warning">• Ödeme tamamlanmadı.</li>
              )}
              {items.some((item) => item.requires_proof) &&
                !proofs.some((proof) => proof.status === 'approved') && (
                  <li className="text-cherie-warning">
                    • Onaylı prova olmadan üretim başlayamaz.
                  </li>
                )}
              {production.some(
                (job) =>
                  job.due_at &&
                  new Date(job.due_at) < new Date() &&
                  job.status !== 'completed',
              ) && <li className="text-cherie-error">• Gecikmiş üretim işi var.</li>}
              {shipments.some((shipment) => shipment.status === 'returned') && (
                <li className="text-cherie-error">• Gönderi iade edildi.</li>
              )}
            </ul>
          </section>
          <OperationalSection title="Yasal anlık görüntü" empty="Yasal snapshot yok">
            {order.legal_snapshot ? (
              <div className="py-3 text-sm leading-6 text-cherie-soft-ink">
                Sipariş sırasında geçerli yasal içerik değiştirilemez biçimde sabitlendi.
                Bu kayıt denetim ve müşteri kabulü için korunuyor.
              </div>
            ) : null}
          </OperationalSection>
          <OperationalSection title="Bildirim zaman çizelgesi" empty="Bildirim yok">
            {(notifications.data ?? []).map((item) => (
              <Row
                key={item.id}
                label={`${adminValueLabel(item.channel)} · ${adminEventLabel(item.event_type)} · ${adminValueLabel(item.status)}`}
                value={`${adminDate(item.sent_at ?? item.created_at)}${item.last_error ? ` · ${item.last_error}` : ''}`}
              />
            ))}
          </OperationalSection>
          <OperationalSection title="Tam denetim izi" empty="Denetim kaydı yok">
            {(audit.data ?? []).map((item) => (
              <Row
                key={item.id}
                label={adminEventLabel(item.action)}
                value={adminDate(item.created_at)}
              />
            ))}
          </OperationalSection>
        </aside>
      </div>
    </div>
  );
}
function OperationalSection({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: React.ReactNode;
}) {
  const has = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return (
    <section className="rounded-card-lg border border-cherie-lace bg-cherie-ivory p-6">
      <h2 className="font-display text-2xl">{title}</h2>
      <div className="mt-4 divide-y divide-cherie-lace">
        {has ? children : <p className="py-4 text-sm text-cherie-soft-ink">{empty}</p>}
      </div>
    </section>
  );
}
function StatusChip({
  tone,
  label,
  subtle = false,
}: {
  tone: string;
  label: string;
  subtle?: boolean;
}) {
  const map: Record<string, string> = {
    success: 'border-cherie-success/30 bg-cherie-success/12 text-cherie-success',
    warning: 'border-cherie-warning/30 bg-cherie-warning/12 text-cherie-warning',
    error: 'border-cherie-error/30 bg-cherie-error/12 text-cherie-error',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-semibold ${map[tone] ?? map.warning} ${subtle ? 'text-xs' : 'text-sm'}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col justify-between gap-1 py-3 sm:flex-row sm:gap-4">
      <strong className="text-sm">{label}</strong>
      <span className="text-sm text-cherie-soft-ink">{value}</span>
    </div>
  );
}
function adminDate(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Istanbul',
  }).format(new Date(value));
}
