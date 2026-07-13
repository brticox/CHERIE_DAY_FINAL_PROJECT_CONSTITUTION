import type { Metadata } from 'next';

import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { requireStaff } from '@/lib/auth/guards';

/**
 * Admin shell (docs/45). Every admin surface is noindex and, in later phases,
 * gated by has_staff_role RLS/middleware (docs/23). Phase 1 = layout skeleton only.
 */
export const metadata: Metadata = {
  title: { default: 'Yönetim', template: '%s · CHERIE DAY Yönetim' },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { staff } = await requireStaff('/admin');
  return (
    <div className="flex min-h-dvh bg-cherie-ivory">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <header className="flex min-h-16 items-center justify-between border-b border-cherie-lace bg-cherie-ivory px-5 md:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cherie-brass">Güvenli Yönetim Alanı</p>
            <p className="text-sm font-medium text-cherie-ink">{staff.name}</p>
          </div>
          <span className="rounded-full border border-cherie-lace bg-cherie-paper px-3 py-1 text-xs text-cherie-soft-ink">{staff.role}</span>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
