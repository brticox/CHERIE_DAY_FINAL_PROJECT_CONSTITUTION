import { CheckCircle2, Clock3, CreditCard, XCircle } from 'lucide-react';

import { createAdminClient } from '@/lib/supabase/admin';
import { formatTRY } from '@/lib/format';
import { requireCapability } from '@/lib/auth/guards';
import {
  AdminEmptyState,
  AdminNotice,
  AdminPageHeader,
  AdminStatus,
  AdminToolbar,
} from '@/components/admin/admin-workspace';
import { adminValueLabel } from '@/lib/admin/presentation';

type PaymentRow = {
  id: string;
  provider: string;
  status: string;
  amount: number;
  currency: string;
  provider_conversation_id: string | null;
  last_error_code?: string | null;
  created_at: string;
  orders: { order_number?: string } | null;
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
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Bekliyor',
  authorized: 'Yetkilendirildi',
  paid: 'Ödendi',
  failed: 'Başarısız',
  cancelled: 'İptal',
  refunded: 'İade',
  partially_refunded: 'Kısmi iade',
};

export const dynamic = 'force-dynamic';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; provider?: string; q?: string }>;
}) {
  const filters = await searchParams;
  await requireCapability('finance.read', '/admin/commerce/payments');
  let rows: PaymentRow[] = [];
  let events: PaymentEvent[] = [];
  let unavailable = false;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createAdminClient();
    let query = admin
      .from('payments')
      .select(
        'id,provider,status,amount,currency,provider_conversation_id,last_error_code,created_at,orders(order_number)',
      )
      .order('created_at', { ascending: false })
      .limit(100);
    if (filters.status) query = query.eq('status', filters.status as never);
    if (filters.provider) query = query.eq('provider', filters.provider as never);
    if (filters.q)
      query = query.ilike(
        'provider_conversation_id',
        `%${filters.q.replace(/[,%]/g, '')}%`,
      );
    const { data, error } = await query;
    rows = (data ?? []) as PaymentRow[];
    events =
      (
        await admin
          .from('payment_events')
          .select(
            'id,provider,event_type,processing_status,signature_valid,payment_id,provider_event_id,error_code,received_at',
          )
          .order('received_at', { ascending: false })
          .limit(100)
      ).data ?? [];
    unavailable = Boolean(error);
  } else {
    unavailable = true;
  }
  const totals = {
    paid: rows.filter((row) => row.status === 'paid'),
    pending: rows.filter((row) => ['pending', 'authorized'].includes(row.status)),
    failed: rows.filter((row) => ['failed', 'cancelled'].includes(row.status)),
  };

  return (
    <div className="space-y-8 p-5 md:p-8">
      <AdminPageHeader
        eyebrow="Finans operasyonu"
        title="Ödeme kontrol merkezi"
        description="Tahsilatları, sağlayıcı bildirimlerini ve doğrulama risklerini tek karar görünümünde izleyin."
      />

      <section className="admin-surface grid overflow-hidden md:grid-cols-[1.618fr_1fr]">
        <div className="bg-cherie-velvet p-6 text-white sm:p-8">
          <CheckCircle2 className="size-5 text-cherie-brass" aria-hidden="true" />
          <p className="mt-8 text-xs font-bold uppercase tracking-[.16em] text-white/65">
            Doğrulanmış tahsilat
          </p>
          <p className="cherie-price mt-2 text-4xl font-semibold sm:text-5xl">
            {formatTRY(totals.paid.reduce((sum, row) => sum + Number(row.amount), 0)) ??
              '₺0'}
          </p>
          <p className="mt-3 text-sm text-white/65">
            Son 100 ödeme kaydı içindeki güvenli toplam
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
          <input
            name="q"
            defaultValue={filters.q}
            placeholder="Sağlayıcı referansı"
            className="cherie-field"
          />
          <select
            name="status"
            defaultValue={filters.status ?? ''}
            className="cherie-field"
          >
            <option value="">Tüm durumlar</option>
            {Object.keys(STATUS_LABELS).map((x) => (
              <option key={x} value={x}>
                {STATUS_LABELS[x]}
              </option>
            ))}
          </select>
          <select
            name="provider"
            defaultValue={filters.provider ?? ''}
            className="cherie-field"
          >
            <option value="">Tüm sağlayıcılar</option>
            <option value="paytr">PayTR</option>
            <option value="iyzico">Iyzico</option>
            <option value="bank_transfer">Banka transferi</option>
            <option value="manual">Manuel kayıt</option>
          </select>
          <button className="cherie-button-primary">Filtrele</button>
        </form>
      </AdminToolbar>

      {unavailable ? (
        <AdminNotice tone="warning" title="Ödeme verileri şu anda kullanılamıyor">
          Hiçbir tahsilat değiştirilmedi. Ortam bağlantısını doğruladıktan sonra sayfayı
          güvenle yenileyebilirsiniz.
        </AdminNotice>
      ) : rows.length === 0 ? (
        <AdminEmptyState
          title="Henüz ödeme denemesi yok"
          description="İlk güvenli ödeme denemesi, doğrulama ve sağlayıcı bağlamıyla burada görünecek."
          primary={{ label: 'Siparişleri incele', href: '/admin/commerce/orders' }}
        />
      ) : (
        <div className="admin-surface overflow-hidden">
          <div className="divide-y divide-cherie-lace p-5 md:hidden">
            {rows.map((row) => (
              <article key={row.id} className="admin-mobile-entity">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <strong>{row.orders?.order_number ?? 'Siparişsiz ödeme'}</strong>
                    <p className="mt-1 text-xs text-cherie-soft-ink">
                      {adminValueLabel(row.provider)} ·{' '}
                      {row.provider_conversation_id ?? 'Referans yok'}
                    </p>
                  </div>
                  <AdminStatus value={row.status} />
                </div>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <strong className="cherie-price text-xl">
                    {formatTRY(Number(row.amount))}
                  </strong>
                  <time className="text-xs text-cherie-soft-ink">
                    {formatDate(row.created_at)}
                  </time>
                </div>
              </article>
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="bg-cherie-paper text-xs uppercase tracking-wide text-cherie-soft-ink">
                <tr>
                  <th className="px-5 py-4">Sipariş</th>
                  <th className="px-5 py-4">Sağlayıcı</th>
                  <th className="px-5 py-4">Durum</th>
                  <th className="px-5 py-4">Tutar</th>
                  <th className="px-5 py-4">Referans</th>
                  <th className="px-5 py-4">Oluşturma</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cherie-lace/70">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-cherie-paper/40">
                    <td className="px-5 py-4 font-semibold text-cherie-ink">
                      {row.orders?.order_number ?? '—'}
                    </td>
                    <td className="px-5 py-4 uppercase text-cherie-soft-ink">
                      {row.provider}
                    </td>
                    <td className="px-5 py-4">
                      <AdminStatus value={row.status} />
                      {row.last_error_code && (
                        <span className="mt-1 block text-xs text-cherie-error">
                          Sağlayıcı hatası kaydedildi
                        </span>
                      )}
                    </td>
                    <td className="cherie-price px-5 py-4 font-semibold text-cherie-ink">
                      {formatTRY(Number(row.amount))}
                    </td>
                    <td className="max-w-48 truncate px-5 py-4 text-xs text-cherie-soft-ink">
                      {row.provider_conversation_id ?? '—'}
                    </td>
                    <td className="px-5 py-4 text-xs text-cherie-soft-ink">
                      {new Intl.DateTimeFormat('tr-TR', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                        timeZone: 'Europe/Istanbul',
                      }).format(new Date(row.created_at))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <section className="admin-surface p-5 shadow-none">
        <p className="admin-eyebrow">Doğrulama izi</p>
        <h2 className="admin-section-title mt-1">Sağlayıcı bildirimleri</h2>
        <p className="mt-2 max-w-2xl text-sm text-cherie-soft-ink">
          İmza, ödeme eşleşmesi ve işleme sonucunu birlikte değerlendirin.
        </p>
        <div className="mt-5 divide-y divide-cherie-lace md:hidden">
          {events.map((event) => (
            <article key={event.id} className="admin-mobile-entity">
              <div className="flex items-start justify-between gap-3">
                <strong>{adminValueLabel(event.provider)}</strong>
                <AdminStatus value={event.processing_status} />
              </div>
              <p className="mt-1 text-sm text-cherie-soft-ink">
                {adminValueLabel(event.event_type ?? 'callback')}
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <dt className="text-cherie-soft-ink">İmza</dt>
                  <dd>{event.signature_valid ? 'Geçerli' : 'Uyuşmuyor'}</dd>
                </div>
                <div>
                  <dt className="text-cherie-soft-ink">Eşleşme</dt>
                  <dd>{event.payment_id ? 'Ödemeye bağlı' : 'Eşleşmedi'}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
        <div className="mt-5 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr>
                <th className="text-left">Olay</th>
                <th>İmza</th>
                <th>Eşleşme</th>
                <th>İşleme</th>
                <th>Hata</th>
                <th>Zaman</th>
              </tr>
            </thead>
            <tbody>
              {events.map((x) => (
                <tr key={x.id} className="border-t border-cherie-lace">
                  <td className="py-3">
                    {adminValueLabel(x.provider)} ·{' '}
                    {adminValueLabel(x.event_type ?? 'callback')}
                    <small className="block">
                      {x.provider_event_id?.slice(0, 12) ?? 'Referans yok'}
                    </small>
                  </td>
                  <td className="text-center">
                    {x.signature_valid ? 'Geçerli' : 'UYUŞMAZLIK'}
                  </td>
                  <td className="text-center">
                    {x.payment_id ? 'Bağlı' : 'Uygulanmamış'}
                  </td>
                  <td className="text-center">
                    <AdminStatus value={x.processing_status} />
                  </td>
                  <td className="text-center text-cherie-error">
                    {x.error_code ? 'İnceleme gerekli' : '—'}
                  </td>
                  <td className="text-center">
                    {new Intl.DateTimeFormat('tr-TR', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                      timeZone: 'Europe/Istanbul',
                    }).format(new Date(x.received_at))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
  tone?: 'neutral' | 'success' | 'error';
}) {
  const color =
    tone === 'success'
      ? 'text-cherie-success'
      : tone === 'error'
        ? 'text-cherie-error'
        : 'text-cherie-burgundy';
  return (
    <article className="flex min-h-24 flex-col justify-center p-4 md:min-h-0">
      <Icon className={`size-4 ${color}`} strokeWidth={1.6} aria-hidden="true" />
      <p className="mt-3 text-xs text-cherie-soft-ink">{label}</p>
      <p className="cherie-price mt-1 text-xl font-bold text-cherie-ink">{value}</p>
    </article>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Europe/Istanbul',
  }).format(new Date(value));
}
