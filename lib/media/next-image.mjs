/**
 * Restrict Next.js image optimization to this deployment's public Supabase
 * media bucket. The exact host is derived at build time so staging and
 * production cannot proxy images from another Supabase project.
 *
 * @param {string | undefined} rawSupabaseUrl
 * @returns {Array<{protocol: 'http' | 'https', hostname: string, port: string, pathname: string}>}
 */
export function supabaseImageRemotePatterns(rawSupabaseUrl) {
  if (!rawSupabaseUrl) return [];

  try {
    const url = new URL(rawSupabaseUrl);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return [];

    return [
      {
        protocol: /** @type {'http' | 'https'} */ (url.protocol.slice(0, -1)),
        hostname: url.hostname,
        port: url.port,
        pathname: '/storage/v1/object/public/public-media/**',
      },
    ];
  } catch {
    return [];
  }
}
