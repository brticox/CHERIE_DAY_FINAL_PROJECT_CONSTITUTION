import { getPublicClient, isSupabaseConfigured } from '@/lib/supabase/public';

export { isSupabaseConfigured };

/**
 * Read a public view with graceful fallback. When Supabase is not configured
 * (or any error/empty result occurs) the local seed `fallback` is returned, so
 * every page renders credible Turkish content in Phase 3. Never throws.
 */
export async function readPublic<T>(
  view: string,
  fallback: T[],
  opts?: { order?: string; ascending?: boolean; limit?: number },
): Promise<T[]> {
  const supabase = getPublicClient();
  if (!supabase) return fallback;
  try {
    const base = supabase.from(view).select('*');
    const ordered = opts?.order
      ? base.order(opts.order, { ascending: opts.ascending ?? true })
      : base;
    const limited = opts?.limit ? ordered.limit(opts.limit) : ordered;
    const { data, error } = await limited;
    if (error || !data || data.length === 0) return fallback;
    return data as unknown as T[];
  } catch {
    return fallback;
  }
}

/** Read a single row by a column match, with seed fallback resolution. */
export async function readOnePublic<T>(
  view: string,
  column: string,
  value: string,
  fallbackResolver: () => T | undefined,
): Promise<T | null> {
  const supabase = getPublicClient();
  if (!supabase) return fallbackResolver() ?? null;
  try {
    const { data, error } = await supabase.from(view).select('*').eq(column, value).limit(1);
    if (error || !data || data.length === 0) return fallbackResolver() ?? null;
    return data[0] as unknown as T;
  } catch {
    return fallbackResolver() ?? null;
  }
}
