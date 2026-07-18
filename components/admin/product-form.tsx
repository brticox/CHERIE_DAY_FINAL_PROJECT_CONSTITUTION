import type { Database } from '@/lib/supabase/database.types';
import {
  changeProductLifecycle,
  saveProduct,
} from '@/app/admin/commerce/products/actions';
import { AdminStatus } from './admin-workspace';
import { UnsavedFormGuard } from './unsaved-form-guard';

type Product = Database['public']['Tables']['products']['Row'];
type Option = { id: string; label: string };
const FORM_ID = 'urun-duzenleme-formu';

export function ProductForm({
  product,
  categories,
  collections,
  canPublish,
  error,
}: {
  product?: Product;
  categories: Option[];
  collections: Option[];
  canPublish: boolean;
  error?: string;
}) {
  const status = product?.archived_at ? 'archived' : (product?.status ?? 'draft');
  return (
    <form
      id={FORM_ID}
      action={saveProduct}
      className="grid gap-7 xl:grid-cols-[1.618fr_1fr]"
    >
      {product && <input type="hidden" name="id" value={product.id} />}
      <div className="space-y-7">
        {error && (
          <div
            role="alert"
            className="rounded-card border border-cherie-error/30 bg-cherie-error/10 p-4 text-sm leading-6 text-cherie-error"
          >
            Değişiklikler kaydedilemedi. Hiçbir alan güncellenmedi; işaretli bilgileri
            kontrol edip yeniden deneyin.
          </div>
        )}
        <Fieldset
          id="kimlik"
          eyebrow="01"
          title="Kimlik ve içerik"
          description="Müşterinin ürün sayfasında göreceği temel bilgi ve sınıflandırma."
        >
          <Field label="Ürün adı" name="name" required defaultValue={product?.name} />
          <Field
            label="Sayfa adresi"
            name="slug"
            required
            defaultValue={product?.slug}
            hint="Örnek: inci-muhur-davetiye"
          />
          <label className="grid gap-2 text-sm font-semibold">
            Açıklama
            <textarea
              name="description"
              defaultValue={product?.description ?? ''}
              rows={8}
              maxLength={6000}
              className="cherie-field resize-y"
            />
            <span className="text-xs font-normal leading-5 text-cherie-soft-ink">
              Yayın öncesinde zorunludur. En az 20 karakterlik açık bir açıklama yazın.
            </span>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Kategori"
              name="category_id"
              options={categories}
              value={product?.category_id}
            />
            <Select
              label="Koleksiyon"
              name="collection_id"
              options={collections}
              value={product?.collection_id}
            />
          </div>
        </Fieldset>

        <Fieldset
          id="ticaret"
          eyebrow="02"
          title="Ticaret ve üretim"
          description="Fiyat, sipariş ve üretim davranışı kaydetme sırasında yeniden doğrulanır."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Satış davranışı"
              name="behavior_type"
              value={product?.behavior_type ?? 'inquiry_only'}
              options={[
                { id: 'cart_enabled', label: 'Doğrudan satış' },
                { id: 'proof_required_cart', label: 'Prova onaylı satış' },
                { id: 'digital_checkout', label: 'Dijital satış' },
                { id: 'quote_required', label: 'Teklif gerekli' },
                { id: 'inquiry_only', label: 'Bilgi talebi' },
                { id: 'reservation_request', label: 'Rezervasyon talebi' },
                { id: 'city_dependent_service', label: 'Şehre bağlı hizmet' },
              ]}
            />
            <Field
              label="Baz fiyat (₺)"
              name="base_price"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              defaultValue={product?.base_price ?? ''}
            />
            <Select
              label="Stok modeli"
              name="stock_mode"
              value={product?.stock_mode ?? 'made_to_order'}
              options={[
                { id: 'in_stock', label: 'Stokta' },
                { id: 'made_to_order', label: 'Siparişe özel üretim' },
                { id: 'preorder', label: 'Ön sipariş' },
                { id: 'unavailable', label: 'Mevcut değil' },
              ]}
            />
            <Field
              label="Üretim süresi (gün)"
              name="production_time_days"
              type="number"
              inputMode="numeric"
              min="0"
              max="365"
              defaultValue={product?.production_time_days ?? ''}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Check
              name="proof_required"
              label="Prova onayı gerekli"
              checked={product?.proof_required}
            />
            <Check
              name="is_personalizable"
              label="Kişiselleştirilebilir"
              checked={product?.is_personalizable}
            />
          </div>
        </Fieldset>
      </div>

      <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
        <section className="admin-surface overflow-hidden">
          <div className="bg-cherie-paper/65 p-5">
            <p className="admin-eyebrow">Kayıt durumu</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <AdminStatus value={status} />
              <UnsavedFormGuard formId={FORM_ID} />
            </div>
          </div>
          <div className="p-5">
            <button type="submit" className="cherie-button-primary min-h-12 w-full">
              {product ? 'Değişiklikleri kaydet' : 'Güvenli taslak oluştur'}
            </button>
            <p className="mt-3 text-xs leading-5 text-cherie-soft-ink">
              Kaydetme işlemi yalnızca bu bölümdeki alanları günceller.
            </p>
          </div>
        </section>

        <section className="admin-surface p-5 shadow-none">
          <h2 className="font-display text-2xl">Yayın güvenliği</h2>
          <ul className="mt-4 space-y-3 text-sm text-cherie-soft-ink">
            <li>Okunabilir ve benzersiz sayfa adresi</li>
            <li>En az 20 karakterlik ürün açıklaması</li>
            <li>Satış ürünlerinde geçerli fiyat</li>
            <li>En az bir etkin ürün görseli</li>
            <li>Sunucuda atomik yayın doğrulaması</li>
          </ul>
          {product && (
            <div className="mt-5 grid gap-2 border-t border-cherie-lace pt-5">
              {product.archived_at ? (
                <button
                  formAction={changeProductLifecycle.bind(null, 'restore')}
                  className="cherie-button-secondary"
                >
                  Arşivden çıkar
                </button>
              ) : (
                <>
                  {canPublish && product.status !== 'published' && (
                    <button
                      formAction={changeProductLifecycle.bind(null, 'publish')}
                      className="cherie-button-primary"
                    >
                      Hazırlığı doğrula ve yayınla
                    </button>
                  )}
                  <button
                    formAction={changeProductLifecycle.bind(null, 'archive')}
                    className="cherie-button-secondary text-cherie-error"
                  >
                    Ürünü arşivle
                  </button>
                </>
              )}
            </div>
          )}
        </section>
      </aside>
    </form>
  );
}

