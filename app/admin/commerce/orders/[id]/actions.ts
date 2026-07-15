'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';
import { requireStaff } from '@/lib/auth/guards';
import { can } from '@/lib/admin/permissions';

type TransitionArgs = Database['public']['Functions']['transition_order_status']['Args'];
type TransitionRpc = (
  name: 'transition_order_status',
  args: TransitionArgs,
) => Promise<{ error: { message: string } | null }>;

export async function transitionOrderAction(formData: FormData) {
  const orderId = String(formData.get('orderId') ?? '');
  const status = String(
    formData.get('status') ?? '',
  ) as Database['public']['Enums']['order_status'];
  const detail = String(formData.get('detail') ?? '').trim();
  const path = `/admin/commerce/orders/${encodeURIComponent(orderId)}`;
  if (!orderId || !status) redirect(`${path}?transition=invalid`);
  const supabase = await createClient();
  const transition = supabase.rpc.bind(supabase) as unknown as TransitionRpc;
  const { error } = await transition('transition_order_status', {
    p_order_id: orderId,
    p_to_status: status,
    p_detail: detail || undefined,
  });
  if (error) redirect(`${path}?transition=failed`);
  revalidatePath('/admin/commerce/orders');
  revalidatePath(path);
  redirect(`${path}?transition=success`);
}

export async function updateOrderOperations(formData: FormData) {
  const orderId = String(formData.get('orderId'));
  const path = `/admin/commerce/orders/${orderId}`;
  const { staff } = await requireStaff(path);
  if (!can(staff.role, 'orders.transition')) redirect(`${path}?transition=permission`);
  const supabase = await createClient();
  const rpc = supabase.rpc as unknown as (
    name: string,
    args: Record<string, unknown>,
  ) => Promise<{ error: { message: string } | null }>;
  const { error } = await rpc('admin_update_order_operations', {
    p_order_id: orderId,
    p_assigned_staff_id: String(formData.get('assigned_staff_id') || '') || null,
    p_internal_note: String(formData.get('internal_note') ?? '').slice(0, 4000),
    p_customer_note: String(formData.get('customer_note') ?? '').slice(0, 2000),
  });
  if (error) redirect(`${path}?transition=failed`);
  revalidatePath(path);
  redirect(`${path}?transition=success`);
}
