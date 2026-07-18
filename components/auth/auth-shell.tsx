import Link from 'next/link';
import { ArrowLeft, Check, ShieldCheck, Sparkles } from 'lucide-react';

import { BrandLogo } from '@/components/layout/brand-logo';
import { ROUTES } from '@/lib/data/routes';

export function AuthShell({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden bg-cherie-paper">
      <div
        aria-hidden
        className="absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_12%_18%,rgba(176,138,87,0.18),transparent_28%),radial-gradient(circle_at_88%_82%,rgba(143,29,44,0.12),transparent_32%)]"
      />
      <div className="cherie-container relative grid min-h-[calc(100dvh-4rem)] items-stretch py-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-12">
        <aside className="relative hidden overflow-hidden rounded-l-card bg-cherie-velvet p-10 text-cherie-ivory lg:flex lg:flex-col lg:justify-between">
          <div
            aria-hidden
            className="absolute -right-24 -top-24 size-80 rounded-full border border-cherie-brass/20"
          />
          <div
            aria-hidden
            className="absolute -right-10 -top-10 size-56 rounded-full border border-cherie-brass/30"
          />
          <div
            aria-hidden
            className="absolute bottom-16 left-10 h-px w-3/4 rotate-[-8deg] bg-gradient-to-r from-transparent via-cherie-cherry to-transparent"
          />

          <div className="relative brightness-0 invert">
            <BrandLogo />
          </div>

          <div className="relative max-w-md">
            <p className="text-xs uppercase tracking-[0.28em] text-cherie-brass">
              Maison Hesabı
            </p>
            <h2 className="mt-5 font-display text-4xl leading-tight text-cherie-ivory">
              Hikâyenize kaldığınız yerden devam edin.
            </h2>
            <ul className="mt-8 space-y-4 text-sm text-cherie-lace">
              {[
                'Sipariş ve rezervasyonlarınızı tek yerde izleyin',
                'Tasarım onaylarını güvenle yönetin',
                'CHERIE DAY ekibiyle doğrudan iletişim kurun',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-cherie-brass/50">
                    <Check className="size-3 text-cherie-brass" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative flex items-center gap-3 text-xs text-cherie-lace/80">
            <ShieldCheck className="size-4 text-cherie-brass" />
            Supabase oturumu ve satır düzeyi güvenlikle korunur.
          </div>
        </aside>

        <main className="rounded-card-lg border border-cherie-lace bg-cherie-ivory/95 p-6 shadow-lift backdrop-blur-sm lg:rounded-l-none lg:p-12">
          <Link
            href={ROUTES.home}
            className="inline-flex min-h-11 min-w-11 items-center gap-2 text-sm text-cherie-soft-ink hover:text-cherie-burgundy"
          >
            <ArrowLeft className="size-4" /> Ana sayfaya dön
          </Link>
          <div className="mx-auto mt-10 max-w-lg">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cherie-brass">
              <Sparkles className="size-3.5" /> {eyebrow}
            </div>
            <h1 className="text-h1 mt-4 text-cherie-ink">{title}</h1>
            <p className="mt-4 text-lg leading-7 text-cherie-soft-ink">{lead}</p>
            <div className="mt-9">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
