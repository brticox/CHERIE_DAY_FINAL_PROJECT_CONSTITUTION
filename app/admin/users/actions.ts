'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireStaff } from '@/lib/auth/guards';
import { can } from '@/lib/admin/permissions';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';
export async function updateStaff(fd: FormData) {
  const { staff } = await requireStaff('/admin/users');
  if (!can(staff.role, 'staff.manage')) redirect('/admin/users?error=permission');
  const db = await createClient();
  const rpc = db.rpc.bind(db) as unknown as (
    name: string,
    args: Record<string, unknown>,
  ) => Promise<{ error: { message: string } | null }>;
  const { error } = await rpc('admin_update_staff', {
    p_staff_id: String(fd.get('id')),
    p_role: String(fd.get('role')) as Database['public']['Enums']['staff_role'],
    p_is_active: fd.get('is_active') === 'on',
  });
  if (error) redirect(`/admin/users?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/admin/users');
  revalidatePath('/admin/roles');
}
