import { requireCapability } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { StateBadge } from '@/components/admin/resource-list';
import {
  AdminEmptyState,
  AdminNotice,
  AdminPageHeader,
} from '@/components/admin/admin-workspace';
import { adminValueLabel } from '@/lib/admin/presentation';
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
  await requireCapability('services.read', '/admin/services/packages');
  const { data, error } = await createAdminClient()
    .from('service_packages')
    .select('*')
    .order('name');
  return (
    <div className="space-y-7 p-4 md:p-8">
      <AdminPageHeader
        eyebrow="Hizmet kataloğu"
        title="Hizmet paketleri"
        description="Teklif, rezervasyon ve şehir bazlı hizmetlerin kapsamını ve satışa hazırlığını yönetin."
      />
      <PackageForm />
      {!error && (data ?? []).length === 0 && (
        <AdminEmptyState
          title="Henüz hizmet paketi yok"
          description="İlk paketi yukarıdaki alanlardan oluşturduğunuzda teklif ve rezervasyon akışlarında kullanılabilir."
          primary={{ label: 'Paket alanlarına dön', href: '#yeni-paket' }}
        />
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        {(data ?? []).map((x) => (
          <details key={x.id} className="admin-surface p-5 shadow-none">
            <summary className="flex cursor-pointer items-center justify-between">
              <strong>{x.name}</strong>
              <StateBadge value={x.status} />
            </summary>
            <PackageForm row={x} />
          </details>
        ))}
      </div>
      {error && (
        <AdminNotice tone="danger" title="Hizmet paketleri okunamıyor">
          Hiçbir paket değiştirilmedi. Bağlantıyı kontrol edip sayfayı güvenle
          yenileyebilirsiniz.
        </AdminNotice>
      )}
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
      id={row ? undefined : 'yeni-paket'}
      action={saveServicePackage}
      className="mt-4 grid gap-3 rounded-card-lg border border-cherie-lace/70 bg-white/50 p-4 sm:grid-cols-2"
    >
      {row && <input type="hidden" name="id" value={row.id} />}
      <input
        aria-label="Paket adı"
        name="name"
        required
        defaultValue={row?.name}
        placeholder="Paket adı"
        className="cherie-field"
      />
      <select
        aria-label="Fiyat gösterimi"
        name="price_display"
        defaultValue={row?.price_display ?? 'quote_only'}
        className="cherie-field"
      >
        <option value="from_price">Başlangıç fiyatı</option>
        <option value="price_band">Fiyat bandı</option>
        <option value="quote_only">Yalnızca teklif</option>
      </select>
      <select
        aria-label="Depozito modeli"
        name="deposit_model"
        defaultValue={row?.deposit_model ?? 'none'}
        className="cherie-field"
      >
        <option value="none">Depozito yok</option>
        <option value="fixed">Sabit depozito</option>
        <option value="percentage">Yüzde depozito</option>
      </select>
      <input
        aria-label="Depozito değeri"
        name="deposit_value"
        type="number"
        min="0"
        step="0.01"
        defaultValue={row?.deposit_value ?? ''}
        placeholder="Depozito değeri"
        className="cherie-field"
      />
      <input
        aria-label="Arama görünümü başlığı"
        name="seo_title"
        defaultValue=""
        placeholder="Arama görünümü başlığı"
        className="cherie-field"
      />
      <textarea
        aria-label="Arama görünümü açıklaması"
        name="seo_description"
        placeholder="Arama görünümü açıklaması"
        className="cherie-field sm:col-span-2"
      />
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input type="checkbox" name="seo_noindex" /> Arama motorlarından gizle
      </label>
      <input
        aria-label="Paket adres kısa adı"
        name="slug"
        required
        defaultValue={row?.slug}
        placeholder="Adres kısa adı"
        className="cherie-field"
      />
      <select
        aria-label="Hizmet kategorisi"
        name="service_category"
        defaultValue={row?.service_category ?? 'organizasyon'}
        className="cherie-field"
      >
        {categories.map((x) => (
          <option key={x} value={x}>
            {adminValueLabel(x)}
          </option>
        ))}
      </select>
      <select
        aria-label="Hizmet davranışı"
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
        aria-label="Başlangıç fiyatı"
        name="base_from_price"
        type="number"
        min="0"
        step="0.01"
        defaultValue={row?.base_from_price ?? ''}
        placeholder="Başlangıç fiyatı"
        className="cherie-field"
      />
      <input
        aria-label="Minimum hazırlık günü"
        name="min_lead_time_days"
        type="number"
        min="0"
        defaultValue={row?.min_lead_time_days ?? 0}
        placeholder="Minimum hazırlık günü"
        className="cherie-field"
      />
      <input
        aria-label="Paket özeti"
        name="summary"
        defaultValue={row?.summary ?? ''}
        placeholder="Kısa özet"
        className="cherie-field sm:col-span-2"
      />
      <textarea
        aria-label="Paket açıklaması"
        name="description"
        defaultValue={row?.description ?? ''}
        placeholder="Açıklama, kapsam ve rezervasyon kuralları"
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
        aria-label="Paket durumu"
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
