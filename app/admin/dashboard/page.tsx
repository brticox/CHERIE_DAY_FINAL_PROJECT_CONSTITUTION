import Link from 'next/link';
import { AlertTriangle, ArrowRight, Banknote, BellRing, Boxes, CalendarClock, CheckCircle2, CircleDollarSign, Database, PackageCheck, Sparkles, Truck, Users } from 'lucide-react';

import { formatTRY } from '@/lib/format';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type Metric = { label: string; value: number | null; href: string; urgent?: boolean; icon: React.ComponentType<{ className?: string }> };

async function countRows(query: PromiseLike<{ count: number | null; error: unknown }>) {
  const result = await query;
  return result.error ? null : result.count;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const week = new Date(today); week.setDate(week.getDate() - 6);
  const month = new Date(today.getFullYear(), today.getMonth(), 1);
  const isoToday = today.toISOString();
  const [newOrders, paidOrders, failedPayments, pendingProofs, productionDue, shipmentsDue, newLeads, appointments, failedNotifications, ordersMonth, productionQueue, unassignedLeads] = await Promise.all([
    countRows(supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', isoToday)),
    countRows(supabase.from('orders').select('*', { count: 'exact', head: true }).eq('payment_status', 'paid').gte('created_at', isoToday)),
    countRows(supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'failed').gte('created_at', isoToday)),
    countRows(supabase.from('product_proofs').select('*', { count: 'exact', head: true }).in('status', ['draft','sent','revision_requested'])),
    countRows(supabase.from('production_jobs').select('*', { count: 'exact', head: true }).in('status', ['ready','in_production','blocked'])),
    countRows(supabase.from('shipments').select('*', { count: 'exact', head: true }).eq('status', 'preparing')),
    countRows(supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'new').gte('created_at', isoToday)),
    countRows(supabase.from('consultations').select('*', { count: 'exact', head: true }).gte('created_at', isoToday)),
    countRows(supabase.from('notification_outbox').select('*', { count: 'exact', head: true }).eq('status', 'permanently_failed')),
    supabase.from('orders').select('total_amount,payment_status,created_at').eq('payment_status', 'paid').gte('created_at', month.toISOString()).order('created_at', { ascending: false }).limit(1000),
    countRows(supabase.from('production_jobs').select('*', { count: 'exact', head: true }).neq('status', 'completed')),
    countRows(supabase.from('leads').select('*', { count: 'exact', head: true }).is('assigned_staff_id', null).neq('status', 'lost')),
  ]);
  const revenueRows = (ordersMonth.data ?? []) as { total_amount: number; payment_status: string; created_at: string }[];
  const sumSince = (date: Date) => revenueRows.filter((row) => new Date(row.created_at) >= date).reduce((sum, row) => sum + Number(row.total_amount), 0);
  const todayRevenue = sumSince(today), weekRevenue = sumSince(week), monthRevenue = sumSince(month);
  const partialRevenue = revenueRows.length === 1000;
  const todayMetrics: Metric[] = [
    { label: 'Yeni sipariş', value: newOrders, href: '/admin/commerce/orders', icon: PackageCheck },
    { label: 'Ödemesi alınan', value: paidOrders, href: '/admin/commerce/orders?status=paid', icon: CircleDollarSign },
    { label: 'Başarısız ödeme', value: failedPayments, href: '/admin/commerce/payments?status=failed', urgent: true, icon: AlertTriangle },
    { label: 'Bekleyen prova', value: pendingProofs, href: '/admin/commerce/proofs', urgent: (pendingProofs ?? 0) > 0, icon: Sparkles },
    { label: 'Üretim kuyruğu', value: productionDue, href: '/admin/commerce/production', icon: Boxes },
    { label: 'Kargoya hazır', value: shipmentsDue, href: '/admin/commerce/shipments', icon: Truck },
    { label: 'Yeni lead', value: newLeads, href: '/admin/crm/leads', icon: Users },
    { label: 'Randevu', value: appointments, href: '/admin/services/consultations', icon: CalendarClock },
    { label: 'Kalıcı bildirim hatası', value: failedNotifications, href: '/admin/marketing/notifications?status=permanently_failed', urgent: (failedNotifications ?? 0) > 0, icon: BellRing },
  ];
  const dbReady = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const paymentReady = Boolean(process.env.PAYTR_MERCHANT_ID || process.env.IYZICO_API_KEY);
  const notificationReady = process.env.NOTIFICATION_SEND_ENABLED === 'true';
  return <div className="mx-auto max-w-[1680px] space-y-8 p-4 md:p-7 xl:p-9">
    <header className="flex flex-col justify-between gap-5 border-b border-cherie-lace pb-7 lg:flex-row lg:items-end"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-cherie-brass">14 Temmuz · Operasyon Özeti</p><h1 className="mt-2 font-display text-4xl leading-none md:text-5xl">Bugün neye dikkat etmeliyiz?</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-cherie-soft-ink">Sipariş, müşteri ve sistem sinyalleri doğrudan operasyon tablolarından okunur. Veri yoksa tahmin gösterilmez.</p></div><div className="flex flex-wrap gap-2"><Link href="/admin/commerce/products/new" className="inline-flex min-h-11 items-center rounded-control bg-cherie-burgundy px-4 text-sm font-semibold text-white">Ürün oluştur</Link><Link href="/admin/crm/leads" className="inline-flex min-h-11 items-center rounded-control border border-cherie-lace px-4 text-sm font-semibold">Lead kutusunu aç</Link></div></header>
    <section aria-labelledby="today-heading"><div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-cherie-brass">A · Bugün</p><h2 id="today-heading" className="font-display text-3xl">Eylem radarı</h2></div><span className="text-xs text-cherie-soft-ink">Canlı operasyon verisi</span></div><div className="grid gap-px overflow-hidden rounded-card-lg border border-cherie-lace bg-cherie-lace sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">{todayMetrics.map((metric) => <Link key={metric.label} href={metric.href} className={`group min-h-32 bg-cherie-ivory p-4 transition-colors hover:bg-white ${metric.urgent ? 'border-l-4 border-cherie-cherry' : ''}`}><div className="flex items-start justify-between"><metric.icon className={`size-5 ${metric.urgent ? 'text-cherie-cherry' : 'text-cherie-brass'}`}/><ArrowRight className="size-4 text-cherie-soft-ink opacity-0 transition-opacity group-hover:opacity-100"/></div><p className="mt-5 tabular-nums text-3xl font-semibold">{metric.value ?? '—'}</p><p className="mt-1 text-xs text-cherie-soft-ink">{metric.value === null ? 'Veri okunamadı' : metric.label}</p></Link>)}</div></section>
    <div className="grid gap-6 xl:grid-cols-[1.618fr_1fr]">
      <section className="rounded-card-lg border border-cherie-lace bg-white/55 p-5 md:p-7" aria-labelledby="business-heading"><p className="text-xs font-bold uppercase tracking-[.18em] text-cherie-brass">B · İş</p><h2 id="business-heading" className="font-display text-3xl">Gelir akışı</h2><div className="mt-7 grid gap-6 sm:grid-cols-3"><Revenue label="Bugün" value={todayRevenue}/><Revenue label="Son 7 gün" value={weekRevenue}/><Revenue label="Bu ay" value={monthRevenue} dominant/></div>{partialRevenue && <p className="mt-5 rounded-control bg-cherie-warning/10 p-3 text-xs text-cherie-warning">Bu ay 1.000’den fazla ödeme var. Toplam, ilk 1.000 kayıtla sınırlı; kesin muhasebe raporu değildir.</p>}<div className="mt-7 border-t border-cherie-lace pt-5"><p className="text-sm text-cherie-soft-ink">Ödenen sipariş sayısı <strong className="text-cherie-ink">{revenueRows.length}</strong>. Zaman serisi için yeterli ve güvenilir veri oluştuğunda burada trend gösterilecektir.</p></div></section>
      <section className="rounded-card-lg bg-cherie-velvet p-5 text-white md:p-7" aria-labelledby="ops-heading"><p className="text-xs font-bold uppercase tracking-[.18em] text-cherie-brass">C · Operasyon</p><h2 id="ops-heading" className="font-display text-3xl">Darboğazlar</h2><div className="mt-6 divide-y divide-white/10"><Signal label="Açık üretim işi" value={productionQueue} href="/admin/commerce/production"/><Signal label="Atanmamış lead" value={unassignedLeads} href="/admin/crm/leads?assignment=unassigned"/><Signal label="Bekleyen prova" value={pendingProofs} href="/admin/commerce/proofs"/><Signal label="Kargo hazırlığı" value={shipmentsDue} href="/admin/commerce/shipments"/></div></section>
    </div>
    <section className="rounded-card-lg border border-cherie-lace bg-cherie-paper/55 p-5 md:p-7" aria-labelledby="system-heading"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-cherie-brass">D · Sistem</p><h2 id="system-heading" className="font-display text-3xl">Hazırlık durumu</h2></div><p className="text-xs text-cherie-soft-ink">Gizli değerler hiçbir zaman gösterilmez.</p></div><div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4"><Health icon={Database} label="Veritabanı" ready={dbReady} detail={dbReady ? 'Ortam değişkenleri yapılandırılmış' : 'Bağlantı yapılandırılmamış'}/><Health icon={BellRing} label="Bildirim gönderimi" ready={notificationReady} detail={notificationReady ? 'Gönderim etkin' : 'Gönderim kapalı veya prova modunda'}/><Health icon={Banknote} label="Ödeme sağlayıcısı" ready={paymentReady} detail={paymentReady ? 'Sağlayıcı yapılandırılmış' : 'Canlı sağlayıcı kanıtlanmadı'}/><Health icon={AlertTriangle} label="Migration kanıtı" ready={false} detail="Staging üzerinde henüz doğrulanmadı"/></div></section>
  </div>;
}

