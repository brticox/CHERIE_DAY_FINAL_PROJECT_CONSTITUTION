import Link from 'next/link';
import { BookHeart, Film, QrCode, ArrowRight } from 'lucide-react';

import { ROUTES } from '@/lib/data/routes';
import { ParallaxLayer } from '@/components/home/primitives/ParallaxLayer';
import { Reveal } from '@/components/home/primitives/Reveal';
import { SectionShell } from '@/components/home/primitives/SectionShell';

const KEEPSAKES = [
  { icon: BookHeart, text: 'El yapımı albümler ve kadife hatıra kutuları' },
  { icon: Film, text: 'Fotoğraf, kısa film ve drone çekimleri' },
  { icon: QrCode, text: 'Tek QR ile bütün günün dijital anısı' },
] as const;

/**
 * MemoriesAlbum — "Gün biter, hatıra kalır." A cracked-open CSS album with
 * page thickness, a photo lifting off the right page on its own parallax depth,
 * a dimensional page-turn corner and a ribbon bookmark. What remains after the
 * day ends — placed just before the social-proof close.
 */
export function MemoriesAlbum() {
  return (
    <SectionShell
      eyebrow="Hatıra"
      title="Gün biter, hatıra kalır."
      lede="Yıllar sonra bir akşam, bu sayfaları yeniden açacaksınız — ve o gün olduğu gibi orada olacak."
      className="bg-cherie-paper/40"
    >
      <div className="grid items-center gap-12 lg:grid-cols-2">
        {/* — the open album — */}
        <Reveal>
          <div className="relative mx-auto max-w-md" style={{ perspective: '1600px' }}>
            <div aria-hidden className="absolute inset-x-4 -bottom-2 top-2 rounded-card bg-cherie-lace/70" />
            <div aria-hidden className="absolute inset-x-2 -bottom-1 top-1 rounded-card bg-cherie-mist" />

            <div className="relative flex rounded-card border border-cherie-lace bg-cherie-velvet p-3 shadow-card">
              <div
                className="relative aspect-[3/4] w-1/2 origin-right rounded-l-sm bg-cherie-ivory shadow-[inset_-14px_0_24px_rgba(31,25,23,0.12)]"
                style={{ transform: 'rotateY(9deg)' }}
              >
                <span aria-hidden className="absolute inset-y-2 left-1 w-px bg-cherie-ink/10" />
                <ParallaxLayer depth={4} className="absolute inset-6 rounded-sm bg-gradient-to-br from-cherie-mist to-cherie-lace" />
                <div aria-hidden className="absolute inset-x-8 bottom-10 h-px bg-cherie-ink/10" />
                <div aria-hidden className="absolute inset-x-8 bottom-14 h-px bg-cherie-ink/10" />
              </div>

              <div
                className="relative aspect-[3/4] w-1/2 origin-left rounded-r-sm bg-cherie-paper shadow-[inset_14px_0_24px_rgba(31,25,23,0.12)]"
                style={{ transform: 'rotateY(-9deg)' }}
              >
                <ParallaxLayer depth={9} className="absolute inset-6">
                  <div className="h-full w-full rounded-sm border border-cherie-ivory bg-gradient-to-br from-cherie-lace to-cherie-mist shadow-card" />
                </ParallaxLayer>
                <div aria-hidden className="absolute bottom-0 right-0 h-10 w-10 rounded-tl-2xl bg-cherie-lace shadow-[-4px_-4px_8px_rgba(31,25,23,0.12)]" />
              </div>

              <div aria-hidden className="absolute inset-y-3 left-1/2 w-1 -translate-x-1/2 bg-cherie-ink/25" />

              <div
                aria-hidden
                className="absolute -bottom-9 left-1/2 h-14 w-2.5 -translate-x-1/2 bg-cherie-cherry shadow-card"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }}
              />
            </div>
          </div>
        </Reveal>

        {/* — copy + CTA — */}
        <Reveal delay={0.15}>
          <ul className="space-y-5">
            {KEEPSAKES.map((k) => {
              const Icon = k.icon;
              return (
                <li key={k.text} className="flex items-center gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-cherie-lace bg-cherie-ivory text-cherie-brass">
                    <Icon className="h-5 w-5" strokeWidth={1.6} aria-hidden />
                  </span>
                  <span className="text-base leading-7 text-cherie-soft-ink">{k.text}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-9">
            <Link
              href={ROUTES.hatira}
              className="group inline-flex h-11 items-center gap-2 rounded-control border border-cherie-burgundy px-6 text-sm font-medium text-cherie-burgundy transition-colors duration-control ease-cherie hover:bg-cherie-burgundy hover:text-cherie-ivory"
            >
              Hatıra Dünyasını Keşfet
              <ArrowRight className="h-4 w-4 transition-transform duration-control ease-cherie group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}
