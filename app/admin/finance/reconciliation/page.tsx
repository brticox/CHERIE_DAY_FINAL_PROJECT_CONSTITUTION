import Link from 'next/link';
import { AlertTriangle, Scale } from 'lucide-react';

import { FinanceNavigation } from '@/components/admin/finance-navigation';
import { FinanceSubmitButton } from '@/components/admin/finance-submit-button';
import {
  AdminEmptyState,
  AdminNotice,
  AdminPageHeader,
  AdminStatus,
} from '@/components/admin/admin-workspace';
import { can, canManageFinance } from '@/lib/admin/permissions';
import { adminValueLabel } from '@/lib/admin/presentation';
import { formatTRYMinor } from '@/lib/format';
import { requireFinanceRead } from '@/lib/payments/finance-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { resolveDiscrepancyAction } from '../actions';

type Discrepancy = {
  id: string;
  discrepancy_type: string;
  severity: string;
  status: string;
  order_id: string | null;
  payment_id: string | null;
  provider_reference: string | null;
  expected_amount_minor: number | null;
  provider_amount_minor: number | null;
  recommended_action: string;
  last_checked_at: string;
  orders: { order_number: string } | null;
};

export const dynamic = 'force-dynamic';

export default async function FinanceReconciliationPage({
  searchParams,
}: {
  searchParams: Promise<{ result?: string; error?: string }>;
}) {
  const params = await searchParams;
  const session = await requireFinanceRead('/admin/finance/reconciliation');
  const canMutate = canManageFinance(session.staff.role);
  const db = createAdminClient();
  const { data, error } = await db
    .from('payment_reconciliation_discrepancies')
    .select(
      'id,discrepancy_type,severity,status,order_id,payment_id,provider_reference,expected_amount_minor,provider_amount_minor,recommended_action,last_checked_at,orders(order_number)',
    )
    .order('created_at', { ascending: false })
    .limit(200);
  const rows = (data ?? []) as Discrepancy[];
  const openCount = rows.filter((row) =>
    ['open', 'investigating'].includes(row.status),
  ).length;

  return (
    <div className="mx-auto max-w-[1680px] space-y-7 p-4 md:p-7 xl:p-9">
      <AdminPageHeader
        eyebrow="Finans kanıtı"
        title="Uzlaştırma farkları"
        description="Yerel kayıt ile sağlayıcı kanıtı arasındaki farklar otomatik olarak düzeltilmez. Her kapanış, açıklayıcı karar notu ve değişmez denetim izi gerektirir."
        action={
          can(session.staff.role, 'audit.read') ? (
            <Link
              href="/admin/finance/audit"
              className="cherie-button-secondary min-h-12"
            >
              Denetim izini aç
            </Link>
          ) : undefined
        }
      />
      <FinanceNavigation active="reconciliation" role={session.staff.role} />

      {params.result === 'saved' && (
        <AdminNotice tone="success" title="Uzlaştırma kararı kaydedildi">
          Durum ve karar notu finans denetim izine eklendi.
        </AdminNotice>
      )}
      {(params.result === 'denied' || params.error === 'finance_mutation_required') && (
        <AdminNotice tone="danger" title="Uzlaştırma kararı kaydedilemedi">
          Bu işlem için finans yönetim yetkisi gerekir. Kayıtlar değiştirilmedi.
        </AdminNotice>
      )}
      {error && (
        <AdminNotice tone="warning" title="Uzlaştırma kayıtları alınamadı">
          Hiçbir finansal durum değiştirilmedi. Bağlantıyı doğruladıktan sonra yeniden
          deneyin.
        </AdminNotice>
      )}
      {!canMutate && (
        <AdminNotice tone="information" title="Salt okunur finans görünümü">
          Farkları ve kanıtları inceleyebilirsiniz; karar durumu yalnızca yetkili finans
          yöneticileri tarafından değiştirilebilir.
        </AdminNotice>
      )}

      <section className="admin-surface flex flex-col gap-5 p-5 shadow-none sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-4">
          <span className="grid size-12 place-items-center rounded-full bg-cherie-paper text-cherie-burgundy">
            <Scale className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm text-cherie-soft-ink">İnceleme bekleyen fark</p>
            <p className="admin-number mt-1 text-3xl font-semibold text-cherie-ink">
              {openCount}
            </p>
          </div>
        </div>
        <p className="max-w-xl text-sm leading-6 text-cherie-soft-ink">
          Kritik ve yüksek riskli farklarda sağlayıcı paneli, tutar ve sipariş kaydı
          birlikte doğrulanmalıdır.
        </p>
      </section>

      {!error && rows.length === 0 ? (
        <AdminEmptyState
          title="Uzlaştırma farkı bulunmuyor"
          description="Yeni bir sağlayıcı uyuşmazlığı veya beklemede kalan ödeme tespit edilirse kanıtıyla birlikte burada görünecek."
          primary={{ label: 'Ödemeleri incele', href: '/admin/finance/payments' }}
        />
      ) : (
        <section className="space-y-4" aria-label="Uzlaştırma fark kayıtları">
          {rows.map((row) => {
            const formId = `reconciliation-${row.id}`;
            const closed = ['resolved', 'dismissed'].includes(row.status);
            return (
              <article key={row.id} className="admin-surface p-5 shadow-none sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <AdminStatus value={row.discrepancy_type} />
                      <AdminStatus value={row.severity} />
                      <AdminStatus value={row.status} />
                    </div>
                    <h2 className="mt-4 text-lg font-bold text-cherie-ink">
                      {adminValueLabel(row.discrepancy_type)}
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-cherie-soft-ink">
                      {row.recommended_action}
                    </p>
                  </div>
                  <time className="shrink-0 text-xs text-cherie-soft-ink">
                    Son kontrol: {formatDate(row.last_checked_at)}
                  </time>
                </div>

                <dl className="mt-5 grid gap-3 rounded-card bg-cherie-paper/65 p-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-cherie-soft-ink">
                      Sipariş
                    </dt>
                    <dd className="mt-1 text-sm font-semibold">
                      {row.order_id ? (
                        <Link
                          href={`/admin/commerce/orders/${row.order_id}`}
                          className="text-cherie-burgundy hover:underline"
                        >
                          {row.orders?.order_number ?? 'Sipariş kaydı'}
                        </Link>
                      ) : (
                        'Eşleşmedi'
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-cherie-soft-ink">
                      Beklenen tutar
                    </dt>
                    <dd className="admin-number mt-1 text-sm font-semibold">
                      {formatTRYMinor(row.expected_amount_minor) ?? 'Belirtilmedi'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-cherie-soft-ink">
                      Sağlayıcı tutarı
                    </dt>
                    <dd className="admin-number mt-1 text-sm font-semibold">
                      {formatTRYMinor(row.provider_amount_minor) ?? 'Belirtilmedi'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-cherie-soft-ink">
                      Sağlayıcı referansı
                    </dt>
                    <dd className="mt-1 break-all font-mono text-xs">
                      {row.provider_reference ?? 'Belirtilmedi'}
                    </dd>
                  </div>
                </dl>

                {canMutate && !closed && (
                  <form
                    action={resolveDiscrepancyAction}
                    className="mt-5 grid gap-4 border-t border-cherie-lace pt-5 lg:grid-cols-[220px_1fr_auto] lg:items-end"
                  >
                    <input type="hidden" name="discrepancy_id" value={row.id} />
                    <label
                      htmlFor={`${formId}-status`}
                      className="grid gap-2 text-sm font-semibold"
                    >
                      Karar durumu
                      <select
                        id={`${formId}-status`}
                        name="status"
                        className="cherie-field w-full"
                      >
                        <option value="investigating">İnceleniyor</option>
                        <option value="resolved">Çözüldü</option>
                        <option value="dismissed">Kanıtla kapatıldı</option>
                      </select>
                    </label>
                    <label
                      htmlFor={`${formId}-notes`}
                      className="grid gap-2 text-sm font-semibold"
                    >
                      Kanıt ve karar notu
                      <input
                        id={`${formId}-notes`}
                        name="notes"
                        required
                        minLength={5}
                        maxLength={2000}
                        className="cherie-field w-full"
                        placeholder="Kontrol edilen kanıtı ve kararı açıklayın"
                      />
                    </label>
                    <FinanceSubmitButton
                      idleLabel="Kararı kaydet"
                      pendingLabel="Kaydediliyor…"
                    />
                  </form>
                )}
                {canMutate && closed && (
                  <div className="mt-5 flex items-start gap-3 border-t border-cherie-lace pt-5 text-sm text-cherie-soft-ink">
                    <AlertTriangle
                      className="mt-0.5 size-4 shrink-0"
                      aria-hidden="true"
                    />
                    Kapanmış fark yeniden açılmaz; yeni kanıt yeni bir uzlaştırma kaydı
                    oluşturmalıdır.
                  </div>
                )}
              </article>
            );
          })}
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
