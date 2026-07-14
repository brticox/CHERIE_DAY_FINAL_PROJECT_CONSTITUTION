'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireStaff } from '@/lib/auth/guards';
import { can } from '@/lib/admin/permissions';
import { createClient } from '@/lib/supabase/server';
export async function retryNotification(formData: FormData) {
  const { staff } = await requireStaff('/admin/marketing/notifications');
  if (!can(staff.role, 'orders.transition'))
    redirect('/admin/marketing/notifications?error=permission');
  if (formData.get('confirm') !== 'retry')
    redirect('/admin/marketing/notifications?error=confirm');
  const db = await createClient();
  const rpc = db.rpc as unknown as (
    name: string,
    args: Record<string, unknown>,
  ) => Promise<{ error: { message: string } | null }>;
  const { error } = await rpc('admin_retry_notification', {
    p_notification_id: String(formData.get('id')),
  });
  if (error)
    redirect(`/admin/marketing/notifications?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/admin/marketing/notifications');
}
