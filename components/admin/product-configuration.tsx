import {
  addProductOption,
  deleteProductOption,
  saveProductSeo,
  saveProductTaxonomy,
} from '@/app/admin/commerce/products/actions';
import { formatTRY } from '@/lib/format';

type Row = {
  id: string;
  title?: string;
  name_tr?: string;
  label?: string;
  price?: number | null;
  unit_price?: number;
  min_qty?: number;
  sku?: string | null;
  field_type?: string;
  required?: boolean;
};
type Named = { id: string; name_tr: string };
type Seo = {
  title: string | null;
  description: string | null;
  canonical_url: string | null;
  schema_type: string | null;
  noindex: boolean;
} | null;

export function ProductConfiguration({
  productId,
  variants,
  addons,
  fields,
  tiers,
  materials,
  colors,
  selectedMaterials,
  selectedColors,
  seo,
  product,
}: {
  productId: string;
  variants: Row[];
  addons: Row[];
  fields: Row[];
  tiers: Row[];
  materials: Named[];
  colors: (Named & { hex: string | null })[];
  selectedMaterials: string[];
  selectedColors: string[];
  seo: Seo;
  product: {
    name: string;
    description: string | null;
    slug: string;
    base_price: number | null;
  };
}) {
  return (
    <div className="space-y-7">
      <section id="secenekler" className="scroll-mt-28 space-y-5">
        <div>
          <p className="admin-eyebrow">04 · Ürün mimarisi</p>
          <h2 className="admin-section-title mt-1">Seçenekler ve kişiselleştirme</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-cherie-soft-ink">
            Müşterinin seçim yapacağı varyantları, ek hizmetleri ve adet fiyatlarını ayrı
            iş katmanları olarak yönetin.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <OptionPanel
            title="Varyantlar"
            kind="variant"
            productId={productId}
            rows={variants}
            fields={
              <>
                <Input name="title" label="Varyant adı" />
                <Input name="sku" label="Stok kodu" />
                <Input
                  name="price"
                  label="Fiyat"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                />
                <Input
                  name="stock_quantity"
                  label="Stok"
                  type="number"
                  inputMode="numeric"
                />
              </>
            }
          />
          <OptionPanel
            title="Ek seçenekler"
            kind="addon"
            productId={productId}
            rows={addons}
            fields={
              <>
                <Input name="title" label="Ek seçenek adı" />
                <Input
                  name="price"
                  label="Fiyat"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                />
              </>
            }
          />
          <OptionPanel
            title="Kişiselleştirme alanları"
            kind="personalization"
            productId={productId}
            rows={fields}
            fields={
              <>
                <Input name="title" label="Alan etiketi" />
                <label className="grid gap-2 text-sm font-semibold">
                  Alan tipi
                  <select name="field_type" className="cherie-field">
                    <option value="text">Kısa metin</option>
                    <option value="textarea">Uzun metin</option>
                    <option value="date">Tarih</option>
                    <option value="number">Sayı</option>
                    <option value="file">Dosya</option>
                    <option value="checkbox">Onay kutusu</option>
                  </select>
                </label>
                <Input name="helper_text" label="Yardım metni" />
                <label className="flex min-h-12 items-center gap-2 text-sm font-semibold">
                  <input type="checkbox" name="required" className="cherie-check" />
                  Zorunlu alan
                </label>
              </>
            }
          />
          <OptionPanel
            title="Adet fiyatları"
            kind="tier"
            productId={productId}
            rows={tiers}
            fields={
              <>
                <Input
                  name="min_qty"
                  label="En az adet"
                  type="number"
                  inputMode="numeric"
                  min="1"
                />
                <Input
                  name="unit_price"
                  label="Birim fiyat"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                />
              </>
            }
          />
        </div>
      </section>

      <form
        id="siniflandirma"
        action={saveProductTaxonomy}
        className="admin-surface scroll-mt-28 p-5 md:p-7"
      >
        <input type="hidden" name="id" value={productId} />
        <p className="admin-eyebrow">05 · Sınıflandırma</p>
        <h2 className="mt-1 font-display text-3xl text-cherie-ink">Malzeme ve renkler</h2>
        <p className="mt-2 text-sm leading-6 text-cherie-soft-ink">
          Filtreleme ve ürün anlatısında kullanılacak gerçek seçenekleri işaretleyin.
        </p>
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <Checks
            name="material_ids"
            title="Malzemeler"
            rows={materials}
            selected={selectedMaterials}
          />
          <Checks
            name="color_ids"
            title="Renkler"
            rows={colors}
            selected={selectedColors}
          />
        </div>
        <button className="cherie-button-primary mt-6">Sınıflandırmayı kaydet</button>
      </form>

      <form
        id="seo"
        action={saveProductSeo}
        className="admin-surface scroll-mt-28 p-5 md:p-7"
      >
        <input type="hidden" name="id" value={productId} />
        <p className="admin-eyebrow">06 · Bulunabilirlik</p>
        <h2 className="mt-1 font-display text-3xl text-cherie-ink">Arama görünümü</h2>
        <p className="mt-2 text-sm leading-6 text-cherie-soft-ink">
          Arama sonucunda görünecek başlık, açıklama ve kanonik adresi yönetin.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Input
            name="seo_title"
            label="Arama başlığı (öneri: en fazla 60 karakter)"
            defaultValue={seo?.title ?? ''}
          />
          <label className="grid gap-2 text-sm font-semibold">
            İçerik türü
            <select
              name="schema_type"
              defaultValue={seo?.schema_type ?? 'Product'}
              className="cherie-field"
            >
              <option value="Product">Ürün</option>
              <option value="Service">Hizmet</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold md:col-span-2">
            Arama açıklaması
            <textarea
              name="seo_description"
              defaultValue={seo?.description ?? ''}
              maxLength={320}
              rows={4}
              className="cherie-field"
            />
          </label>
          <Input
            name="canonical_url"
            label="Kanonik adres"
            defaultValue={seo?.canonical_url ?? ''}
          />
          <label className="flex min-h-12 items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              name="noindex"
              defaultChecked={seo?.noindex}
              className="cherie-check"
            />
            Arama motorlarından gizle
          </label>
        </div>
        <details className="mt-6 rounded-card bg-cherie-paper/55 p-4">
          <summary className="font-semibold text-cherie-burgundy">
            Arama sonucu önizlemesini göster
          </summary>
          <div className="mt-4 max-w-2xl rounded-control bg-white p-4">
            <p className="text-lg font-semibold text-cherie-burgundy">
              {seo?.title || product.name}
            </p>
            <p className="mt-1 break-all text-xs text-cherie-success">/{product.slug}</p>
            <p className="mt-2 text-sm leading-6 text-cherie-soft-ink">
              {seo?.description ||
                product.description ||
                'Arama açıklaması henüz yazılmadı.'}
            </p>
            {product.base_price ? (
              <p className="mt-2 text-sm font-semibold text-cherie-ink">
                {formatTRY(product.base_price)}
              </p>
            ) : null}
          </div>
        </details>
        <button className="cherie-button-primary mt-6">Arama ayarlarını kaydet</button>
      </form>
    </div>
  );
}

