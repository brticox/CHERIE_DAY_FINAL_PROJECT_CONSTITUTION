import 'server-only';

import { requireUser } from '@/lib/auth/guards';
import {
  actionPriority,
  isActiveOrder,
  orderJourney,
  orderNextAction,
  type NextAction,
  type OrderJourney,
  type OrderStatus,
} from '@/lib/orders/journey';
import { orderStatusLabel } from '@/lib/orders/presentation';
import type { Database, Json } from '@/lib/supabase/database.types';

type OrderRow = Database['public']['Tables']['orders']['Row'];
type EventRow = Database['public']['Tables']['order_status_events']['Row'];
type ReservationRow = Database['public']['Tables']['reservations']['Row'];

export type TodayOccasion = {
  kind: 'reservation';
  reservationNumber: string;
  eventDate: string;
  daysUntil: number | null;
  city: string | null;
  guestCount: number | null;
};

export type TodayRecentUpdate = {
  title: string;
  detail: string | null;
  at: string;
  orderNumber: string;
};

export type TodayOrderSpotlight = {
  orderNumber: string;
  status: OrderStatus;
  statusLabel: string;
  journey: OrderJourney;
  totalAmount: number;
  currency: string;
  createdAt: string;
};

export type TodayCounts = {
  orders: number;
  activeOrders: number;
  reservations: number;
  quotes: number;
  favorites: number;
  digitalProjects: number;
  unreadNotifications: number;
};

export type TodayModel = {
  displayName: string;
  timeGreeting: string;
  occasion: TodayOccasion | null;
  primaryAction: NextAction | null;
  spotlight: TodayOrderSpotlight | null;
  recentUpdate: TodayRecentUpdate | null;
  counts: TodayCounts;
  hasOrders: boolean;
};

function istanbulHour(now = new Date()): number {
  return Number(
    new Intl.DateTimeFormat('tr-TR', {
      hour: 'numeric',
      hour12: false,
      timeZone: 'Europe/Istanbul',
    }).format(now),
  );
}

export function timeGreeting(now = new Date()): string {
  const hour = istanbulHour(now);
  if (hour >= 5 && hour < 11) return 'Günaydın';
  if (hour >= 11 && hour < 18) return 'İyi günler';
  return 'İyi akşamlar';
}

function jsonString(value: Json | null | undefined, key: string): string | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const candidate = (value as Record<string, Json>)[key];
    if (typeof candidate === 'string' && candidate.trim()) return candidate;
  }
  return null;
}