function Fieldset({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset id={id} className="admin-surface scroll-mt-28 space-y-5 p-5 md:p-7">
      <legend className="sr-only">{title}</legend>
      <div className="border-b border-cherie-lace pb-5">
        <p className="admin-eyebrow">{eyebrow}</p>
        <h2 className="mt-1 font-display text-3xl text-cherie-ink">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-cherie-soft-ink">{description}</p>
      </div>
      {children}
    </fieldset>
  );
}

function Field({
  label,
  name,
  hint,
  ...props
}: {
  label: string;
  name: string;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <input name={name} className="cherie-field" {...props} />
      {hint && <span className="text-xs font-normal text-cherie-soft-ink">{hint}</span>}
    </label>
  );
}

function Select({
  label,
  name,
  options,
  value,
}: {
  label: string;
  name: string;
  options: Option[];
  value?: string | null;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <select name={name} defaultValue={value ?? ''} className="cherie-field">
        <option value="">Seçilmedi</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Check({
  name,
  label,
  checked,
}: {
  name: string;
  label: string;
  checked?: boolean;
}) {
  return (
    <label className="flex min-h-12 items-center gap-3 rounded-control border border-cherie-lace bg-cherie-ivory px-4 text-sm font-semibold">
      <input
        type="checkbox"
        name={name}
        defaultChecked={checked}
        className="cherie-check size-4"
      />
      {label}
    </label>
  );
}
