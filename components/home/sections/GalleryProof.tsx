import type { Testimonial } from '@/lib/data/types';
import { Reveal } from '@/components/home/primitives/Reveal';
import { SectionShell } from '@/components/home/primitives/SectionShell';

/**
 * GalleryProof — "Onların gününden."
 * Testimonials framed by a brass ribbon rule; Phase 5 adds the curated
 * moment-photography masonry behind them (real events, warm grain).
 */
export function GalleryProof({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <SectionShell
      eyebrow="Misafir Defteri"
      title="Onların gününden."
      lede="Bizim sözlerimiz değil; günlerini birlikte kurduğumuz çiftlerin sözleri."
      className="bg-cherie-ivory"
      align="center"
    >
      <div className="grid gap-5 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <Reveal key={t.id} delay={i * 0.12}>
            <figure className="flex h-full flex-col justify-between rounded-card border border-cherie-lace bg-cherie-paper/50 p-8 shadow-card transition-transform duration-card ease-cherie hover:-translate-y-0.5">
              <blockquote className="font-display text-xl leading-relaxed text-cherie-ink">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 border-t border-cherie-lace pt-4 text-sm text-cherie-soft-ink">
                <span className="font-medium text-cherie-ink">
                  {t.client_display_name ?? 'CHERIE DAY Çifti'}
                </span>
                {t.event_type ? <span> · {t.event_type}</span> : null}
                {t.location ? <span> · {t.location}</span> : null}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