function daysUntil(dateISO: string, now = new Date()): number | null {
  const target = new Date(`${dateISO.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date(`${now.toISOString().slice(0, 10)}T00:00:00Z`);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/**
 * Builds the personalized Bugün model for the signed-in customer. Every read
 * runs through the RLS-backed SSR client keyed on `customer.id`, so a customer
 * only ever sees their own orders, reservations, and counts.
 */
export async function getToday(): Promise<TodayModel | null> {
  const { supabase, user, customer } = await requireUser('/hesap');
  const displayName =
    customer?.name?.trim() ||
    (typeof user.user_metadata?.name === 'string' ? user.user_metadata.name : '') ||
    user.email?.split('@')[0] ||
    'CHERIE DAY Misafiri';

  const emptyCounts: TodayCounts = {
    orders: 0,
    activeOrders: 0,
    reservations: 0,
    quotes: 0,
    favorites: 0,
    digitalProjects: 0,
    unreadNotifications: 0,
  };

  if (!customer) {
    return {
      displayName,
      timeGreeting: timeGreeting(),
      occasion: null,
      primaryAction: null,
      spotlight: null,
      recentUpdate: null,
      counts: emptyCounts,
      hasOrders: false,
    };
  }

  const { data: orderData } = await supabase
    .from('orders')
    .select('id, order_number, status, total_amount, currency, created_at')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false });
  const orders = (orderData ?? []) as Pick<
    OrderRow,
    'id' | 'order_number' | 'status' | 'total_amount' | 'currency' | 'created_at'
  >[];
  const orderIds = orders.map((order) => order.id);

  const [
    eventsRes,
    reservationRes,
    reservationCount,
    quoteCount,
    favoriteCount,
    digitalCount,
    unreadCount,
  ] = await Promise.all([
    orderIds.length
      ? supabase
          .from('order_status_events')
          .select('order_id, title_tr, detail_tr, created_at')
          .in('order_id', orderIds)
          .eq('visible_to_customer', true)
          .order('created_at', { ascending: false })
          .limit(1)
      : Promise.resolve({ data: [] as Pick<EventRow, 'order_id' | 'title_tr' | 'detail_tr' | 'created_at'>[] }),
    supabase
      .from('reservations')
      .select('reservation_number, event_date, event_location, guest_count, status')
      .eq('customer_id', customer.id)
      .not('event_date', 'is', null)
      .gte('event_date', new Date().toISOString().slice(0, 10))
      .order('event_date', { ascending: true })
      .limit(1),
    supabase
      .from('reservations')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', customer.id),
    supabase
      .from('quotes')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', customer.id),
    supabase
      .from('favorites')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', customer.id),
    supabase
      .from('customer_digital_projects')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', customer.id),
    supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', customer.id)
      .eq('is_read', false),
  ]);

  const orderNumberById = new Map(orders.map((order) => [order.id, order.order_number]));

  // Dominant order: the one most in need of the customer's attention, most
  // recent as a tie-break (orders already arrive newest-first).
  const dominant = orders.reduce<(typeof orders)[number] | null>((best, order) => {
    if (!best) return order;
    return actionPriority(order.status) > actionPriority(best.status) ? order : best;
  }, null);

  const spotlight: TodayOrderSpotlight | null = dominant
    ? {
        orderNumber: dominant.order_number,
        status: dominant.status,
        statusLabel: orderStatusLabel(dominant.status),
        journey: orderJourney(dominant.status),
        totalAmount: Number(dominant.total_amount),
        currency: dominant.currency,
        createdAt: dominant.created_at,
      }
    : null;

  const primaryAction = dominant
    ? orderNextAction({ status: dominant.status, order_number: dominant.order_number })
    : null;

  const latestEvent = (eventsRes.data ?? [])[0] as
    | Pick<EventRow, 'order_id' | 'title_tr' | 'detail_tr' | 'created_at'>
    | undefined;
  const recentUpdate: TodayRecentUpdate | null = latestEvent
    ? {
        title: latestEvent.title_tr,
        detail: latestEvent.detail_tr,
        at: latestEvent.created_at,
        orderNumber: orderNumberById.get(latestEvent.order_id) ?? '',
      }
    : null;

  const reservation = (reservationRes.data ?? [])[0] as
    | Pick<ReservationRow, 'reservation_number' | 'event_date' | 'event_location' | 'guest_count' | 'status'>
    | undefined;
  const occasion: TodayOccasion | null =
    reservation && reservation.event_date
      ? {
          kind: 'reservation',
          reservationNumber: reservation.reservation_number,
          eventDate: reservation.event_date,
          daysUntil: daysUntil(reservation.event_date),
          city: jsonString(reservation.event_location, 'city'),
          guestCount: reservation.guest_count,
        }
      : null;

  const counts: TodayCounts = {
    orders: orders.length,
    activeOrders: orders.filter((order) => isActiveOrder(order.status)).length,
    reservations: reservationCount.count ?? 0,
    quotes: quoteCount.count ?? 0,
    favorites: favoriteCount.count ?? 0,
    digitalProjects: digitalCount.count ?? 0,
    unreadNotifications: unreadCount.count ?? 0,
  };

  return {
    displayName,
    timeGreeting: timeGreeting(),
    occasion,
    primaryAction,
    spotlight,
    recentUpdate,
    counts,
    hasOrders: orders.length > 0,
  };
}
