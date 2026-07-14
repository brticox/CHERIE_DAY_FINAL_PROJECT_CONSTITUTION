'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireStaff } from '@/lib/auth/guards';
import { can } from '@/lib/admin/permissions';
import { createAdminClient } from '@/lib/supabase/admin';
const transitions: Record<string, string[]> = {
  preparing: ['shipped'],
  shipped: ['in_transit'],
  in_transit: ['delivered', 'returned'],
  delivered: [],
  returned: [],
};
export async function transitionShipment(formData: FormData) {
  const { staff } = await requireStaff('/admin/commerce/shipments');
  if (!can(staff.role, 'orders.transition'))
    redirect('/admin/commerce/shipments?error=permission');
  const id = String(formData.get('id'));
  const next = String(formData.get('status')) as
    'preparing' | 'shipped' | 'in_transit' | 'delivered' | 'returned';
  const db = createAdminClient();
  const { data: row } = await db
    .from('shipments')
    .select('status,order_id')
    .eq('id', id)
    .single();
  if (!row || !transitions[row.status]?.includes(next))
    redirect('/admin/commerce/shipments?error=transition');
  const now = new Date().toISOString();
  const patch: { status: typeof next; shipped_at?: string; delivered_at?: string } = {
    status: next,
  };
  if (next === 'shipped') patch.shipped_at = now;
  if (next === 'delivered') patch.delivered_at = now;
  const { error } = await db.from('shipments').update(patch).eq('id', id);
  if (error) redirect('/admin/commerce/shipments?error=save');
  await db
    .from('tracking_events')
    .insert({
      shipment_id: id,
      status: next,
      message_tr: `Yönetim durumu: ${next}`,
      occurred_at: now,
    });
  await db
    .from('audit_log')
    .insert({
      staff_user_id: staff.id,
      action: 'shipment.transitioned',
      entity_type: 'shipment',
      entity_id: id,
      diff: { from: row.status, to: next, order_id: row.order_id },
    });
  revalidatePath('/admin/commerce/shipments');
}
export async function createShipment(formData: FormData) {
  const { staff } = await requireStaff('/admin/commerce/shipments');
  if (!can(staff.role, 'orders.transition'))
    redirect('/admin/commerce/shipments?error=permission');
  const db = await import('@/lib/supabase/server').then((x) => x.createClient());
  const rpc = db.rpc as unknown as (
    name: string,
    args: Record<string, unknown>,
  ) => Promise<{ error: { message: string } | null }>;
  const { error } = await rpc('admin_create_shipment', {
    p_order_id: String(formData.get('order_id')),
    p_carrier: String(formData.get('carrier') ?? ''),
    p_tracking: String(formData.get('tracking') ?? ''),
    p_package_count: Number(formData.get('package_count') || 1),
    p_internal_note: String(formData.get('internal_note') ?? ''),
  });
  if (error)
    redirect(`/admin/commerce/shipments?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/admin/commerce/shipments');
}
export async function recordShipmentException(formData: FormData) {
  const { staff } = await requireStaff('/admin/commerce/shipments');
  if (!can(staff.role, 'orders.transition'))
    redirect('/admin/commerce/shipments?error=permission');
  const id = String(formData.get('id'));
  const code = String(formData.get('exception_code') ?? 'delivery_failed').slice(0, 80);
  const note = String(formData.get('note') ?? '').slice(0, 500);
  const db = createAdminClient();
  const now = new Date().toISOString();
  const { error } = await db
    .from('shipments')
    .update({
      exception_code: code,
      failed_delivery_at: now,
      internal_note: note || null,
    })
    .eq('id', id);
  if (error) redirect('/admin/commerce/shipments?error=save');
  await db
    .from('tracking_events')
    .insert({
      shipment_id: id,
      status: null,
      message_tr: `Teslimat istisnası: ${code}${note ? ` · ${note}` : ''}`,
      occurred_at: now,
    });
  await db
    .from('audit_log')
    .insert({
      staff_user_id: staff.id,
      action: 'shipment.exception.recorded',
      entity_type: 'shipment',
      entity_id: id,
      diff: { code, note },
    });
  revalidatePath('/admin/commerce/shipments');
}
