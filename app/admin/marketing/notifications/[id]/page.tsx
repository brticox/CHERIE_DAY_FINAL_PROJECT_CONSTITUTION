import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AdminPageHeader, AdminStatus } from '@/components/admin/admin-workspace';
import { requireStaff } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';

type TimelineItem = {
  from_status: string | null;
  to_status: string;
  source: string;
  created_at: string;
};
type NotificationDetail = {
  id: string;
  status: string;
  event_type: string;
  template_key: string;
  aggregate_type: string;
  aggregate_id: string | null;
  recipient: string;
  recipient_kind: string;
  reply_to_route: string | null;
  provider: string | null;
  provider_message_id: string | null;
  attempts: number;
  max_attempts: number;
  last_error_code: string | null;
  created_at: string;
  sent_at: string | null;
  delivered_at: string | null;
  timeline: TimelineItem[];
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id)) notFound();
  await requireStaff(`/admin/marketing/notifications/${id}`);
  const db = await createClient();
  const rpc = db.rpc.bind(db) as unknown as (
    name: string,
    args: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: { code: string } | null }>;
  const { data, error } = await rpc('admin_notification_detail', { p_notification_id: id });
  if (error || !isDetail(data)) notFound();
  const detail = data;

  return (
    <div className="space-y-7 p-5 md:p-8">
      <AdminPageHeader
        eyebrow="Teslimat ayrıntısı"
        title="Bildirim zaman çizelgesi"
        description="Alıcı ve sağlayıcı kimlikleri güvenli biçimde maskelenmiştir; ileti gövdesi ve sağlayıcı yükü gösterilmez."
        action={<Link href="/admin/marketing/notifications" className="cherie-button-secondary">Teslimatlara dön</Link>}
      />
      <div className="admin-surface grid gap-px overflow-hidden bg-cherie-lace md:grid-cols-2 xl:grid-cols-4">
        <Fact label="Durum"><AdminStatus value={detail.status} label={detail.status} /></Fact>
        <Fact label="İş olayı" value={detail.event_type} />
        <Fact label="Şablon" value={detail.template_key} />
        <Fact label="Alıcı" value={detail.recipient_kind === 'staff' ? 'Ekip' : detail.recipient} />
        <Fact label="İlgili kayıt" value={`${detail.aggregate_type} · ${shortId(detail.aggregate_id)}`} />
        <Fact label="Reply-To sahibi" value={detail.reply_to_route ?? 'Yapılandırmadan çözümlenir'} />
        <Fact label="Sağlayıcı izi" value={`${detail.provider ?? '—'} · ${detail.provider_message_id ?? '—'}`} />
        <Fact label="Denemeler" value={`${detail.attempts}/${detail.max_attempts}`} />
      </div>
      <section className="admin-surface p-5 md:p-7">
        <h2 className="font-display text-2xl text-cherie-burgundy">Teslimat akışı</h2>
        {detail.timeline.length === 0 ? (
          <p className="mt-4 text-sm text-cherie-soft-ink">Henüz durum değişikliği kaydedilmedi.</p>
        ) : (
          <ol className="mt-5 space-y-4 border-l border-cherie-brass/40 pl-5">
            {detail.timeline.map((item, index) => (
              <li key={`${item.created_at}-${index}`}>
                <p className="font-medium text-cherie-ink">{item.from_status ?? 'oluşturuldu'} → {item.to_status}</p>
                <p className="mt-1 text-xs text-cherie-soft-ink">{sourceLabel(item.source)} · {formatDate(item.created_at)}</p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function Fact({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return <div className="bg-cherie-ivory p-5"><p className="text-xs uppercase tracking-wide text-cherie-soft-ink">{label}</p><div className="mt-2 text-sm font-medium text-cherie-ink">{children ?? value ?? '—'}</div></div>;
}
function isDetail(value: unknown): value is NotificationDetail {
  if (!value || typeof value !== 'object') return false;
  const detail = value as Partial<NotificationDetail>;
  return typeof detail.id === 'string' && typeof detail.status === 'string' && Array.isArray(detail.timeline);
}
function shortId(value: string | null) { return value ? `${value.slice(0, 8)}…` : '—'; }
function sourceLabel(value: string) { return ({ worker: 'İşleyici', provider_webhook: 'Sağlayıcı', admin: 'Yönetici', database: 'Sistem' } as Record<string, string>)[value] ?? 'Sistem'; }
function formatDate(value: string) { return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Istanbul' }).format(new Date(value)); }
