import { requireCapability } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { AdminDate, StateBadge } from '@/components/admin/resource-list';
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
    <div className="space-y-6 p-4 md:p-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-cherie-brass">
          CRM pipeline
        </p>
        <h1 className="font-display text-4xl">Lead inbox</h1>
        <p className="mt-2 text-sm text-cherie-soft-ink">
          Phase 1 kaynaklarından gelen tüm talepler; takip, atama ve dönüşüm tek yerde.
        </p>
      </header>
      {filters.error && (
        <p role="alert" className="rounded-control bg-cherie-error/10 p-3 text-sm">
          {decodeURIComponent(filters.error)}
        </p>
      )}
      <form className="grid gap-3 rounded-card-lg border border-cherie-lace p-4 md:grid-cols-4">
        <input
          aria-label="Lead ara"
          name="q"
          defaultValue={filters.q}
          placeholder="Ad, iletişim, mesaj"
          className="cherie-field"
        />
        <select
          aria-label="Lead kaynağı"
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
            <option key={x}>{x}</option>
          ))}
        </select>
        <select
          aria-label="Lead önceliği"
          name="priority"
          defaultValue={filters.priority ?? ''}
          className="cherie-field"
        >
          <option value="">Tüm öncelikler</option>
          {['low', 'normal', 'high', 'urgent'].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <button className="cherie-button-primary">Filtrele</button>
      </form>
      {error ? (
        <p>Lead kayıtları okunamadı.</p>
      ) : (
        <div className="grid items-start gap-4 xl:grid-cols-4">
          {stages.map((stage) => (
            <section
              key={stage}
              className="rounded-card-lg border border-cherie-lace bg-white/50 p-3"
            >
              <h2 className="flex justify-between font-display text-xl">
                <span>{labels[stage]}</span>
                <span>{rows.filter((x) => x.status === stage).length}</span>
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
                        className="rounded-control border border-cherie-lace bg-cherie-ivory p-3 text-sm"
                      >
                        <div className="flex justify-between gap-2">
                          <strong>{lead.name || 'İsimsiz lead'}</strong>
                          <StateBadge value={lead.priority} />
                        </div>
                        <p className="mt-1 text-xs text-cherie-soft-ink">
                          {lead.source_type} · {lead.event_type || 'Genel'}
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
                              aria-label={`${lead.name || 'İsimsiz lead'} lead durumu`}
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
                              aria-label={`${lead.name || 'İsimsiz lead'} lead önceliği`}
                              name="priority"
                              defaultValue={lead.priority}
                              className="cherie-field"
                            >
                              {['low', 'normal', 'high', 'urgent'].map((x) => (
                                <option key={x}>{x}</option>
                              ))}
                            </select>
                            <select
                              aria-label={`${lead.name || 'İsimsiz lead'} lead sorumlusu`}
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
                              aria-label={`${lead.name || 'İsimsiz lead'} sonraki takip zamanı`}
                              type="datetime-local"
                              name="next_follow_up_at"
                              defaultValue={lead.next_follow_up_at?.slice(0, 16)}
                              className="cherie-field"
                            />
                            <textarea
                              aria-label={`${lead.name || 'İsimsiz lead'} aktivite notu`}
                              name="note"
                              placeholder="Aktivite notu"
                              className="cherie-field"
                            />
                            <input
                              aria-label={`${lead.name || 'İsimsiz lead'} kayıp nedeni`}
                              name="lost_reason"
                              defaultValue={lead.lost_reason ?? ''}
                              placeholder="Kayıp nedeni (lost için zorunlu)"
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
                                  → {target}
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
                                  {x.from_status} → {x.to_status}
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
