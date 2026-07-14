import { notFound } from 'next/navigation';

import { requireStaff } from '@/lib/auth/guards';
import { notificationReadiness } from '@/lib/notifications/config';
import { createAdminClient } from '@/lib/supabase/admin';
import { retryNotification } from './actions';

const allowedRoles = new Set([
  'superadmin',
  'admin',
  'order_operations',
  'commerce_manager',
  'support_agent',
]);

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    channel?: string;
    provider?: string;
    q?: string;
    error?: string;
  }>;
}) {
  const filters = await searchParams;
  const { staff } = await requireStaff('/admin/marketing/notifications');
  if (!allowedRoles.has(staff.role)) notFound();
  const admin = createAdminClient();
  let query = admin
    .from('notification_outbox')
    .select(
      'id,status,template_key,channel,aggregate_type,aggregate_id,recipient_email,recipient_kind,attempts,max_attempts,provider_message_id,last_error,last_error_code,created_at,next_attempt_at,sent_at',
    )
    .order('created_at', { ascending: false })
    .limit(100);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.channel) query = query.eq('channel', filters.channel as never);
  if (filters.provider) query = query.eq('provider', filters.provider);
  if (filters.q)
    query = query.or(
      `template_key.ilike.%${filters.q.replace(/[,%]/g, '')}%,aggregate_id.ilike.%${filters.q.replace(/[,%]/g, '')}%`,
    );
  const { data: rows } = await query;
  const readiness = notificationReadiness();
  const counts = countStatuses(rows ?? []);

  return (
    <div className="p-5 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="cherie-kicker">Operasyon</p>
          <h1 className="text-h2 mt-2">Bildirim teslimatı</h1>
          <p className="mt-2 text-sm text-cherie-soft-ink">
            Son 100 işlem; alıcılar ve sağlayıcı hataları güvenli biçimde maskelenir.
          </p>
        </div>
        <span className="rounded-full border border-cherie-lace bg-cherie-paper px-3 py-1.5 text-xs font-semibold">
          Taşıma: {readiness.mode}
        </span>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {Object.entries(counts).map(([label, value]) => (
          <div
            key={label}
            className="rounded-card border border-cherie-lace bg-cherie-ivory p-4"
          >
            <p className="text-xs uppercase tracking-wide text-cherie-soft-ink">
              {label}
            </p>
            <p className="mt-2 font-display text-3xl text-cherie-burgundy">{value}</p>
          </div>
        ))}
      </div>
      {filters.error && (
        <p role="alert" className="mt-4 rounded-control bg-cherie-error/10 p-3 text-sm">
          {decodeURIComponent(filters.error)}
        </p>
      )}
      <form className="mt-5 grid gap-3 rounded-card border border-cherie-lace p-4 md:grid-cols-5">
        <input
          aria-label="Bildirim ara"
          name="q"
          defaultValue={filters.q}
          placeholder="Şablon veya aggregate"
          className="cherie-field"
        />
        <select
          aria-label="Bildirim durumu"
          name="status"
          defaultValue={filters.status ?? ''}
          className="cherie-field"
        >
          <option value="">Tüm durumlar</option>
          {[
            'queued',
            'processing',
            'sent',
            'retry_scheduled',
            'permanently_failed',
            'cancelled',
          ].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <select
          aria-label="Bildirim kanalı"
          name="channel"
          defaultValue={filters.channel ?? ''}
          className="cherie-field"
        >
          <option value="">Tüm kanallar</option>
          <option value="email">E-posta</option>
          <option value="sms">SMS</option>
          <option value="whatsapp">WhatsApp</option>
        </select>
        <input
          aria-label="Bildirim sağlayıcısı"
          name="provider"
          defaultValue={filters.provider}
          placeholder="Sağlayıcı"
          className="cherie-field"
        />
        <button className="cherie-button-primary">Filtrele</button>
      </form>

      <div className="mt-7 overflow-x-auto rounded-card border border-cherie-lace bg-cherie-ivory">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-cherie-paper text-xs uppercase tracking-wide text-cherie-soft-ink">
            <tr>
              <th className="p-3">Durum</th>
              <th className="p-3">Şablon</th>
              <th className="p-3">Kanal / alıcı</th>
              <th className="p-3">Bağlam</th>
              <th className="p-3">Deneme</th>
              <th className="p-3">Sağlayıcı</th>
              <th className="p-3">Zaman / hata</th>
              <th className="p-3">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cherie-lace">
            {(rows ?? []).map((row) => (
              <tr key={row.id}>
                <td className="p-3 font-semibold">{statusLabel(row.status)}</td>
                <td className="p-3">{row.template_key}</td>
                <td className="p-3">
                  {row.channel} ·{' '}
                  {row.recipient_kind === 'staff'
                    ? 'ekip'
                    : redactEmail(row.recipient_email)}
                </td>
                <td className="p-3">
                  {row.aggregate_type} · {shortId(row.aggregate_id)}
                </td>
                <td className="p-3">
                  {row.attempts}/{row.max_attempts}
                </td>
                <td className="p-3">
                  {row.provider_message_id ? shortId(row.provider_message_id) : '—'}
                </td>
                <td className="max-w-xs p-3 text-xs text-cherie-soft-ink">
                  {formatDate(row.sent_at ?? row.next_attempt_at ?? row.created_at)}
                  {row.last_error && (
                    <span className="mt-1 block text-cherie-burgundy">
                      {row.last_error_code}: {row.last_error}
                    </span>
                  )}
                </td>
                <td className="p-3">
                  {['retry_scheduled', 'permanently_failed'].includes(row.status) && (
                    <form action={retryNotification}>
                      <input type="hidden" name="id" value={row.id} />
                      <button
                        name="confirm"
                        value="retry"
                        className="cherie-button-secondary"
                      >
                        Güvenli tekrar
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows?.length && (
          <p className="p-8 text-center text-sm text-cherie-soft-ink">
            Henüz bildirim kaydı yok.
          </p>
        )}
      </div>
    </div>
  );
}

function countStatuses(rows: { status: string }[]) {
  const result = {
    Kuyrukta: 0,
    İşleniyor: 0,
    Gönderildi: 0,
    Tekrar: 0,
    'Kalıcı hata': 0,
  };
  for (const row of rows) {
    if (row.status === 'queued') result.Kuyrukta += 1;
    else if (row.status === 'processing') result.İşleniyor += 1;
    else if (row.status === 'sent') result.Gönderildi += 1;
    else if (row.status === 'retry_scheduled') result.Tekrar += 1;
    else if (row.status === 'permanently_failed') result['Kalıcı hata'] += 1;
  }
  return result;
}

function redactEmail(value: string | null) {
  if (!value) return 'çözümlenecek';
  const [name = '', domain = '—'] = value.split('@');
  return `${name.slice(0, 2)}***@${domain}`;
}
function shortId(value: string | null) {
  return value ? `${value.slice(0, 8)}…` : '—';
}
function statusLabel(value: string) {
  return (
    (
      {
        queued: 'Kuyrukta',
        processing: 'İşleniyor',
        sent: 'Gönderildi',
        retry_scheduled: 'Tekrar bekliyor',
        permanently_failed: 'Kalıcı hata',
        cancelled: 'İptal',
      } as Record<string, string>
    )[value] ?? value
  );
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Europe/Istanbul',
  }).format(new Date(value));
}
