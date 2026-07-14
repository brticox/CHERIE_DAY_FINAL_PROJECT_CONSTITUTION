import { ResourceList, StateBadge } from '@/components/admin/resource-list';
import { requireStaff } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
export const dynamic = 'force-dynamic';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  await requireStaff('/admin/catalog/categories');
  const db = createAdminClient();
  let request = db
    .from('categories')
    .select('id,name,slug,status,sort_order,departments(name_tr)', { count: 'exact' })
    .order('sort_order')
    .limit(100);
  if (q) request = request.ilike('name', `%${q.replace(/[,%]/g, '')}%`);
  const { data, count, error } = await request;
  return (
    <ResourceList
      eyebrow="Katalog"
      title="Kategoriler"
      description="Ürünleri departmanlar içinde anlaşılır ve yayınlanabilir gruplara ayırın."
      rows={data ?? []}
      total={count ?? 0}
      query={q}
      error={error ? 'Kategoriler okunamadı.' : undefined}
      columns={[
        { label: 'Kategori', value: (r) => <strong>{r.name}</strong> },
        { label: 'Departman', value: (r) => r.departments?.name_tr ?? 'Atanmamış' },
        { label: 'Slug', value: (r) => r.slug },
        { label: 'Sıra', value: (r) => r.sort_order },
        { label: 'Durum', value: (r) => <StateBadge value={r.status} /> },
      ]}
    />
  );
}
