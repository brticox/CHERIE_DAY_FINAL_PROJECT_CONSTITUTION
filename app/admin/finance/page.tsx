import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  RefreshCcwDot,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';

import { FinanceNavigation } from '@/components/admin/finance-navigation';
import {
  AdminNotice,
  AdminPageHeader,
  AdminStatus,
} from '@/components/admin/admin-workspace';
import { can } from '@/lib/admin/permissions';
import { requireFinanceRead } from '@/lib/payments/finance-auth';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

async function countRows(query: PromiseLike<{ count: number | null; error: unknown }>) {
  const result = await query;
  return result.error ? null : result.count;
}

export default async function FinanceOverviewPage() {
  const session = await requireFinanceRead('/admin/finance');
  const canViewAudit = can(session.staff.role, 'audit.read');
  const db = createAdminClient();
  const [failedPayments, openDiscrepancies, pendingRefunds, criticalDiscrepancies] =
    await Promise.all([
      countRows(
        db
          .from('payments')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'failed'),
      ),
      countRows(
        db
          .from('payment_reconciliation_discrepancies')
          .select('id', { count: 'exact', head: true })
          .in('status', ['open', 'investigating']),
      ),
      countRows(
        db
          .from('refunds')
          .select('id', { count: 'exact', head: true })
          .in('status', ['requested', 'approved', 'processing']),
      ),
      countRows(
        db
          .from('payment_reconciliation_discrepancies')
          .select('id', { count: 'exact', head: true })
          .eq('severity', 'critical')
          .in('status', ['open', 'investigating']),
      ),
    ]);

  const metrics = [
    {
      title: 'Başarısız ödemeler',
      value: failedPayments,
      detail: 'Sağlayıcı sonucu başarısız olan kayıtlar',
      href: '/admin/finance/payments?status=failed',
      icon: Banknote,
      status: failedPayments ? 'failed' : 'resolved',
    },
    {
      title: 'Açık uzlaştırma farkı',
      value: openDiscrepancies,
      detail: 'İnsan kararı veya kanıt incelemesi bekleyen farklar',
      href: '/admin/finance/reconciliation',
      icon: RefreshCcwDot,
      status: openDiscrepancies ? 'investigating' : 'resolved',
    },
    {
      title: 'İşlem bekleyen iadeler',
      value: pendingRefunds,
      detail: 'Talep, onay veya sağlayıcı sonucu bekleyen iadeler',
      href: '/admin/finance/refunds',
      icon: RotateCcw,
      status: pendingRefunds ? 'pending' : 'resolved',
    },
  ] as const;
  const unavailable = metrics.some((metric) => metric.value === null);

  return (
    <div className="mx-auto max-w-[1680px] space-y-7 p-4 md:p-7 xl:p-9">
      <AdminPageHeader
        eyebrow="Finans kontrolü"
        title="Ödeme güvenliği"
        description="Sağlayıcı kanıtı, uzlaştırma ve iadeler birbirinden ayrı, değiştirilemez izlerle yönetilir. Bu görünüm yalnızca gerçek kayıtları özetler."
        action={
          canViewAudit ? (
            <Link
              href="/admin/finance/audit"
              className="cherie-button-secondary min-h-12 gap-2"
            >
              <ShieldCheck className="size-4" aria-hidden="true" />
              Denetim izini aç
            </Link>
          ) : undefined
        }
      />
      <FinanceNavigation active="overview" role={session.staff.role} />

      {unavailable && (
        <AdminNotice tone="warning" title="Finans göstergelerinin bir bölümü alınamadı">
          Hiçbir finans kaydı değiştirilmedi. Bağlantı doğrulandıktan sonra görünümü
          güvenle yenileyebilirsiniz.
        </AdminNotice>
      )}

      <section className="grid gap-4 lg:grid-cols-3" aria-label="Finans risk özeti">
        {metrics.map(({ title, value, detail, href, icon: Icon, status }) => (
          <Link
            key={href}
            href={href}
            className="admin-surface group flex min-h-56 flex-col justify-between p-6 shadow-none hover:border-cherie-brass"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="grid size-11 place-items-center rounded-full bg-cherie-paper text-cherie-burgundy">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <AdminStatus value={status} />
            </div>
            <div className="mt-8">
              <p className="admin-number text-4xl font-semibold text-cherie-ink">
                {value ?? '—'}
              </p>
              <h2 className="mt-2 text-lg font-bold text-cherie-ink">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-cherie-soft-ink">{detail}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-cherie-burgundy">
                Kayıtları incele
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </div>
          </Link>
        ))}
      </section>

      <section className="admin-surface grid overflow-hidden shadow-none lg:grid-cols-[1.618fr_1fr]">
        <div className="bg-cherie-velvet p-6 text-white sm:p-8">
          <ShieldCheck className="size-6 text-cherie-brass" aria-hidden="true" />
          <p className="mt-10 text-xs font-bold uppercase tracking-[.16em] text-white/65">
            Değişmez finans ilkesi
          </p>
          <h2 className="mt-2 font-display text-3xl leading-tight text-white sm:text-4xl">
            Sağlayıcı kanıtı olmadan finansal durum değişmez.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70">
            Ödeme bildirimleri, iade kararları ve uzlaştırma sonuçları ayrı denetim
            kayıtları üretir; arayüz doğrudan finansal durum yazmaz.
          </p>
        </div>
        <div className="flex flex-col justify-center p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <AlertTriangle className="size-5 text-cherie-warning" aria-hidden="true" />
            <p className="font-bold text-cherie-ink">Kritik açık fark</p>
          </div>
          <p className="admin-number mt-4 text-4xl font-semibold text-cherie-ink">
            {criticalDiscrepancies ?? '—'}
          </p>
          <p className="mt-2 text-sm leading-6 text-cherie-soft-ink">
            Otomatik düzeltme yapılmaz; kanıt ve karar notu zorunludur.
          </p>
          <Link
            href="/admin/finance/reconciliation"
            className="cherie-button-secondary mt-6 min-h-12"
          >
            Uzlaştırmayı aç
          </Link>
        </div>
      </section>
    </div>
  );
}
