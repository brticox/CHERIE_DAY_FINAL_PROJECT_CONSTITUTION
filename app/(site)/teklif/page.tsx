import type { Metadata } from 'next';

import { IntakeForm } from '@/components/forms/intake-form';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { ROUTES } from '@/lib/data/routes';
import { buildMetadata } from '@/lib/data/seo';
import type { IntakeSourceContext } from '@/lib/validation/intake';

export const metadata: Metadata = buildMetadata({
  title: 'Teklif Al | CHERIE DAY',
  description:
    'Ürün, organizasyon, dijital ve hatıra ihtiyaçlarınız için teklif talebi oluşturun.',
  path: ROUTES.teklif,
  noindex: true,
});

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const source = sourceFromParams(params);
  const initialMessage = first(params.message);
  return (
    <div className="cherie-container max-w-3xl py-14">
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'Teklif Al', path: ROUTES.teklif },
        ]}
      />
      <PageHeader
        eyebrow="Teklif"
        title="Size özel bir başlangıç hazırlayalım"
        lead="İhtiyacınızı birkaç ayrıntıyla paylaşın; CHERIE DAY ekibi talebinizi inceleyip sizinle iletişime geçsin."
      />
      <div className="mt-10 rounded-card border border-cherie-lace bg-cherie-ivory p-6 shadow-card sm:p-8">
        <IntakeForm type="quote" source={source} initialMessage={initialMessage} />
      </div>
    </div>
  );
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function sourceFromParams(
  params: Record<string, string | string[] | undefined>,
): IntakeSourceContext {
  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;
  const type = first(params.sourceType);
  return {
    sourceEntityType:
      type === 'product' || type === 'service' || type === 'experience' || type === 'page'
        ? type
        : undefined,
    sourceSlug: first(params.sourceSlug),
    sourceLabel: first(params.sourceLabel),
    sourcePath: first(params.sourcePath),
  };
}
