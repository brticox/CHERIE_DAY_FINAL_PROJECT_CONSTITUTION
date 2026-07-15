import type { Testimonial } from '@/lib/data/types';
import { SectionShell } from '@/components/home/primitives/SectionShell';
import { Reveal } from '@/components/home/primitives/Reveal';
import { TestimonialsCarousel } from '@/components/home/sections/TestimonialsCarousel.client';

/**
 * GalleryProof — "Onların gününden."
 * Social proof placed near peak buying intent (just before the closing CTA).
 * The old three static cards are replaced by an accessible editorial carousel:
 * one large serif quotation at a time, real couple / occasion / city only.
 */
export function GalleryProof({ testimonials }: { testimonials: Testimonial[] }) {
  if (!testimonials.length) return null;

  return (
    <SectionShell
      eyebrow="Misafir Defteri"
      title="Onların gününden."
      lede="Bizim sözlerimiz değil; günlerini birlikte kurduğumuz çiftlerin kendi cümleleri."
      className="bg-cherie-ivory"
      align="center"
    >
      <Reveal>
        <TestimonialsCarousel testimonials={testimonials} />
      </Reveal>
    </SectionShell>
  );
}
