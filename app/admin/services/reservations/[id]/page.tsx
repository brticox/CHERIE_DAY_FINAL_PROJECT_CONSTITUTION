import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireCapability } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { AdminDate, StateBadge } from '@/components/admin/resource-list';
import {
  addReservationTask,
  toggleReservationTask,
  updateReservation,
} from '../../actions';
import { adminValueLabel } from '@/lib/admin/presentation';
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
  await requireCapability('services.read', `/admin/services/reservations/${id}`);
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
      {state.error && (
        <p
          role="alert"
          className="rounded-control bg-cherie-error/10 p-4 text-sm text-cherie-error"
        >
          Rezervasyon işlemi tamamlanamadı. Önceki kayıt korundu; alanları kontrol edip
          yeniden deneyebilirsiniz.
        </p>
      )}
      <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <form
          action={updateReservation}
          className="grid gap-3 rounded-card-lg border border-cherie-lace p-5 sm:grid-cols-2"
        >
          <input type="hidden" name="id" value={id} />
          <select
            aria-label="Rezervasyon durumu"
            name="status"
            defaultValue={r.status}
            className="cherie-field"
          >
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
              <option key={x} value={x}>
                {adminValueLabel(x)}
              </option>
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
          <h2 className="font-display text-2xl">Müşteri ve etkinlik özeti</h2>
          <p className="mt-2 text-sm">
            {r.customers?.email || r.customers?.phone || 'İletişim yok'}
          </p>
          <BriefSummary value={briefQ.data?.brief_json ?? r.event_location} />
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-card-lg border border-cherie-lace p-5">
          <h2 className="font-display text-2xl">Aşamalar ve ödemeler</h2>
          {(milestonesQ.data ?? []).map((x) => (
            <div
              key={x.id}
              className="flex justify-between border-b border-cherie-lace py-3 text-sm"
            >
              <span>
                <strong>{x.title_tr}</strong>
                <small className="block">{adminValueLabel(x.type)}</small>
              </span>
              <span>
                {x.amount ?? '—'} TL · {adminValueLabel(x.status)}
                <br />
                <AdminDate value={x.due_date} />
              </span>
            </div>
          ))}
        </div>
        <div className="rounded-card-lg border border-cherie-lace p-5">
          <h2 className="font-display text-2xl">Görev listesi ve ekip</h2>
          <form action={addReservationTask} className="mt-3 grid gap-2 sm:grid-cols-2">
            <input type="hidden" name="reservation_id" value={id} />
            <input
              aria-label="Görev"
              name="item_tr"
              required
              placeholder="Görev"
              className="cherie-field"
            />
            <input
              aria-label="Görev son tarihi"
              type="date"
              name="due_date"
              className="cherie-field"
            />
            <select
              aria-label="Görev sorumlusu"
              name="owner_staff_id"
              className="cherie-field"
            >
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

const BRIEF_LABELS: Record<string, string> = {
  palette: 'Renk paleti',
  style: 'Stil',
  mustHave: 'Vazgeçilmezler',
  venue: 'Mekân',
  district: 'İlçe',
};

const BRIEF_VALUES: Record<string, string> = {
  ivory: 'Fildişi',
  cherry: 'Vişne',
  'romantic editorial': 'Romantik editoryal',
  'welcome sign': 'Karşılama panosu',
  'photo corner': 'Fotoğraf köşesi',
};

function BriefSummary({ value }: { value: unknown }) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return (
      <p className="mt-4 rounded-control bg-cherie-paper p-4 text-sm text-cherie-soft-ink">
        {typeof value === 'string' && value ? value : 'Etkinlik ayrıntısı paylaşılmadı.'}
      </p>
    );
  }
  const entries = Object.entries(value as Record<string, unknown>);
  if (!entries.length)
    return (
      <p className="mt-4 text-sm text-cherie-soft-ink">
        Etkinlik ayrıntısı paylaşılmadı.
      </p>
    );
  return (
    <dl className="mt-4 divide-y divide-cherie-lace rounded-control bg-cherie-paper px-4">
      {entries.map(([key, entry]) => (
        <div key={key} className="grid gap-1 py-3 text-sm sm:grid-cols-[9rem_1fr]">
          <dt className="font-semibold text-cherie-soft-ink">
            {BRIEF_LABELS[key] ?? 'Etkinlik ayrıntısı'}
          </dt>
          <dd>
            {(Array.isArray(entry) ? entry : [entry])
              .map((item) => BRIEF_VALUES[String(item)] ?? String(item))
              .join(', ')}
          </dd>
        </div>
      ))}
    </dl>
  );
}