function Revenue({ label, value, dominant = false }: { label: string; value: number; dominant?: boolean }) { return <div className={dominant ? 'sm:row-span-2' : ''}><p className="text-xs uppercase tracking-wider text-cherie-soft-ink">{label}</p><p className={`mt-2 tabular-nums font-semibold ${dominant ? 'text-4xl text-cherie-burgundy' : 'text-2xl'}`}>{formatTRY(value)}</p></div>; }
function Signal({ label, value, href }: { label: string; value: number | null; href: string }) { return <Link href={href} className="flex min-h-14 items-center justify-between py-3 text-sm hover:text-cherie-brass"><span>{label}</span><span className="tabular-nums text-xl font-semibold">{value ?? '—'}</span></Link>; }
function Health({ icon: Icon, label, ready, detail }: { icon: React.ComponentType<{ className?: string }>; label: string; ready: boolean; detail: string }) { return <div className="flex gap-3 rounded-control border border-cherie-lace bg-cherie-ivory p-4"><Icon className={`mt-0.5 size-5 shrink-0 ${ready ? 'text-cherie-success' : 'text-cherie-warning'}`}/><div><p className="flex items-center gap-2 text-sm font-semibold">{label}{ready && <CheckCircle2 className="size-3.5 text-cherie-success"/>}</p><p className="mt-1 text-xs leading-5 text-cherie-soft-ink">{detail}</p></div></div>; }
