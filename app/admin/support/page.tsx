import Link from 'next/link';
import { requireStaff } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { AdminDate, StateBadge } from '@/components/admin/resource-list';
export const dynamic = 'force-dynamic';
export default async function Page() {
  await requireStaff('/admin/support');
  const { data, error } = await createAdminClient()
    .from('customer_support_threads')
    .select(
      'id,subject,source,status,updated_at,customers(name,email),orders(order_number)',
    )
    .order('updated_at', { ascending: false })
    .limit(150);
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
    </div>
  );
}
