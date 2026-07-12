import type { Metadata } from 'next';

import { IntakeForm } from '@/components/forms/intake-form';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { ROUTES } from '@/lib/data/routes';
import { buildMetadata } from '@/lib/data/seo';

const PATH = `${ROUTES.planlama}/hayalini-tasarla`;

export const metadata: Metadata = buildMetadata({
  title: 'Hayalini Tasarla | CHERIE DAY',
  description:
    'Kutlamanızın türünü, atmosferini ve ihtiyaçlarını CHERIE DAY ekibiyle paylaşın.',
  path: PATH,
  noindex: true,
});

export default function Page() {
  return (
    <div className="cherie-container max-w-3xl py-14">
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'Planlama', path: ROUTES.planlama },
          { name: 'Hayalini Tasarla', path: PATH },
        ]}
      />
      <PageHeader
        eyebrow="Planlama"
        title="Hayalinizi bize anlatın"
        lead="Kutlamanızın tarihini, atmosferini ve ihtiyaçlarını paylaşın; ilk yaratıcı çerçeveyi birlikte kuralım."
      />
      <div className="mt-10 rounded-card border border-cherie-lace bg-cherie-ivory p-6 shadow-card sm:p-8">
        <IntakeForm
          type="dream"
          source={{
            sourceEntityType: 'page',
            sourceSlug: 'hayalini-tasarla',
            sourcePath: PATH,
          }}
        />
      </div>
    </div>
  );
}
