import 'server-only';

import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

import { isSupabaseConfigured } from '@/lib/supabase/public';
import { createClient } from '@/lib/supabase/server';

type CustomerSummary = { id: string; name: string | null; email: string | null; phone: string | null };
type StaffSummary = { id: string; name: string; role: string; is_active: boolean };

export async function requireUser(next = '/hesap') {
  if (!isSupabaseConfigured()) redirect('/hesap/giris?reason=unavailable');
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect(`/hesap/giris?reason=session&next=${encodeURIComponent(next)}`);

  const { data: customerData } = await supabase
    .from('customers')
    .select('id, name, email, phone')
    .eq('auth_user_id', data.user.id)
    .maybeSingle();

  return {
    supabase,
    user: data.user as User,
    customer: (customerData as CustomerSummary | null) ?? null,
  };
}

export async function requireStaff(next = '/admin') {
  const session = await requireUser(next);
  const { data: staffData } = await session.supabase
    .from('staff_users')
    .select('id, name, role, is_active')
    .eq('auth_user_id', session.user.id)
    .eq('is_active', true)
    .maybeSingle();

  if (!staffData) redirect('/hesap?error=staff_required');
  return { ...session, staff: staffData as StaffSummary };
}

