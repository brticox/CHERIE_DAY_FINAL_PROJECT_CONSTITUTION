import Link from 'next/link';
import { ResourceList, AdminDate, StateBadge } from '@/components/admin/resource-list';
import { requireCapability } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
export const dynamic = 'force-dynamic';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; slug?: string }>;
}) {
  const { q, slug } = await searchParams;
  await requireCapability('content.read', '/admin/cms/pages');
  const db = createAdminClient();
  let request = db
    .from('pages')
    .select('id,title,slug,status,updated_at', { count: 'exact' })
    .order('updated_at', { ascending: false })
    .limit(100);
  if (slug) request = request.eq('slug', slug);
  else if (q) request = request.ilike('title', `%${q.replace(/[,%]/g, '')}%`);
  const { data, count, error } = await request;
  return (
    <ResourceList
      eyebrow="İçerik"
      title={slug === 'home' ? 'Ana Sayfa' : 'Sayfalar'}
      description="Marka güvenli yapılandırılmış sayfa içeriğini taslak ve yayın durumuyla yönetin."
      rows={data ?? []}
      total={count ?? 0}
      query={q}
      error={error ? 'Sayfalar okunamadı.' : undefined}
      columns={[
        {
          label: 'Sayfa',
          value: (r) => (
            <Link
              className="font-semibold text-cherie-burgundy hover:underline"
              href={`/admin/cms/pages/${r.id}`}
            >
              {r.title}
            </Link>
          ),
        },
        { label: 'Slug', value: (r) => r.slug },
        { label: 'Durum', value: (r) => <StateBadge value={r.status} /> },
        { label: 'Güncelleme', value: (r) => <AdminDate value={r.updated_at} /> },
      ]}
    />
  );
}
