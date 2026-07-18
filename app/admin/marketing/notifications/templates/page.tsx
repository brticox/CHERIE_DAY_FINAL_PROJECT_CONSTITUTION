import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AdminPageHeader, AdminStatus } from '@/components/admin/admin-workspace';
import { requireStaff } from '@/lib/auth/guards';
import { notificationEventCatalog } from '@/lib/notifications/catalog';
import { renderTemplate, templateDefinitions } from '@/lib/notifications/templates';
import { templateFixture } from '@/lib/notifications/templates/components';

const allowedRoles = new Set([
  'superadmin', 'admin', 'commerce_manager', 'order_operations', 'support_agent',
  'service_operations', 'finance_viewer', 'operations',
]);

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { staff } = await requireStaff('/admin/marketing/notifications/templates');
  if (!allowedRoles.has(staff.role)) notFound();
  const { key } = await searchParams;
  const selectedKey = key && templateDefinitions[key] ? key : 'account_welcome';
  const rendered = renderTemplate(selectedKey, templateFixture());
  const mappedEvents = notificationEventCatalog.filter((event) => event.templateKey === selectedKey);

  return (
    <div className="space-y-7 p-5 md:p-8">
      <AdminPageHeader
        eyebrow="İletişim tasarım sistemi"
        title="Şablon kataloğu ve güvenli ön izleme"
        description="Yalnızca sabit test verisi kullanılır; bu ekrandan gerçek e-posta gönderilmez."
        action={<Link href="/admin/marketing/notifications" className="cherie-button-secondary">Teslimatlara dön</Link>}
      />
      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <aside className="admin-surface max-h-[780px] overflow-y-auto p-4">
          <p className="mb-3 text-xs uppercase tracking-wide text-cherie-soft-ink">
            {Object.keys(templateDefinitions).length} şablon
          </p>
          <nav aria-label="E-posta şablonları" className="space-y-1">
            {Object.entries(templateDefinitions).map(([templateKey, definition]) => (
              <Link
                key={templateKey}
                href={`?key=${encodeURIComponent(templateKey)}`}
                className={`block rounded-control px-3 py-2 text-sm ${templateKey === selectedKey ? 'bg-cherie-burgundy text-white' : 'hover:bg-cherie-paper'}`}
              >
                {definition.title}
                <span className="mt-1 block text-xs opacity-70">{templateKey}</span>
              </Link>
            ))}
          </nav>
        </aside>
        <section className="space-y-4">
          <div className="admin-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-cherie-soft-ink">Konu</p>
                <h2 className="mt-1 font-display text-2xl text-cherie-burgundy">{rendered.subject}</h2>
                <p className="mt-2 text-sm text-cherie-soft-ink">{rendered.preheader}</p>
              </div>
              <AdminStatus
                value={mappedEvents.some((event) => event.connection === 'connected') ? 'ready' : 'pending'}
                label={mappedEvents.length ? `${mappedEvents.length} olay eşlemesi` : 'Ön izleme hazır'}
              />
            </div>
          </div>
          <div className="admin-surface overflow-hidden bg-cherie-paper p-3">
            <iframe
              title={`${selectedKey} e-posta ön izlemesi`}
              srcDoc={rendered.html}
              sandbox=""
              className="h-[760px] w-full border-0 bg-white"
            />
          </div>
          <details className="admin-surface p-5">
            <summary className="cursor-pointer font-medium text-cherie-burgundy">Düz metin sürümü</summary>
            <pre className="mt-4 whitespace-pre-wrap text-sm leading-7 text-cherie-ink">{rendered.text}</pre>
          </details>
        </section>
      </div>
    </div>
  );
}
