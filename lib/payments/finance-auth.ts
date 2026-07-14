import 'server-only';

import { redirect } from 'next/navigation';

import { requireStaff } from '@/lib/auth/guards';

const READ_ROLES = new Set(['superadmin', 'admin', 'finance_viewer', 'commerce_manager']);
const MUTATE_ROLES = new Set(['superadmin', 'admin']);

export async function requireFinanceRead(next = '/admin/finance') {
  const session = await requireStaff(next);
  if (!READ_ROLES.has(session.staff.role)) redirect('/admin?error=finance_required');
  return session;
}

export async function requireFinanceMutation(next = '/admin/finance') {
  const session = await requireFinanceRead(next);
  if (!MUTATE_ROLES.has(session.staff.role))
    redirect(`${next}?error=finance_mutation_required`);
  return session;
}
