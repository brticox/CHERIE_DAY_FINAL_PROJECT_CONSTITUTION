import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  BellRing,
  Boxes,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Database,
  Lock,
  PackageCheck,
  Sparkles,
  Truck,
  Users,
} from 'lucide-react';

import { can, roleLabel, type AdminCapability } from '@/lib/admin/permissions';
import { requireStaff } from '@/lib/auth/guards';
import { formatTRY } from '@/lib/format';

export const dynamic = 'force-dynamic';

type Metric = {
  label: string;
  value: number | null;
  href: string;
  capability: AdminCapability;
  urgent?: boolean;
  icon: React.ComponentType<{ className?: string }>;
};

// Turkish module name for the "access denied" explanation shown when a deep
// link redirects here because the operator's role lacks the capability.
const CAPABILITY_MODULE_TR: Partial<Record<AdminCapability, string>> = {
  'catalog.read': 'Katalog',
  'catalog.write': 'Katalog düzenleme',
  'orders.read': 'Siparişler',
  'finance.read': 'Ödemeler ve Finans',
  'crm.read': 'Müşteriler ve CRM',
  'services.read': 'Hizmetler',
  'content.read': 'İçerik',
  'legal.read': 'Hukuk',
  'system.read': 'Sistem',
  'audit.read': 'Denetim kaydı',
};

