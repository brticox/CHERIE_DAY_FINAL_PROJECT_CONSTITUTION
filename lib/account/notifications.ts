import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/public';

/**
 * Customer notification feed (Bildirimlerim). Read-only surface over the
 * existing public.notifications table. All access goes through the cookie-bound
 * SSR client, so RLS (cust_select_own / cust_update_own, migration 0012) is the
 * ownership authority — a customer only ever sees or marks their own rows.
 */

export const NOTIFICATIONS_PAGE_SIZE = 20;

export type CustomerNotification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

export type NotificationFeed = {
  items: CustomerNotification[];
  unreadCount: number;
  page: number;
  hasMore: boolean;
};

export function notificationsConfigured(): boolean {
  return isSupabaseConfigured();
}

export async function getNotificationFeed(page = 1): Promise<NotificationFeed> {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  if (!notificationsConfigured()) {
    return { items: [], unreadCount: 0, page: safePage, hasMore: false };
  }
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { items: [], unreadCount: 0, page: safePage, hasMore: false };

  const from = (safePage - 1) * NOTIFICATIONS_PAGE_SIZE;
  const to = from + NOTIFICATIONS_PAGE_SIZE; // fetch one extra to detect hasMore
  const [{ data, error }, { count }] = await Promise.all([
    supabase
      .from('notifications')
      .select('id, type, title_tr, body_tr, link, is_read, created_at')
      .order('created_at', { ascending: false })
      .range(from, to),
    supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('is_read', false),
  ]);
  if (error || !data) {
    return { items: [], unreadCount: 0, page: safePage, hasMore: false };
  }
  const rows = data as unknown as {
    id: string;
    type: string;
    title_tr: string;
    body_tr: string | null;
    link: string | null;
    is_read: boolean;
    created_at: string;
  }[];
  const hasMore = rows.length > NOTIFICATIONS_PAGE_SIZE;
  const items = rows.slice(0, NOTIFICATIONS_PAGE_SIZE).map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title_tr,
    body: row.body_tr,
    link: row.link,
    isRead: row.is_read,
    createdAt: row.created_at,
  }));
  return { items, unreadCount: count ?? 0, page: safePage, hasMore };
}

export async function markNotificationRead(id: string): Promise<boolean> {
  if (!notificationsConfigured()) return false;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return false;
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);
  return !error;
}

export async function markAllNotificationsRead(): Promise<boolean> {
  if (!notificationsConfigured()) return false;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return false;
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('is_read', false);
  return !error;
}
