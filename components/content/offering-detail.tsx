import Link from 'next/link';
import { Check } from 'lucide-react';

import { Breadcrumbs, type Crumb } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { MediaFrame } from '@/components/commerce/media-frame';
import { Button } from '@/components/ui/button';

export type OfferingCta = { label: string; href: string };

/**
 * Shared layout for a single digital-product or memory (hatıra) offering
 * (docs Phase 4B). Keeps the family visually coherent: honest media sample,
 * "neler dahil" highlights, an optional process, honest price/availability
 * language, behaviour-correct CTAs and optional reassurance FAQ. No invented
 * business claims — copy is supplied per route.
 */
export function OfferingDetail({
  breadcrumbs,
  eyebrow,
  title,
  lead,
  highlights,
  steps,
  priceLabel,
  primaryCta,
  secondaryCta,
  faqs,
  note,
}: {
  breadcrumbs: Crumb[];
  eyebrow: string;
  title: string;
  lead: string;
  highlights: { title: string; body: string }[];
  steps?: { title: string; body: string }[];
  priceLabel?: string;
  primaryCta: OfferingCta;
  secondaryCta?: OfferingCta;
  faqs?: { q: string; a: string }[];
  note?: string;
}) {
  return (
    <div className="cherie-container py-14 md:py-20">
      <Breadcrumbs items={breadcrumbs} />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.85fr)] lg:gap-16">
        <div>
          <PageHeader eyebrow={eyebrow} title={title} lead={lead} />

          <section className="mt-10">
            <h2 className="text-h3 text-cherie-ink">Neler sunuyoruz</h2>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {highlights.map((h) => (
                <li
                  key={h.title}
                  className="rounded-card border border-cherie-lace bg-cherie-ivory p-5"
                >
                  <span className="flex items-center gap-2 font-medium text-cherie-ink">
                    <Check className="size-4 text-cherie-brass" strokeWidth={2} />
                    {h.title}
                  </span>
                  <p className="mt-2 text-sm leading-6 text-cherie-soft-ink">{h.body}</p>
                </li>
              ))}
            </ul>
          </section>

          {steps && steps.length > 0 && (
            <section className="mt-14">
              <h2 className="text-h3 text-cherie-ink">Nasıl ilerliyoruz</h2>
              <ol className="mt-5 grid gap-5 sm:grid-cols-3">
                {steps.map((s, i) => (
                  <li key={s.title}>
                    <span className="font-display text-3xl text-cherie-brass">{i + 1}</span>
                    <h3 className="mt-1 font-medium text-cherie-ink">{s.title}</h3>
                    <p className="mt-1 text-sm text-cherie-soft-ink">{s.body}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {faqs && faqs.length > 0 && (
            <section className="mt-14">
              <h2 className="text-h3 text-cherie-ink">Merak edilenler</h2>
              <div className="mt-4 divide-y divide-cherie-lace border-y border-cherie-lace">
                {faqs.map((f, i) => (
                  <details key={i} className="group py-3.5">
                    <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-medium text-cherie-ink [&::-webkit-details-marker]:hidden">
                      {f.q}
                      <span className="text-cherie-brass transition-transform duration-control ease-cherie group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-2 text-sm leading-6 text-cherie-soft-ink">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sticky action card */}
        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <div className="cherie-surface rounded-card-lg p-6">
            <MediaFrame label={title} ratio="aspect-[4/3]" />
            {priceLabel && (
              <p className="mt-5 font-display text-3xl text-cherie-burgundy">{priceLabel}</p>
            )}
            <div className="mt-5 flex flex-col gap-3">
              <Button asChild size="lg">
                <Link href={primaryCta.href}>{primaryCta.label}</Link>
              </Button>
              {secondaryCta && (
                <Button asChild size="lg" variant="secondary">
                  <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
                </Button>
              )}
            </div>
            {note && (
              <p className="mt-4 text-xs leading-5 text-cherie-soft-ink">{note}</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
