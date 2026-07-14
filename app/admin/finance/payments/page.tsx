import Link from 'next/link';
import { CheckCircle2, Clock3, CreditCard, XCircle } from 'lucide-react';

import { FinanceNavigation } from '@/components/admin/finance-navigation';
import {
  AdminEmptyState,
  AdminNotice,
  AdminPageHeader,
  AdminStatus,
  AdminToolbar,
} from '@/components/admin/admin-workspace';
import { adminValueLabel } from '@/lib/admin/presentation';
import { formatTRYMinor } from '@/lib/format';
import { requireFinanceRead } from '@/lib/payments/finance-auth';
import { createAdminClient } from '@/lib/supabase/admin';

type PaymentRow = {
  id: string;
  status: string;
  provider: string;
  provider_conversation_id: string | null;
  amount_minor: number;
  attempt_number: number;
  initialized_at: string | null;
  paid_at: string | null;
  created_at: string;
  order_id: string | null;
  last_error_code: string | null;
  orders: { order_number: string; customer_id: string | null } | null;
};

type PaymentEvent = {
  id: string;
  provider: string;
  event_type: string | null;
  processing_status: string;
  signature_valid: boolean;
  payment_id: string | null;
  provider_event_id: string | null;
  error_code: string | null;
  received_at: string;
  outcome: string | null;
};

const PAYMENT_STATUSES = [
  'pending',
  'authorized',
  'paid',
  'failed',
  'cancelled',
  'refunded',
  'partially_refunded',
] as const;

export const dynamic = 'force-dynamic';

