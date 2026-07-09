import Link from 'next/link';

import { ROUTES } from '@/lib/data/routes';
import { ParallaxLayer } from '@/components/home/primitives/ParallaxLayer';
import { Reveal } from '@/components/home/primitives/Reveal';
import { SectionShell } from '@/components/home/primitives/SectionShell';

/**
 * DigitalInvite — the dimensional phone: a CSS-3D tilted device (with edge
 * thickness + screen reflection) whose angle follows the cursor field, and a
 * QR card that floats in front of the screen on its own parallax depth with a
 * cast shadow. Phase 5 swaps the inner mock for a real invite loop.
 */
export function DigitalInvite() {
  return (
    <SectionShell
      eyebrow="Dijital"
      title="Dijital davetiye — anında, zarifçe."
      lede="Işıkla yazılan davet: bir bağlantıyla paylaşın, QR ile kapıda karşılayın, RSVP'yi tek yerden yönetin."
      className="bg-cherie-ivory"
    >
      <div className="grid items-center gap-12 lg:grid-cols-2">
        {/* — the phone, tilted in space, following the cursor — */}
        <Reveal>
          <div className="flex justify-center" style={{ perspective: '1300px' }}>
            <div
              className="relative [transform-style:preserve-3d] will-change-transform"
              style={{
                transform:
                  'rotateY(calc(var(--mx, 0) * 7deg)) rotateX(calc(var(--my, 0) * -5deg))',
              }}
            >
              {/* device edge thickness (behind, pushed back in Z) */}
              <div
                aria-hidden
                className="absolute inset-0 rounded-[2.4rem] bg-cherie-velvet"
                style={{ transform: 'translateZ(-14px)' }}
              />
              {/* ground shadow */}
              <div
                aria-hidden
                className="absolute -bottom-6 left-1/2 h-8 w-56 -translate-x-1/2 rounded-[50%] bg-cherie-ink/20 blur-lg"
              />
              {/* the device */}
              <div className="relative w-64 rounded-[2.2rem] border border-cherie-lace bg-cherie-ink p-3 shadow-card md:w-72">
                <div className="relative overflow-hidden rounded-[1.7rem] bg-gradient-to-b from-cherie-ivory via-cherie-mist to-cherie-lace">
                  <div className="flex aspect-[9/17] flex-col items-center justify-center px-6 text-center">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-cherie-brass">
                      Davetlisiniz
                    </p>
                    <div aria-hidden className="mt-4 h-px w-10 bg-cherie-cherry/70" />
                    <p className="mt-4 font-display text-2xl leading-snug text-cherie-ink">
                      Elif &amp; Emir
                    </p>
                    <p className="mt-2 text-xs text-cherie-soft-ink">12 Eylül 2026 · İstanbul</p>
                  </div>
                  {/* moving screen reflection */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-cherie-ivory/0 to-cherie-ivory/40"
                  />
                </div>
              </div>

              {/* QR card floating in front of the screen (its own depth + shadow) */}
              <ParallaxLayer
                aria-hidden
                depth={10}
                className="absolute -bottom-4 -right-5"
              >
                <div
                  className="rounded-card border border-cherie-lace bg-cherie-ivory p-2.5 shadow-card"
                  style={{ transform: 'translateZ(40px)' }}
                >
                  <div className="grid h-16 w-16 grid-cols-4 gap-0.5">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <span
                        key={i}
                        className={
                          [0, 2, 3, 5, 6, 8, 11, 12, 15].includes(i)
                            ? 'bg-cherie-ink'
                            : 'bg-transparent'
                        }
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-center text-[8px] uppercase tracking-wider text-cherie-brass">
                    QR Davet
                  </p>
                </div>
              </ParallaxLayer>
            </div>
          </div>
        </Reveal>

        {/* — copy + CTA — */}
        <Reveal delay={0.15}>
          <ul className="space-y-4">
            {[
              'Hareketli, size özel tasarlanan dijital davetiyeler',
              'QR kart ile basılı ve dijitalin zarif buluşması',
              'RSVP ve misafir listesi tek bağlantıda',
            ].map((line) => (
              <li key={line} className="flex items-start gap-3">
                <span aria-hidden className="mt-2.5 h-px w-6 shrink-0 bg-cherie-brass" />
                <span className="text-base leading-7 text-cherie-soft-ink">{line}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Link
              href={ROUTES.dijital}
              className="inline-flex h-11 items-center justify-center rounded-control bg-cherie-burgundy px-6 text-sm font-medium text-cherie-ivory transition-colors duration-control ease-cherie hover:bg-cherie-cherry"
            >
              Dijital Davetiyeyi Keşfet
            </Link>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}
