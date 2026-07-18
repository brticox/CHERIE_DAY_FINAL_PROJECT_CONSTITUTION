import { isIP } from 'node:net';

export function trustedClientIp(
  headers: Headers,
  env: Readonly<Record<string, string | undefined>> = process.env,
) {
  const vercelIp = first(headers.get('x-vercel-forwarded-for'));
  if (vercelIp && isIP(vercelIp)) return vercelIp;

  if (env.TRUST_PROXY_HEADERS === 'true') {
    const proxyIp = first(headers.get('x-forwarded-for')) ?? headers.get('x-real-ip');
    if (proxyIp && isIP(proxyIp)) return proxyIp;
  }
  if (env.NODE_ENV !== 'production') return '127.0.0.1';
  throw new Error('TRUSTED_CLIENT_IP_UNAVAILABLE');
}

function first(value: string | null) {
  return value?.split(',')[0]?.trim() || null;
}
