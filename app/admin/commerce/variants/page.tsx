import { ResourceList, StateBadge } from '@/components/admin/resource-list';
import { requireCapability } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatTRY } from '@/lib/format';
export const dynamic = 'force-dynamic';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  await requireCapability('catalog.read', '/admin/commerce/variants');
  const db = createAdminClient();
  let request = db
    .from('product_variants')
    .select('id,title,sku,price,stock_quantity,status,products(name)', { count: 'exact' })
    .order('sort_order')
    .limit(100);
  if (q) request = request.ilike('title', `%${q.replace(/[,%]/g, '')}%`);
  const { data, count, error } = await request;
  return (
    <ResourceList
      eyebrow="Katalog"
      title="Varyantlar"
      description="Ürün seçeneklerinin SKU, fiyat, stok ve etkinlik durumunu denetleyin."
      rows={data ?? []}
      total={count ?? 0}
      query={q}
      error={error ? 'Varyantlar okunamadı.' : undefined}
      columns={[
        {
          label: 'Varyant',
          value: (r) => (
            <>
              <strong>{r.title}</strong>
              <p className="text-xs text-cherie-soft-ink">{r.products?.name}</p>
            </>
          ),
        },
        { label: 'SKU', value: (r) => r.sku ?? '—' },
        { label: 'Fiyat', value: (r) => (r.price ? formatTRY(r.price) : 'Ürün fiyatı') },
        { label: 'Stok', value: (r) => r.stock_quantity ?? 'Siparişe özel' },
        { label: 'Durum', value: (r) => <StateBadge value={r.status} /> },
      ]}
    />
  );
}
