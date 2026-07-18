import Link from 'next/link';
import { requireCapability } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { AdminPageHeader, AdminToolbar } from '@/components/admin/admin-workspace';
import { AdminDate, StateBadge } from '@/components/admin/resource-list';
import { adjustInventory } from './actions';

type Variant = {
  id: string; title: string; sku: string | null; stock_quantity: number | null; status: string;
  products: { name: string; stock_mode: string } | null;
};
type Movement = {
  id: string; variant_id: string; delta: number; quantity_before: number; quantity_after: number;
  reason: string; note: string | null; created_at: string;
  product_variants: { title: string; sku: string | null } | null;
};
type VariantQuery = {
  select(columns: string, options: { count: 'exact' }): VariantQuery;
  ilike(column: 'title', pattern: string): VariantQuery;
  order(column: 'title', options: { ascending: true }): VariantQuery;
  range(from: number, to: number): Promise<{ data: Variant[] | null; count: number | null; error: { message: string } | null }>;
};
type MovementQuery = {
  select(columns: string): MovementQuery;
  order(column: 'created_at', options: { ascending: false }): MovementQuery;
  limit(count: number): Promise<{ data: Movement[] | null; error: { message: string } | null }>;
};

export default async function Page({ searchParams }: {
  searchParams: Promise<{ q?: string; page?: string; saved?: string; error?: string }>;
}) {
  const path = '/admin/commerce/inventory';
  const { staff } = await requireCapability('catalog.read', path);
  const mayAdjust = ['superadmin', 'admin', 'commerce_manager'].includes(staff.role);
  const query = await searchParams;
  const page = Math.max(1, Number.parseInt(query.page ?? '1', 10) || 1);
  const pageSize = 20;
  const db = createAdminClient();
  const from = db.from.bind(db) as unknown as (name: string) => VariantQuery;
  let variantsRequest = from('product_variants').select(
    'id,title,sku,stock_quantity,status,products!inner(name,stock_mode)', { count: 'exact' },
  );
  if (query.q) variantsRequest = variantsRequest.ilike('title', `%${query.q.replace(/[,%]/g, '')}%`);
  const variantsResult = await variantsRequest.order('title', { ascending: true }).range((page - 1) * pageSize, page * pageSize - 1);
  const movementsFrom = db.from.bind(db) as unknown as (name: string) => MovementQuery;
  const movementsResult = await movementsFrom('inventory_movements')
    .select('id,variant_id,delta,quantity_before,quantity_after,reason,note,created_at,product_variants(title,sku)')
    .order('created_at', { ascending: false }).limit(40);
  const variants = variantsResult.data ?? [];
  const pages = Math.max(1, Math.ceil((variantsResult.count ?? 0) / pageSize));

  return (
    <div className="mx-auto max-w-[1680px] space-y-7 p-4 md:p-7 xl:p-9">
      <AdminPageHeader
        eyebrow="Ticaret operasyonu"
        title="Stok yönetimi"
        description="Stoklu ve ön sipariş ürünlerini atomik olarak günceller; her hareket öncesi ve sonrası miktarla denetim günlüğüne kaydedilir. Siparişe göre üretilen ürünlerde stok takibi bilinçli olarak kapalıdır."
      />
      {query.saved && <p role="status" className="rounded-card border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">Stok hareketi kaydedildi.</p>}
      {query.error && <p role="alert" className="rounded-card border border-cherie-error/30 bg-cherie-error/10 p-4 text-sm text-cherie-error">Stok değiştirilemedi: {decodeURIComponent(query.error)}</p>}
      {!mayAdjust && <p className="rounded-card border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">Stokları görüntüleyebilirsiniz. Değişiklik yalnızca ticaret yöneticisi veya yönetici tarafından yapılabilir.</p>}
      <AdminToolbar label="Stok arama araçları">
        <form className="flex flex-col gap-3 sm:flex-row">
          <input name="q" defaultValue={query.q} placeholder="Varyant adına göre ara" aria-label="Varyant adına göre ara" className="cherie-field flex-1" />
          <button className="cherie-button-secondary min-h-12">Ara</button>
        </form>
      </AdminToolbar>
      {variantsResult.error ? <p role="alert" className="rounded-card border border-cherie-error/30 bg-cherie-error/10 p-4 text-cherie-error">Stok listesi okunamadı; hiçbir değişiklik yapılmadı.</p> : (
        <section aria-label="Varyant stokları" className="grid gap-4 xl:grid-cols-2">
          {variants.map((variant) => {
            const mode = variant.products?.stock_mode ?? 'unknown';
            const tracked = mode === 'in_stock' || mode === 'preorder';
            return <article key={variant.id} className="admin-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><p className="text-xs font-bold uppercase tracking-wider text-cherie-soft-ink">{variant.products?.name ?? 'Ürün'}</p><h2 className="mt-1 font-serif text-xl">{variant.title}</h2><p className="mt-1 text-sm text-cherie-soft-ink">SKU: {variant.sku ?? '—'}</p></div>
                <div className="text-right"><StateBadge value={variant.status} /><p className="mt-2 text-2xl font-bold">{tracked ? (variant.stock_quantity ?? 0) : '—'}</p><p className="text-xs text-cherie-soft-ink">{stockModeLabel(mode)}</p></div>
              </div>
              {mayAdjust && tracked ? <form action={adjustInventory} className="mt-5 grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="variant_id" value={variant.id} />
                <label className="space-y-2"><span className="text-sm font-bold">Değişim (+/−)</span><input name="delta" type="number" step="1" min="-100000" max="100000" className="cherie-field w-full" required /></label>
                <label className="space-y-2"><span className="text-sm font-bold">Neden</span><select name="reason" className="cherie-field w-full" required><option value="restock">Stok girişi</option><option value="sale_correction">Satış düzeltmesi</option><option value="damage">Hasar / kayıp</option><option value="count">Sayım farkı</option><option value="return">İade</option><option value="other">Diğer</option></select></label>
                <label className="space-y-2 sm:col-span-2"><span className="text-sm font-bold">İç not</span><input name="note" maxLength={1000} className="cherie-field w-full" placeholder="Hareketin dayanağı" /></label>
                <button className="cherie-button-primary min-h-12 sm:col-span-2">Stok hareketini kaydet</button>
              </form> : !tracked ? <p className="mt-5 rounded-card bg-cherie-paper p-3 text-sm text-cherie-soft-ink">Bu ürün modeli fiziksel stok saymaz. Ürün düzenleyicisinden stok modelini değiştirirseniz burada yönetilebilir.</p> : null}
            </article>;
          })}
          {!variants.length && <p className="admin-surface p-5 text-sm text-cherie-soft-ink xl:col-span-2">Bu aramayla eşleşen varyant bulunamadı.</p>}
        </section>
      )}
      {pages > 1 && <nav aria-label="Stok sayfalama" className="admin-surface flex items-center justify-between p-4"><span className="text-sm">Sayfa {page} / {pages}</span><div className="flex gap-2">{page > 1 && <Link className="cherie-button-secondary min-h-11" href={pageHref(page - 1, query.q)}>Önceki</Link>}{page < pages && <Link className="cherie-button-secondary min-h-11" href={pageHref(page + 1, query.q)}>Sonraki</Link>}</div></nav>}
      <section className="admin-surface overflow-hidden">
        <div className="border-b border-cherie-lace p-5"><h2 className="font-serif text-2xl">Son stok hareketleri</h2><p className="mt-1 text-sm text-cherie-soft-ink">Son 40 hareket, en yeniden eskiye.</p></div>
        {movementsResult.error ? <p role="alert" className="p-5 text-sm text-cherie-error">Hareket geçmişi okunamadı.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-cherie-paper"><tr><th className="p-3">Varyant</th><th className="p-3">Değişim</th><th className="p-3">Önce → sonra</th><th className="p-3">Neden</th><th className="p-3">Zaman</th></tr></thead><tbody>{(movementsResult.data ?? []).map((movement) => <tr key={movement.id} className="border-t border-cherie-lace"><td className="p-3">{movement.product_variants?.title ?? movement.variant_id}<span className="block text-xs text-cherie-soft-ink">{movement.product_variants?.sku}</span></td><td className={`p-3 font-bold ${movement.delta > 0 ? 'text-emerald-700' : 'text-cherie-error'}`}>{movement.delta > 0 ? '+' : ''}{movement.delta}</td><td className="p-3">{movement.quantity_before} → {movement.quantity_after}</td><td className="p-3">{reasonLabel(movement.reason)}{movement.note && <span className="block max-w-sm text-xs text-cherie-soft-ink">{movement.note}</span>}</td><td className="p-3"><AdminDate value={movement.created_at} /></td></tr>)}</tbody></table></div>}
      </section>
    </div>
  );
}

function pageHref(page: number, query?: string) { const params = new URLSearchParams({ page: String(page) }); if (query) params.set('q', query); return `/admin/commerce/inventory?${params}`; }
function stockModeLabel(mode: string) { return ({ in_stock: 'Stoklu', preorder: 'Ön sipariş', made_to_order: 'Siparişe göre üretim', unavailable: 'Satış dışı' } as Record<string, string>)[mode] ?? mode; }
function reasonLabel(reason: string) { return ({ restock: 'Stok girişi', sale_correction: 'Satış düzeltmesi', damage: 'Hasar / kayıp', count: 'Sayım farkı', return: 'İade', other: 'Diğer' } as Record<string, string>)[reason] ?? reason; }
