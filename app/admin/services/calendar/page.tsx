import Link from 'next/link';
import { requireCapability } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { AdminDate, StateBadge } from '@/components/admin/resource-list';
export const dynamic = 'force-dynamic';
export default async function Page() {
  await requireCapability('services.read', '/admin/services/calendar');
  const db = createAdminClient();
  const from = new Date().toISOString().slice(0, 10);
  const [reservations, consultations, blocks] = await Promise.all([
    db
      .from('reservations')
      .select('id,reservation_number,event_date,event_time,status,customers(name)')
      .gte('event_date', from)
      .order('event_date')
      .limit(100),
    db
      .from('consultations')
      .select('id,consultation_number,confirmed_slot,status,customers(name)')
      .in('status', ['requested', 'confirmed'])
      .order('created_at')
      .limit(100),
    db
      .from('service_availability_blocks')
      .select('id,date,is_blackout,note')
      .gte('date', from)
      .order('date')
      .limit(100),
  ]);
  const events = [
    ...(reservations.data ?? []).map((x) => ({
      id: x.id,
      date: x.event_date,
      label: `Etkinlik · ${x.reservation_number} · ${x.customers?.name ?? 'Müşteri'}`,
      status: x.status,
      href: `/admin/services/reservations/${x.id}`,
    })),
    ...(consultations.data ?? []).map((x) => ({
      id: x.id,
      date: slotDate(x.confirmed_slot),
      label: `Görüşme · ${x.consultation_number} · ${x.customers?.name ?? 'Müşteri'}`,
      status: x.status,
      href: '/admin/services/consultations',
    })),
    ...(blocks.data ?? []).map((x) => ({
      id: x.id,
      date: x.date,
      label: x.is_blackout
        ? `Rezervasyona kapalı · ${x.note ?? ''}`
        : `Kapasite · ${x.note ?? ''}`,
      status: x.is_blackout ? 'blackout' : 'available',
      href: '/admin/services/availability',
    })),
  ]
    .filter((x) => x.date)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));
  return (
    <div className="space-y-6 p-4 md:p-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-cherie-brass">
          Operasyon takvimi
        </p>
        <h1 className="font-display text-4xl">Yaklaşan hizmetler</h1>
      </header>
      <div className="grid gap-3">
        {events.map((x) => (
          <Link
            key={`${x.status}-${x.id}`}
            href={x.href}
            className="grid gap-2 rounded-card-lg border border-cherie-lace p-4 sm:grid-cols-[180px_1fr_auto]"
          >
            <AdminDate value={String(x.date)} />
            <strong>{x.label}</strong>
            <StateBadge value={x.status} />
          </Link>
        ))}
      </div>
    </div>
  );
}
function slotDate(v: unknown) {
  return v &&
    typeof v === 'object' &&
    !Array.isArray(v) &&
    'date' in v &&
    typeof v.date === 'string'
    ? v.date
    : null;
}
