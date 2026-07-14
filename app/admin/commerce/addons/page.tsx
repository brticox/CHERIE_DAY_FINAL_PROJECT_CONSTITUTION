import { ResourceList, StateBadge } from '@/components/admin/resource-list';
import { requireStaff } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatTRY } from '@/lib/format';
export const dynamic = 'force-dynamic';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  await requireStaff('/admin/commerce/addons');
  const db = createAdminClient();
  let request = db
    .from('product_addons')
    .select('id,name_tr,addon_type,price,price_type,status,products(name)', {
      count: 'exact',
    })
    .order('sort_order')
    .limit(100);
  if (q) request = request.ilike('name_tr', `%${q.replace(/[,%]/g, '')}%`);
  const { data, count, error } = await request;
  return (
    <ResourceList
      eyebrow="Katalog"
      title="Eklentiler"
      description="Hediye paketi, hızlı üretim ve yükseltme seçeneklerinin ticari görünümü."
      rows={data ?? []}
      total={count ?? 0}
      query={q}
      error={error ? 'Eklentiler okunamadı.' : undefined}
      columns={[
        {
          label: 'Eklenti',
          value: (r) => (
            <>
              <strong>{r.name_tr}</strong>
              <p className="text-xs text-cherie-soft-ink">
                {r.products?.name ?? 'Tüm ürünler'}
              </p>
            </>
          ),
        },
        { label: 'Tür', value: (r) => r.addon_type },
        {
          label: 'Fiyat',
          value: (r) =>
            r.price_type === 'percentage' ? `%${r.price}` : formatTRY(r.price),
        },
        { label: 'Durum', value: (r) => <StateBadge value={r.status} /> },
      ]}
    />
  );
}
