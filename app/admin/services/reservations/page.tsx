import Link from 'next/link';
import { requireStaff } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { AdminDate, StateBadge } from '@/components/admin/resource-list';
export const dynamic = 'force-dynamic';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  await requireStaff('/admin/services/reservations');
  const db = createAdminClient();
  let query = db
    .from('reservations')
    .select(
      'id,reservation_number,status,event_date,event_time,total_amount,deposit_amount,deposit_paid_at,customers(name,email),service_packages(name)',
      { count: 'exact' },
    )
    .order('event_date', { ascending: true })
    .limit(150);
  if (status) query = query.eq('status', status as never);
  if (q) query = query.ilike('reservation_number', `%${q.replace(/[,%]/g, '')}%`);
  const { data, count, error } = await query;
  return (
    <div className="space-y-6 p-4 md:p-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-cherie-brass">
          Etkinlik operasyonu
        </p>
        <h1 className="font-display text-4xl">Rezervasyonlar</h1>
        <p className="text-sm text-cherie-soft-ink">{count ?? 0} kayıt</p>
      </header>
      <form className="flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Rezervasyon no"
          className="cherie-field max-w-sm"
        />
        <select
          name="status"
          defaultValue={status ?? ''}
          className="cherie-field max-w-sm"
        >
          <option value="">Tüm durumlar</option>
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
        <button className="cherie-button-primary">Filtrele</button>
      </form>
      {error ? (
        <p>Rezervasyonlar okunamadı.</p>
      ) : (
        <div className="grid gap-3">
          {(data ?? []).map((x) => (
            <Link
              key={x.id}
              href={`/admin/services/reservations/${x.id}`}
              className="grid gap-3 rounded-card-lg border border-cherie-lace p-4 md:grid-cols-[1fr_1fr_auto_auto]"
            >
              <span>
                <strong>{x.reservation_number}</strong>
                <small className="block">
                  {x.customers?.name ?? 'Müşteri'} ·{' '}
                  {x.service_packages?.name ?? 'Özel hizmet'}
                </small>
              </span>
              <span>
                <AdminDate value={x.event_date} />
                {x.event_time && ` · ${x.event_time}`}
              </span>
              <span>
                {x.deposit_paid_at
                  ? 'Depozito ödendi'
                  : `Depozito: ${x.deposit_amount ?? '—'}`}
              </span>
              <StateBadge value={x.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
