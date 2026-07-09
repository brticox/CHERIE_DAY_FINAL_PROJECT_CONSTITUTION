import { createClient } from '@supabase/supabase-js';

import type { Database } from './database.types';

/**
 * Lightweight anon client for reading PUBLIC data (the `*_public` views) from
 * Server Components. No cookies/session — public views are readable by anon via
 * RLS (docs/23). Returns null when Supabase env vars are not configured, so the
 * data layer can fall back to local seed content (Phase 3).
 */
let cached: ReturnType<typeof createClient<Database>> | null = null;

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && url.startsWith('http'));
}

export function getPublicClient() {
  if (!isSupabaseConfigured()) return null;
  if (!cached) {
    cached = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }
  return cached;
}
