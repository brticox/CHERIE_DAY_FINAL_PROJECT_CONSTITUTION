'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireStaff } from '@/lib/auth/guards';
import { can } from '@/lib/admin/permissions';
import { createAdminClient } from '@/lib/supabase/admin';
export async function addCustomerNote(formData: FormData) {
  const id = String(formData.get('id'));
  const { staff } = await requireStaff(`/admin/customers/${id}`);
  if (!can(staff.role, 'crm.write')) redirect(`/admin/customers/${id}?error=permission`);
  const note = String(formData.get('note') ?? '')
    .trim()
    .slice(0, 4000);
  if (!note) redirect(`/admin/customers/${id}?error=note`);
  const db = createAdminClient();
  const { error } = await db
    .from('customer_notes')
    .insert({ customer_id: id, author_staff_id: staff.id, note });
  if (error) redirect(`/admin/customers/${id}?error=save`);
  await db.from('audit_log').insert({
    staff_user_id: staff.id,
    action: 'customer.note.added',
    entity_type: 'customer',
    entity_id: id,
  });
  revalidatePath(`/admin/customers/${id}`);
}
export async function updateCustomerStatus(formData: FormData) {
  const id = String(formData.get('id'));
  const { staff } = await requireStaff(`/admin/customers/${id}`);
  if (!can(staff.role, 'crm.write')) redirect(`/admin/customers/${id}?error=permission`);
  const status = String(formData.get('status'));
  if (!['active', 'inactive', 'blocked'].includes(status))
    redirect(`/admin/customers/${id}?error=status`);
  const db = createAdminClient();
  const { data: before } = await db
    .from('customers')
    .select('status')
    .eq('id', id)
    .single();
  const { error } = await db.from('customers').update({ status }).eq('id', id);
  if (error) redirect(`/admin/customers/${id}?error=save`);
  await db.from('audit_log').insert({
    staff_user_id: staff.id,
    action: 'customer.status.updated',
    entity_type: 'customer',
    entity_id: id,
    diff: { before, after: { status } },
  });
  revalidatePath(`/admin/customers/${id}`);
}
