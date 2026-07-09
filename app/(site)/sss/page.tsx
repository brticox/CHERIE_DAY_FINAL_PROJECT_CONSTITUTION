import type { Metadata } from 'next';

import { getFaqs } from '@/lib/data/editorial';
import { buildMetadata, faqPageLd } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { JsonLd } from '@/components/layout/json-ld';
import { FaqAccordion } from '@/components/content/faq-accordion';

export const metadata: Metadata = buildMetadata({
  title: 'Sıkça Sorulan Sorular | CHERIE DAY',
  description: 'Teslimat, tasarım onayı, hizmet şehirleri ve iade koşulları hakkında sık sorulan sorular.',
  path: ROUTES.sss,
});

export default async function SssPage() {
  const faqs = await getFaqs();
  return (
    <div className="cherie-container max-w-3xl py-14">
      <JsonLd data={faqPageLd(faqs)} />
      <Breadcrumbs items={[{ name: 'Ana Sayfa', path: ROUTES.home }, { name: 'SSS', path: ROUTES.sss }]} />
      <PageHeader eyebrow="Yardım" title="Sıkça Sorulan Sorular" />
      <div className="mt-10">
        <FaqAccordion faqs={faqs} />
      </div>
    </div>
  );
}
