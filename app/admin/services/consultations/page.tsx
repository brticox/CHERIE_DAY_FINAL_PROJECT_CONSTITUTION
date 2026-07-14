import { requireStaff } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { updateConsultation } from '../actions';
import { StateBadge } from '@/components/admin/resource-list';
export const dynamic = 'force-dynamic';
export default async function Page() {
  await requireStaff('/admin/services/consultations');
  const db = createAdminClient();
  const [rows, staff] = await Promise.all([
    db
      .from('consultations')
      .select('*,customers(name,email,phone)')
      .order('created_at', { ascending: false })
      .limit(150),
    db.from('staff_users').select('id,name').eq('is_active', true).order('name'),
  ]);
  return (
    <div className="space-y-6 p-4 md:p-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-cherie-brass">
          Randevu operasyonu
        </p>
        <h1 className="font-display text-4xl">Görüşmeler</h1>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        {(rows.data ?? []).map((x) => (
          <article key={x.id} className="rounded-card-lg border border-cherie-lace p-5">
            <div className="flex justify-between">
              <div>
                <h2 className="font-display text-2xl">{x.consultation_number}</h2>
                <p className="text-sm">
                  {x.customers?.name ?? 'Müşteri'} ·{' '}
                  {x.customers?.email || x.customers?.phone || 'İletişim yok'}
                </p>
              </div>
              <StateBadge value={x.status} />
            </div>
            <form action={updateConsultation} className="mt-4 grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="id" value={x.id} />
              <select name="status" defaultValue={x.status} className="cherie-field">
                <option value="requested">Talep</option>
                <option value="confirmed">Onaylı</option>
                <option value="completed">Tamamlandı</option>
                <option value="no_show">Gelmedi</option>
                <option value="cancelled">İptal</option>
              </select>
              <select
                name="assigned_staff_id"
                defaultValue={x.assigned_staff_id ?? ''}
                className="cherie-field"
              >
                <option value="">Atanmadı</option>
                {(staff.data ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <select name="channel" defaultValue={x.channel} className="cherie-field">
                <option value="online">Online</option>
                <option value="phone">Telefon</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="in_person">Yüz yüze</option>
              </select>
              <input
                type="date"
                name="date"
                defaultValue={slot(x.confirmed_slot, 'date')}
                className="cherie-field"
              />
              <input
                type="time"
                name="time"
                defaultValue={slot(x.confirmed_slot, 'time')}
                className="cherie-field"
              />
              <input
                type="number"
                name="duration_minutes"
                min="15"
                step="15"
                defaultValue={Number(slot(x.confirmed_slot, 'duration_minutes')) || 60}
                className="cherie-field"
              />
              <textarea
                name="note"
                defaultValue={x.note ?? ''}
                placeholder="Görüşme notu / intake gereksinimleri"
                className="cherie-field sm:col-span-2"
              />
              <button className="cherie-button-primary sm:col-span-2">
                Görüşmeyi güncelle
              </button>
            </form>
          </article>
        ))}
      </div>
    </div>
  );
}
function slot(v: unknown, key: string) {
  return v && typeof v === 'object' && !Array.isArray(v) && key in v
    ? String((v as Record<string, unknown>)[key] ?? '')
    : '';
}
