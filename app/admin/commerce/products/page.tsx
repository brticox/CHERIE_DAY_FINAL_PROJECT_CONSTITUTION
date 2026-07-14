import Link from 'next/link';
import { Copy, PackageOpen, Plus, Search } from 'lucide-react';
import { duplicateProduct } from './actions';
import { requireCapability } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatTRY } from '@/lib/format';

export const dynamic = 'force-dynamic';
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string; error?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const size = 25;
  await requireCapability('catalog.read', '/admin/commerce/products');
  const supabase = createAdminClient();
  let query = supabase
    .from('products')
    .select(
      'id,name,slug,status,behavior_type,base_price,currency,stock_mode,proof_required,updated_at',
      { count: 'exact' },
    )
    .order('updated_at', { ascending: false })
    .range((page - 1) * size, page * size - 1);
  if (params.q)
    query = query.or(
      `name.ilike.%${params.q.replace(/[,%]/g, '')}%,slug.ilike.%${params.q.replace(/[,%]/g, '')}%`,
    );
  if (params.status) query = query.eq('status', params.status as 'draft' | 'published');
  const { data, count, error } = await query;
  return (
    <div className="mx-auto max-w-[1680px] space-y-6 p-4 md:p-7 xl:p-9">
      <header className="flex flex-col justify-between gap-4 border-b border-cherie-lace pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-cherie-brass">
            Katalog
          </p>
          <h1 className="font-display text-4xl">Ürünler</h1>
          <p className="mt-2 text-sm text-cherie-soft-ink">
            {count ?? 0} ürün · taslak, fiyat ve yayın durumunu tek yerde yönetin.
          </p>
        </div>
        <Link
          href="/admin/commerce/products/new"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-cherie-burgundy px-4 text-sm font-bold text-white"
        >
          <Plus className="size-4" />
          Ürün oluştur
        </Link>
      </header>
      {(params.error || error) && (
        <div
          role="alert"
          className="rounded-control border border-cherie-error/30 bg-cherie-error/10 p-4 text-sm text-cherie-error"
        >
          {params.error === 'permission'
            ? 'Bu işlem için ürün düzenleme yetkiniz yok.'
            : 'Ürünler okunamadı. Bağlantıyı kontrol edip yeniden deneyin.'}
        </div>
      )}
      <form className="flex flex-col gap-3 rounded-card-lg border border-cherie-lace bg-white/50 p-3 sm:flex-row">
        <label className="flex min-h-11 flex-1 items-center gap-2 rounded-control border border-cherie-lace bg-cherie-ivory px-3">
          <Search className="size-4 text-cherie-soft-ink" />
          <span className="sr-only">Ürün ara</span>
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Ürün adı veya slug"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </label>
        <select
          aria-label="Ürün durumu"
          name="status"
          defaultValue={params.status ?? ''}
          className="cherie-field sm:w-44"
        >
          <option value="">Tüm durumlar</option>
          <option value="draft">Taslak</option>
          <option value="published">Yayında</option>
        </select>
        <button className="min-h-11 rounded-control border border-cherie-burgundy px-4 text-sm font-semibold text-cherie-burgundy">
          Filtrele
        </button>
      </form>
      {!data?.length ? (
        <div className="rounded-card-lg border border-dashed border-cherie-lace py-16 text-center">
          <PackageOpen className="mx-auto size-7 text-cherie-brass" />
          <h2 className="mt-4 font-display text-2xl">Bu görünümde ürün yok</h2>
          <p className="mt-2 text-sm text-cherie-soft-ink">
            Filtreyi temizleyin veya ilk ürün taslağını oluşturun.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-card-lg border border-cherie-lace bg-white/60">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-cherie-paper text-xs uppercase tracking-wider text-cherie-soft-ink">
                <tr>
                  <th className="px-5 py-4">Ürün</th>
                  <th className="px-5 py-4">Davranış</th>
                  <th className="px-5 py-4">Fiyat</th>
                  <th className="px-5 py-4">Stok</th>
                  <th className="px-5 py-4">Durum</th>
                  <th className="px-5 py-4 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cherie-lace">
                {data.map((product) => (
                  <tr key={product.id} className="hover:bg-cherie-paper/45">
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/commerce/products/${product.id}`}
                        className="font-semibold text-cherie-burgundy hover:underline"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-1 text-xs text-cherie-soft-ink">/{product.slug}</p>
                    </td>
                    <td className="px-5 py-4">{product.behavior_type}</td>
                    <td className="px-5 py-4 tabular-nums">
                      {product.base_price ? formatTRY(product.base_price) : '—'}
                    </td>
                    <td className="px-5 py-4">{product.stock_mode}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${product.status === 'published' ? 'bg-cherie-success/10 text-cherie-success' : 'bg-cherie-warning/10 text-cherie-warning'}`}
                      >
                        {product.status === 'published' ? 'Yayında' : 'Taslak'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <form action={duplicateProduct}>
                        <input type="hidden" name="id" value={product.id} />
                        <button
                          aria-label={`${product.name} ürününü çoğalt`}
                          className="inline-grid size-10 place-items-center rounded-control border border-cherie-lace hover:bg-cherie-paper"
                        >
                          <Copy className="size-4" />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div className="flex justify-between text-sm">
        <span>
          {count ?? 0} kayıttan {(page - 1) * size + 1}–
          {Math.min(page * size, count ?? 0)}
        </span>
        <div className="flex gap-2">
          {page > 1 && (
            <Link
              href={`?page=${page - 1}`}
              className="rounded-control border border-cherie-lace px-3 py-2"
            >
              Önceki
            </Link>
          )}
          {(count ?? 0) > page * size && (
            <Link
              href={`?page=${page + 1}`}
              className="rounded-control border border-cherie-lace px-3 py-2"
            >
              Sonraki
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
