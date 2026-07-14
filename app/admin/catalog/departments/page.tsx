import { ResourceList, StateBadge } from '@/components/admin/resource-list';
import { requireCapability } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
export const dynamic = 'force-dynamic';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  await requireCapability('catalog.read', '/admin/catalog/departments');
  const db = createAdminClient();
  let request = db
    .from('departments')
    .select('id,name_tr,slug,status,sort_order', { count: 'exact' })
    .order('sort_order')
    .limit(100);
  if (q) request = request.ilike('name_tr', `%${q.replace(/[,%]/g, '')}%`);
  const { data, count, error } = await request;
  return (
    <ResourceList
      eyebrow="Katalog"
      title="Departmanlar"
      description="Mağaza bilgi mimarisinin ana katmanını ve yayın sırasını yönetin."
      rows={data ?? []}
      total={count ?? 0}
      query={q}
      error={error ? 'Departmanlar okunamadı.' : undefined}
      columns={[
        { label: 'Ad', value: (r) => <strong>{r.name_tr}</strong> },
        { label: 'Adres kısa adı', value: (r) => r.slug },
        { label: 'Sıra', value: (r) => r.sort_order },
        { label: 'Durum', value: (r) => <StateBadge value={r.status} /> },
      ]}
    />
  );
}
