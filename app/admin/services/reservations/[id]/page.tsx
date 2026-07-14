import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireStaff } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { AdminDate, StateBadge } from '@/components/admin/resource-list';
import {
  addReservationTask,
  toggleReservationTask,
  updateReservation,
} from '../../actions';
export const dynamic = 'force-dynamic';
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const state = await searchParams;
  await requireStaff(`/admin/services/reservations/${id}`);
  const db = createAdminClient();
  const [reservationQ, briefQ, milestonesQ, tasksQ, staffQ] = await Promise.all([
    db
      .from('reservations')
      .select(
        '*,customers(name,email,phone),service_packages(name),service_cities(city_name)',
      )
      .eq('id', id)
      .single(),
    db.from('service_briefs').select('*').eq('reservation_id', id).maybeSingle(),
    db
      .from('service_milestones')
      .select('*')
      .eq('reservation_id', id)
      .order('sort_order'),
    db
      .from('service_checklists')
      .select('*')
      .eq('reservation_id', id)
      .order('sort_order'),
    db.from('staff_users').select('id,name').eq('is_active', true).order('name'),
  ]);
  const r = reservationQ.data;
  if (!r) notFound();
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
      <header>
        <Link
          href="/admin/services/reservations"
          className="text-sm text-cherie-burgundy"
        >
          ← Rezervasyonlara dön
        </Link>
        <div className="mt-5 flex justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-cherie-brass">
              Etkinlik dosyası
            </p>
            <h1 className="font-display text-4xl">{r.reservation_number}</h1>
            <p>
              {r.customers?.name} · {r.service_packages?.name ?? 'Özel hizmet'} ·{' '}
              {r.service_cities?.city_name ?? 'Şehir yok'}
            </p>
          </div>
          <StateBadge value={r.status} />
        </div>
      </header>
      {state.error && <p role="alert">{state.error}</p>}
      <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <form
          action={updateReservation}
          className="grid gap-3 rounded-card-lg border border-cherie-lace p-5 sm:grid-cols-2"
        >
          <input type="hidden" name="id" value={id} />
          <select aria-label="Rezervasyon durumu" name="status" defaultValue={r.status} className="cherie-field">
            {[
              'requested',
              'quote_pending',
              'confirmed',
              'deposit_paid',
              'in_planning',
              'ready',
              'in_progress',
              'completed',
              'cancelled',
              'rescheduled',
              'no_show',
            ].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <select
            aria-label="Rezervasyon sorumlusu"
            name="assigned_staff_id"
            defaultValue={r.assigned_staff_id ?? ''}
            className="cherie-field"
          >
            <option value="">Atanmadı</option>
            {(staffQ.data ?? []).map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
          <input
            aria-label="Etkinlik tarihi"
            type="date"
            name="event_date"
            defaultValue={r.event_date ?? ''}
            className="cherie-field"
          />
          <input
            aria-label="Etkinlik saati"
            type="time"
            name="event_time"
            defaultValue={r.event_time ?? ''}
            className="cherie-field"
          />
          <input
            aria-label="Konuk sayısı"
            type="number"
            name="guest_count"
            defaultValue={r.guest_count ?? ''}
            placeholder="Konuk"
            className="cherie-field"
          />
          <input
            aria-label="Rezervasyon toplamı"
            type="number"
            name="total_amount"
            step="0.01"
            defaultValue={r.total_amount ?? ''}
            placeholder="Toplam"
            className="cherie-field"
          />
          <input
            aria-label="Depozito tutarı"
            type="number"
            name="deposit_amount"
            step="0.01"
            defaultValue={r.deposit_amount ?? ''}
            placeholder="Depozito"
            className="cherie-field"
          />
          <input
            aria-label="Bakiye son ödeme tarihi"
            type="date"
            name="balance_due_date"
            defaultValue={r.balance_due_date ?? ''}
            className="cherie-field"
          />
          <textarea
            aria-label="İptal veya yeniden planlama nedeni"
            name="cancellation_reason"
            defaultValue={r.cancellation_reason ?? ''}
            placeholder="İptal / yeniden planlama nedeni"
            className="cherie-field sm:col-span-2"
          />
          <button className="cherie-button-primary sm:col-span-2">
            Rezervasyonu güncelle
          </button>
        </form>
        <div className="rounded-card-lg border border-cherie-lace p-5">
          <h2 className="font-display text-2xl">Müşteri ve brief</h2>
          <p className="mt-2 text-sm">
            {r.customers?.email || r.customers?.phone || 'İletişim yok'}
          </p>
          <pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap rounded-control bg-cherie-paper p-3 text-xs">
            {JSON.stringify(briefQ.data?.brief_json ?? r.event_location, null, 2)}
          </pre>
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-card-lg border border-cherie-lace p-5">
          <h2 className="font-display text-2xl">Milestones ve ödemeler</h2>
          {(milestonesQ.data ?? []).map((x) => (
            <div
              key={x.id}
              className="flex justify-between border-b border-cherie-lace py-3 text-sm"
            >
              <span>
                <strong>{x.title_tr}</strong>
                <small className="block">{x.type}</small>
              </span>
              <span>
                {x.amount ?? '—'} TRY · {x.status}
                <br />
                <AdminDate value={x.due_date} />
              </span>
            </div>
          ))}
        </div>
        <div className="rounded-card-lg border border-cherie-lace p-5">
          <h2 className="font-display text-2xl">Checklist ve ekip</h2>
          <form action={addReservationTask} className="mt-3 grid gap-2 sm:grid-cols-2">
            <input type="hidden" name="reservation_id" value={id} />
            <input aria-label="Checklist görevi" name="item_tr" required placeholder="Görev" className="cherie-field" />
            <input aria-label="Görev son tarihi" type="date" name="due_date" className="cherie-field" />
            <select aria-label="Görev sorumlusu" name="owner_staff_id" className="cherie-field">
              <option value="">Sorumlu yok</option>
              {(staffQ.data ?? []).map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
            <button className="cherie-button-secondary">Görev ekle</button>
          </form>
          <div className="mt-4 space-y-2">
            {(tasksQ.data ?? []).map((x) => (
              <form
                key={x.id}
                action={toggleReservationTask}
                className="flex justify-between rounded-control border border-cherie-lace p-3 text-sm"
              >
                <input type="hidden" name="reservation_id" value={id} />
                <input type="hidden" name="id" value={x.id} />
                <span className={x.is_done ? 'line-through opacity-60' : ''}>
                  {x.item_tr}
                  <small className="block">
                    <AdminDate value={x.due_date} />
                  </small>
                </span>
                <button
                  name="done"
                  value={String(!x.is_done)}
                  className="font-bold text-cherie-burgundy"
                >
                  {x.is_done ? 'Geri al' : 'Tamamla'}
                </button>
              </form>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
