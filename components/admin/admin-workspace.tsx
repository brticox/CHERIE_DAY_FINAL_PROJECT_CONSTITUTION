import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Info,
  Inbox,
  type LucideIcon,
} from 'lucide-react';
import {
  adminToneClass,
  adminValueLabel,
  adminValueTone,
  type AdminTone,
} from '@/lib/admin/presentation';

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
    <header className="flex flex-col justify-between gap-6 border-b border-cherie-lace pb-7 sm:flex-row sm:items-end">
      <div className="min-w-0">
        <p className="admin-eyebrow">{eyebrow}</p>
        <h1 className="admin-page-title mt-2 break-words">{title}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-cherie-soft-ink">
          {description}
        </p>
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
        {eyebrow && <p className="admin-eyebrow">{eyebrow}</p>}
        <h2 id={id} className="admin-section-title mt-1">
          {title}
        </h2>
        {description && (
          <AdminHelperText className="mt-2 max-w-3xl">{description}</AdminHelperText>
        )}
      </div>
      {meta}
    </div>
  );
}

export function AdminHelperText({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={`text-sm leading-6 text-cherie-soft-ink ${className}`}>{children}</p>
  );
}

export function AdminMetadata({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={`text-xs font-medium leading-5 text-cherie-soft-ink ${className}`}>
      {children}
    </p>
  );
}

export function AdminSegmentedControl({
  label,
  items,
}: {
  label: string;
  items: Array<{ label: string; href: string; active: boolean; count?: number }>;
}) {
  return (
    <nav
      aria-label={label}
      className="inline-flex rounded-control border border-cherie-lace bg-white/60 p-1"
    >
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
            <span className={item.active ? 'text-white/80' : 'text-cherie-soft-ink'}>
              {item.count}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}

export function AdminToolbar({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <section aria-label={label} className="admin-surface p-3 shadow-none">
      {children}
    </section>
  );
}

export function AdminEmptyState({
  title,
  description,
  primary,
  secondary,
  icon: Icon = Inbox,
}: {
  title: string;
  description: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  icon?: LucideIcon;
}) {
  return (
    <section className="admin-surface px-5 py-12 text-center shadow-none sm:px-8">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-cherie-paper text-cherie-burgundy">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h3 className="mt-4 font-display text-3xl leading-tight text-cherie-ink">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-cherie-soft-ink">
        {description}
      </p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link href={primary.href} className="cherie-button-primary min-h-11">
          {primary.label}
        </Link>
        {secondary && (
          <Link href={secondary.href} className="cherie-button-secondary min-h-11">
            {secondary.label}
          </Link>
        )}
      </div>
    </section>
  );
}

export function AdminStatus({
  value,
  label,
  tone,
  className = '',
}: {
  value?: string | null;
  label?: string;
  tone?: AdminTone;
  className?: string;
}) {
  const resolved = tone ?? adminValueTone(value);
  const Icon =
    resolved === 'success'
      ? CheckCircle2
      : resolved === 'danger' || resolved === 'warning'
        ? AlertTriangle
        : resolved === 'information'
          ? Info
          : CircleDashed;
  return (
    <span
      className={`inline-flex min-h-7 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${adminToneClass(resolved)} ${className}`}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      {label ?? adminValueLabel(value)}
    </span>
  );
}

export function AdminNotice({
  tone,
  title,
  children,
}: {
  tone: Exclude<AdminTone, 'neutral'>;
  title: string;
  children: ReactNode;
}) {
  const Icon =
    tone === 'success' ? CheckCircle2 : tone === 'information' ? Info : AlertTriangle;
  return (
    <section
      role={tone === 'danger' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-card border p-4 ${adminToneClass(tone)}`}
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div>
        <p className="text-sm font-bold">{title}</p>
        <div className="mt-1 text-sm leading-6">{children}</div>
      </div>
    </section>
  );
}

export function AdminSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div
      aria-label="İçerik yükleniyor"
      role="status"
      className="admin-surface overflow-hidden p-5"
    >
      <span className="sr-only">İçerik yükleniyor.</span>
      <div className="h-5 w-40 animate-pulse rounded-control bg-cherie-paper" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="h-12 animate-pulse rounded-control bg-cherie-paper/75"
          />
        ))}
      </div>
    </div>
  );
}
