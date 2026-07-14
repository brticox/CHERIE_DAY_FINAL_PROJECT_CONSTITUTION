import type { Metadata } from 'next';

import { AdminShell } from '@/components/admin/admin-shell';
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
  return <AdminShell staff={{ name: staff.name, role: staff.role }}>{children}</AdminShell>;
}
