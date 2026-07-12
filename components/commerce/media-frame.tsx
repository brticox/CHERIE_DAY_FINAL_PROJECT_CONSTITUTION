import Image from 'next/image';

import { cn } from '@/lib/utils';

/**
 * Tasteful placeholder frame used until real product/collection imagery is
 * produced (docs/16 asset production is a later dependency). Reserves aspect
 * ratio to avoid layout shift (docs/29).
 */
export function MediaFrame({
  label,
  ratio = 'aspect-[4/5]',
  className,
  src,
  alt,
}: {
  label: string;
  ratio?: string;
  className?: string;
  src?: string | null;
  alt?: string;
}) {
  const initials = label.trim().slice(0, 1).toLocaleUpperCase('tr');
  return (
    <div
      className={cn(
        ratio,
        'flex items-center justify-center overflow-hidden rounded-card border border-cherie-lace bg-gradient-to-br from-cherie-paper to-cherie-mist',
        className,
      )}
      aria-hidden={src ? undefined : true}
    >
      {src ? (
        <Image
          src={src}
          alt={alt ?? label}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover transition duration-card ease-cherie group-hover:scale-[1.02]"
        />
      ) : (
        <div className="text-center">
          <span className="font-display text-4xl text-cherie-brass/70">{initials}</span>
          <span className="mt-2 block text-[10px] uppercase tracking-[0.16em] text-cherie-soft-ink/60">
            Görsel hazırlanıyor
          </span>
        </div>
      )}
    </div>
  );
}
