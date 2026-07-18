import 'server-only';

import { redirect } from 'next/navigation';

import { canManageFinance } from '@/lib/admin/permissions';
import { requireCapability } from '@/lib/auth/guards';

export async function requireFinanceRead(next = '/admin/finance') {
  return requireCapability('finance.read', next);
}

export async function requireFinanceAudit(next = '/admin/finance/audit') {
  return requireCapability('audit.read', next);
}

export async function requireFinanceMutation(next = '/admin/finance') {
  const session = await requireFinanceRead(next);
  if (!canManageFinance(session.staff.role)) {
    redirect(`${next}?error=finance_mutation_required`);
  }
  return session;
}
