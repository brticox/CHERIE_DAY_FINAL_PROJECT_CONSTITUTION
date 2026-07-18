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
  await requireCapability('catalog.read', '/admin/catalog/collections');
  const db = createAdminClient();
  let request = db
    .from('collections')
    .select('id,name,slug,status,is_featured,sort_order', { count: 'exact' })
    .order('sort_order')
    .limit(100);
  if (q) request = request.ilike('name', `%${q.replace(/[,%]/g, '')}%`);
  const { data, count, error } = await request;
  return (
    <ResourceList
      eyebrow="Katalog"
      title="Koleksiyonlar"
      description="Editoryal koleksiyon dünyalarını, öne çıkarma durumunu ve yayın sırasını izleyin."
      rows={data ?? []}
      total={count ?? 0}
      query={q}
      error={error ? 'Koleksiyonlar okunamadı.' : undefined}
      columns={[
        { label: 'Koleksiyon', value: (r) => <strong>{r.name}</strong> },
        { label: 'Adres kısa adı', value: (r) => r.slug },
        { label: 'Öne çıkan', value: (r) => (r.is_featured ? 'Evet' : 'Hayır') },
        { label: 'Sıra', value: (r) => r.sort_order },
        { label: 'Durum', value: (r) => <StateBadge value={r.status} /> },
      ]}
    />
  );
}
