import Link from 'next/link';
import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-col justify-between gap-5 border-b border-cherie-lace pb-6 sm:flex-row sm:items-end">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-cherie-brass">{eyebrow}</p>
        <h1 className="break-words font-display text-3xl leading-tight text-cherie-ink sm:text-5xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-base leading-7 text-cherie-soft-ink">{description}</p>
      </div>
      {action && <div className="shrink-0 [&>*]:w-full sm:[&>*]:w-auto">{action}</div>}
    </header>
  );
}

export function AdminSectionHeading({
  eyebrow,
  title,
  description,
  meta,
  id,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  meta?: ReactNode;
  id?: string;
}) {
  return (
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        {eyebrow && <p className="text-xs font-bold uppercase tracking-[.16em] text-cherie-brass">{eyebrow}</p>}
        <h2 id={id} className="font-display text-3xl leading-tight text-cherie-ink sm:text-4xl">{title}</h2>
        {description && <AdminHelperText className="mt-2 max-w-3xl">{description}</AdminHelperText>}
      </div>
      {meta}
    </div>
  );
}

export function AdminHelperText({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`text-sm leading-6 text-cherie-soft-ink ${className}`}>{children}</p>;
}

export function AdminMetadata({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`text-xs font-medium leading-5 text-cherie-soft-ink ${className}`}>{children}</p>;
}

export function AdminSegmentedControl({
  label,
  items,
}: {
  label: string;
  items: Array<{ label: string; href: string; active: boolean; count?: number }>;
}) {
  return (
    <nav aria-label={label} className="inline-flex rounded-control border border-cherie-lace bg-white/60 p-1">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.active ? 'page' : undefined}
          scroll={false}
          className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cherie-focus ${
            item.active
              ? 'bg-cherie-burgundy text-white shadow-sm'
              : 'text-cherie-soft-ink hover:bg-cherie-paper hover:text-cherie-ink'
          }`}
        >
          {item.label}
          {typeof item.count === 'number' && (
            <span className={item.active ? 'text-white/80' : 'text-cherie-soft-ink'}>{item.count}</span>
          )}
        </Link>
      ))}
    </nav>
  );
}

export function AdminToolbar({ children, label }: { children: ReactNode; label: string }) {
  return (
    <section aria-label={label} className="rounded-card border border-cherie-lace bg-white/60 p-3 shadow-sm">
      {children}
    </section>
  );
}

export function AdminEmptyState({
  title,
  description,
  primary,
  secondary,
}: {
  title: string;
  description: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <section className="rounded-card-lg border border-dashed border-cherie-brass/50 bg-cherie-paper/40 px-5 py-12 text-center sm:px-8">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-white text-cherie-brass shadow-sm">
        <Inbox className="size-5" aria-hidden="true" />
      </span>
      <h3 className="mt-4 font-display text-3xl leading-tight text-cherie-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-cherie-soft-ink">{description}</p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link href={primary.href} className="cherie-button-primary min-h-11">{primary.label}</Link>
        {secondary && <Link href={secondary.href} className="cherie-button-secondary min-h-11">{secondary.label}</Link>}
      </div>
    </section>
  );
}
