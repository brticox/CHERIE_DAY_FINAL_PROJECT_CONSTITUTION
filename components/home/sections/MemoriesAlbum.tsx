import Link from 'next/link';

import { ROUTES } from '@/lib/data/routes';
import { ParallaxLayer } from '@/components/home/primitives/ParallaxLayer';
import { Reveal } from '@/components/home/primitives/Reveal';
import { SectionShell } from '@/components/home/primitives/SectionShell';

/**
 * MemoriesAlbum — "Gün biter, hatıra kalır."
 * A cracked-open CSS album with a clear page/layer illusion: stacked page
 * edges give the book thickness, a photo lifts off the right page on its own
 * parallax depth with a cast shadow, the spine and lifted page-turn corner
 * read dimensionally, and a ribbon bookmark hangs from the binding.
 */
export function MemoriesAlbum() {
  return (
    <SectionShell
      eyebrow="Hatıra"
      title="Gün biter, hatıra kalır."
      lede="Albümler, hatıra kutuları, film ve fotoğraf — yıllar sonra bile açılacak sayfalar."
      className="bg-cherie-paper/40"
    >
      <div className="grid items-center gap-12 lg:grid-cols-2">
        {/* — the open album — */}
        <Reveal>
          <div className="relative mx-auto max-w-md" style={{ perspective: '1600px' }}>
            {/* page-stack thickness beneath the book */}
            <div aria-hidden className="absolute inset-x-4 -bottom-2 top-2 rounded-card bg-cherie-lace/70" />
            <div aria-hidden className="absolute inset-x-2 -bottom-1 top-1 rounded-card bg-cherie-mist" />

            <div className="relative flex rounded-card border border-cherie-lace bg-cherie-velvet p-3 shadow-card">
              {/* left page */}
              <div
                className="relative aspect-[3/4] w-1/2 origin-right rounded-l-sm bg-cherie-ivory shadow-[inset_-14px_0_24px_rgba(31,25,23,0.12)]"
                style={{ transform: 'rotateY(9deg)' }}
              >
                {/* page edge lines (thickness) */}
                <span aria-hidden className="absolute inset-y-2 left-1 w-px bg-cherie-ink/10" />
                <ParallaxLayer depth={4} className="absolute inset-6 rounded-sm bg-gradient-to-br from-cherie-mist to-cherie-lace" />
                <div aria-hidden className="absolute inset-x-8 bottom-10 h-px bg-cherie-ink/10" />
                <div aria-hidden className="absolute inset-x-8 bottom-14 h-px bg-cherie-ink/10" />
              </div>

              {/* right page */}
              <div
                className="relative aspect-[3/4] w-1/2 origin-left rounded-r-sm bg-cherie-paper shadow-[inset_14px_0_24px_rgba(31,25,23,0.12)]"
                style={{ transform: 'rotateY(-9deg)' }}
              >
                {/* the mounted photo lifts off the page */}
                <ParallaxLayer depth={9} className="absolute inset-6">
                  <div className="h-full w-full rounded-sm border border-cherie-ivory bg-gradient-to-br from-cherie-lace to-cherie-mist shadow-card" />
                </ParallaxLayer>
                {/* page-turn hint: lifted corner with under-shadow */}
                <div aria-hidden className="absolute bottom-0 right-0 h-10 w-10 rounded-tl-2xl bg-cherie-lace shadow-[-4px_-4px_8px_rgba(31,25,23,0.12)]" />
              </div>

              {/* spine */}
              <div aria-hidden className="absolute inset-y-3 left-1/2 w-1 -translate-x-1/2 bg-cherie-ink/25" />

              {/* ribbon bookmark hanging from the binding */}
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
          <ul className="space-y-4">
            {[
              'El yapımı albümler ve hatıra kutuları',
              'Fotoğraf, film ve drone çekimleri',
              'Dijital anı bağlantıları — tek QR ile tüm gün',
            ].map((line) => (
              <li key={line} className="flex items-start gap-3">
                <span aria-hidden className="mt-2.5 h-px w-6 shrink-0 bg-cherie-brass" />
                <span className="text-base leading-7 text-cherie-soft-ink">{line}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Link
              href={ROUTES.hatira}
              className="inline-flex h-11 items-center justify-center rounded-control border border-cherie-burgundy px-6 text-sm font-medium text-cherie-burgundy transition-colors duration-control ease-cherie hover:bg-cherie-ivory"
            >
              Hatıra Dünyasını Keşfet
            </Link>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}
