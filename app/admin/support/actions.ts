'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireStaff } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
export async function replySupport(fd: FormData) {
  const id = String(fd.get('id'));
  const { staff } = await requireStaff(`/admin/support/${id}`);
  const message = String(fd.get('message') ?? '')
    .trim()
    .slice(0, 4000);
  if (!message) redirect(`/admin/support/${id}?error=message`);
  const db = createAdminClient();
  const { error } = await db.from('customer_support_messages').insert({
    thread_id: id,
    sender_type: 'staff',
    sender_id: staff.id,
    message,
    is_internal_note: fd.get('is_internal_note') === 'on',
  });
  if (error) redirect(`/admin/support/${id}?error=save`);
  await db
    .from('customer_support_threads')
    .update({
      status: fd.get('is_internal_note') === 'on' ? 'waiting_team' : 'waiting_customer',
      assigned_staff_id: staff.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  await db.from('audit_log').insert({
    staff_user_id: staff.id,
    action: 'support.replied',
    entity_type: 'support_thread',
    entity_id: id,
    diff: { internal: fd.get('is_internal_note') === 'on' },
  });
  revalidatePath(`/admin/support/${id}`);
  revalidatePath('/admin/support');
}
export async function updateSupport(fd: FormData) {
  const id = String(fd.get('id'));
  const { staff } = await requireStaff(`/admin/support/${id}`);
  const status = String(fd.get('status')) as
    'open' | 'waiting_customer' | 'waiting_team' | 'closed';
  const db = createAdminClient();
  await db
    .from('customer_support_threads')
    .update({
      status,
      assigned_staff_id: String(fd.get('assigned_staff_id') || '') || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  await db.from('audit_log').insert({
    staff_user_id: staff.id,
    action: 'support.updated',
    entity_type: 'support_thread',
    entity_id: id,
    diff: { status },
  });
  revalidatePath(`/admin/support/${id}`);
}
