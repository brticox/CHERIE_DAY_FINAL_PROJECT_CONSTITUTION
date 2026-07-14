import { randomUUID } from 'node:crypto';
import Link from 'next/link';
import { RotateCcw, ShieldCheck } from 'lucide-react';

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
import {
  approveRefundAction,
  requestRefundAction,
  simulateRefundAction,
} from '../actions';

type Refund = {
  id: string;
  payment_id: string | null;
  order_id: string | null;
  amount_minor: number;
  status: string;
  provider_status: string;
  reason: string;
  retryable: boolean;
  provider_reference: string | null;
  requested_by: string | null;
  approved_by: string | null;
  created_at: string;
  orders: { order_number: string; customer_id: string | null } | null;
  payments: { provider_conversation_id: string | null } | null;
};

type Payment = {
  id: string;
  amount_minor: number;
  status: string;
  provider_conversation_id: string | null;
  order_id: string | null;
  orders: { order_number: string; customer_id: string | null } | null;
};

export const dynamic = 'force-dynamic';

export default async function FinanceRefundsPage({
  searchParams,
}: {
  searchParams: Promise<{ result?: string; error?: string }>;
}) {
  const params = await searchParams;
  const session = await requireFinanceRead('/admin/finance/refunds');
  const canMutate = canManageFinance(session.staff.role);
  const db = createAdminClient();
  const [
    { data: refundData, error: refundError },
    { data: paymentData, error: paymentError },
  ] = await Promise.all([
    db
      .from('refunds')
      .select(
        'id,payment_id,order_id,amount_minor,status,provider_status,reason,retryable,provider_reference,requested_by,approved_by,created_at,orders(order_number,customer_id),payments(provider_conversation_id)',
      )
      .order('created_at', { ascending: false })
      .limit(200),
    db
      .from('payments')
      .select(
        'id,amount_minor,status,provider_conversation_id,order_id,orders(order_number,customer_id)',
      )
      .in('status', ['paid', 'partially_refunded'])
      .order('created_at', { ascending: false })
      .limit(100),
  ]);
  const refunds = (refundData ?? []) as Refund[];
  const payments = (paymentData ?? []) as Payment[];
  const customerIds = Array.from(
    new Set(
      [
        ...refunds.map((row) => row.orders?.customer_id),
        ...payments.map((row) => row.orders?.customer_id),
      ].filter((value): value is string => Boolean(value)),
    ),
  );
  const { data: customerData } = customerIds.length
    ? await db.from('customers').select('id,name').in('id', customerIds)
    : { data: [] };
  const customerNames = new Map(
    (customerData ?? []).map((customer) => [
      customer.id,
      customer.name ?? 'Adsız müşteri',
    ]),
  );
  const unavailable = Boolean(refundError || paymentError);

  return (
    <div className="mx-auto max-w-[1680px] space-y-7 p-4 md:p-7 xl:p-9">
      <AdminPageHeader
        eyebrow="Yüksek riskli finans işlemi"
        title="İade operasyonu"
        description="İade talebi, ikinci onay ve sağlayıcı sonucu ayrı aşamalardır. Tutar sınırı, tekrar güvenliği ve sipariş doğrulaması veritabanı tarafından uygulanır."
        action={
          can(session.staff.role, 'audit.read') ? (
            <Link
              href="/admin/finance/audit"
              className="cherie-button-secondary min-h-12 gap-2"
            >
              <ShieldCheck className="size-4" aria-hidden="true" />
              Denetim izini aç
            </Link>
          ) : undefined
        }
      />
      <FinanceNavigation active="refunds" role={session.staff.role} />

      <ResultNotice result={params.result} error={params.error} />
      {unavailable && (
        <AdminNotice tone="warning" title="İade kayıtlarının bir bölümü alınamadı">
          Hiçbir iade işlemi başlatılmadı. Bağlantıyı doğruladıktan sonra görünümü
          yenileyin.
        </AdminNotice>
      )}
      {!canMutate && (
        <AdminNotice tone="information" title="Salt okunur finans görünümü">
          İade durumlarını ve sağlayıcı sonuçlarını inceleyebilirsiniz. Talep, onay ve
          yeniden deneme işlemleri yalnızca yetkili finans yöneticilerine açıktır.
        </AdminNotice>
      )}

      {canMutate && !unavailable && (
        <section className="admin-surface grid overflow-hidden shadow-none lg:grid-cols-[1fr_1.25fr]">
          <div className="bg-cherie-velvet p-6 text-white sm:p-8">
            <RotateCcw className="size-6 text-cherie-brass" aria-hidden="true" />
            <p className="mt-10 text-xs font-bold uppercase tracking-[.16em] text-white/65">
              Yeni iade talebi
            </p>
            <h2 className="mt-2 font-display text-3xl leading-tight text-white">
              Sipariş numarası, yüksek risk onayıdır.
            </h2>
            <p className="mt-4 text-sm leading-6 text-white/70">
              Tutar, ödeme için kalan iade edilebilir bakiyeyi aşamaz. Talebi oluşturan
              kişi, süper yönetici değilse aynı talebi onaylayamaz.
            </p>
          </div>
          <div className="p-5 sm:p-7">
            {payments.length === 0 ? (
              <AdminNotice tone="information" title="İade edilebilir ödeme yok">
                Ödenmiş veya kısmen iade edilmiş bir ödeme oluştuğunda talep formu
                açılacaktır.
              </AdminNotice>
            ) : (
              <form action={requestRefundAction} className="grid gap-4">
                <input type="hidden" name="request_id" value={randomUUID()} />
                <label
                  htmlFor="refund-payment"
                  className="grid gap-2 text-sm font-semibold"
                >
                  Ödeme ve sipariş
                  <select
                    id="refund-payment"
                    name="payment_id"
                    required
                    className="cherie-field w-full"
                  >
                    <option value="">Ödeme seçin</option>
                    {payments.map((payment) => (
                      <option key={payment.id} value={payment.id}>
                        {payment.orders?.order_number ?? 'Sipariş kaydı'} ·{' '}
                        {formatTRYMinor(payment.amount_minor)} ·{' '}
                        {adminValueLabel(payment.status)}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label
                    htmlFor="refund-amount"
                    className="grid gap-2 text-sm font-semibold"
                  >
                    İade tutarı
                    <input
                      id="refund-amount"
                      name="amount"
                      inputMode="decimal"
                      required
                      className="cherie-field w-full"
                      placeholder="Örn. 125,50"
                    />
                  </label>
                  <label
                    htmlFor="refund-reason"
                    className="grid gap-2 text-sm font-semibold"
                  >
                    İade nedeni
                    <select
                      id="refund-reason"
                      name="reason"
                      className="cherie-field w-full"
                    >
                      {[
                        'customer_request',
                        'defect',
                        'cancellation',
                        'duplicate',
                        'goodwill',
                        'other',
                      ].map((reason) => (
                        <option key={reason} value={reason}>
                          {adminValueLabel(reason)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label
                  htmlFor="refund-confirmation"
                  className="grid gap-2 text-sm font-semibold"
                >
                  Sipariş numarasıyla doğrulama
                  <input
                    id="refund-confirmation"
                    name="confirmation"
                    required
                    className="cherie-field w-full"
                    placeholder="Seçilen sipariş numarasını aynen yazın"
                    autoComplete="off"
                  />
                </label>
                <label htmlFor="refund-note" className="grid gap-2 text-sm font-semibold">
                  Finans notu{' '}
                  <span className="font-normal text-cherie-soft-ink">(isteğe bağlı)</span>
                  <textarea
                    id="refund-note"
                    name="note"
                    maxLength={1000}
                    className="cherie-field min-h-28 w-full py-3"
                    placeholder="Kararın dayanağını veya müşteri bağlamını ekleyin"
                  />
                </label>
                <FinanceSubmitButton
                  idleLabel="İade talebi oluştur"
                  pendingLabel="Talep güvenle oluşturuluyor…"
                />
              </form>
            )}
          </div>
        </section>
      )}

      {!unavailable && refunds.length === 0 ? (
        <AdminEmptyState
          title="Henüz iade kaydı yok"
          description="İlk iade talebi; onay, sağlayıcı ve bildirim aşamalarıyla birlikte burada görünecek."
          primary={{ label: 'Ödemeleri incele', href: '/admin/finance/payments' }}
        />
      ) : (
        <section className="space-y-4" aria-label="İade kayıtları">
          {refunds.map((refund) => {
            const orderNumber = refund.orders?.order_number ?? 'Sipariş kaydı';
            const customerId = refund.orders?.customer_id;
            const canApprove = canMutate && refund.status === 'requested';
            const canSimulate =
              canMutate &&
              process.env.NODE_ENV !== 'production' &&
              (refund.status === 'approved' ||
                (refund.status === 'processing' && refund.retryable));
            return (
              <article key={refund.id} className="admin-surface p-5 shadow-none sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <AdminStatus value={refund.status} />
                      <AdminStatus value={refund.provider_status} />
                      {refund.retryable && (
                        <AdminStatus value="attention" label="Kontrollü tekrar mümkün" />
                      )}
                    </div>
                    <p className="admin-number mt-4 text-3xl font-semibold text-cherie-ink">
                      {formatTRYMinor(refund.amount_minor)}
                    </p>
                    <p className="mt-1 text-sm text-cherie-soft-ink">
                      {adminValueLabel(refund.reason)}
                    </p>
                  </div>
                  <time className="text-xs text-cherie-soft-ink">
                    {formatDate(refund.created_at)}
                  </time>
                </div>

                <dl className="mt-5 grid gap-3 rounded-card bg-cherie-paper/65 p-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-cherie-soft-ink">
                      Sipariş
                    </dt>
                    <dd className="mt-1 text-sm font-semibold">
                      {refund.order_id ? (
                        <Link
                          href={`/admin/commerce/orders/${refund.order_id}`}
                          className="text-cherie-burgundy hover:underline"
                        >
                          {orderNumber}
                        </Link>
                      ) : (
                        orderNumber
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-cherie-soft-ink">
                      Müşteri
                    </dt>
                    <dd className="mt-1 text-sm font-semibold">
                      {customerId ? (
                        <Link
                          href={`/admin/customers/${customerId}`}
                          className="text-cherie-burgundy hover:underline"
                        >
                          {customerNames.get(customerId) ?? 'Müşteri kaydı'}
                        </Link>
                      ) : (
                        'Belirtilmedi'
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-cherie-soft-ink">
                      Ödeme referansı
                    </dt>
                    <dd className="mt-1 break-all font-mono text-xs">
                      {refund.payments?.provider_conversation_id ?? 'Belirtilmedi'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-cherie-soft-ink">
                      İade referansı
                    </dt>
                    <dd className="mt-1 break-all font-mono text-xs">
                      {refund.provider_reference ?? 'Sağlayıcı sonucu bekleniyor'}
                    </dd>
                  </div>
                </dl>

                {canApprove && (
                  <form
                    action={approveRefundAction}
                    className="mt-5 grid gap-4 border-t border-cherie-lace pt-5 lg:grid-cols-[1fr_auto] lg:items-end"
                  >
                    <input type="hidden" name="refund_id" value={refund.id} />
                    <label
                      htmlFor={`approve-${refund.id}`}
                      className="grid gap-2 text-sm font-semibold"
                    >
                      İkinci onay doğrulaması
                      <input
                        id={`approve-${refund.id}`}
                        name="confirmation"
                        required
                        className="cherie-field w-full"
                        placeholder={`REFUND ${orderNumber}`}
                        autoComplete="off"
                      />
                      <span className="text-xs font-normal leading-5 text-cherie-soft-ink">
                        Onaylamak için <strong>REFUND {orderNumber}</strong> ifadesini
                        aynen yazın.
                      </span>
                    </label>
                    <FinanceSubmitButton
                      idleLabel="İadeyi onayla"
                      pendingLabel="Onaylanıyor…"
                    />
                  </form>
                )}

                {canSimulate && (
                  <form
                    action={simulateRefundAction}
                    className="mt-5 grid gap-4 border-t border-cherie-lace pt-5 lg:grid-cols-[1fr_auto] lg:items-end"
                  >
                    <input type="hidden" name="refund_id" value={refund.id} />
                    <label
                      htmlFor={`simulate-${refund.id}`}
                      className="grid gap-2 text-sm font-semibold"
                    >
                      Yalnızca yerel sağlayıcı sonucu
                      <select
                        id={`simulate-${refund.id}`}
                        name="outcome"
                        className="cherie-field w-full"
                      >
                        <option value="success">Başarılı sonucu simüle et</option>
                        <option value="failure">Ret sonucunu simüle et</option>
                        <option value="timeout">Zaman aşımını simüle et</option>
                      </select>
                    </label>
                    <FinanceSubmitButton
                      idleLabel="Yerel sağlayıcıyı çalıştır"
                      pendingLabel="Yerel sonuç işleniyor…"
                    />
                  </form>
                )}
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

function ResultNotice({ result, error }: { result?: string; error?: string }) {
  if (result === 'requested') {
    return (
      <AdminNotice tone="success" title="İade talebi oluşturuldu">
        Talep, ikinci onay ve sağlayıcı sonucu için değişmez finans izine eklendi.
      </AdminNotice>
    );
  }
  if (result === 'approved') {
    return (
      <AdminNotice tone="success" title="İade ikinci onaydan geçti">
        Sağlayıcıya gönderim ayrı ve idempotent bir adım olarak bekliyor.
      </AdminNotice>
    );
  }
  if (result === 'processed') {
    return (
      <AdminNotice tone="success" title="Yerel sağlayıcı sonucu kaydedildi">
        Ödeme, sipariş, bildirim ve finans denetim kayıtları aynı sonuçla güncellendi.
      </AdminNotice>
    );
  }
  if (result === 'invalid') {
    return (
      <AdminNotice tone="danger" title="İade talebi geçersiz">
        Ödeme seçimini ve tutarı doğrulayın. Hiçbir finans kaydı değiştirilmedi.
      </AdminNotice>
    );
  }
  if (result === 'denied' || error === 'finance_mutation_required') {
    return (
      <AdminNotice tone="danger" title="İade işlemi reddedildi">
        Yetki, sipariş doğrulaması, tutar sınırı veya ikinci onay kuralı sağlanmadı.
        Hiçbir finansal durum değiştirilmedi.
      </AdminNotice>
    );
  }
  if (result === 'processing_failed') {
    return (
      <AdminNotice tone="warning" title="Yerel sağlayıcı sonucu tamamlanamadı">
        İşlem güvenli biçimde kaydedildi. Yeniden denemeden önce denetim ve uzlaştırma
        kayıtlarını inceleyin.
      </AdminNotice>
    );
  }
  return null;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Istanbul',
  }).format(new Date(value));
}
