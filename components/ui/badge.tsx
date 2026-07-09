import { cn } from '@/lib/utils';

type BadgeTone = 'neutral' | 'burgundy' | 'brass' | 'muted';

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-cherie-mist text-cherie-soft-ink',
  burgundy: 'bg-cherie-burgundy text-cherie-ivory',
  brass: 'bg-cherie-lace text-cherie-ink',
  muted: 'border border-cherie-lace text-cherie-soft-ink',
};

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium tracking-wide',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
