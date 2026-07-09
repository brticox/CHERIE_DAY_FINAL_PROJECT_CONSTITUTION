'use client';

import { createBrowserClient } from '@supabase/ssr';

import type { Database } from './database.types';

/**
 * Browser Supabase client (anon key). Reads only published `*_public` views and
 * the current user's own rows via RLS (docs/23). Never use the service role here.
 *
 * Phase 1: structure only — no migrations, queries, or auth flows are wired yet.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
