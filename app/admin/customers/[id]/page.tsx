import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireCapability } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { AdminDate, StateBadge } from '@/components/admin/resource-list';
import { addCustomerNote, updateCustomerStatus } from '../actions';
import { adminEventLabel, adminValueLabel } from '@/lib/admin/presentation';
export const dynamic = 'force-dynamic';
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const state = await searchParams;
  await requireCapability('crm.read', `/admin/customers/${id}`);
  const db = createAdminClient();
  const [
    customerQ,
    addressesQ,
    ordersQ,
    leadsQ,
    consultationsQ,
    quotesQ,
    supportQ,
    consentsQ,
    prefsQ,
    notesQ,
    auditQ,
  ] = await Promise.all([
    db.from('customers').select('*').eq('id', id).single(),
    db
      .from('customer_addresses')
      .select('*')
      .eq('customer_id', id)
      .order('is_default', { ascending: false }),
    db
      .from('orders')
      .select('id,order_number,status,payment_status,total_amount,created_at')
      .eq('customer_id', id)
      .order('created_at', { ascending: false }),
    db
      .from('leads')
      .select('id,source_type,status,priority,created_at')
      .eq('converted_customer_id', id)
      .order('created_at', { ascending: false }),
    db
      .from('consultations')
      .select('id,consultation_number,status,confirmed_slot,created_at')
      .eq('customer_id', id)
      .order('created_at', { ascending: false }),
    db
      .from('quote_requests')
      .select('id,status,event_type,created_at')
      .eq('customer_id', id)
      .order('created_at', { ascending: false }),
    db
      .from('customer_support_threads')
      .select('id,subject,status,updated_at')
      .eq('customer_id', id)
      .order('updated_at', { ascending: false }),
    db
      .from('consent_records')
      .select('id,consent_type,created_at,source_route')
      .eq('customer_id', id)
      .order('created_at', { ascending: false }),
    db
      .from('notification_preferences')
      .select('id,category,channel,opted_in,updated_at')
      .eq('customer_id', id),
    db
      .from('customer_notes')
      .select('id,note,created_at,author_staff_id')
      .eq('customer_id', id)
      .order('created_at', { ascending: false }),
    db
      .from('audit_log')
      .select('id,action,created_at')
      .eq('entity_type', 'customer')
      .eq('entity_id', id)
      .order('created_at', { ascending: false })
      .limit(50),
  ]);
  const customer = customerQ.data;
  if (!customer) notFound();
  const orderIds = (ordersQ.data ?? []).map((x) => x.id);
  const proofs = orderIds.length
    ? ((
        await db
          .from('product_proofs')
          .select('id,order_id,status,version,created_at')
          .in('order_id', orderIds)
          .order('created_at', { ascending: false })
      ).data ?? [])
    : [];
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
      <header>
        <Link href="/admin/customers" className="text-sm text-cherie-burgundy">
          ← Müşterilere dön
        </Link>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="admin-eyebrow">Müşteri 360°</p>
            <h1 className="admin-page-title mt-2">
              {customer.name || 'İsimsiz müşteri'}
            </h1>
            <p className="mt-2 text-sm text-cherie-soft-ink">
              {customer.email || 'E-posta yok'} · {customer.phone || 'Telefon yok'}
            </p>
          </div>
          <StateBadge value={customer.status} />
        </div>
      </header>
      {state.error && (
        <p role="alert" className="rounded-control bg-cherie-error/10 p-3 text-sm">
          {state.error}
        </p>
      )}
      <section className="grid gap-4 md:grid-cols-3">
        <Card title="Hesap">
          <p>Durum: {adminValueLabel(customer.status)}</p>
          <p>KVKK: {customer.kvkk_consent_at ? 'Kayıtlı' : 'Yok'}</p>
          <p>Pazarlama: {customer.marketing_consent_at ? 'Açık' : 'Kapalı'}</p>
          <form action={updateCustomerStatus} className="mt-3 flex gap-2">
            <input type="hidden" name="id" value={id} />
            <select
              aria-label="Müşteri durumu"
              name="status"
              defaultValue={customer.status}
              className="cherie-field"
            >
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
              <option value="blocked">Engelli</option>
            </select>
            <button className="cherie-button-secondary">Kaydet</button>
          </form>
        </Card>
        <Card title="Adresler">
          {(addressesQ.data ?? []).map((x) => (
            <p key={x.id} className="mb-2">
              <strong>
                {x.type}
                {x.is_default ? ' · Varsayılan' : ''}
              </strong>
              <br />
              {x.neighborhood} {x.district} / {x.city}
              <br />
              <span className="text-xs text-cherie-soft-ink">{x.address_line}</span>
            </p>
          ))}
        </Card>
        <Card title="Bildirim tercihleri">
          {(prefsQ.data ?? []).map((x) => (
            <p key={x.id}>
              {adminValueLabel(x.category)} · {adminValueLabel(x.channel)}:{' '}
              {x.opted_in ? 'Açık' : 'Kapalı'}
            </p>
          ))}
        </Card>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <List
          title="Siparişler"
          rows={(ordersQ.data ?? []).map((x) => ({
            id: x.id,
            label: x.order_number,
            detail: `${adminValueLabel(x.status)} · ${adminValueLabel(x.payment_status)} · ${x.total_amount} TL`,
            date: x.created_at,
            href: `/admin/commerce/orders/${x.id}`,
          }))}
        />
        <List
          title="Talepler"
          rows={(leadsQ.data ?? []).map((x) => ({
            id: x.id,
            label: `${adminValueLabel(x.source_type)} · ${adminValueLabel(x.priority)}`,
            detail: adminValueLabel(x.status),
            date: x.created_at,
          }))}
        />
        <List
          title="Randevular"
          rows={(consultationsQ.data ?? []).map((x) => ({
            id: x.id,
            label: x.consultation_number,
            detail: adminValueLabel(x.status),
            date: x.created_at,
          }))}
        />
        <List
          title="Teklifler"
          rows={(quotesQ.data ?? []).map((x) => ({
            id: x.id,
            label: x.event_type ? adminValueLabel(x.event_type) : 'Teklif talebi',
            detail: adminValueLabel(x.status),
            date: x.created_at,
          }))}
        />
        <List
          title="Provalar"
          rows={proofs.map((x) => ({
            id: x.id,
            label: `v${x.version}`,
            detail: adminValueLabel(x.status),
            date: x.created_at,
          }))}
        />
        <List
          title="Destek geçmişi"
          rows={(supportQ.data ?? []).map((x) => ({
            id: x.id,
            label: x.subject || 'Destek talebi',
            detail: adminValueLabel(x.status),
            date: x.updated_at,
            href: `/admin/support/${x.id}`,
          }))}
        />
        <List
          title="Onay kayıtları"
          rows={(consentsQ.data ?? []).map((x) => ({
            id: x.id,
            label: adminValueLabel(x.consent_type),
            detail: x.source_route || 'Kaynak yok',
            date: x.created_at,
          }))}
        />
        <List
          title="Denetim"
          rows={(auditQ.data ?? []).map((x) => ({
            id: x.id,
            label: adminEventLabel(x.action),
            detail: '',
            date: x.created_at,
          }))}
        />
      </section>
      <section className="admin-surface p-5 shadow-none">
        <h2 className="font-display text-2xl">İç notlar</h2>
        <form action={addCustomerNote} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input type="hidden" name="id" value={id} />
          <textarea
            aria-label="Dahili müşteri notu"
            name="note"
            required
            maxLength={4000}
            className="cherie-field"
            placeholder="Yalnızca personelin göreceği not"
          />
          <button className="cherie-button-primary sm:w-48">Not ekle</button>
        </form>
        <ol className="mt-4 space-y-3">
          {(notesQ.data ?? []).map((x) => (
            <li key={x.id} className="border-l-2 border-cherie-lace pl-3 text-sm">
              <p>{x.note}</p>
              <small className="text-cherie-soft-ink">
                Personel · <AdminDate value={x.created_at} />
              </small>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="admin-surface p-5 text-sm shadow-none">
      <h2 className="mb-3 font-display text-2xl">{title}</h2>
      {children}
    </article>
  );
}
type Item = { id: string; label: string; detail: string; date: string; href?: string };
function List({ title, rows }: { title: string; rows: Item[] }) {
  return (
    <section className="admin-surface p-5 shadow-none">
      <h2 className="font-display text-2xl">{title}</h2>
      <div className="mt-3 divide-y divide-cherie-lace">
        {rows.map((x) => (
          <div key={x.id} className="flex justify-between gap-3 py-3 text-sm">
            <span>
              {x.href ? (
                <Link href={x.href} className="font-bold text-cherie-burgundy">
                  {x.label}
                </Link>
              ) : (
                <strong>{x.label}</strong>
              )}
              <small className="block text-cherie-soft-ink">{x.detail}</small>
            </span>
            <AdminDate value={x.date} />
          </div>
        ))}
        {!rows.length && (
          <p className="py-4 text-sm text-cherie-soft-ink">
            Bu müşteriye bağlı henüz bir {title.toLocaleLowerCase('tr-TR')} kaydı yok.
          </p>
        )}
      </div>
    </section>
  );
}
