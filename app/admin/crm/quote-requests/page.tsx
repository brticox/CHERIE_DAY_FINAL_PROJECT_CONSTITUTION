import { ResourceList, AdminDate, StateBadge } from '@/components/admin/resource-list';
import { requireCapability } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { adminValueLabel } from '@/lib/admin/presentation';
export const dynamic = 'force-dynamic';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  await requireCapability('crm.read', '/admin/crm/quote-requests');
  const db = createAdminClient();
  let query = db
    .from('quote_requests')
    .select(
      'id,name,email,phone,event_type,event_date_or_season,city,budget_band,status,created_at',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .limit(150);
  if (q)
    query = query.or(
      `name.ilike.%${q.replace(/[,%]/g, '')}%,email.ilike.%${q.replace(/[,%]/g, '')}%,phone.ilike.%${q.replace(/[,%]/g, '')}%`,
    );
  if (status) query = query.eq('status', status as never);
  const { data, count, error } = await query;
  return (
    <ResourceList
      eyebrow="CRM"
      title="Teklif Talepleri"
      description="Teklif alımından gelen kayıtları müşteri, etkinlik, bütçe ve durum bağlamıyla değerlendirin."
      rows={data ?? []}
      total={count ?? 0}
      query={q}
      error={error ? 'Teklif talepleri okunamadı.' : undefined}
      columns={[
        {
          label: 'Müşteri',
          value: (r) => (
            <>
              <strong>{r.name || 'İsimsiz'}</strong>
              <p className="text-xs text-cherie-soft-ink">
                {r.email || r.phone || 'İletişim yok'}
              </p>
            </>
          ),
        },
        {
          label: 'Etkinlik',
          value: (r) => (
            <>
              {r.event_type ? adminValueLabel(r.event_type) : 'Etkinlik belirtilmedi'}
              <p className="text-xs">
                {r.event_date_or_season || 'Tarih yok'} · {r.city || 'Şehir yok'}
              </p>
            </>
          ),
        },
        { label: 'Bütçe', value: (r) => r.budget_band || '—' },
        { label: 'Durum', value: (r) => <StateBadge value={r.status} /> },
        { label: 'Geliş', value: (r) => <AdminDate value={r.created_at} /> },
      ]}
    />
  );
}
