import Link from 'next/link';
import { requireCapability } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { AdminDate, StateBadge } from '@/components/admin/resource-list';
import { AdminPagination } from '@/components/admin/pagination';
const PAGE_SIZE = 50;
export const dynamic = 'force-dynamic';
export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireCapability('crm.read', '/admin/support');
  const { page: rawPage } = await searchParams;
  const page = Math.max(1, Number.parseInt(rawPage ?? '1', 10) || 1);
  const { data, count, error } = await createAdminClient()
    .from('customer_support_threads')
    .select(
      'id,subject,source,status,updated_at,customers(name,email),orders(order_number)',
      { count: 'exact' },
    )
    .order('updated_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  return (
    <div className="space-y-6 p-4 md:p-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-cherie-brass">
          Müşteri desteği
        </p>
        <h1 className="font-display text-4xl">Destek talepleri</h1>
      </header>
      {error ? (
        <p>Talepler okunamadı.</p>
      ) : (
        <div className="grid gap-3">
          {(data ?? []).map((x) => (
            <Link
              key={x.id}
              href={`/admin/support/${x.id}`}
              className="grid gap-3 rounded-card-lg border border-cherie-lace p-4 md:grid-cols-[1fr_1fr_auto_auto]"
            >
              <span>
                <strong>{x.subject || 'Destek talebi'}</strong>
                <small className="block">
                  {x.customers?.name ?? x.customers?.email ?? 'Müşteri'}
                </small>
              </span>
              <span>
                {x.source}
                {x.orders?.order_number && ` · ${x.orders.order_number}`}
              </span>
              <StateBadge value={x.status} />
              <AdminDate value={x.updated_at} />
            </Link>
          ))}
        </div>
      )}
      <AdminPagination
        path="/admin/support"
        page={page}
        pageSize={PAGE_SIZE}
        total={count ?? 0}
        label="Destek talebi sayfalama"
      />
    </div>
  );
}
