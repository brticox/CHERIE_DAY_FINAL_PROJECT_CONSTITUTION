import { requireStaff } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { StateBadge } from '@/components/admin/resource-list';
import { saveServicePackage } from '../actions';
import type { Database } from '@/lib/supabase/database.types';
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
  await requireStaff('/admin/services/packages');
  const { data, error } = await createAdminClient()
    .from('service_packages')
    .select('*')
    .order('name');
  return (
    <div className="space-y-6 p-4 md:p-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-cherie-brass">
          Hizmet kataloğu
        </p>
        <h1 className="font-display text-4xl">Hizmet paketleri</h1>
      </header>
      <PackageForm />
      <div className="grid gap-4 lg:grid-cols-2">
        {(data ?? []).map((x) => (
          <details key={x.id} className="rounded-card-lg border border-cherie-lace p-5">
            <summary className="flex cursor-pointer items-center justify-between">
              <strong>{x.name}</strong>
              <StateBadge value={x.status} />
            </summary>
            <PackageForm row={x} />
          </details>
        ))}
      </div>
      {error && <p>Hizmet paketleri okunamadı.</p>}
    </div>
  );
}
function PackageForm({
  row,
}: {
  row?: Database['public']['Tables']['service_packages']['Row'];
}) {
  return (
    <form
      action={saveServicePackage}
      className="mt-4 grid gap-3 rounded-card-lg border border-cherie-lace/70 bg-white/50 p-4 sm:grid-cols-2"
    >
      {row && <input type="hidden" name="id" value={row.id} />}
      <input
        name="name"
        required
        defaultValue={row?.name}
        placeholder="Paket adı"
        className="cherie-field"
      />
      <select
        name="price_display"
        defaultValue={row?.price_display ?? 'quote_only'}
        className="cherie-field"
      >
        <option value="from_price">Başlangıç fiyatı</option>
        <option value="price_band">Fiyat bandı</option>
        <option value="quote_only">Yalnızca teklif</option>
      </select>
      <select
        name="deposit_model"
        defaultValue={row?.deposit_model ?? 'none'}
        className="cherie-field"
      >
        <option value="none">Depozito yok</option>
        <option value="fixed">Sabit depozito</option>
        <option value="percentage">Yüzde depozito</option>
      </select>
      <input
        name="deposit_value"
        type="number"
        min="0"
        step="0.01"
        defaultValue={row?.deposit_value ?? ''}
        placeholder="Depozito değeri"
        className="cherie-field"
      />
      <input
        name="seo_title"
        defaultValue=""
        placeholder="SEO başlığı"
        className="cherie-field"
      />
      <textarea
        name="seo_description"
        placeholder="SEO açıklaması"
        className="cherie-field sm:col-span-2"
      />
      <label className="text-sm">
        <input type="checkbox" name="seo_noindex" /> Noindex
      </label>
      <input
        name="slug"
        required
        defaultValue={row?.slug}
        placeholder="slug"
        className="cherie-field"
      />
      <select
        name="service_category"
        defaultValue={row?.service_category ?? 'organizasyon'}
        className="cherie-field"
      >
        {categories.map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>
      <select
        name="behavior_type"
        defaultValue={row?.behavior_type ?? 'quote_required'}
        className="cherie-field"
      >
        <option value="quote_required">Teklif gerekli</option>
        <option value="reservation_request">Rezervasyon talebi</option>
        <option value="city_dependent_service">Şehre bağlı</option>
        <option value="inquiry_only">Talep</option>
      </select>
      <input
        name="base_from_price"
        type="number"
        min="0"
        step="0.01"
        defaultValue={row?.base_from_price ?? ''}
        placeholder="Başlangıç fiyatı"
        className="cherie-field"
      />
      <input
        name="min_lead_time_days"
        type="number"
        min="0"
        defaultValue={row?.min_lead_time_days ?? 0}
        placeholder="Minimum hazırlık günü"
        className="cherie-field"
      />
      <input
        name="summary"
        defaultValue={row?.summary ?? ''}
        placeholder="Kısa özet"
        className="cherie-field sm:col-span-2"
      />
      <textarea
        name="description"
        defaultValue={row?.description ?? ''}
        placeholder="Açıklama / kapsam / booking kuralları"
        className="cherie-field sm:col-span-2"
      />
      <div className="flex flex-wrap gap-3 text-xs sm:col-span-2">
        <label>
          <input
            type="checkbox"
            name="requires_event_date"
            defaultChecked={row?.requires_event_date}
          />{' '}
          Tarih gerekli
        </label>
        <label>
          <input
            type="checkbox"
            name="requires_guest_count"
            defaultChecked={row?.requires_guest_count}
          />{' '}
          Konuk sayısı
        </label>
        <label>
          <input
            type="checkbox"
            name="requires_venue"
            defaultChecked={row?.requires_venue}
          />{' '}
          Mekân
        </label>
      </div>
      <select
        name="status"
        defaultValue={row?.status ?? 'draft'}
        className="cherie-field"
      >
        <option value="draft">Taslak</option>
        <option value="published">Yayında</option>
      </select>
      <button className="cherie-button-primary">
        {row ? 'Güncelle' : 'Paket oluştur'}
      </button>
    </form>
  );
}
