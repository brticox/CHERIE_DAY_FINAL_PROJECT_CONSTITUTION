import type { Metadata } from 'next';
import Link from 'next/link';

import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = buildMetadata({
  title: 'Planlama — Hayalini Tasarla | CHERIE DAY',
  description:
    'Kontrol listesi, bütçe rehberi ve zaman akışıyla kutlamanızı sakin bir düzenle planlayın.',
  path: ROUTES.planlama,
});

const TOOLS = [
  { title: 'Hayalini Tasarla', desc: 'Birkaç soruyla size özel bir başlangıç.', href: `${ROUTES.planlama}/hayalini-tasarla` },
  { title: 'Kontrol Listesi', desc: 'Adımları sırayla, huzurla ilerleyin.', href: `${ROUTES.planlama}/kontrol-listesi` },
  { title: 'Bütçe Rehberi', desc: 'Önceliklerinizi netleştirin.', href: `${ROUTES.planlama}/butce-rehberi` },
  { title: 'Zaman Akışı', desc: 'Hangi iş, hangi haftada?', href: `${ROUTES.planlama}/zaman-akisi` },
];

export default function PlanlamaPage() {
  return (
    <div className="cherie-container py-14">
      <Breadcrumbs items={[{ name: 'Ana Sayfa', path: ROUTES.home }, { name: 'Planlama', path: ROUTES.planlama }]} />
      <PageHeader
        eyebrow="Concierge"
        title="Hikâyeniz, sakin bir düzenle başlasın"
        lead="Planlama araçlarımızla kutlamanızı adım adım, telaşsız kurgulayın."
      />

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {TOOLS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group rounded-card border border-cherie-lace bg-cherie-ivory p-6 transition-colors duration-card ease-cherie hover:border-cherie-burgundy"
          >
            <h3 className="text-h3 text-cherie-ink group-hover:text-cherie-burgundy">{t.title}</h3>
            <p className="mt-1 text-sm text-cherie-soft-ink">{t.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <Button asChild size="lg"><Link href={`${ROUTES.planlama}/hayalini-tasarla`}>Hayalini Tasarla</Link></Button>
        <Button asChild size="lg" variant="secondary"><Link href={ROUTES.teklif}>Teklif Al</Link></Button>
      </div>
    </div>
  );
}
