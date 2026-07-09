import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getExperiences, getExperienceBySlug } from '@/lib/data/editorial';
import { getServicePackages } from '@/lib/data/services';
import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { ServiceGrid } from '@/components/services/service-grid';
import { Button } from '@/components/ui/button';

export async function generateStaticParams() {
  const experiences = await getExperiences();
  return experiences.map((e) => ({ event: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ event: string }>;
}): Promise<Metadata> {
  const { event } = await params;
  const exp = await getExperienceBySlug(event);
  if (!exp) return {};
  return buildMetadata({
    title: `${exp.name} Deneyimi | CHERIE DAY`,
    description: exp.summary ?? `${exp.name} için CHERIE DAY deneyimi.`,
    path: `${ROUTES.deneyimler}/${event}`,
  });
}

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ event: string }>;
}) {
  const { event } = await params;
  const exp = await getExperienceBySlug(event);
  if (!exp) notFound();

  const services = (await getServicePackages()).slice(0, 3);

  return (
    <div className="cherie-container py-14">
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'Deneyimler', path: ROUTES.deneyimler },
          { name: exp.name, path: `${ROUTES.deneyimler}/${event}` },
        ]}
      />
      <PageHeader eyebrow="Deneyim" title={exp.name} lead={exp.summary ?? undefined} />

      {exp.process_steps.length > 0 && (
        <section className="mt-12">
          <h2 className="text-h3 text-cherie-ink">Nasıl İlerliyoruz</h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-3">
            {exp.process_steps.map((step, i) => (
              <li key={i} className="rounded-card border border-cherie-lace bg-cherie-ivory p-5">
                <span className="font-display text-3xl text-cherie-brass">{i + 1}</span>
                <h3 className="mt-2 font-medium text-cherie-ink">{step.title}</h3>
                <p className="mt-1 text-sm text-cherie-soft-ink">{step.description}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="mt-16">
        <h2 className="text-h3 text-cherie-ink">İlgili Hizmetler</h2>
        <div className="mt-8">
          <ServiceGrid services={services} />
        </div>
      </section>

      <section className="mt-16 flex flex-wrap gap-3">
        <Button asChild size="lg"><Link href={ROUTES.teklif}>Teklif Al</Link></Button>
        <Button asChild size="lg" variant="secondary"><Link href={ROUTES.magaza}>Ürünlere Göz At</Link></Button>
      </section>
    </div>
  );
}
