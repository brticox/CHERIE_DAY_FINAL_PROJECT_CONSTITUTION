import { requireCapability } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { notificationReadiness } from '@/lib/notifications/config';
import { saveSettings } from './actions';
import { StateBadge } from '@/components/admin/resource-list';
import { AdminNotice, AdminPageHeader } from '@/components/admin/admin-workspace';
export const dynamic = 'force-dynamic';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const state = await searchParams;
  await requireCapability('system.read', '/admin/settings');
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
    ['Veri bağlantısı', !siteQ.error],
    ['Sistem ayarları', !systemQ.error],
    ['Bildirim teslimatı', readiness.mode !== 'invalid'],
    ['Yasal yayın hazırlığı', (legalQ.data ?? []).every((x) => x.status === 'published')],
    [
      'Ödeme sağlayıcısı',
      Boolean(
        process.env.PAYTR_MERCHANT_ID &&
        process.env.PAYTR_MERCHANT_KEY &&
        process.env.PAYTR_MERCHANT_SALT,
      ),
    ],
  ] as const;
  return (
    <div className="space-y-7 p-4 md:p-8">
      <AdminPageHeader
        eyebrow="Sistem operasyonu"
        title="Ayarlar ve sistem sağlığı"
        description="Gizli anahtarlar gösterilmeden, yapılandırma hazırlığını ve marka ayarlarını güvenli biçimde yönetin."
      />
      {state.error && (
        <AdminNotice tone="danger" title="Ayarlar kaydedilemedi">
          Önceki ayarlar korunuyor. Alanları kontrol edip güvenle yeniden
          deneyebilirsiniz.
        </AdminNotice>
      )}
      <section className="admin-surface grid overflow-hidden sm:grid-cols-2 lg:grid-cols-5">
        {health.map(([label, ok]) => (
          <article
            key={label}
            className="border-t border-cherie-lace p-4 first:border-t-0 sm:border-l sm:first:border-l-0 lg:border-t-0"
          >
            <p className="text-xs">{label}</p>
            <StateBadge value={ok ? 'ready' : 'attention'} />
          </article>
        ))}
      </section>
      <section className="grid gap-4 md:grid-cols-3" aria-label="Sistem sinyalleri">
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
        <Section title="Sosyal ve arama görünümü">
          <Field name="instagram" label="Instagram" value={str(social.instagram)} />
          <Field name="pinterest" label="Pinterest" value={str(social.pinterest)} />
          <Field name="youtube" label="YouTube" value={str(social.youtube)} />
          <Field
            name="seo_title"
            label="Varsayılan arama başlığı"
            value={str(seo.title)}
          />
          <Area
            name="seo_description"
            label="Varsayılan arama açıklaması"
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
          <div className="rounded-control bg-cherie-paper p-3 text-xs leading-5">
            Bildirim teslimatı:{' '}
            {readiness.mode === 'invalid' ? 'Yapılandırma gerekli' : 'Hazır'} · PayTR:{' '}
            {health[4][1] ? 'Hazır' : 'Yapılandırma gerekli'} · Güvenli sunucu erişimi:{' '}
            {process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Hazır' : 'Yapılandırma gerekli'}
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
    <article className="admin-surface p-4 shadow-none">
      <p className="text-xs">{label}</p>
      <strong className="font-display text-3xl">{value}</strong>
    </article>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="admin-surface space-y-4 p-5 shadow-none">
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
