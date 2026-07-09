import Link from 'next/link';

import { ROUTES } from '@/lib/data/routes';
import { ParallaxLayer } from '@/components/home/primitives/ParallaxLayer';
import { Reveal } from '@/components/home/primitives/Reveal';
import { SectionShell } from '@/components/home/primitives/SectionShell';

const STEPS = [
  {
    number: 'I',
    title: 'Seç',
    description: 'Dünyanızı ve ürününüzü seçin; koleksiyonlardan ya da tamamen size özel.',
  },
  {
    number: 'II',
    title: 'Kişiselleştir',
    description: 'İsimler, tarihler, renkler, mühür — her detay sizin hikâyenize göre.',
  },
  {
    number: 'III',
    title: 'Onayla',
    description: 'Tasarımınızı size gönderiyoruz; onayınız gelmeden üretim başlamaz.',
  },
] as const;

/**
 * PersonalizationSteps — the proof-approval promise as three stepping paper
 * layers. De-risks customization: nothing is printed before your approval.
 */
export function PersonalizationSteps() {
  return (
    <SectionShell
      eyebrow="Kişiselleştirme"
      title="Sizin hikâyeniz, sizin tasarımınız."
      lede="Kişiselleştirilmiş her üründe aynı söz geçerli: onayınız olmadan üretim başlamaz."
      className="bg-cherie-paper/40"
    >
      <div className="grid gap-5 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <Reveal key={step.number} delay={i * 0.14}>
            <div className="relative h-full">
              {/* stepped paper layer behind each card — subtle forward march */}
              <ParallaxLayer
                aria-hidden
                depth={3 + i * 2}
                className="absolute inset-0 translate-x-2 translate-y-2 rounded-card bg-cherie-lace/50"
              />
              <div className="relative h-full rounded-card border border-cherie-lace bg-cherie-ivory p-8 shadow-card">
                <span className="font-display text-3xl text-cherie-brass">{step.number}</span>
                <h3 className="mt-4 text-h3 text-cherie-ink">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-cherie-soft-ink">
                  {step.description}
                </p>
                {/* ribbon underline advances with the steps */}
                <div
                  aria-hidden
                  className="mt-6 h-px bg-cherie-cherry/60"
                  style={{ width: `${((i + 1) / STEPS.length) * 100}%` }}
                />
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-10">
        <Link
          href={ROUTES.maisonNasilCalisir}
          className="text-sm font-medium text-cherie-burgundy underline-offset-4 hover:underline"
        >
          Nasıl çalışır? Süreci inceleyin
        </Link>
      </Reveal>
    </SectionShell>
  );
}
