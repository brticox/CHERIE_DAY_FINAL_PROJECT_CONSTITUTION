import Image from 'next/image';

import { cn } from '@/lib/utils';

/**
 * Media frame with a premium, honest fallback (docs Phase 4D). Until real
 * product photography is produced (an external asset dependency), the empty
 * state is art-directed — a warm paper surface, the piece's monogram and, when
 * a collection palette is known, a colour/material sample strip — never a bare
 * "görsel yok" box, and never a fabricated photo. Aspect ratio is always
 * reserved to avoid layout shift (docs/29).
 */
export function MediaFrame({
  label,
  ratio = 'aspect-[4/5]',
  className,
  src,
  alt,
  palette,
  priority,
  sizes,
}: {
  label: string;
  ratio?: string;
  className?: string;
  src?: string | null;
  alt?: string;
  /** Collection palette hexes → rendered as a sample strip when no photo. */
  palette?: string[];
  priority?: boolean;
  sizes?: string;
}) {
  const initials = label.trim().slice(0, 1).toLocaleUpperCase('tr');
  return (
    <div
      className={cn(
        ratio,
        'cd-grain relative flex items-center justify-center overflow-hidden rounded-card border border-cherie-lace bg-gradient-to-br from-cherie-paper to-cherie-mist',
        className,
      )}
      aria-hidden={src ? undefined : true}
    >
      {src ? (
        <Image
          src={src}
          alt={alt ?? label}
          fill
          priority={priority}
          sizes={sizes ?? '(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw'}
          className="object-cover transition duration-card ease-cherie group-hover:scale-[1.02]"
        />
      ) : (
        <div className="flex flex-col items-center px-4 text-center">
          <span className="grid size-16 place-items-center rounded-full border border-cherie-brass/25 font-display text-3xl text-cherie-brass/70">
            {initials}
          </span>
          {palette && palette.length > 0 && (
            <span className="mt-4 flex overflow-hidden rounded-full border border-cherie-ivory/70 shadow-sm">
              {palette.map((hex) => (
                <span
                  key={hex}
                  className="size-4"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </span>
          )}
          <span className="mt-3 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-cherie-soft-ink/60">
            <span className="size-1 rounded-full bg-cherie-brass/60" aria-hidden />
            {palette && palette.length > 0 ? 'Renk & doku numunesi' : 'Görsel hazırlanıyor'}
          </span>
        </div>
      )}
    </div>
  );
}
