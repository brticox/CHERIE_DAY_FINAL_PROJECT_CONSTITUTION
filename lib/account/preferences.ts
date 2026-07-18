import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/public';
import {
  PREFERENCE_CATEGORIES,
  PREFERENCE_CHANNELS,
  type PreferenceCategory,
  type PreferenceChannel,
} from './preference-defs';

/**
 * Tercihlerim — notification delivery preferences.
 *
 * Notification preferences live in public.notification_preferences (RLS
 * cust_select/insert/update_own). All access is through the RLS-bound SSR
 * client; no service role. KVKK marketing consent is deliberately handled
 * separately (see lib/account/privacy) because the customers table has no
 * customer UPDATE policy — consent flows through a narrow RPC instead.
 */

export type PreferencesState = {
  // Keyed "category:channel" -> opted_in.
  notifications: Record<string, boolean>;
};

export function preferencesConfigured(): boolean {
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

export async function loadPreferences(): Promise<PreferencesState> {
  const empty: PreferencesState = { notifications: {} };
  if (!preferencesConfigured()) return empty;
  const supabase = await createClient();
  const customerId = await resolveCustomerId(supabase);
  if (!customerId) return empty;

  const { data } = await supabase
    .from('notification_preferences')
    .select('channel, category, opted_in');

  const notifications: Record<string, boolean> = {};
  for (const row of (data ?? []) as {
    channel: string;
    category: string;
    opted_in: boolean;
  }[]) {
    notifications[`${row.category}:${row.channel}`] = row.opted_in;
  }
  return { notifications };
}

export type SavePreferencesInput = {
  // Keyed "category:channel" -> opted_in for every cell in the curated matrix.
  notifications: Record<string, boolean>;
};

export async function savePreferences(
  input: SavePreferencesInput,
): Promise<{ ok: boolean; message?: string }> {
  if (!preferencesConfigured()) {
    return { ok: false, message: 'Tercihler şu anda kaydedilemiyor.' };
  }
  const supabase = await createClient();
  const customerId = await resolveCustomerId(supabase);
  if (!customerId) return { ok: false, message: 'Giriş yapmanız gerekir.' };

  // Only persist cells within the curated matrix — never trust arbitrary keys.
  const rows: { customer_id: string; channel: PreferenceChannel; category: PreferenceCategory; opted_in: boolean }[] = [];
  for (const category of PREFERENCE_CATEGORIES) {
    for (const channel of PREFERENCE_CHANNELS) {
      rows.push({
        customer_id: customerId,
        channel: channel.key,
        category: category.key,
        opted_in: Boolean(input.notifications[`${category.key}:${channel.key}`]),
      });
    }
  }

  const { error: prefError } = await supabase
    .from('notification_preferences')
    .upsert(rows, { onConflict: 'customer_id,channel,category' });
  if (prefError) return { ok: false, message: 'Tercihleriniz kaydedilemedi.' };

  return { ok: true };
}
