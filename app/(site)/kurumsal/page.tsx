import type { Metadata } from 'next';
import Link from 'next/link';

import { getLegalDocuments } from '@/lib/data/legal';
import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';

export const metadata: Metadata = buildMetadata({
  title: 'Kurumsal & Yasal | CHERIE DAY',
  description: 'KVKK, gizlilik, mesafeli satış, iade ve tüm yasal metinlerimiz.',
  path: ROUTES.kurumsal,
});

export default async function KurumsalPage() {
  const docs = await getLegalDocuments();
  return (
    <div className="cherie-container max-w-3xl py-14">
      <Breadcrumbs items={[{ name: 'Ana Sayfa', path: ROUTES.home }, { name: 'Kurumsal', path: ROUTES.kurumsal }]} />
      <PageHeader eyebrow="Kurumsal" title="Yasal Metinler" lead="Güveniniz, bizim de değerimiz." />
      <ul className="mt-10 divide-y divide-cherie-lace border-y border-cherie-lace">
        {docs.map((d) => (
          <li key={d.slug}>
            <Link
              href={`${ROUTES.kurumsal}/${d.slug}`}
              className="flex items-center justify-between py-4 text-cherie-ink hover:text-cherie-burgundy"
            >
              <span>{d.title_tr}</span>
              <span aria-hidden className="text-cherie-brass">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
