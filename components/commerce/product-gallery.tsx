'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

import type { ProductMedia } from '@/lib/data/types';
import { cn } from '@/lib/utils';

/**
 * Product media gallery (docs Phase 4D). With real photography it shows a main
 * image, a thumbnail rail and a full-screen zoom preview. Without photography
 * it renders an honest, art-directed colour/material sample — the piece's
 * monogram and its collection palette — clearly labelled as a sample while
 * final imagery is prepared. No fabricated photos, aspect ratio always reserved.
 */
export function ProductGallery({
  name,
  media,
  palette,
  materialStory,
}: {
  name: string;
  media: ProductMedia[];
  palette: string[];
  materialStory: string | null;
}) {
  const images = media.filter((m) => m.url);
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);

  const hasImages = images.length > 0;

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoom(false);
      if (e.key === 'ArrowRight') setActive((i) => (i + 1) % images.length);
      if (e.key === 'ArrowLeft') setActive((i) => (i - 1 + images.length) % images.length);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [zoom, images.length]);

  if (!hasImages) {
    return (
      <div className="space-y-4">
        <div className="cd-grain relative flex aspect-[4/5] flex-col items-center justify-center overflow-hidden rounded-card-lg border border-cherie-lace bg-gradient-to-br from-cherie-paper to-cherie-mist">
          <span className="grid size-24 place-items-center rounded-full border border-cherie-brass/25 font-display text-5xl text-cherie-brass/70">
            {name.trim().slice(0, 1).toLocaleUpperCase('tr')}
          </span>
          {palette.length > 0 && (
            <span className="mt-6 flex overflow-hidden rounded-full border border-cherie-ivory/70 shadow-sm">
              {palette.map((hex) => (
                <span key={hex} className="size-7" style={{ backgroundColor: hex }} />
              ))}
            </span>
          )}
          <span className="mt-5 max-w-xs px-6 text-center text-[11px] uppercase tracking-[0.16em] text-cherie-soft-ink/70">
            {palette.length > 0 ? 'Renk & doku numunesi' : 'Görsel hazırlanıyor'}
          </span>
        </div>
        <p className="rounded-card border border-dashed border-cherie-lace bg-cherie-paper/40 px-4 py-3 text-xs leading-5 text-cherie-soft-ink">
          Bu ürünün fotoğrafları hazırlanıyor. Şimdilik rengini ve dokusunu
          numune kartıyla gösteriyoruz.
          {materialStory ? ` Malzeme: ${materialStory}` : ''}
        </p>
      </div>
    );
  }

  const activeImage = images[active] ?? images[0]!;

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setZoom(true)}
        className="group relative block aspect-[4/5] w-full overflow-hidden rounded-card-lg border border-cherie-lace bg-cherie-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cherie-focus focus-visible:ring-offset-2"
        aria-label={`${name} — büyük görüntüle`}
      >
        <Image
          src={activeImage.url!}
          alt={activeImage.alt_text ?? name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="object-cover"
        />
        <span className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-full bg-cherie-ivory/90 text-cherie-burgundy opacity-0 shadow-card transition group-hover:opacity-100">
          <ZoomIn className="size-4" />
        </span>
      </button>

      {images.length > 1 && (
        <ul className="grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <li key={img.id}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`${name} — görünüm ${i + 1}`}
                aria-current={i === active}
                className={cn(
                  'relative block aspect-square w-full overflow-hidden rounded-card border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cherie-focus',
                  i === active ? 'border-cherie-burgundy' : 'border-cherie-lace hover:border-cherie-brass',
                )}
              >
                <Image
                  src={img.url!}
                  alt=""
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      {zoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-cherie-velvet/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${name} görsel önizleme`}
          onClick={() => setZoom(false)}
        >
          <button
            type="button"
            onClick={() => setZoom(false)}
            aria-label="Kapat"
            className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-cherie-ivory/15 text-cherie-ivory hover:bg-cherie-ivory/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cherie-ivory"
          >
            <X className="size-5" />
          </button>
          <div
            className="relative aspect-[4/5] w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={activeImage.url!}
              alt={activeImage.alt_text ?? name}
              fill
              sizes="(max-width: 768px) 92vw, 640px"
              className="object-contain"
            />
          </div>
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActive((i) => (i - 1 + images.length) % images.length);
                }}
                aria-label="Önceki görsel"
                className="absolute left-4 grid size-11 place-items-center rounded-full bg-cherie-ivory/15 text-cherie-ivory hover:bg-cherie-ivory/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cherie-ivory"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActive((i) => (i + 1) % images.length);
                }}
                aria-label="Sonraki görsel"
                className="absolute right-4 grid size-11 place-items-center rounded-full bg-cherie-ivory/15 text-cherie-ivory hover:bg-cherie-ivory/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cherie-ivory"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
