import { requireStaff } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { saveAvailability } from '../actions';
import type { Database } from '@/lib/supabase/database.types';
import { AdminDate, StateBadge } from '@/components/admin/resource-list';
const categories: Database['public']['Enums']['service_category'][] = [
  'organizasyon',
  'nisan_soz_setup',
  'dogum_gunu',
  'baby_shower',
  'gender_reveal',
  'dekor_konsept',
  'muzik_dj',
  'foto_video',
  'sehir_hizmeti',
  'ozel',
];
export const dynamic = 'force-dynamic';
export default async function Page() {
  await requireStaff('/admin/services/availability');
  const db = createAdminClient();
  const [blocks, cities] = await Promise.all([
    db
      .from('service_availability_blocks')
      .select('*,service_cities(city_name)')
      .gte('date', new Date().toISOString().slice(0, 10))
      .order('date')
      .limit(180),
    db
      .from('service_cities')
      .select('id,city_name')
      .eq('is_active', true)
      .order('city_name'),
  ]);
  return (
    <div className="space-y-6 p-4 md:p-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-cherie-brass">
          Kapasite ve blackout
        </p>
        <h1 className="font-display text-4xl">Uygunluk</h1>
      </header>
      <form
        action={saveAvailability}
        className="grid gap-3 rounded-card-lg border border-cherie-lace p-4 md:grid-cols-3"
      >
        <input type="date" name="date" required className="cherie-field" />
        <select name="city_id" className="cherie-field">
          <option value="">Tüm şehirler</option>
          {(cities.data ?? []).map((x) => (
            <option key={x.id} value={x.id}>
              {x.city_name}
            </option>
          ))}
        </select>
        <select name="service_category" className="cherie-field">
          <option value="">Tüm hizmetler</option>
          {categories.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <input
          name="capacity"
          type="number"
          min="0"
          defaultValue="1"
          className="cherie-field"
          placeholder="Kapasite"
        />
        <input name="note" className="cherie-field" placeholder="Not / booking kuralı" />
        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_blackout" /> Blackout
        </label>
        <button className="cherie-button-primary md:col-span-3">
          Uygunluk bloğu ekle
        </button>
      </form>
      <div className="overflow-x-auto rounded-card-lg border border-cherie-lace">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-cherie-paper">
            <tr>
              <th className="p-3 text-left">Tarih</th>
              <th>Şehir</th>
              <th>Hizmet</th>
              <th>Kapasite</th>
              <th>Durum</th>
              <th>Not</th>
            </tr>
          </thead>
          <tbody>
            {(blocks.data ?? []).map((x) => (
              <tr key={x.id} className="border-t border-cherie-lace">
                <td className="p-3">
                  <AdminDate value={x.date} />
                </td>
                <td>{x.service_cities?.city_name ?? 'Tümü'}</td>
                <td>{x.service_category ?? 'Tümü'}</td>
                <td>
                  {x.booked_count}/{x.capacity}
                </td>
                <td>
                  <StateBadge
                    value={
                      x.is_blackout
                        ? 'blackout'
                        : x.booked_count >= x.capacity
                          ? 'full'
                          : 'available'
                    }
                  />
                </td>
                <td>{x.note ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
