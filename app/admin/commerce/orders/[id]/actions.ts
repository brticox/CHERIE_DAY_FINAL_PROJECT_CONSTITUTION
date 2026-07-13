'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';

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
