import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { getPublicClient, isSupabaseConfigured } from '@/lib/supabase/public';
import { FAVORITE_ITEM_TYPE, MAX_FAVORITES, isLikelyUuid } from './constants';

/**
 * Server-side favorites (Seçtiklerim) operations for authenticated customers.
 *
 * Ownership is enforced by RLS, not the service role: every write goes through
 * the cookie-bound SSR client, whose `favorites` policies (`cust_insert_own` /
 * `cust_delete_own`, migration 0012/0015) restrict rows to
 * `customer_id = current_customer_id()`. We set `customer_id` explicitly so the
 * RLS `with check` matches. No service-role key is ever used here, so there is
 * no path to cross-customer reads or writes.
 *
 * Products are validated against `products_public` (published + anon-readable)
 * before a favorite is written, so junk or unpublished ids can never be stored.
 */

export type FavoritesState = { authenticated: boolean; ids: string[] };

export function favoritesConfigured(): boolean {
  return isSupabaseConfigured();
}

type SsrClient = Awaited<ReturnType<typeof createClient>>;

async function resolveCustomerId(supabase: SsrClient): Promise<string | null> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data } = await supabase
    .from('customers')
    .select('id, status')
    .eq('auth_user_id', auth.user.id)
    .maybeSingle();
  if (!data || data.status !== 'active') return null;
  return String(data.id);
}

/** Keep only ids that are real, currently-published products. */
async function filterPublishedProductIds(ids: string[]): Promise<string[]> {
  const candidates = Array.from(new Set(ids.filter(isLikelyUuid))).slice(0, MAX_FAVORITES);
  if (candidates.length === 0) return [];
  const supabase = getPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('products_public')
    .select('id')
    .in('id', candidates);
  if (error || !data) return [];
  const published = new Set(data.map((row) => String(row.id)));
  return candidates.filter((id) => published.has(id));
}

/** Current customer's favorited product ids (empty + authenticated:false for guests). */
export async function getFavoritesState(): Promise<FavoritesState> {
  if (!favoritesConfigured()) return { authenticated: false, ids: [] };
  const supabase = await createClient();
  const customerId = await resolveCustomerId(supabase);
  if (!customerId) return { authenticated: false, ids: [] };
  const { data, error } = await supabase
    .from('favorites')
    .select('item_id, created_at')
    .eq('item_type', FAVORITE_ITEM_TYPE)
    .order('created_at', { ascending: false });
  if (error || !data) return { authenticated: true, ids: [] };
  return { authenticated: true, ids: data.map((row) => String(row.item_id)) };
}

export type FavoriteWriteResult =
  | { ok: true; ids: string[] }
  | { ok: false; status: number; code: string; message: string };

const UNAVAILABLE: FavoriteWriteResult = {
  ok: false,
  status: 503,
  code: 'service_unavailable',
  message: 'Seçtiklerim şu anda kullanılamıyor.',
};
const UNAUTHORIZED: FavoriteWriteResult = {
  ok: false,
  status: 401,
  code: 'unauthorized',
  message: 'Bu işlem için giriş yapmanız gerekir.',
};

export async function addFavorite(productId: string): Promise<FavoriteWriteResult> {
  if (!favoritesConfigured()) return UNAVAILABLE;
  if (!isLikelyUuid(productId)) {
    return { ok: false, status: 400, code: 'invalid_id', message: 'Geçersiz ürün.' };
  }
  const supabase = await createClient();
  const customerId = await resolveCustomerId(supabase);
  if (!customerId) return UNAUTHORIZED;

  const [published] = await filterPublishedProductIds([productId]);
  if (!published) {
    return { ok: false, status: 409, code: 'product_unavailable', message: 'Bu ürün artık sunulmuyor.' };
  }

  // Idempotent: the (customer_id, item_type, item_id) unique constraint makes a
  // repeat save a no-op rather than an error.
  const { error } = await supabase.from('favorites').upsert(
    { customer_id: customerId, item_type: FAVORITE_ITEM_TYPE, item_id: productId },
    { onConflict: 'customer_id,item_type,item_id', ignoreDuplicates: true },
  );
  if (error) {
    return { ok: false, status: 502, code: 'write_failed', message: 'Kaydedilemedi.' };
  }
  const state = await getFavoritesState();
  return { ok: true, ids: state.ids };
}

export async function removeFavorite(productId: string): Promise<FavoriteWriteResult> {
  if (!favoritesConfigured()) return UNAVAILABLE;
  if (!isLikelyUuid(productId)) {
    return { ok: false, status: 400, code: 'invalid_id', message: 'Geçersiz ürün.' };
  }
  const supabase = await createClient();
  const customerId = await resolveCustomerId(supabase);
  if (!customerId) return UNAUTHORIZED;

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('item_type', FAVORITE_ITEM_TYPE)
    .eq('item_id', productId);
  if (error) {
    return { ok: false, status: 502, code: 'write_failed', message: 'Çıkarılamadı.' };
  }
  const state = await getFavoritesState();
  return { ok: true, ids: state.ids };
}

/**
 * Merge guest (localStorage) favorites into the signed-in customer's list.
 * Idempotent by construction: only published ids are considered, and the insert
 * relies on the unique constraint (ignoreDuplicates) so re-running the merge —
 * or merging an id the customer already saved — changes nothing. Returns the
 * authoritative server list so the client can replace its state and only then
 * clear localStorage.
 */
export async function mergeGuestFavorites(ids: string[]): Promise<FavoriteWriteResult> {
  if (!favoritesConfigured()) return UNAVAILABLE;
  const supabase = await createClient();
  const customerId = await resolveCustomerId(supabase);
  if (!customerId) return UNAUTHORIZED;

  const published = await filterPublishedProductIds(ids);
  if (published.length > 0) {
    const rows = published.map((id) => ({
      customer_id: customerId,
      item_type: FAVORITE_ITEM_TYPE,
      item_id: id,
    }));
    const { error } = await supabase
      .from('favorites')
      .upsert(rows, { onConflict: 'customer_id,item_type,item_id', ignoreDuplicates: true });
    if (error) {
      return { ok: false, status: 502, code: 'merge_failed', message: 'Seçtikleriniz aktarılamadı.' };
    }
  }
  const state = await getFavoritesState();
  return { ok: true, ids: state.ids };
}
