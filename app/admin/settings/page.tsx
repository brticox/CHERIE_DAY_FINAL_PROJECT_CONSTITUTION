import { requireStaff } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { notificationReadiness } from '@/lib/notifications/config';
import { saveSettings } from './actions';
import { StateBadge } from '@/components/admin/resource-list';
export const dynamic = 'force-dynamic';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const state = await searchParams;
  await requireStaff('/admin/settings');
  const db = createAdminClient();
  const [siteQ, systemQ, failedNotifications, failedPayments, legalQ, recentAudit] =
    await Promise.all([
      db.from('site_settings').select('*').limit(1).maybeSingle(),
      db.from('system_settings').select('*'),
      db
        .from('notification_outbox')
        .select('id', { count: 'exact', head: true })
        .in('status', ['retry_scheduled', 'permanently_failed']),
      db
        .from('payments')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'failed'),
      db.from('legal_documents').select('id,status'),
      db
        .from('audit_log')
        .select('id,action,created_at')
        .order('created_at', { ascending: false })
        .limit(5),
    ]);
  const site = siteQ.data;
  const settings = Object.fromEntries((systemQ.data ?? []).map((x) => [x.key, x.value]));
  const tax = obj(settings['company.tax']),
    sender = obj(settings['notification.sender']),
    features = obj(settings.features),
    shipping = obj(settings.shipping),
    social = obj(site?.social_links),
    seo = obj(site?.default_seo);
  const readiness = notificationReadiness();
  const health = [
    ['Database', !siteQ.error],
    ['Migrations / system settings', !systemQ.error],
    ['Notification worker', readiness.mode !== 'invalid'],
    ['Legal readiness', (legalQ.data ?? []).every((x) => x.status === 'published')],
    [
      'Payment provider',
      Boolean(
        process.env.PAYTR_MERCHANT_ID &&
        process.env.PAYTR_MERCHANT_KEY &&
        process.env.PAYTR_MERCHANT_SALT,
      ),
    ],
  ] as const;
  return (
    <div className="space-y-6 p-4 md:p-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-cherie-brass">
          Sistem operasyonu
        </p>
        <h1 className="font-display text-4xl">Ayarlar ve sağlık</h1>
        <p className="text-sm text-cherie-soft-ink">
          Secret değerleri gösterilmez; yalnızca configured/not configured durumu görünür.
        </p>
      </header>
      {state.error && <p role="alert">{state.error}</p>}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {health.map(([label, ok]) => (
          <article key={label} className="rounded-card-lg border border-cherie-lace p-4">
            <p className="text-xs">{label}</p>
            <StateBadge value={ok ? 'ready' : 'attention'} />
          </article>
        ))}
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="Başarısız bildirim" value={failedNotifications.count ?? 0} />
        <Metric label="Başarısız ödeme" value={failedPayments.count ?? 0} />
        <Metric label="Son sistem olayları" value={recentAudit.data?.length ?? 0} />
      </section>
      <form action={saveSettings} className="grid gap-6 lg:grid-cols-2">
        <Section title="Şirket ve destek">
          <Field
            name="business_name"
            label="Şirket / marka"
            value={site?.business_name ?? ''}
          />
          <Field
            name="contact_email"
            label="Destek e-posta"
            value={site?.contact_email ?? ''}
          />
          <Field name="contact_phone" label="Telefon" value={site?.contact_phone ?? ''} />
          <Field
            name="whatsapp_number"
            label="WhatsApp"
            value={site?.whatsapp_number ?? ''}
          />
          <Area
            name="service_area_text"
            label="Hizmet alanı"
            value={site?.service_area_text ?? ''}
          />
        </Section>
        <Section title="Satıcı ve vergi">
          <Field name="tax_office" label="Vergi dairesi" value={str(tax.tax_office)} />
          <Field name="tax_number" label="Vergi numarası" value={str(tax.tax_number)} />
          <Field
            name="sender_name"
            label="Bildirim gönderici adı"
            value={str(sender.name)}
          />
        </Section>
        <Section title="Sosyal ve SEO">
          <Field name="instagram" label="Instagram" value={str(social.instagram)} />
          <Field name="pinterest" label="Pinterest" value={str(social.pinterest)} />
          <Field name="youtube" label="YouTube" value={str(social.youtube)} />
          <Field name="seo_title" label="Varsayılan SEO başlığı" value={str(seo.title)} />
          <Area
            name="seo_description"
            label="Varsayılan SEO açıklaması"
            value={str(seo.description)}
          />
        </Section>
        <Section title="Özellikler ve gönderim">
          <label>
            <input
              type="checkbox"
              name="feature_services"
              defaultChecked={features.services !== false}
            />{' '}
            Hizmetleri göster
          </label>
          <label>
            <input
              type="checkbox"
              name="feature_digital"
              defaultChecked={features.digital !== false}
            />{' '}
            Dijital ürünleri göster
          </label>
          <Field
            name="free_threshold"
            type="number"
            label="Ücretsiz kargo eşiği"
            value={String(shipping.free_threshold ?? 0)}
          />
          <Area
            name="shipping_city_note"
            label="Şehir/kargo notu"
            value={str(shipping.city_note)}
          />
          <div className="rounded-control bg-cherie-paper p-3 text-xs">
            Bildirim: {readiness.mode} · PAYTR:{' '}
            {health[4][1] ? 'configured' : 'not configured'} · Service role:{' '}
            {process.env.SUPABASE_SERVICE_ROLE_KEY ? 'configured' : 'not configured'}
          </div>
        </Section>
        <button className="cherie-button-primary lg:col-span-2">Ayarları kaydet</button>
      </form>
    </div>
  );
}
function obj(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};
}
const str = (v: unknown) => (typeof v === 'string' ? v : '');
function Metric({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-card-lg border border-cherie-lace p-4">
      <p className="text-xs">{label}</p>
      <strong className="font-display text-3xl">{value}</strong>
    </article>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-card-lg border border-cherie-lace p-5">
      <h2 className="font-display text-2xl">{title}</h2>
      {children}
    </section>
  );
}
function Field({
  label,
  value,
  ...props
}: { label: string; value: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="grid gap-1 text-sm font-bold">
      {label}
      <input defaultValue={value} {...props} className="cherie-field" />
    </label>
  );
}
function Area({ label, value, name }: { label: string; value: string; name: string }) {
  return (
    <label className="grid gap-1 text-sm font-bold">
      {label}
      <textarea name={name} defaultValue={value} className="cherie-field" />
    </label>
  );
}