export default async function FinancePaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; provider?: string; q?: string }>;
}) {
  const filters = await searchParams;
  const session = await requireFinanceRead('/admin/finance/payments');
  const db = createAdminClient();
  let query = db
    .from('payments')
    .select(
      'id,status,provider,provider_conversation_id,amount_minor,attempt_number,initialized_at,paid_at,created_at,order_id,last_error_code,orders(order_number,customer_id)',
    )
    .order('created_at', { ascending: false })
    .limit(200);

  if (PAYMENT_STATUSES.includes(filters.status as (typeof PAYMENT_STATUSES)[number])) {
    query = query.eq('status', filters.status as never);
  }
  if (
    filters.provider &&
    ['paytr', 'iyzico', 'bank_transfer', 'manual'].includes(filters.provider)
  ) {
    query = query.eq('provider', filters.provider as never);
  }
  if (filters.q) {
    query = query.ilike(
      'provider_conversation_id',
      `%${filters.q.replace(/[,%]/g, '').slice(0, 80)}%`,
    );
  }

  const [
    { data: paymentData, error: paymentError },
    { data: eventData, error: eventError },
  ] = await Promise.all([
    query,
    db
      .from('payment_events')
      .select(
        'id,provider,event_type,processing_status,signature_valid,payment_id,provider_event_id,error_code,received_at,outcome',
      )
      .order('received_at', { ascending: false })
      .limit(100),
  ]);
  const rows = (paymentData ?? []) as PaymentRow[];
  const events = (eventData ?? []) as PaymentEvent[];
  const customerIds = Array.from(
    new Set(
      rows
        .map((row) => row.orders?.customer_id)
        .filter((value): value is string => Boolean(value)),
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
  const totals = {
    paid: rows.filter((row) => row.status === 'paid'),
    pending: rows.filter((row) => ['pending', 'authorized'].includes(row.status)),
    failed: rows.filter((row) => ['failed', 'cancelled'].includes(row.status)),
  };
  const unavailable = Boolean(paymentError || eventError);

  return (
    <div className="mx-auto max-w-[1680px] space-y-7 p-4 md:p-7 xl:p-9">
      <AdminPageHeader
        eyebrow="Finans operasyonu"
        title="Ödeme kontrol merkezi"
        description="Tahsilatları, imza doğrulamasını ve sağlayıcı bildirimlerinin uygulanma sonucunu tek karar görünümünde izleyin."
        action={
          <Link
            href="/admin/finance/reconciliation"
            className="cherie-button-secondary min-h-12"
          >
            Açık farkları incele
          </Link>
        }
      />
      <FinanceNavigation active="payments" role={session.staff.role} />

      <section className="admin-surface grid overflow-hidden shadow-none md:grid-cols-[1.618fr_1fr]">
        <div className="bg-cherie-velvet p-6 text-white sm:p-8">
          <CheckCircle2 className="size-5 text-cherie-brass" aria-hidden="true" />
          <p className="mt-8 text-xs font-bold uppercase tracking-[.16em] text-white/65">
            Doğrulanmış tahsilat
          </p>
          <p className="admin-number mt-2 text-4xl font-semibold sm:text-5xl">
            {formatTRYMinor(
              totals.paid.reduce((sum, row) => sum + Number(row.amount_minor), 0),
            ) ?? '₺0,00'}
          </p>
          <p className="mt-3 text-sm text-white/65">
            Bu görünümdeki en güncel 200 ödeme kaydı içindeki güvenli toplam
          </p>
        </div>
        <div className="grid grid-cols-3 divide-x divide-cherie-lace md:grid-cols-1 md:divide-x-0 md:divide-y">
          <Metric icon={CreditCard} label="İşlem" value={String(rows.length)} />
          <Metric icon={Clock3} label="Bekleyen" value={String(totals.pending.length)} />
          <Metric
            icon={XCircle}
            label="Sorunlu"
            value={String(totals.failed.length)}
            tone="error"
          />
        </div>
      </section>

      <AdminToolbar label="Ödeme filtreleri">
        <form className="grid gap-3 md:grid-cols-4">
          <label>
            <span className="sr-only">Sağlayıcı referansı</span>
            <input
              name="q"
              defaultValue={filters.q}
              placeholder="Sağlayıcı referansı"
              className="cherie-field w-full"
            />
          </label>
          <label>
            <span className="sr-only">Ödeme durumu</span>
            <select
              name="status"
              defaultValue={filters.status ?? ''}
              className="cherie-field w-full"
            >
              <option value="">Tüm durumlar</option>
              {PAYMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {adminValueLabel(status)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Ödeme sağlayıcısı</span>
            <select
              name="provider"
              defaultValue={filters.provider ?? ''}
              className="cherie-field w-full"
            >
              <option value="">Tüm sağlayıcılar</option>
              <option value="paytr">PayTR</option>
              <option value="iyzico">Iyzico</option>
              <option value="bank_transfer">Banka transferi</option>
              <option value="manual">Manuel kayıt</option>
            </select>
          </label>
          <button className="cherie-button-primary min-h-12">Filtrele</button>
        </form>
      </AdminToolbar>

      {unavailable ? (
        <AdminNotice tone="warning" title="Finans kayıtlarının bir bölümü alınamadı">
          Hiçbir tahsilat değiştirilmedi. Ortam bağlantısını doğruladıktan sonra sayfayı
          güvenle yenileyebilirsiniz.
        </AdminNotice>
      ) : rows.length === 0 ? (
        <AdminEmptyState
          title="Bu filtrelerde ödeme kaydı yok"
          description="Filtreleri temizleyin veya ilk güvenli ödeme denemesinin sağlayıcı kanıtıyla oluşmasını bekleyin."
          primary={{ label: 'Tüm ödemeleri göster', href: '/admin/finance/payments' }}
          secondary={{ label: 'Siparişleri incele', href: '/admin/commerce/orders' }}
        />
      ) : (
        <div className="admin-surface overflow-hidden shadow-none">
          <div className="divide-y divide-cherie-lace p-5 md:hidden">
            {rows.map((row) => {
              const customerId = row.orders?.customer_id;
              return (
                <article key={row.id} className="admin-mobile-entity">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {row.order_id ? (
                        <Link
                          href={`/admin/commerce/orders/${row.order_id}`}
                          className="font-bold text-cherie-burgundy hover:underline"
                        >
                          {row.orders?.order_number ?? 'Sipariş kaydı'}
                        </Link>
                      ) : (
                        <strong>Siparişsiz ödeme</strong>
                      )}
                      {customerId && (
                        <Link
                          href={`/admin/customers/${customerId}`}
                          className="mt-1 block truncate text-xs text-cherie-soft-ink hover:text-cherie-burgundy"
                        >
                          {customerNames.get(customerId) ?? 'Müşteri kaydı'}
                        </Link>
                      )}
                    </div>
                    <AdminStatus value={row.status} />
                  </div>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div>
                      <strong className="admin-number text-xl">
                        {formatTRYMinor(row.amount_minor)}
                      </strong>
                      <p className="mt-1 text-xs text-cherie-soft-ink">
                        {adminValueLabel(row.provider)} · {row.attempt_number}. deneme
                      </p>
                    </div>
                    <time className="text-right text-xs text-cherie-soft-ink">
                      {formatDate(row.paid_at ?? row.initialized_at ?? row.created_at)}
                    </time>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-cherie-paper/90">
                <tr>
                  <th className="px-5 py-4">Sipariş / müşteri</th>
                  <th className="px-5 py-4">Sağlayıcı</th>
                  <th className="px-5 py-4">Durum</th>
                  <th className="px-5 py-4">Tutar</th>
                  <th className="px-5 py-4">Deneme</th>
                  <th className="px-5 py-4">Kanıt zamanı</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cherie-lace/70">
                {rows.map((row) => {
                  const customerId = row.orders?.customer_id;
                  return (
                    <tr key={row.id}>
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
                        {customerId && (
                          <Link
                            href={`/admin/customers/${customerId}`}
                            className="mt-1 block text-xs text-cherie-soft-ink hover:text-cherie-burgundy"
                          >
                            {customerNames.get(customerId) ?? 'Müşteri kaydı'}
                          </Link>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-semibold">
                          {adminValueLabel(row.provider)}
                        </span>
                        <small className="mt-1 block max-w-48 truncate text-cherie-soft-ink">
                          {row.provider_conversation_id ?? 'Referans bekleniyor'}
                        </small>
                      </td>
                      <td className="px-5 py-4">
                        <AdminStatus value={row.status} />
                        {row.last_error_code && (
                          <span className="mt-1 block text-xs text-cherie-error">
                            Sağlayıcı hatası kaydedildi
                          </span>
                        )}
                      </td>
                      <td className="admin-number px-5 py-4 font-bold">
                        {formatTRYMinor(row.amount_minor)}
                      </td>
                      <td className="admin-number px-5 py-4">{row.attempt_number}</td>
                      <td className="px-5 py-4 text-xs text-cherie-soft-ink">
                        {formatDate(row.paid_at ?? row.initialized_at ?? row.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <section className="admin-surface p-5 shadow-none sm:p-6">
        <p className="admin-eyebrow">Doğrulama izi</p>
        <h2 className="admin-section-title mt-1">Sağlayıcı bildirimleri</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-cherie-soft-ink">
          İmza, ödeme eşleşmesi ve uygulanma sonucunu birlikte değerlendirin. Ham
          sağlayıcı yükü bu ekranda gösterilmez.
        </p>
        {events.length === 0 ? (
          <AdminNotice tone="information" title="Henüz sağlayıcı bildirimi yok">
            İlk doğrulanmış bildirim geldiğinde değişmez olay izi burada görünecek.
          </AdminNotice>
        ) : (
          <>
            <div className="mt-5 divide-y divide-cherie-lace md:hidden">
              {events.map((event) => (
                <article key={event.id} className="admin-mobile-entity">
                  <div className="flex items-start justify-between gap-3">
                    <strong>{adminValueLabel(event.event_type ?? 'callback')}</strong>
                    <AdminStatus value={event.outcome ?? event.processing_status} />
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <dt className="text-cherie-soft-ink">İmza</dt>
                      <dd className="mt-1 font-semibold">
                        {event.signature_valid ? 'Geçerli' : 'Doğrulanamadı'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-cherie-soft-ink">Eşleşme</dt>
                      <dd className="mt-1 font-semibold">
                        {event.payment_id ? 'Ödemeye bağlı' : 'Eşleşmedi'}
                      </dd>
                    </div>
                  </dl>
                  <time className="mt-3 block text-xs text-cherie-soft-ink">
                    {formatDate(event.received_at)}
                  </time>
                </article>
              ))}
            </div>
            <div className="mt-5 hidden overflow-x-auto md:block">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr>
                    <th className="text-left">Bildirim</th>
                    <th>İmza</th>
                    <th>Eşleşme</th>
                    <th>Sonuç</th>
                    <th>Zaman</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-t border-cherie-lace">
                      <td className="py-4 text-left">
                        <span className="font-semibold">
                          {adminValueLabel(event.event_type ?? 'callback')}
                        </span>
                        <small className="block text-cherie-soft-ink">
                          {adminValueLabel(event.provider)} ·{' '}
                          {event.provider_event_id?.slice(0, 12) ?? 'Referans yok'}
                        </small>
                      </td>
                      <td className="text-center">
                        {event.signature_valid ? 'Geçerli' : 'Doğrulanamadı'}
                      </td>
                      <td className="text-center">
                        {event.payment_id ? 'Ödemeye bağlı' : 'Eşleşmedi'}
                      </td>
                      <td className="text-center">
                        <AdminStatus value={event.outcome ?? event.processing_status} />
                      </td>
                      <td className="text-center text-xs text-cherie-soft-ink">
                        {formatDate(event.received_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone = 'neutral',
}: {
  icon: typeof CreditCard;
  label: string;
  value: string;
  tone?: 'neutral' | 'error';
}) {
  return (
    <article className="flex min-h-24 flex-col justify-center p-4 md:min-h-0">
      <Icon
        className={`size-4 ${tone === 'error' ? 'text-cherie-error' : 'text-cherie-burgundy'}`}
        strokeWidth={1.6}
        aria-hidden="true"
      />
      <p className="mt-3 text-xs text-cherie-soft-ink">{label}</p>
      <p className="admin-number mt-1 text-xl font-bold text-cherie-ink">{value}</p>
    </article>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Istanbul',
  }).format(new Date(value));
}
