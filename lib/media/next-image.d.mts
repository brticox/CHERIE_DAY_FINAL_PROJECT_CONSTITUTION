export type NextImageRemotePattern = {
  protocol: 'http' | 'https';
  hostname: string;
  port: string;
  pathname: string;
};

export function supabaseImageRemotePatterns(
  rawSupabaseUrl: string | undefined,
): NextImageRemotePattern[];
