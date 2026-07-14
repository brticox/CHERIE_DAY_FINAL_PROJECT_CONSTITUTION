import { requireCapability } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { AdminDate, StateBadge } from '@/components/admin/resource-list';
import {
  AdminNotice,
  AdminPageHeader,
  AdminToolbar,
} from '@/components/admin/admin-workspace';
import { adminValueLabel } from '@/lib/admin/presentation';
import { convertLead, updateLead } from './actions';
import type { Database } from '@/lib/supabase/database.types';
const stages: Database['public']['Enums']['lead_status'][] = [
  'new',
  'contacted',
  'qualified',
  'appointment',
  'proposal_sent',
  'negotiation',
  'won',
  'lost',
];
const labels: Record<string, string> = {
  new: 'Yeni',
  contacted: 'İletişime geçildi',
  qualified: 'Nitelikli',
  appointment: 'Randevu',
  proposal_sent: 'Teklif',
  negotiation: 'Müzakere',
  won: 'Kazanıldı',
  lost: 'Kaybedildi',
};
export const dynamic = 'force-dynamic';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    source?: string;
    priority?: string;
    error?: string;
  }>;
}) {
  const filters = await searchParams;
  await requireCapability('crm.read', '/admin/crm/leads');
  const db = createAdminClient();
  let query = db
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(250);
  if (filters.q)
    query = query.or(
      `name.ilike.%${safe(filters.q)}%,email.ilike.%${safe(filters.q)}%,phone.ilike.%${safe(filters.q)}%,message.ilike.%${safe(filters.q)}%`,
    );
  if (filters.source) query = query.eq('source_type', filters.source as never);
  if (filters.priority) query = query.eq('priority', filters.priority);
  const [{ data, error }, staffQ, notesQ, historyQ, customersQ] = await Promise.all([
    query,
    db.from('staff_users').select('id,name').eq('is_active', true).order('name'),
    db
      .from('lead_notes')
      .select('id,lead_id,note,created_at')
      .order('created_at', { ascending: false })
      .limit(500),
    db
      .from('lead_status_history')
      .select('*')
      .order('changed_at', { ascending: false })
      .limit(500),
    db.from('customers').select('id,email,phone'),
  ]);
  const rows = data ?? [];
  const dupKeys = new Set<string>();
  const seen = new Set<string>();
  for (const record of [...(customersQ.data ?? []), ...rows])
    for (const key of [
      record.email?.toLowerCase(),
      record.phone?.replace(/\D/g, ''),
    ].filter(Boolean) as string[]) {
      if (seen.has(key)) dupKeys.add(key);
      seen.add(key);
    }
  return (
    <div className="space-y-7 p-4 md:p-8">
      <AdminPageHeader
        eyebrow="Müşteri ilişkileri"
        title="Talep ve fırsat merkezi"
        description="Yeni talepleri önceliğine göre değerlendirin; sonraki teması, sorumluyu ve dönüşüm yolunu tek akışta yönetin."
      />
      {filters.error && (
        <p role="alert" className="rounded-control bg-cherie-error/10 p-3 text-sm">
          Talep işlemi tamamlanamadı. Önceki kayıt korundu; alanları kontrol edip yeniden
          deneyebilirsiniz.
        </p>
      )}
      <AdminToolbar label="Talep filtreleri">
        <form className="grid gap-3 md:grid-cols-4">
          <input
            aria-label="Taleplerde ara"
            name="q"
            defaultValue={filters.q}
            placeholder="Ad, iletişim, mesaj"
            className="cherie-field"
          />
          <select
            aria-label="Talep kaynağı"
            name="source"
            defaultValue={filters.source ?? ''}
            className="cherie-field"
          >
            <option value="">Tüm kaynaklar</option>
            {[
              'hayalini_tasarla',
              'quote_request',
              'product_inquiry',
              'contact_form',
              'memory_request',
              'whatsapp',
              'city_waitlist',
            ].map((x) => (
              <option key={x} value={x}>
                {adminValueLabel(x)}
              </option>
            ))}
          </select>
          <select
            aria-label="Talep önceliği"
            name="priority"
            defaultValue={filters.priority ?? ''}
            className="cherie-field"
          >
            <option value="">Tüm öncelikler</option>
            {['low', 'normal', 'high', 'urgent'].map((x) => (
              <option key={x} value={x}>
                {adminValueLabel(x)}
              </option>
            ))}
          </select>
          <button className="cherie-button-primary">Filtrele</button>
        </form>
      </AdminToolbar>
      {error ? (
        <AdminNotice tone="danger" title="Talepler şu anda okunamıyor">
          Hiçbir kayıt değiştirilmedi. Bağlantıyı kontrol ettikten sonra sayfayı güvenle
          yenileyebilirsiniz.
        </AdminNotice>
      ) : (
        <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stages.map((stage) => (
            <section key={stage} className="admin-surface overflow-hidden p-3">
              <h2 className="flex justify-between font-display text-xl">
                <span>{labels[stage]}</span>
                <span className="text-base tabular-nums text-cherie-soft-ink">
                  {rows.filter((x) => x.status === stage).length}
                </span>
              </h2>
              <div className="mt-3 space-y-3">
                {rows
                  .filter((x) => x.status === stage)
                  .map((lead) => {
                    const duplicate = [
                      lead.email?.toLowerCase(),
                      lead.phone?.replace(/\D/g, ''),
                    ].some((x) => x && dupKeys.has(x));
                    const overdue =
                      lead.next_follow_up_at &&
                      new Date(lead.next_follow_up_at) < new Date() &&
                      !['won', 'lost'].includes(lead.status);
                    return (
                      <article
                        key={lead.id}
                        className="rounded-control border border-cherie-lace bg-cherie-ivory p-4 text-sm shadow-[0_8px_24px_rgb(var(--cherie-ink-rgb)/0.04)]"
                      >
                        <div className="flex justify-between gap-2">
                          <strong>{lead.name || 'İsimsiz talep'}</strong>
                          <StateBadge value={lead.priority} />
                        </div>
                        <p className="mt-1 text-xs text-cherie-soft-ink">
                          {adminValueLabel(lead.source_type)} ·{' '}
                          {lead.event_type || 'Genel etkinlik'}
                        </p>
                        <p className="mt-2 line-clamp-3">
                          {lead.message || lead.style_notes || 'Mesaj yok'}
                        </p>
                        {duplicate && (
                          <p className="mt-2 text-xs font-bold text-cherie-warning">
                            Olası mükerrer kayıt
                          </p>
                        )}
                        {overdue && (
                          <p className="mt-2 text-xs font-bold text-cherie-error">
                            Takip gecikmiş
                          </p>
                        )}
                        <p className="mt-2 text-xs">
                          Sonraki takip: <AdminDate value={lead.next_follow_up_at} />
                        </p>
                        <details className="mt-3">
                          <summary className="cursor-pointer font-bold text-cherie-burgundy">
                            İşlemler ve aktivite
                          </summary>
                          <form action={updateLead} className="mt-3 grid gap-2">
                            <input type="hidden" name="id" value={lead.id} />
                            <select
                              aria-label={`${lead.name || 'İsimsiz talep'} talep durumu`}
                              name="status"
                              defaultValue={lead.status}
                              className="cherie-field"
                            >
                              {stages.map((x) => (
                                <option key={x} value={x}>
                                  {labels[x]}
                                </option>
                              ))}
                            </select>
                            <select
                              aria-label={`${lead.name || 'İsimsiz talep'} talep önceliği`}
                              name="priority"
                              defaultValue={lead.priority}
                              className="cherie-field"
                            >
                              {['low', 'normal', 'high', 'urgent'].map((x) => (
                                <option key={x} value={x}>
                                  {adminValueLabel(x)}
                                </option>
                              ))}
                            </select>
                            <select
                              aria-label={`${lead.name || 'İsimsiz talep'} talep sorumlusu`}
                              name="assigned_staff_id"
                              defaultValue={lead.assigned_staff_id ?? ''}
                              className="cherie-field"
                            >
                              <option value="">Atanmadı</option>
                              {(staffQ.data ?? []).map((x) => (
                                <option key={x.id} value={x.id}>
                                  {x.name}
                                </option>
                              ))}
                            </select>
                            <input
                              aria-label={`${lead.name || 'İsimsiz talep'} sonraki takip zamanı`}
                              type="datetime-local"
                              name="next_follow_up_at"
                              defaultValue={lead.next_follow_up_at?.slice(0, 16)}
                              className="cherie-field"
                            />
                            <textarea
                              aria-label={`${lead.name || 'İsimsiz talep'} aktivite notu`}
                              name="note"
                              placeholder="Aktivite notu"
                              className="cherie-field"
                            />
                            <input
                              aria-label={`${lead.name || 'İsimsiz talep'} kayıp nedeni`}
                              name="lost_reason"
                              defaultValue={lead.lost_reason ?? ''}
                              placeholder="Kaybedilen talepler için neden"
                              className="cherie-field"
                            />
                            <button className="cherie-button-primary">Güncelle</button>
                          </form>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {['customer', 'appointment', 'quote'].map((target) => (
                              <form key={target} action={convertLead}>
                                <input type="hidden" name="id" value={lead.id} />
                                <button
                                  name="target"
                                  value={target}
                                  className="rounded-full border border-cherie-lace px-2 py-1 text-xs font-bold"
                                >
                                  → {adminValueLabel(target)}
                                </button>
                              </form>
                            ))}
                          </div>
                          <ol className="mt-3 space-y-2 text-xs">
                            {(notesQ.data ?? [])
                              .filter((x) => x.lead_id === lead.id)
                              .slice(0, 5)
                              .map((x) => (
                                <li key={x.id}>
                                  {x.note} · <AdminDate value={x.created_at} />
                                </li>
                              ))}
                            {(historyQ.data ?? [])
                              .filter((x) => x.lead_id === lead.id)
                              .slice(0, 5)
                              .map((x) => (
                                <li key={x.id}>
                                  {adminValueLabel(x.from_status)} →{' '}
                                  {adminValueLabel(x.to_status)}
                                </li>
                              ))}
                          </ol>
                        </details>
                      </article>
                    );
                  })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
const safe = (v: string) => v.replace(/[,%]/g, '');
