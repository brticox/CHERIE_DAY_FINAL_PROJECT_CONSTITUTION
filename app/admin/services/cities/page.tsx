import { requireStaff } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { saveServiceCity } from '../actions';
import type { Database } from '@/lib/supabase/database.types';
export const dynamic = 'force-dynamic';
export default async function Page() {
  await requireStaff('/admin/services/cities');
  const { data } = await createAdminClient()
    .from('service_cities')
    .select('*')
    .order('city_name');
  return (
    <div className="space-y-6 p-4 md:p-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-cherie-brass">
          Kapsama alanı
        </p>
        <h1 className="font-display text-4xl">Şehirler</h1>
      </header>
      <CityForm />
      <div className="grid gap-4 lg:grid-cols-2">
        {(data ?? []).map((x) => (
          <details key={x.id} className="rounded-card-lg border border-cherie-lace p-5">
            <summary className="cursor-pointer font-bold">
              {x.city_name} · {x.is_active ? 'Aktif' : 'Pasif'}
            </summary>
            <CityForm row={x} />
          </details>
        ))}
      </div>
    </div>
  );
}
function CityForm({
  row,
}: {
  row?: Database['public']['Tables']['service_cities']['Row'];
}) {
  return (
    <form
      action={saveServiceCity}
      className="mt-4 grid gap-3 rounded-card-lg border border-cherie-lace/70 p-4 sm:grid-cols-2"
    >
      {row && <input type="hidden" name="id" value={row.id} />}
      <input
        name="city_name"
        required
        defaultValue={row?.city_name}
        placeholder="Şehir"
        className="cherie-field"
      />
      <input
        name="city_slug"
        required
        defaultValue={row?.city_slug}
        placeholder="slug"
        className="cherie-field"
      />
      <select
        name="travel_fee_model"
        defaultValue={row?.travel_fee_model ?? 'none'}
        className="cherie-field"
      >
        <option value="none">Ücretsiz</option>
        <option value="fixed">Sabit</option>
        <option value="per_km">Km başı</option>
        <option value="quote">Teklif</option>
      </select>
      <input
        name="travel_fee_value"
        type="number"
        min="0"
        step="0.01"
        defaultValue={row?.travel_fee_value ?? ''}
        placeholder="Seyahat bedeli"
        className="cherie-field"
      />
      <textarea
        name="notes_tr"
        defaultValue={row?.notes_tr ?? ''}
        placeholder="Şehir notu"
        className="cherie-field sm:col-span-2"
      />
      <label className="text-sm">
        <input type="checkbox" name="is_active" defaultChecked={row?.is_active ?? true} />{' '}
        Aktif
      </label>
      <button className="cherie-button-primary">Kaydet</button>
    </form>
  );
}
