import 'server-only';

import { requireUser } from '@/lib/auth/guards';
import type { Database, Json } from '@/lib/supabase/database.types';

type OrderRow = Database['public']['Tables']['orders']['Row'];
type OrderItemRow = Database['public']['Tables']['order_items']['Row'];
type OrderEventRow = Database['public']['Tables']['order_status_events']['Row'];
type ShipmentRow = Database['public']['Tables']['shipments']['Row'];
type ProofRow = Database['public']['Tables']['product_proofs']['Row'];

export type CustomerOrderSummary = Pick<
  OrderRow,
  | 'id'
  | 'order_number'
  | 'status'
  | 'payment_status'
  | 'fulfillment_status'
  | 'total_amount'
  | 'currency'
  | 'created_at'
> & { item_count: number };

export type CustomerOrderDetail = {
  order: OrderRow;
  items: OrderItemRow[];
  events: OrderEventRow[];
  shipments: ShipmentRow[];
  proofs: ProofRow[];
};

export async function getCustomerOrders(): Promise<CustomerOrderSummary[]> {
  const { supabase, customer } = await requireUser('/hesap/siparisler');
  if (!customer) return [];

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false });
  if (error) throw new Error('ORDERS_READ_FAILED');
  const orderRows = (orders ?? []) as OrderRow[];
  if (!orderRows.length) return [];

  const { data: items, error: itemError } = await supabase
    .from('order_items')
    .select('order_id,quantity')
    .in(
      'order_id',
      orderRows.map((order) => order.id),
    );
  if (itemError) throw new Error('ORDER_ITEMS_READ_FAILED');

  const counts = new Map<string, number>();
  for (const item of (items ?? []) as Pick<OrderItemRow, 'order_id' | 'quantity'>[]) {
    counts.set(item.order_id, (counts.get(item.order_id) ?? 0) + Number(item.quantity));
  }
  return orderRows.map((order) => ({
    id: order.id,
    order_number: order.order_number,
    status: order.status,
    payment_status: order.payment_status,
    fulfillment_status: order.fulfillment_status,
    total_amount: order.total_amount,
    currency: order.currency,
    created_at: order.created_at,
    item_count: counts.get(order.id) ?? 0,
  }));
}

export async function getCustomerOrderDetail(
  orderNumber: string,
): Promise<CustomerOrderDetail | null> {
  const { supabase, customer } = await requireUser(
    `/hesap/siparisler/${encodeURIComponent(orderNumber)}`,
  );
  if (!customer) return null;

  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('customer_id', customer.id)
    .eq('order_number', orderNumber)
    .maybeSingle();
  if (error) throw new Error('ORDER_READ_FAILED');
  if (!order) return null;
  const orderRow = order as OrderRow;

  const [items, events, shipments, proofs] = await Promise.all([
    // order_items has no created_at column; sort by the stable primary key so
    // line ordering is deterministic across reloads.
    supabase.from('order_items').select('*').eq('order_id', orderRow.id).order('id'),
    supabase
      .from('order_status_events')
      .select('*')
      .eq('order_id', orderRow.id)
      .eq('visible_to_customer', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('shipments')
      .select('*')
      .eq('order_id', orderRow.id)
      .order('created_at'),
    supabase
      .from('product_proofs')
      .select('*')
      .eq('order_id', orderRow.id)
      .order('created_at'),
  ]);
  if (items.error || events.error || shipments.error || proofs.error) {
    throw new Error('ORDER_DETAIL_READ_FAILED');
  }
  return {
    order: orderRow,
    items: (items.data ?? []) as OrderItemRow[],
    events: (events.data ?? []) as OrderEventRow[],
    shipments: (shipments.data ?? []) as ShipmentRow[],
    proofs: (proofs.data ?? []) as ProofRow[],
  };
}

export function jsonText(value: Json, key: string, fallback = '—'): string {
  if (value && !Array.isArray(value) && typeof value === 'object') {
    const candidate = value[key];
    if (typeof candidate === 'string' || typeof candidate === 'number') {
      return String(candidate);
    }
  }
  return fallback;
}
