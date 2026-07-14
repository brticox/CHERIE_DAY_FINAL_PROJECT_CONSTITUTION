import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const isProduction = process.env.APP_ENV === 'production';

/** Admin is never indexed (docs/40 §3.15, docs/45). */
export default function robots(): MetadataRoute.Robots {
  if (!isProduction) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/hesap', '/odeme'] }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
