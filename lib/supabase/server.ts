import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

import type { Database } from './database.types';

/**
 * Server Supabase client bound to the request cookies (RLS-scoped to the signed-in
 * user). Use in Server Components, Route Handlers, and Server Actions.
 *
 * Phase 1: structure only. The service-role client (for webhooks/admin mutations)
 * lives in lib/supabase/admin.ts and must never be imported into client code.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[],
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set({ name, value, ...options }),
            );
          } catch {
            // `setAll` called from a Server Component — safe to ignore when
            // session refresh is handled by middleware.
          }
        },
      },
    },
  );
}
