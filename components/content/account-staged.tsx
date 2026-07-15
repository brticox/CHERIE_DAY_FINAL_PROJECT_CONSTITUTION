import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';

import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { ROUTES } from '@/lib/data/routes';
import { HELP_EMAILS } from '@/lib/data/help';

export type AccountAction = { label: string; href: string };

/**
 * Honest, useful "staged" state for a customer-account workspace whose live
 * data binding is owned by the identity/DB agent (docs Phase 4H). It never
 * pretends to be finished: it explains the workspace's value, shows what will
 * appear here, offers a real next step, and routes support contextually. No
 * auth or database access happens here — presentation only.
 */
export function AccountStaged({
  title,
  lead,
  value,
  statusNote,
  actions,
  mailbox = 'support',
}: {
  title: string;
  lead: string;
  value: string[];
  statusNote: string;
  actions?: AccountAction[];
  mailbox?: keyof typeof HELP_EMAILS;
}) {
  const email = HELP_EMAILS[mailbox];
  return (
    <div className="cherie-container py-14">
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'Hesabım', path: ROUTES.hesap },
          { name: title, path: ROUTES.hesap },
        ]}
      />
      <PageHeader eyebrow="Hesabım" title={title} lead={lead} />

      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)]">
        <section className="rounded-card-lg border border-cherie-lace bg-cherie-ivory p-6 md:p-8">
          <h2 className="text-h3 text-cherie-ink">Burada neler olacak</h2>
          <ul className="mt-5 space-y-3">
            {value.map((v) => (
              <li key={v} className="flex items-start gap-3 text-sm text-cherie-soft-ink">
                <Check className="mt-0.5 size-4 shrink-0 text-cherie-brass" strokeWidth={2} />
                <span>{v}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 rounded-card border border-dashed border-cherie-lace bg-cherie-paper/50 px-4 py-3 text-sm text-cherie-soft-ink">
            {statusNote}
          </p>
        </section>

        <aside className="flex flex-col gap-4 rounded-card-lg border border-cherie-lace bg-cherie-paper/40 p-6">
          {actions && actions.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-cherie-ink">Bu arada</p>
              <ul className="mt-3 space-y-2">
                {actions.map((a) => (
                  <li key={a.href}>
                    <Link
                      href={a.href}
                      className="text-sm font-medium text-cherie-burgundy hover:underline"
                    >
                      {a.label} →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-auto border-t border-cherie-lace pt-4">
            <p className="text-sm text-cherie-soft-ink">
              Yardıma mı ihtiyacınız var?
            </p>
            <a
              href={`mailto:${email}`}
              className="mt-1 block text-sm font-medium text-cherie-burgundy hover:underline"
            >
              {email}
            </a>
          </div>
        </aside>
      </div>

      <Link
        href={ROUTES.hesap}
        className="mt-10 inline-flex items-center gap-1.5 text-sm font-medium text-cherie-soft-ink hover:text-cherie-burgundy"
      >
        <ArrowLeft className="size-4" /> Hesabıma dön
      </Link>
    </div>
  );
}
