import type { ProductSort } from '@/lib/data/catalog';
import type { Category, ProductBehavior, StockMode } from '@/lib/data/types';

type CatalogValue = {
  q?: string;
  category?: string;
  stock?: StockMode;
  behavior?: ProductBehavior;
  sort?: ProductSort;
};

const selectClass = 'cherie-field h-12 py-0 text-sm';

export function CatalogToolbar({
  categories,
  value,
  resultCount,
}: {
  categories: Category[];
  value: CatalogValue;
  resultCount: number;
}) {
  return (
    <div className="cherie-surface rounded-card-lg p-4 sm:p-5">
      <form className="grid gap-3 lg:grid-cols-[minmax(220px,1.5fr)_repeat(4,minmax(130px,1fr))_auto]">
        <label className="sr-only" htmlFor="catalog-search">
          Ürün ara
        </label>
        <input
          id="catalog-search"
          name="q"
          type="search"
          defaultValue={value.q}
          placeholder="Ürün, malzeme veya koleksiyon ara"
          className={selectClass}
        />
        <select
          name="category"
          defaultValue={value.category ?? ''}
          className={selectClass}
        >
          <option value="">Tüm alt kategoriler</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
        <select name="stock" defaultValue={value.stock ?? ''} className={selectClass}>
          <option value="">Tüm erişilebilirlik</option>
          <option value="in_stock">Stokta</option>
          <option value="made_to_order">Sipariş üzerine</option>
          <option value="preorder">Ön sipariş</option>
          <option value="unavailable">Şu an sunulmuyor</option>
        </select>
        <select
          name="behavior"
          defaultValue={value.behavior ?? ''}
          className={selectClass}
        >
          <option value="">Tüm satın alma yolları</option>
          <option value="cart_enabled">Doğrudan sipariş</option>
          <option value="proof_required_cart">Tasarım onaylı</option>
          <option value="quote_required">Teklif ile</option>
          <option value="inquiry_only">Görüşme ile</option>
        </select>
        <select
          name="sort"
          defaultValue={value.sort ?? 'featured'}
          className={selectClass}
        >
          <option value="featured">Önerilen sıralama</option>
          <option value="price-asc">Fiyat: düşükten yükseğe</option>
          <option value="price-desc">Fiyat: yüksekten düşüğe</option>
          <option value="production">En kısa üretim</option>
        </select>
        <button className="h-12 cursor-pointer rounded-control bg-cherie-burgundy px-5 text-sm font-semibold text-cherie-ivory shadow-sm transition hover:-translate-y-0.5 hover:bg-cherie-cherry">
          Uygula
        </button>
      </form>
      <div className="mt-3 flex items-center justify-between text-xs text-cherie-soft-ink">
        <span>{resultCount} seçim gösteriliyor</span>
        <a href="?" className="font-medium text-cherie-burgundy hover:underline">
          Filtreleri temizle
        </a>
      </div>
    </div>
  );
}
