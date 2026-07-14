'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Bell, ChevronDown, Command, Menu, PanelLeftClose, PanelLeftOpen, Search, X } from 'lucide-react';

import { ADMIN_NAVIGATION } from '@/lib/admin/navigation';
import { can, roleLabel } from '@/lib/admin/permissions';

type Props = { children: React.ReactNode; staff: { name: string; role: string } };
const routePath = (href: string) => href.split('?')[0] ?? href;

export function AdminShell({ children, staff }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);
  const [query, setQuery] = useState('');
  const groups = useMemo(() => ADMIN_NAVIGATION.filter((group) => can(staff.role, group.capability)), [staff.role]);
  const commands = useMemo(() => groups.flatMap((group) => group.items).filter((item) => `${item.label} ${item.keywords?.join(' ') ?? ''}`.toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr'))).slice(0, 10), [groups, query]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setPalette(true); }
      if (event.key === '/' && !['INPUT','TEXTAREA'].includes((event.target as HTMLElement).tagName)) { event.preventDefault(); setPalette(true); }
      if (event.key === 'Escape') { setPalette(false); setDrawer(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const nav = (
    <>
      <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
        {!collapsed && <Link href="/admin/dashboard" className="font-display text-xl tracking-wide text-white">CHERIE DAY</Link>}
        <button className="grid size-11 place-items-center rounded-control text-white/70 hover:bg-white/10 hover:text-white" onClick={() => { setCollapsed((v) => !v); setDrawer(false); }} aria-label={collapsed ? 'Menüyü genişlet' : 'Menüyü daralt'}>
          {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
        </button>
      </div>
      <nav aria-label="Yönetim menüsü" className="space-y-2 overflow-y-auto px-3 py-4">
        {groups.map((group, index) => <NavGroup key={group.label} group={group} pathname={pathname} collapsed={collapsed} initiallyOpen={index < 3 || group.items.some((item) => pathname.startsWith(routePath(item.href)))} onNavigate={() => setDrawer(false)} />)}
      </nav>
    </>
  );

  const breadcrumb = groups.flatMap((group) => group.items.map((item) => ({ ...item, group: group.label }))).find((item) => pathname.startsWith(routePath(item.href)));
  return (
    <div className="min-h-dvh bg-cherie-ivory text-cherie-ink">
      <a href="#admin-content" className="fixed left-3 top-3 z-[100] -translate-y-24 rounded-control bg-cherie-velvet px-4 py-3 text-sm text-white focus:translate-y-0">Ana içeriğe geç</a>
      <aside className={`fixed inset-y-0 left-0 z-40 hidden flex-col bg-cherie-velvet shadow-lift transition-[width] duration-drawer ease-cherie md:flex ${collapsed ? 'w-20' : 'w-72'}`}>{nav}</aside>
      {drawer && <div className="fixed inset-0 z-50 md:hidden"><button aria-label="Menüyü kapat" className="absolute inset-0 bg-cherie-ink/55" onClick={() => setDrawer(false)} /><aside className="relative flex h-full w-[min(88vw,320px)] flex-col bg-cherie-velvet">{nav}</aside></div>}
      <div className={`transition-[padding] duration-drawer ease-cherie ${collapsed ? 'md:pl-20' : 'md:pl-72'}`}>
        <header className="sticky top-0 z-30 flex min-h-20 items-center gap-3 border-b border-cherie-lace/80 bg-cherie-ivory/95 px-4 backdrop-blur md:px-7">
          <button onClick={() => setDrawer(true)} className="grid size-11 place-items-center rounded-control border border-cherie-lace md:hidden" aria-label="Yönetim menüsünü aç"><Menu className="size-5" /></button>
          <div className="min-w-0 flex-1"><p className="truncate text-xs uppercase tracking-[.16em] text-cherie-brass">{breadcrumb?.group ?? 'Yönetim'}</p><p className="truncate text-sm font-semibold">{breadcrumb?.label ?? 'Kontrol Merkezi'}</p></div>
          <button onClick={() => setPalette(true)} className="hidden h-11 min-w-64 items-center gap-3 rounded-control border border-cherie-lace bg-white/60 px-3 text-sm text-cherie-soft-ink shadow-sm lg:flex"><Search className="size-4" />Komut veya kayıt ara <kbd className="ml-auto rounded border border-cherie-lace px-1.5 py-0.5 text-[11px]">⌘K</kbd></button>
          <button className="relative grid size-11 place-items-center rounded-control border border-cherie-lace" aria-label="Operasyon bildirimleri"><Bell className="size-5" /><span className="absolute right-2 top-2 size-2 rounded-full bg-cherie-cherry" /></button>
          <div className="hidden text-right sm:block"><p className="text-sm font-semibold">{staff.name}</p><p className="text-xs text-cherie-soft-ink">{roleLabel(staff.role)}</p></div>
          <span className="rounded-full border border-cherie-warning/30 bg-cherie-warning/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-cherie-warning">{process.env.NODE_ENV === 'production' ? 'Canlı' : 'Yerel'}</span>
        </header>
        <main id="admin-content" tabIndex={-1} className="min-h-[calc(100dvh-5rem)]">{children}</main>
      </div>
      {palette && <div className="fixed inset-0 z-[80] flex items-start justify-center bg-cherie-ink/55 px-4 pt-[10vh]" role="dialog" aria-modal="true" aria-label="Komut paleti"><div className="w-full max-w-2xl overflow-hidden rounded-card-lg border border-cherie-lace bg-cherie-ivory shadow-lift"><div className="flex items-center gap-3 border-b border-cherie-lace px-4"><Command className="size-5 text-cherie-brass"/><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Sipariş, ürün, lead veya sayfa ara…" className="h-14 min-w-0 flex-1 bg-transparent text-base outline-none"/><button onClick={() => setPalette(false)} aria-label="Komut paletini kapat" className="grid size-10 place-items-center"><X className="size-5"/></button></div><div className="max-h-[55vh] overflow-y-auto p-2">{commands.length ? commands.map((item) => <button key={item.href} onClick={() => { router.push(item.href); setPalette(false); setQuery(''); }} className="flex min-h-12 w-full items-center justify-between rounded-control px-3 text-left text-sm hover:bg-cherie-paper focus:bg-cherie-paper"><span>{item.label}</span><span className="text-xs text-cherie-soft-ink">Aç</span></button>) : <p className="px-4 py-10 text-center text-sm text-cherie-soft-ink">Bu komut için sonuç bulunamadı.</p>}</div></div></div>}
    </div>
  );
}

function NavGroup({ group, pathname, collapsed, initiallyOpen, onNavigate }: { group: (typeof ADMIN_NAVIGATION)[number]; pathname: string; collapsed: boolean; initiallyOpen: boolean; onNavigate: () => void }) {
  const [open, setOpen] = useState(initiallyOpen);
  if (collapsed) return <div className="mx-auto my-3 h-px w-8 bg-white/15" title={group.label} />;
  return <section><button onClick={() => setOpen((v) => !v)} className="flex min-h-10 w-full items-center justify-between rounded-control px-3 text-left text-[11px] font-bold uppercase tracking-[.15em] text-cherie-brass hover:bg-white/5" aria-expanded={open}>{group.label}<ChevronDown className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`}/></button>{open && <ul className="space-y-0.5 pb-2">{group.items.map((item) => { const base = routePath(item.href); const active = pathname === base || (item.href !== '/admin/dashboard' && pathname.startsWith(base + '/')); return <li key={item.href}><Link onClick={onNavigate} href={item.href} aria-current={active ? 'page' : undefined} className={`flex min-h-10 items-center rounded-control border-l-2 px-3 text-sm transition-colors ${active ? 'border-cherie-brass bg-white/10 font-semibold text-white' : 'border-transparent text-white/72 hover:bg-white/5 hover:text-white'}`}>{item.label}</Link></li>; })}</ul>}</section>;
}
