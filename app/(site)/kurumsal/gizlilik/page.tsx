import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getLegalDocumentBySlug } from '@/lib/data/legal';
import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { LegalLayout } from '@/components/content/legal-layout';

const SLUG = 'gizlilik';

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getLegalDocumentBySlug(SLUG);
  if (!doc) return {};
  return buildMetadata({
    title: `${doc.title_tr} | CHERIE DAY`,
    description: doc.title_tr,
    path: `${ROUTES.kurumsal}/${SLUG}`,
  });
}

export default async function Page() {
  const doc = await getLegalDocumentBySlug(SLUG);
  if (!doc) notFound();
  return <LegalLayout document={doc} />;
}