function OptionPanel({
  title,
  kind,
  productId,
  rows,
  fields,
}: {
  title: string;
  kind: string;
  productId: string;
  rows: Row[];
  fields: React.ReactNode;
}) {
  return (
    <section className="admin-surface p-5 shadow-none">
      <h3 className="font-display text-2xl text-cherie-ink">{title}</h3>
      <div className="mt-4 space-y-2">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex items-center justify-between gap-3 rounded-control bg-cherie-paper/55 px-3 py-3 text-sm"
          >
            <span className="min-w-0">
              <strong>
                {row.title || row.name_tr || row.label || `${row.min_qty} adet`}
              </strong>
              {row.price != null || row.unit_price != null
                ? ` · ${formatTRY(Number(row.price ?? row.unit_price))}`
                : ''}
            </span>
            <form action={deleteProductOption}>
              <input type="hidden" name="product_id" value={productId} />
              <input type="hidden" name="row_id" value={row.id} />
              <input type="hidden" name="kind" value={kind} />
              <button className="min-h-11 px-2 text-sm font-bold text-cherie-error">
                Kaldır
              </button>
            </form>
          </div>
        ))}
        {!rows.length && (
          <p className="rounded-control bg-cherie-paper/55 p-4 text-sm leading-6 text-cherie-soft-ink">
            {title} henüz eklenmedi. Müşterinin göreceği ilk seçeneği aşağıdaki alanlardan
            oluşturabilirsiniz.
          </p>
        )}
      </div>
      <form
        action={addProductOption}
        className="mt-5 grid gap-3 border-t border-cherie-lace pt-5 sm:grid-cols-2"
      >
        <input type="hidden" name="id" value={productId} />
        <input type="hidden" name="kind" value={kind} />
        {fields}
        <button className="cherie-button-secondary sm:col-span-2">
          Yeni seçenek ekle
        </button>
      </form>
    </section>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <input {...rest} className="cherie-field" />
    </label>
  );
}

function Checks({
  name,
  title,
  rows,
  selected,
}: {
  name: string;
  title: string;
  rows: Named[];
  selected: string[];
}) {
  return (
    <fieldset>
      <legend className="text-sm font-bold">{title}</legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {rows.map((row) => (
          <label
            key={row.id}
            className="inline-flex min-h-11 items-center rounded-full border border-cherie-lace bg-cherie-ivory px-3 text-sm"
          >
            <input
              type="checkbox"
              name={name}
              value={row.id}
              defaultChecked={selected.includes(row.id)}
              className="cherie-check mr-2"
            />
            {row.name_tr}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
