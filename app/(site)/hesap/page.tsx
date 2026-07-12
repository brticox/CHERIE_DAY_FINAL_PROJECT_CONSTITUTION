import type { Metadata } from 'next';
import Link from 'next/link';
import { Bell, BookOpenCheck, CalendarDays, Headphones, LogOut, MapPin, Package, Sparkles } from 'lucide-react';

import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { Button } from '@/components/ui/button';
import { requireUser } from '@/lib/auth/guards';
import { ROUTES } from '@/lib/data/routes';
import { logoutAction } from './actions';

export const metadata: Metadata = { title: 'Hesabım', robots: { index: false, follow: false } };

const MODULES = [
  { title: 'Siparişlerim', description: 'Sipariş ve teslimat durumlarınızı izleyin.', href: '/hesap/siparisler', icon: Package },
  { title: 'Rezervasyonlarım', description: 'Hizmet tarihlerinizi ve süreçlerinizi görün.', href: '/hesap/rezervasyonlar', icon: CalendarDays },
  { title: 'Tasarım Onayları', description: 'Hazır tasarımları inceleyip yanıtlayın.', href: '/hesap/tasarim-onaylari', icon: BookOpenCheck },
  { title: 'Adreslerim', description: 'Teslimat ve fatura adreslerinizi yönetin.', href: '/hesap/adresler', icon: MapPin },
  { title: 'Bildirimler', description: 'Önemli güncellemeleri tek yerde takip edin.', href: '/hesap/bildirimler', icon: Bell },
  { title: 'Destek', description: 'CHERIE DAY ekibiyle güvenli biçimde yazışın.', href: '/hesap/destek', icon: Headphones },
] as const;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { user, customer } = await requireUser('/hesap');
  const params = await searchParams;
  const displayName = customer?.name || user.user_metadata.name || user.email?.split('@')[0] || 'CHERIE DAY Misafiri';

  return (
    <div className="cherie-container py-14">
      <Breadcrumbs items={[{ name: 'Ana Sayfa', path: ROUTES.home }, { name: 'Hesabım', path: ROUTES.hesap }]} />

      {params.error === 'staff_required' && (
        <div role="alert" className="mb-8 rounded-card border border-cherie-warning/40 bg-cherie-warning/10 px-5 py-4 text-sm text-cherie-soft-ink">
          Yönetim alanına erişim yetkiniz yok. Müşteri hesabınıza güvenle devam edebilirsiniz.
        </div>
      )}

      <section className="relative overflow-hidden rounded-card bg-cherie-velvet px-6 py-10 text-cherie-ivory shadow-card md:px-10">
        <div aria-hidden className="absolute -right-24 -top-24 size-72 rounded-full border border-cherie-brass/25" />
        <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-cherie-brass"><Sparkles className="size-3.5" /> Maison Hesabı</p>
            <h1 className="mt-4 font-display text-4xl text-cherie-ivory md:text-5xl">Hoş geldiniz, {displayName}</h1>
            <p className="mt-3 max-w-xl text-sm text-cherie-lace">Hikâyenizin sipariş, tasarım ve rezervasyon adımlarını burada bir arada tutuyoruz.</p>
          </div>
          <form action={logoutAction}>
            <Button type="submit" variant="secondary" className="border-cherie-ivory/40 text-cherie-ivory hover:bg-cherie-ivory/10">
              <LogOut className="size-4" /> Çıkış Yap
            </Button>
          </form>
        </div>
      </section>

      <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map(({ title, description, href, icon: Icon }) => (
          <Link key={href} href={href} className="group rounded-card border border-cherie-lace bg-cherie-ivory p-6 shadow-card transition-transform duration-card ease-cherie hover:-translate-y-1 hover:border-cherie-brass">
            <span className="grid size-11 place-items-center rounded-full bg-cherie-paper text-cherie-burgundy"><Icon className="size-5" /></span>
            <h2 className="mt-5 font-display text-2xl text-cherie-ink group-hover:text-cherie-burgundy">{title}</h2>
            <p className="mt-2 text-sm text-cherie-soft-ink">{description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
