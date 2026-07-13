import { AlertTriangle, CheckCircle2, Clock3, CreditCard, XCircle } from 'lucide-react';

import { createAdminClient } from '@/lib/supabase/admin';
import { formatTRY } from '@/lib/format';

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

export default async function Page() {
  let rows: PaymentRow[] = [];
  let unavailable = false;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('payments')
      .select(
        'id,provider,status,amount,currency,provider_conversation_id,last_error_code,created_at,orders(order_number)',
      )
      .order('created_at', { ascending: false })
      .limit(100);
    rows = (data ?? []) as PaymentRow[];
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
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-cherie-brass">
          Ticaret operasyonu
        </p>
        <h1 className="mt-2 font-display text-4xl text-cherie-ink">Ödemeler</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-cherie-soft-ink">
          Sağlayıcı bildirimleri, doğrulama durumu ve tahsilat akışının tek görünümü.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={CreditCard} label="Son 100 işlem" value={String(rows.length)} />
        <Metric
          icon={CheckCircle2}
          label="Doğrulanmış tahsilat"
          value={
            formatTRY(totals.paid.reduce((sum, row) => sum + Number(row.amount), 0)) ??
            '₺0'
          }
          tone="success"
        />
        <Metric icon={Clock3} label="Bekleyen" value={String(totals.pending.length)} />
        <Metric
          icon={XCircle}
          label="Başarısız / iptal"
          value={String(totals.failed.length)}
          tone="error"
        />
      </section>

      {unavailable ? (
        <div className="rounded-card-lg border border-cherie-warning/30 bg-cherie-warning/10 p-5 text-sm text-cherie-soft-ink">
          <AlertTriangle className="mr-2 inline size-4 text-cherie-warning" />
          Ödeme veritabanı veya son migration henüz bu ortamda kullanılamıyor.
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-card-lg border border-dashed border-cherie-lace bg-cherie-paper/50 px-6 py-14 text-center">
          <h2 className="font-display text-2xl text-cherie-ink">
            Henüz ödeme denemesi yok
          </h2>
          <p className="mt-2 text-sm text-cherie-soft-ink">
            İlk güvenli ödeme denemesi burada görünecek.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-card-lg border border-cherie-lace bg-cherie-ivory shadow-sm">
          <div className="overflow-x-auto">
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
                      <StatusBadge status={row.status} />
                      {row.last_error_code && (
                        <span className="mt-1 block text-xs text-cherie-error">
                          {row.last_error_code}
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
    <article className="rounded-card-lg border border-cherie-lace bg-cherie-ivory p-5 shadow-sm">
      <Icon className={`size-5 ${color}`} strokeWidth={1.6} />
      <p className="mt-5 text-xs text-cherie-soft-ink">{label}</p>
      <p className="cherie-price mt-1 text-xl font-bold text-cherie-ink">{value}</p>
    </article>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === 'paid'
      ? 'bg-cherie-success/10 text-cherie-success'
      : ['failed', 'cancelled'].includes(status)
        ? 'bg-cherie-error/10 text-cherie-error'
        : 'bg-cherie-warning/10 text-cherie-warning';
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${color}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
