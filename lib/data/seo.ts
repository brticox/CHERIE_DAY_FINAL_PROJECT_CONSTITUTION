import type { Metadata } from 'next';

import type { Article, Faq, Product } from './types';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const BRAND = 'CHERIE DAY';

/** Route-aware Turkish metadata builder (docs/13). */
export function buildMetadata(opts: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}): Metadata {
  const url = `${SITE_URL}${opts.path}`;
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: { title: `${opts.title} · ${BRAND}`, description: opts.description, url, siteName: BRAND, locale: 'tr_TR', type: 'website' },
    robots: opts.noindex ? { index: false, follow: false } : undefined,
  };
}

// ---- JSON-LD structured data (docs/13) -------------------------------------
export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND,
    url: SITE_URL,
    description: 'Türkiye’ye özel lüks düğün, hediye ve kutlama maison’u.',
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function productLd(product: Product, path: string) {
  const availability = {
    in_stock: 'https://schema.org/InStock',
    made_to_order: 'https://schema.org/MadeToOrder',
    preorder: 'https://schema.org/PreOrder',
    unavailable: 'https://schema.org/OutOfStock',
  }[product.stock_mode];
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? undefined,
    url: `${SITE_URL}${path}`,
    brand: { '@type': 'Brand', name: BRAND },
    image: product.media?.map((item) => item.url).filter(Boolean),
    sku: product.sku ?? undefined,
    ...(product.base_price
      ? {
          offers: {
            '@type': 'Offer',
            price: product.base_price,
            priceCurrency: product.currency,
            availability,
            url: `${SITE_URL}${path}`,
          },
        }
      : {}),
  };
}

export function articleLd(article: Article, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt ?? undefined,
    author: { '@type': 'Organization', name: article.author_display },
    datePublished: article.published_at ?? undefined,
    url: `${SITE_URL}${path}`,
  };
}

export function faqPageLd(faqs: Faq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}
