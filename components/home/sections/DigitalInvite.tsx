import Link from 'next/link';
import { Sparkles, QrCode, ListChecks, ArrowRight } from 'lucide-react';

import { ROUTES } from '@/lib/data/routes';
import { ParallaxLayer } from '@/components/home/primitives/ParallaxLayer';
import { Reveal } from '@/components/home/primitives/Reveal';
import { SectionShell } from '@/components/home/primitives/SectionShell';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Hareketli, size özel',
    body: 'İsimleriniz, tarihiniz ve renk dünyanızla animasyonlu bir davetiye.',
  },
  {
    icon: QrCode,
    title: 'QR ile kapıda',
    body: 'Basılı davetin zarafeti, dijitalin pratikliğiyle tek karede buluşur.',
  },
  {
    icon: ListChecks,
    title: 'Tek bağlantıda RSVP',
    body: 'Katılım yanıtları ve misafir listesi tek yerden, otomatik toplanır.',
  },
] as const;

/**
 * DigitalInvite — the dimensional phone: a CSS-3D tilted device whose angle
 * follows the cursor field, with a QR card floating in front on its own
 * parallax depth. The surrounding composition is an icon-led value ladder.
 */
export function DigitalInvite() {
  return (
    <SectionShell
      eyebrow="Dijital"
      title="Işıkla yazılan davet."
      lede="Bir bağlantıyla paylaşın, QR ile karşılayın, katılımı tek yerden yönetin — davetiyeniz artık ekranda da nefes alır."
      className="bg-cherie-ivory"
    >
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
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
              <div
                aria-hidden
                className="absolute inset-0 rounded-[2.4rem] bg-cherie-velvet"
                style={{ transform: 'translateZ(-14px)' }}
              />
              <div
                aria-hidden
                className="absolute -bottom-6 left-1/2 h-8 w-56 -translate-x-1/2 rounded-[50%] bg-cherie-ink/20 blur-lg"
              />
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
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-cherie-ivory/0 to-cherie-ivory/40"
                  />
                </div>
              </div>

              <ParallaxLayer aria-hidden depth={10} className="absolute -bottom-4 -right-5">
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

        {/* — icon-led value ladder + CTA — */}
        <Reveal delay={0.15}>
          <ul className="space-y-6">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <li key={f.title} className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-cherie-lace bg-cherie-paper/50 text-cherie-brass">
                    <Icon className="h-5 w-5" strokeWidth={1.6} aria-hidden />
                  </span>
                  <span>
                    <span className="font-display text-lg text-cherie-ink">{f.title}</span>
                    <span className="mt-1 block text-sm leading-6 text-cherie-soft-ink">
                      {f.body}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="mt-9">
            <Link
              href={ROUTES.dijital}
              className="group inline-flex h-11 items-center gap-2 rounded-control bg-cherie-burgundy px-6 text-sm font-medium text-cherie-ivory transition-colors duration-control ease-cherie hover:bg-cherie-cherry"
            >
              Dijital Davetiyeyi Keşfet
              <ArrowRight className="h-4 w-4 transition-transform duration-control ease-cherie group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}