async function countRows(query: PromiseLike<{ count: number | null; error: unknown }>) {
  const result = await query;
  return result.error ? null : result.count;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string; view?: string }>;
}) {
  const { supabase, staff } = await requireStaff('/admin/dashboard');
  const role = staff.role;
  const deniedRaw = (await searchParams).denied;
  const deniedModule =
    deniedRaw && deniedRaw in CAPABILITY_MODULE_TR
      ? CAPABILITY_MODULE_TR[deniedRaw as AdminCapability]
      : deniedRaw
        ? 'İstenen bölüm'
        : null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const week = new Date(today);
  week.setDate(week.getDate() - 6);
  const month = new Date(today.getFullYear(), today.getMonth(), 1);
  const isoToday = today.toISOString();
  const dateLabel = new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
  }).format(today);
  const [
    newOrders,
    paidOrders,
    failedPayments,
    pendingProofs,
    productionDue,
    shipmentsDue,
    newLeads,
    appointments,
    failedNotifications,
    ordersMonth,
    productionQueue,
    unassignedLeads,
  ] = await Promise.all([
    countRows(
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', isoToday),
    ),
    countRows(
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'paid')
        .gte('created_at', isoToday),
    ),
    countRows(
      supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'failed')
        .gte('created_at', isoToday),
    ),
    countRows(
      supabase
        .from('product_proofs')
        .select('*', { count: 'exact', head: true })
        .in('status', ['draft', 'sent', 'revision_requested']),
    ),
    countRows(
      supabase
        .from('production_jobs')
        .select('*', { count: 'exact', head: true })
        .in('status', ['ready', 'in_production', 'blocked']),
    ),
    countRows(
      supabase
        .from('shipments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'preparing'),
    ),
    countRows(
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new')
        .gte('created_at', isoToday),
    ),
    countRows(
      supabase
        .from('consultations')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', isoToday),
    ),
    countRows(
      supabase
        .from('notification_outbox')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'permanently_failed'),
    ),
    supabase
      .from('orders')
      .select('total_amount,payment_status,created_at')
      .eq('payment_status', 'paid')
      .gte('created_at', month.toISOString())
      .order('created_at', { ascending: false })
      .limit(1000),
    countRows(
      supabase
        .from('production_jobs')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'completed'),
    ),
    countRows(
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .is('assigned_staff_id', null)
        .neq('status', 'lost'),
    ),
  ]);
  const revenueRows = (ordersMonth.data ?? []) as {
    total_amount: number;
    payment_status: string;
    created_at: string;
  }[];
  const sumSince = (date: Date) =>
    revenueRows
      .filter((row) => new Date(row.created_at) >= date)
      .reduce((sum, row) => sum + Number(row.total_amount), 0);
  const todayRevenue = sumSince(today),
    weekRevenue = sumSince(week),
    monthRevenue = sumSince(month);
  const partialRevenue = revenueRows.length === 1000;

  const todayMetrics: Metric[] = (
    [
      {
        label: 'Yeni sipariş',
        value: newOrders,
        href: '/admin/commerce/orders',
        capability: 'orders.read',
        icon: PackageCheck,
      },
      {
        label: 'Ödemesi alınan',
        value: paidOrders,
        href: '/admin/commerce/orders?status=paid',
        capability: 'orders.read',
        icon: CircleDollarSign,
      },
      {
        label: 'Başarısız ödeme',
        value: failedPayments,
        href: '/admin/commerce/payments?status=failed',
        capability: 'finance.read',
        urgent: (failedPayments ?? 0) > 0,
        icon: AlertTriangle,
      },
      {
        label: 'Bekleyen prova',
        value: pendingProofs,
        href: '/admin/commerce/proofs',
        capability: 'orders.read',
        urgent: (pendingProofs ?? 0) > 0,
        icon: Sparkles,
      },
      {
        label: 'Üretim kuyruğu',
        value: productionDue,
        href: '/admin/commerce/production',
        capability: 'orders.read',
        icon: Boxes,
      },
      {
        label: 'Kargoya hazır',
        value: shipmentsDue,
        href: '/admin/commerce/shipments',
        capability: 'orders.read',
        icon: Truck,
      },
      {
        label: 'Yeni lead',
        value: newLeads,
        href: '/admin/crm/leads',
        capability: 'crm.read',
        icon: Users,
      },
      {
        label: 'Randevu',
        value: appointments,
        href: '/admin/services/consultations',
        capability: 'services.read',
        icon: CalendarClock,
      },
      {
        label: 'Kalıcı bildirim hatası',
        value: failedNotifications,
        href: '/admin/marketing/notifications?status=permanently_failed',
        capability: 'system.read',
        urgent: (failedNotifications ?? 0) > 0,
        icon: BellRing,
      },
    ] as Metric[]
  ).filter((metric) => can(role, metric.capability));

  const signals = [
    {
      label: 'Açık üretim işi',
      value: productionQueue,
      href: '/admin/commerce/production',
      capability: 'orders.read' as AdminCapability,
    },
    {
      label: 'Atanmamış lead',
      value: unassignedLeads,
      href: '/admin/crm/leads?assignment=unassigned',
      capability: 'crm.read' as AdminCapability,
    },
    {
      label: 'Bekleyen prova',
      value: pendingProofs,
      href: '/admin/commerce/proofs',
      capability: 'orders.read' as AdminCapability,
    },
    {
      label: 'Kargo hazırlığı',
      value: shipmentsDue,
      href: '/admin/commerce/shipments',
      capability: 'orders.read' as AdminCapability,
    },
  ].filter((signal) => can(role, signal.capability));

  const ctas = [
    {
      label: 'Ürün oluştur',
      href: '/admin/commerce/products/new',
      capability: 'catalog.write' as AdminCapability,
      primary: true,
    },
    {
      label: 'Lead kutusunu aç',
      href: '/admin/crm/leads',
      capability: 'crm.read' as AdminCapability,
      primary: false,
    },
    {
      label: 'Siparişleri aç',
      href: '/admin/commerce/orders',
      capability: 'orders.read' as AdminCapability,
      primary: false,
    },
  ].filter((cta) => can(role, cta.capability));

  const showRevenue = can(role, 'finance.read');
  const showHealth = can(role, 'system.read');
  const priorityMetric =
    todayMetrics.find((metric) => metric.urgent && (metric.value ?? 0) > 0) ??
    todayMetrics.find((metric) => (metric.value ?? 0) > 0) ??
    todayMetrics[0];
  const supportingMetrics = todayMetrics.filter((metric) => metric !== priorityMetric);

  const dbReady = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  const paymentReady = Boolean(
    process.env.PAYTR_MERCHANT_ID || process.env.IYZICO_API_KEY,
  );
  const notificationReady = process.env.NOTIFICATION_SEND_ENABLED === 'true';

  return (
    <div className="mx-auto max-w-[1680px] space-y-8 p-4 md:p-7 xl:p-9">
      {deniedModule && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-card-lg border border-cherie-warning/40 bg-cherie-warning/10 p-4"
        >
          <Lock className="mt-0.5 size-5 shrink-0 text-cherie-warning" />
          <div>
            <p className="text-sm font-semibold text-cherie-ink">
              “{deniedModule}” bölümüne erişim yetkiniz yok
            </p>
            <p className="mt-1 text-sm leading-6 text-cherie-soft-ink">
              Rolünüz ({roleLabel(role)}) bu bölümü görüntüleyemiyor. Yetki gerekiyorsa
              bir yöneticiden talep edebilirsiniz. Kontrol paneline yönlendirildiniz.
            </p>
          </div>
        </div>
      )}
      <header className="flex flex-col justify-between gap-5 border-b border-cherie-lace pb-7 lg:flex-row lg:items-end">
        <div>
          <p className="admin-eyebrow">{dateLabel} · Operasyon Özeti</p>
          <h1 className="admin-page-title mt-3">Bugün neye dikkat etmeliyiz?</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-cherie-soft-ink">
            Sipariş, müşteri ve sistem sinyalleri doğrudan operasyon tablolarından okunur.
            Veri yoksa tahmin gösterilmez. Panel, rolünüze göre uyarlanır.
          </p>
        </div>
        {ctas.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {ctas.map((cta) => (
              <Link
                key={cta.href}
                href={cta.href}
                className={
                  cta.primary
                    ? 'inline-flex min-h-11 items-center rounded-control bg-cherie-burgundy px-4 text-sm font-semibold text-white transition-colors hover:bg-cherie-cherry'
                    : 'inline-flex min-h-11 items-center rounded-control border border-cherie-lace px-4 text-sm font-semibold transition-colors hover:border-cherie-brass'
                }
              >
                {cta.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {todayMetrics.length > 0 && (
        <section aria-labelledby="today-heading">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="admin-eyebrow">A · Bugün</p>
              <h2 id="today-heading" className="admin-section-title mt-1">
                Günün odağı
              </h2>
            </div>
            <span className="text-xs text-cherie-soft-ink">Canlı operasyon verisi</span>
          </div>
          <div className="admin-surface overflow-hidden">
            <div className="grid xl:grid-cols-[1.618fr_1fr]">
              {priorityMetric && (
                <Link
                  href={priorityMetric.href}
                  className={`group flex min-h-64 flex-col justify-between p-6 sm:p-8 ${priorityMetric.urgent && (priorityMetric.value ?? 0) > 0 ? 'bg-cherie-velvet text-white' : 'bg-cherie-paper/65 text-cherie-ink'}`}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={`grid size-12 place-items-center rounded-full ${priorityMetric.urgent && (priorityMetric.value ?? 0) > 0 ? 'bg-white/10 text-cherie-brass' : 'bg-white text-cherie-burgundy'}`}
                    >
                      <priorityMetric.icon className="size-5" aria-hidden="true" />
                    </span>
                    <ArrowRight
                      className="size-5 opacity-60 group-hover:translate-x-1 group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-10">
                    <p className="text-xs font-bold uppercase tracking-[.18em] opacity-70">
                      {priorityMetric.urgent && (priorityMetric.value ?? 0) > 0
                        ? 'Öncelikli müdahale'
                        : 'İlk çalışma alanı'}
                    </p>
                    <div className="mt-2 flex items-end gap-4">
                      <p className="text-6xl font-semibold tabular-nums leading-none sm:text-7xl">
                        {priorityMetric.value ?? '—'}
                      </p>
                      <p className="pb-1 text-lg font-semibold">{priorityMetric.label}</p>
                    </div>
                    <p className="mt-4 max-w-xl text-sm leading-6 opacity-75">
                      {priorityMetric.value === null
                        ? 'Veri okunamadı. Hiçbir işlem yapılmadı; ayrıntıyı kontrol edin.'
                        : priorityMetric.urgent && (priorityMetric.value ?? 0) > 0
                          ? 'Operasyon akışını korumak için önce bu kayıtları inceleyin.'
                          : 'Güne bu çalışma alanındaki kayıtları doğrulayarak başlayabilirsiniz.'}
                    </p>
                  </div>
                </Link>
              )}
              <div className="border-t border-cherie-lace p-5 sm:p-6 xl:border-l xl:border-t-0">
                <p className="admin-eyebrow">Sıradaki işler</p>
                <div className="mt-4 divide-y divide-cherie-lace">
                  {supportingMetrics.slice(0, 5).map((metric) => (
                    <Link
                      key={metric.label}
                      href={metric.href}
                      className="group flex min-h-14 items-center gap-3 py-3"
                    >
                      <metric.icon
                        className={`size-4 shrink-0 ${metric.urgent && (metric.value ?? 0) > 0 ? 'text-cherie-error' : 'text-cherie-brass'}`}
                        aria-hidden="true"
                      />
                      <span className="flex-1 text-sm font-medium text-cherie-ink">
                        {metric.label}
                      </span>
                      <span className="text-lg font-semibold tabular-nums text-cherie-ink">
                        {metric.value ?? '—'}
                      </span>
                      <ArrowRight
                        className="size-4 text-cherie-soft-ink opacity-50 group-hover:translate-x-1 group-hover:opacity-100"
                        aria-hidden="true"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            {supportingMetrics.length > 5 && (
              <div className="grid border-t border-cherie-lace sm:grid-cols-3">
                {supportingMetrics.slice(5).map((metric) => (
                  <Link
                    key={metric.label}
                    href={metric.href}
                    className="flex min-h-20 items-center justify-between gap-3 border-t border-cherie-lace px-5 py-4 first:border-t-0 sm:border-l sm:border-t-0 sm:first:border-l-0"
                  >
                    <span className="text-sm text-cherie-soft-ink">{metric.label}</span>
                    <strong className="text-2xl tabular-nums text-cherie-ink">
                      {metric.value ?? '—'}
                    </strong>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {(showRevenue || signals.length > 0) && (
        <div
          className={`grid gap-6 ${showRevenue && signals.length > 0 ? 'xl:grid-cols-[1.618fr_1fr]' : ''}`}
        >
          {showRevenue && (
            <section
              className="rounded-card-lg border border-cherie-lace bg-white/55 p-5 md:p-7"
              aria-labelledby="business-heading"
            >
              <p className="text-xs font-bold uppercase tracking-[.18em] text-cherie-brass">
                B · İş
              </p>
              <h2 id="business-heading" className="font-display text-3xl">
                Gelir akışı
              </h2>
              <div className="mt-7 grid gap-6 sm:grid-cols-3">
                <Revenue label="Bugün" value={todayRevenue} />
                <Revenue label="Son 7 gün" value={weekRevenue} />
                <Revenue label="Bu ay" value={monthRevenue} dominant />
              </div>
              {partialRevenue && (
                <p className="mt-5 rounded-control bg-cherie-warning/10 p-3 text-xs text-cherie-warning">
                  Bu ay 1.000’den fazla ödeme var. Toplam, ilk 1.000 kayıtla sınırlı;
                  kesin muhasebe raporu değildir.
                </p>
              )}
              <div className="mt-7 border-t border-cherie-lace pt-5">
                <p className="text-sm text-cherie-soft-ink">
                  Ödenen sipariş sayısı{' '}
                  <strong className="text-cherie-ink">{revenueRows.length}</strong>. Zaman
                  serisi için yeterli ve güvenilir veri oluştuğunda burada trend
                  gösterilecektir.
                </p>
              </div>
            </section>
          )}
          {signals.length > 0 && (
            <section
              className="rounded-card-lg bg-cherie-velvet p-5 text-white md:p-7"
              aria-labelledby="ops-heading"
            >
              <p className="text-xs font-bold uppercase tracking-[.18em] text-cherie-brass">
                C · Operasyon
              </p>
              <h2 id="ops-heading" className="font-display text-3xl">
                Darboğazlar
              </h2>
              <div className="mt-6 divide-y divide-white/10">
                {signals.map((signal) => (
                  <Signal
                    key={signal.label}
                    label={signal.label}
                    value={signal.value}
                    href={signal.href}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {showHealth && (
        <section
          className="rounded-card-lg border border-cherie-lace bg-cherie-paper/55 p-5 md:p-7"
          aria-labelledby="system-heading"
        >
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-cherie-brass">
                D · Sistem
              </p>
              <h2 id="system-heading" className="font-display text-3xl">
                Hazırlık durumu
              </h2>
            </div>
            <p className="text-xs text-cherie-soft-ink">
              Gizli değerler hiçbir zaman gösterilmez.
            </p>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Health
              icon={Database}
              label="Veritabanı"
              ready={dbReady}
              detail={
                dbReady
                  ? 'Ortam değişkenleri yapılandırılmış'
                  : 'Bağlantı yapılandırılmamış'
              }
            />
            <Health
              icon={BellRing}
              label="Bildirim gönderimi"
              ready={notificationReady}
              detail={
                notificationReady
                  ? 'Gönderim etkin'
                  : 'Gönderim kapalı veya prova modunda'
              }
            />
            <Health
              icon={Banknote}
              label="Ödeme sağlayıcısı"
              ready={paymentReady}
              detail={
                paymentReady
                  ? 'Sağlayıcı yapılandırılmış'
                  : 'Canlı sağlayıcı kanıtlanmadı'
              }
            />
            <Health
              icon={AlertTriangle}
              label="Migration kanıtı"
              ready={false}
              detail="Staging üzerinde henüz doğrulanmadı"
            />
          </div>
        </section>
      )}
    </div>
  );
}

function Revenue({
  label,
  value,
  dominant = false,
}: {
  label: string;
  value: number;
  dominant?: boolean;
}) {
  return (
    <div className={dominant ? 'sm:row-span-2' : ''}>
      <p className="text-xs uppercase tracking-wider text-cherie-soft-ink">{label}</p>
      <p
        className={`mt-2 font-semibold tabular-nums ${dominant ? 'text-4xl text-cherie-burgundy' : 'text-2xl'}`}
      >
        {formatTRY(value)}
      </p>
    </div>
  );
}
function Signal({
  label,
  value,
  href,
}: {
  label: string;
  value: number | null;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-14 items-center justify-between py-3 text-sm hover:text-cherie-brass"
    >
      <span>{label}</span>
      <span className="text-xl font-semibold tabular-nums">{value ?? '—'}</span>
    </Link>
  );
}
function Health({
  icon: Icon,
  label,
  ready,
  detail,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  ready: boolean;
  detail: string;
}) {
  return (
    <div className="flex gap-3 rounded-control border border-cherie-lace bg-cherie-ivory p-4">
      <Icon
        className={`mt-0.5 size-5 shrink-0 ${ready ? 'text-cherie-success' : 'text-cherie-warning'}`}
      />
      <div>
        <p className="flex items-center gap-2 text-sm font-semibold">
          {label}
          {ready && <CheckCircle2 className="size-3.5 text-cherie-success" />}
        </p>
        <p className="mt-1 text-xs leading-5 text-cherie-soft-ink">{detail}</p>
      </div>
    </div>
  );
}
