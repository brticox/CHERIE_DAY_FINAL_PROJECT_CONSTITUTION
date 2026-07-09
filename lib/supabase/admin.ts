import 'server-only';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

import type { Database } from './database.types';

/**
 * Service-role Supabase client — BYPASSES RLS. Server-only.
 * Use exclusively for trusted server work: payment webhooks, admin mutations,
 * idempotent order/reservation state transitions (docs/23, docs/43).
 *
 * The `server-only` import guarantees a build error if this is ever pulled into
 * a client bundle. Phase 1: structure only.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
