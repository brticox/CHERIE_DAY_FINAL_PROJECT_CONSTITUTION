import type { SupabaseClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/nextjs';

import { getPublicClient, isSupabaseConfigured } from '@/lib/supabase/public';
import type { Database } from '@/lib/supabase/database.types';

export { isSupabaseConfigured };

type PublicViewName = keyof Database['public']['Views'] & string;

export class PublicDataSourceError extends Error {
  constructor(
    public readonly source: string,
    public readonly reason: 'not_configured' | 'query_failed',
  ) {
    super(`Public data source unavailable: ${source} (${reason})`);
    this.name = 'PublicDataSourceError';
  }
}

export function allowLocalSeedFallback() {
  if (process.env.APP_ENV) return process.env.APP_ENV === 'development';
  return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
}

export function localSeedFallback<T>(source: string, fallback: T[]): T[] {
  if (allowLocalSeedFallback()) return fallback;
  return failPublicData(source, 'not_configured');
}

export function failPublicData(
  source: string,
  reason: 'not_configured' | 'query_failed',
  cause?: unknown,
): never {
  const error = new PublicDataSourceError(source, reason);
  Sentry.captureException(error, {
    tags: { subsystem: 'public-data', source, reason },
    extra: {
      upstreamCode:
        cause && typeof cause === 'object' && 'code' in cause
          ? String((cause as { code?: unknown }).code ?? '')
          : undefined,
    },
  });
  throw error;
}

/**
 * Read a public projection. Seed content is only a local-development fixture:
 * configured environments return a truthful empty list and fail visibly on
 * upstream errors instead of impersonating a healthy shop.
 */
export async function readPublic<T>(
  view: PublicViewName,
  fallback: T[],
  opts?: { order?: string; ascending?: boolean; limit?: number },
): Promise<T[]> {
  const supabase = getPublicClient();
  if (!supabase) return localSeedFallback(view, fallback);
  try {
    // The view name is schema-checked above; the untyped client keeps this
    // shared dynamic reader from expanding every generated view row union.
    const base = (supabase as unknown as SupabaseClient).from(view).select('*');
    const ordered = opts?.order
      ? base.order(opts.order, { ascending: opts.ascending ?? true })
      : base;
    const limited = opts?.limit ? ordered.limit(opts.limit) : ordered;
    const { data, error } = await limited;
    if (error) return failPublicData(view, 'query_failed', error);
    if (!data || data.length === 0) return [];
    return data as unknown as T[];
  } catch (error) {
    if (error instanceof PublicDataSourceError) throw error;
    return failPublicData(view, 'query_failed', error);
  }
}

/** Read one public row; local development may resolve the matching seed fixture. */
export async function readOnePublic<T>(
  view: PublicViewName,
  column: string,
  value: string,
  fallbackResolver: () => T | undefined,
): Promise<T | null> {
  const supabase = getPublicClient();
  if (!supabase) {
    const fallback = fallbackResolver();
    return localSeedFallback(view, fallback ? [fallback] : [])[0] ?? null;
  }
  try {
    const { data, error } = await (supabase as unknown as SupabaseClient)
      .from(view)
      .select('*')
      .eq(column, value)
      .limit(1);
    if (error) return failPublicData(view, 'query_failed', error);
    if (!data || data.length === 0) return null;
    return data[0] as unknown as T;
  } catch (error) {
    if (error instanceof PublicDataSourceError) throw error;
    return failPublicData(view, 'query_failed', error);
  }
}
