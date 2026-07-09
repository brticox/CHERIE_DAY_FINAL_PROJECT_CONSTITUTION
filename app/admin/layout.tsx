import type { Metadata } from 'next';

import { AdminSidebar } from '@/components/admin/admin-sidebar';

/**
 * Admin shell (docs/45). Every admin surface is noindex and, in later phases,
 * gated by has_staff_role RLS/middleware (docs/23). Phase 1 = layout skeleton only.
 */
export const metadata: Metadata = {
  title: { default: 'Yönetim', template: '%s · CHERIE DAY Yönetim' },
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh bg-cherie-ivory">
      <AdminSidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
