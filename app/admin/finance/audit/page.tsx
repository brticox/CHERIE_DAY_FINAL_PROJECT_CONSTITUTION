import Link from 'next/link';
import { Fingerprint } from 'lucide-react';

import { FinanceNavigation } from '@/components/admin/finance-navigation';
import {
  AdminEmptyState,
  AdminNotice,
  AdminPageHeader,
  AdminStatus,
} from '@/components/admin/admin-workspace';
import { adminEventLabel, adminValueLabel } from '@/lib/admin/presentation';
import { requireFinanceAudit } from '@/lib/payments/finance-auth';
import { createAdminClient } from '@/lib/supabase/admin';

type FinancialAuditRow = {
  id: string;
  action: string;
  severity: string;
  actor_type: string;
  order_id: string | null;
  payment_id: string | null;
  refund_id: string | null;
  correlation_id: string;
  created_at: string;
  orders: { order_number: string } | null;
};

export const dynamic = 'force-dynamic';

export default async function FinancialAuditPage() {
  const session = await requireFinanceAudit('/admin/finance/audit');
  const db = createAdminClient();
  const { data, error } = await db
    .from('financial_audit_log')
    .select(
      'id,action,severity,actor_type,order_id,payment_id,refund_id,correlation_id,created_at,orders(order_number)',
    )
    .order('created_at', { ascending: false })
    .limit(200);
  const rows = (data ?? []) as FinancialAuditRow[];

  return (
    <div className="mx-auto max-w-[1680px] space-y-7 p-4 md:p-7 xl:p-9">
      <AdminPageHeader
        eyebrow="Değişmez finans kaydı"
        title="Finans denetim izi"
        description="Ödeme, sağlayıcı bildirimi, uzlaştırma ve iade kararlarının en güncel 200 değişmez kaydı. Ham sağlayıcı yükleri ve kişisel veriler bu görünümde gösterilmez."
      />
      <FinanceNavigation active="audit" role={session.staff.role} />

      {error && (
        <AdminNotice tone="warning" title="Finans denetim kayıtları alınamadı">
          Hiçbir kayıt değiştirilmedi. Bağlantıyı doğruladıktan sonra görünümü yenileyin.
        </AdminNotice>
      )}
      {!error && rows.length === 0 ? (
        <AdminEmptyState
          title="Henüz finans denetim kaydı yok"
          description="İlk ödeme denemesi veya finans işlemi değişmez korelasyon iziyle burada görünecek."
          primary={{ label: 'Ödemeleri incele', href: '/admin/finance/payments' }}
        />
      ) : (
        <section
          className="admin-surface overflow-hidden shadow-none"
          aria-label="Finans denetim kayıtları"
        >
          <div className="divide-y divide-cherie-lace p-5 md:hidden">
            {rows.map((row) => (
              <article key={row.id} className="admin-mobile-entity">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <strong className="text-sm">{adminEventLabel(row.action)}</strong>
                    <p className="mt-1 text-xs text-cherie-soft-ink">
                      {adminValueLabel(row.actor_type)}
                    </p>
                  </div>
                  <AdminStatus value={row.severity} />
                </div>
                <div className="mt-4 flex items-end justify-between gap-3">
                  {row.order_id ? (
                    <Link
                      href={`/admin/commerce/orders/${row.order_id}`}
                      className="text-sm font-bold text-cherie-burgundy hover:underline"
                    >
                      {row.orders?.order_number ?? 'Sipariş kaydı'}
                    </Link>
                  ) : (
                    <span className="text-sm text-cherie-soft-ink">Siparişsiz kayıt</span>
                  )}
                  <time className="text-right text-xs text-cherie-soft-ink">
                    {formatDate(row.created_at)}
                  </time>
                </div>
                <p className="mt-3 flex items-center gap-2 break-all font-mono text-[11px] text-cherie-soft-ink">
                  <Fingerprint className="size-3.5 shrink-0" aria-hidden="true" />
                  {row.correlation_id}
                </p>
              </article>
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-cherie-paper/90">
                <tr>
                  <th className="px-5 py-4">İşlem</th>
                  <th className="px-5 py-4">Önem</th>
                  <th className="px-5 py-4">Kaynak</th>
                  <th className="px-5 py-4">Sipariş</th>
                  <th className="px-5 py-4">Korelasyon</th>
                  <th className="px-5 py-4">Zaman</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cherie-lace">
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-5 py-4 font-semibold">
                      {adminEventLabel(row.action)}
                    </td>
                    <td className="px-5 py-4">
                      <AdminStatus value={row.severity} />
                    </td>
                    <td className="px-5 py-4">{adminValueLabel(row.actor_type)}</td>
                    <td className="px-5 py-4">
                      {row.order_id ? (
                        <Link
                          href={`/admin/commerce/orders/${row.order_id}`}
                          className="font-bold text-cherie-burgundy hover:underline"
                        >
                          {row.orders?.order_number ?? 'Sipariş kaydı'}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="max-w-48 truncate px-5 py-4 font-mono text-xs text-cherie-soft-ink">
                      {row.correlation_id}
                    </td>
                    <td className="px-5 py-4 text-xs text-cherie-soft-ink">
                      {formatDate(row.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Istanbul',
  }).format(new Date(value));
}
