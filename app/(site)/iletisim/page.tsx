import type { Metadata } from 'next';

import { buildMetadata, organizationLd } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { IntakeForm } from '@/components/forms/intake-form';
import { PageHeader } from '@/components/layout/page-header';
import { JsonLd } from '@/components/layout/json-ld';
import type { IntakeSourceContext } from '@/lib/validation/intake';

export const metadata: Metadata = buildMetadata({
  title: 'İletişim | CHERIE DAY',
  description: 'CHERIE DAY ile iletişime geçin; sorularınız için WhatsApp ve e-posta.',
  path: ROUTES.iletisim,
});

export default async function IletisimPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const whatsapp =
    process.env.NEXT_PUBLIC_WHATSAPP_CONTACT_URL ?? process.env.WHATSAPP_CONTACT_URL;
  const params = await searchParams;
  const source = sourceFromParams(params);
  const initialMessage = first(params.message);
  return (
    <div className="cherie-container max-w-3xl py-14">
      <JsonLd data={organizationLd()} />
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'İletişim', path: ROUTES.iletisim },
        ]}
      />
      <PageHeader
        eyebrow="CHERIE DAY"
        title="Bize yazın; bahçenin kapısı açık"
        lead="Bir sorunuz mu var, yoksa bir hayaliniz mi? İkisi için de buradayız."
      />

      {whatsapp && (
        <p className="mt-8 text-sm text-cherie-soft-ink">
          Dilerseniz doğrudan{' '}
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cherie-burgundy underline"
          >
            WhatsApp ile yazabilirsiniz
          </a>
          .
        </p>
      )}

      <div className="mt-10 rounded-card border border-cherie-lace bg-cherie-ivory p-6 shadow-card sm:p-8">
        <IntakeForm type="contact" source={source} initialMessage={initialMessage} />
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

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
