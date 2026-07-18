'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireStaff } from '@/lib/auth/guards';
import { can } from '@/lib/admin/permissions';
import { createClient } from '@/lib/supabase/server';
export async function retryNotification(formData: FormData) {
  await mutateNotification(formData, 'retry', 'admin_retry_notification');
}

export async function cancelNotification(formData: FormData) {
  await mutateNotification(formData, 'cancel', 'admin_cancel_notification');
}

export async function markNotificationForReview(formData: FormData) {
  await mutateNotification(formData, 'review', 'admin_mark_notification_for_review');
}

async function mutateNotification(
  formData: FormData,
  confirmation: 'retry' | 'cancel' | 'review',
  functionName:
    | 'admin_retry_notification'
    | 'admin_cancel_notification'
    | 'admin_mark_notification_for_review',
) {
  const { staff } = await requireStaff('/admin/marketing/notifications');
  if (!can(staff.role, 'notifications.manage'))
    redirect('/admin/marketing/notifications?error=permission');
  if (formData.get('confirm') !== confirmation)
    redirect('/admin/marketing/notifications?error=confirm');
  const db = await createClient();
  const rpc = db.rpc.bind(db) as unknown as (
    name: string,
    args: Record<string, unknown>,
  ) => Promise<{ error: { message: string } | null }>;
  const { error } = await rpc(functionName, {
    p_notification_id: String(formData.get('id')),
  });
  if (error)
    redirect(`/admin/marketing/notifications?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/admin/marketing/notifications');
}
