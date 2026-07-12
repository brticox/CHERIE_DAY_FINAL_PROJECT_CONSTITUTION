import type { Metadata } from 'next';

import { IntakeForm } from '@/components/forms/intake-form';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { ROUTES } from '@/lib/data/routes';
import { buildMetadata } from '@/lib/data/seo';
import type { IntakeSourceContext } from '@/lib/validation/intake';

export const metadata: Metadata = buildMetadata({
  title: 'Randevu Al | CHERIE DAY',
  description: 'Ürün ve hizmetlerimiz için görüşme talebi oluşturun.',
  path: ROUTES.randevu,
  noindex: true,
});

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const source = sourceFromParams(await searchParams);
  return (
    <div className="cherie-container max-w-3xl py-14">
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'Randevu Al', path: ROUTES.randevu },
        ]}
      />
      <PageHeader
        eyebrow="Randevu"
        title="Sizin için uygun zamanı bulalım"
        lead="Tercih ettiğiniz gün ve görüşme kanalını paylaşın. Ekibimiz kesin saati sizinle birlikte netleştirsin."
      />
      <div className="mt-10 rounded-card border border-cherie-lace bg-cherie-ivory p-6 shadow-card sm:p-8">
        <IntakeForm type="appointment" source={source} />
      </div>
    </div>
  );
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
