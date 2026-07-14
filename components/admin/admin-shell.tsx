'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  ChevronDown,
  Command,
  CornerDownLeft,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  X,
} from 'lucide-react';

import { ADMIN_NAVIGATION, type AdminNavGroup } from '@/lib/admin/navigation';
import { can, roleLabel } from '@/lib/admin/permissions';

type Props = { children: React.ReactNode; staff: { name: string; role: string } };
type PaletteItem = { key: string; label: string; hint?: string; href: string; group: string };
const routePath = (href: string) => href.split('?')[0] ?? href;
const GROUP_ORDER = ['Sayfalar', 'Siparişler', 'Ürünler', 'Müşteriler'];

export function AdminShell({ children, staff }: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);
  const paletteTrigger = useRef<HTMLElement | null>(null);
  const groups = useMemo(
    () => ADMIN_NAVIGATION.filter((group) => can(staff.role, group.capability)),
    [staff.role],
  );

  const openPalette = () => {
    paletteTrigger.current = (document.activeElement as HTMLElement) ?? null;
    setPalette(true);
  };
  const closePalette = () => {
    setPalette(false);
    // Return focus to whatever opened the palette (keyboard accessibility).
    paletteTrigger.current?.focus?.();
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        openPalette();
      }
      if (
        event.key === '/' &&
        !['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement).tagName)
      ) {
        event.preventDefault();
        openPalette();
      }
      if (event.key === 'Escape') setDrawer(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const nav = (
    <>
      <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
        {!collapsed && (
          <Link href="/admin/dashboard" className="font-display text-xl tracking-wide text-white">
            CHERIE DAY
          </Link>
        )}
        <button
          className="grid size-11 place-items-center rounded-control text-white/70 hover:bg-white/10 hover:text-white"
          onClick={() => {
            setCollapsed((v) => !v);
            setDrawer(false);
          }}
          aria-label={collapsed ? 'Menüyü genişlet' : 'Menüyü daralt'}
        >
          {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
        </button>
      </div>
      <nav aria-label="Yönetim menüsü" className="space-y-2 overflow-y-auto px-3 py-4">
        {groups.map((group, index) => (
          <NavGroup
            key={group.label}
            group={group}
            pathname={pathname}
            collapsed={collapsed}
            initiallyOpen={
              index < 3 || group.items.some((item) => pathname.startsWith(routePath(item.href)))
            }
            onNavigate={() => setDrawer(false)}
          />
        ))}
      </nav>
    </>
  );

  const breadcrumb = groups
    .flatMap((group) => group.items.map((item) => ({ ...item, group: group.label })))
    .find((item) => pathname.startsWith(routePath(item.href)));

  return (
    <div className="min-h-dvh bg-cherie-ivory text-cherie-ink">
      <a
        href="#admin-content"
        className="fixed left-3 top-3 z-[100] -translate-y-24 rounded-control bg-cherie-velvet px-4 py-3 text-sm text-white focus:translate-y-0"
      >
        Ana içeriğe geç
      </a>
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden flex-col bg-cherie-velvet shadow-lift transition-[width] duration-drawer ease-cherie md:flex ${collapsed ? 'w-20' : 'w-72'}`}
      >
        {nav}
      </aside>
      {drawer && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="Menüyü kapat"
            className="absolute inset-0 bg-cherie-ink/55"
            onClick={() => setDrawer(false)}
          />
          <aside className="relative flex h-full w-[min(88vw,320px)] flex-col bg-cherie-velvet">
            {nav}
          </aside>
        </div>
      )}
      <div
        className={`transition-[padding] duration-drawer ease-cherie ${collapsed ? 'md:pl-20' : 'md:pl-72'}`}
      >
        <header className="sticky top-0 z-30 flex min-h-20 items-center gap-3 border-b border-cherie-lace/80 bg-cherie-ivory/95 px-4 backdrop-blur md:px-7">
          <button
            onClick={() => setDrawer(true)}
            className="grid size-11 place-items-center rounded-control border border-cherie-lace md:hidden"
            aria-label="Yönetim menüsünü aç"
          >
            <Menu className="size-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs uppercase tracking-[.16em] text-cherie-brass">
              {breadcrumb?.group ?? 'Yönetim'}
            </p>
            <p className="truncate text-sm font-semibold">
              {breadcrumb?.label ?? 'Kontrol Merkezi'}
            </p>
          </div>
          <button
            onClick={openPalette}
            className="hidden h-11 min-w-64 items-center gap-3 rounded-control border border-cherie-lace bg-white/60 px-3 text-sm text-cherie-soft-ink shadow-sm lg:flex"
          >
            <Search className="size-4" />
            Komut veya kayıt ara
            <kbd className="ml-auto rounded border border-cherie-lace px-1.5 py-0.5 text-[11px]">
              ⌘K
            </kbd>
          </button>
          <button
            onClick={openPalette}
            className="grid size-11 place-items-center rounded-control border border-cherie-lace lg:hidden"
            aria-label="Komut paletini aç"
          >
            <Search className="size-5" />
          </button>
          <button
            className="relative grid size-11 place-items-center rounded-control border border-cherie-lace"
            aria-label="Operasyon bildirimleri"
          >
            <Bell className="size-5" />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-cherie-cherry" />
          </button>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold">{staff.name}</p>
            <p className="text-xs text-cherie-soft-ink">{roleLabel(staff.role)}</p>
          </div>
          <span className="rounded-full border border-cherie-warning/30 bg-cherie-warning/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-cherie-warning">
            {process.env.NODE_ENV === 'production' ? 'Canlı' : 'Yerel'}
          </span>
        </header>
        <main id="admin-content" tabIndex={-1} className="min-h-[calc(100dvh-5rem)]">
          {children}
        </main>
      </div>
      <CommandPalette open={palette} onClose={closePalette} navGroups={groups} />
    </div>
  );
}

function CommandPalette({
  open,
  onClose,
  navGroups,
}: {
  open: boolean;
  onClose: () => void;
  navGroups: AdminNavGroup[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [entities, setEntities] = useState<PaletteItem[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);

  const routeItems = useMemo<PaletteItem[]>(() => {
    const q = query.trim().toLocaleLowerCase('tr');
    return navGroups
      .flatMap((group) => group.items)
      .filter((item) =>
        `${item.label} ${item.keywords?.join(' ') ?? ''}`.toLocaleLowerCase('tr').includes(q),
      )
      .slice(0, q ? 8 : 6)
      .map((item) => ({
        key: `route:${item.href}`,
        label: item.label,
        href: item.href,
        group: 'Sayfalar',
      }));
  }, [navGroups, query]);

  const items = useMemo(() => [...routeItems, ...entities], [routeItems, entities]);

  // Reset transient state whenever the palette closes.
  useEffect(() => {
    if (!open) {
      setQuery('');
      setEntities([]);
      setActive(0);
    } else {
      inputRef.current?.focus();
    }
  }, [open]);

  // Debounced capability-aware entity search (orders / products / customers).
  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) {
      setEntities([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = (await res.json()) as { results?: PaletteItem[] };
          setEntities(data.results ?? []);
        }
      } catch {
        /* aborted or offline — keep route results only */
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query, open]);

  useEffect(() => {
    setActive((current) => (current >= items.length ? 0 : current));
  }, [items.length]);

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-idx="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  const go = (item: PaletteItem | undefined) => {
    if (!item) return;
    router.push(item.href);
    onClose();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((i) => Math.min(i + 1, items.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      go(items[active]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  };

  const visibleGroups = GROUP_ORDER.filter((g) => items.some((item) => item.group === g));

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center bg-cherie-ink/55 px-4 pt-[10vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Komut paleti"
    >
      <button aria-label="Komut paletini kapat" className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-card-lg border border-cherie-lace bg-cherie-ivory shadow-lift">
        <div className="flex items-center gap-3 border-b border-cherie-lace px-4">
          <Command className="size-5 text-cherie-brass" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-list"
            aria-activedescendant={items[active] ? `cmd-${active}` : undefined}
            placeholder="Sipariş no, ürün, müşteri veya sayfa ara…"
            className="h-14 min-w-0 flex-1 bg-transparent text-base outline-none"
          />
          {loading && <span className="text-xs text-cherie-soft-ink">Aranıyor…</span>}
          <button
            onClick={onClose}
            aria-label="Komut paletini kapat"
            className="grid size-10 place-items-center"
          >
            <X className="size-5" />
          </button>
        </div>
        <div id="command-palette-list" ref={listRef} className="max-h-[55vh] overflow-y-auto p-2" role="listbox">
          {items.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-cherie-soft-ink">
              {query.trim().length >= 2
                ? 'Eşleşen sayfa veya kayıt bulunamadı.'
                : 'Aramak için en az iki karakter yazın.'}
            </p>
          ) : (
            visibleGroups.map((groupName) => (
              <div key={groupName} className="mb-1">
                <p className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-[.14em] text-cherie-brass">
                  {groupName}
                </p>
                {items.map((item, index) =>
                  item.group !== groupName ? null : (
                    <button
                      key={item.key}
                      id={`cmd-${index}`}
                      data-idx={index}
                      role="option"
                      aria-selected={index === active}
                      onMouseEnter={() => setActive(index)}
                      onClick={() => go(item)}
                      className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-control px-3 text-left text-sm ${
                        index === active ? 'bg-cherie-paper' : ''
                      }`}
                    >
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {item.hint && (
                        <span className="shrink-0 text-xs text-cherie-soft-ink">{item.hint}</span>
                      )}
                      {index === active && (
                        <CornerDownLeft className="size-3.5 shrink-0 text-cherie-brass" />
                      )}
                    </button>
                  ),
                )}
              </div>
            ))
          )}
        </div>
        <div className="flex items-center gap-4 border-t border-cherie-lace px-4 py-2 text-[11px] text-cherie-soft-ink">
          <span>↑↓ gezin</span>
          <span>↵ aç</span>
          <span>Esc kapat</span>
        </div>
      </div>
    </div>
  );
}

function NavGroup({
  group,
  pathname,
  collapsed,
  initiallyOpen,
  onNavigate,
}: {
  group: (typeof ADMIN_NAVIGATION)[number];
  pathname: string;
  collapsed: boolean;
  initiallyOpen: boolean;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(initiallyOpen);
  if (collapsed) return <div className="mx-auto my-3 h-px w-8 bg-white/15" title={group.label} />;
  return (
    <section>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-10 w-full items-center justify-between rounded-control px-3 text-left text-[11px] font-bold uppercase tracking-[.15em] text-cherie-brass hover:bg-white/5"
        aria-expanded={open}
      >
        {group.label}
        <ChevronDown className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul className="space-y-0.5 pb-2">
          {group.items.map((item) => {
            const base = routePath(item.href);
            const active =
              pathname === base ||
              (item.href !== '/admin/dashboard' && pathname.startsWith(base + '/'));
            return (
              <li key={item.href}>
                <Link
                  onClick={onNavigate}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex min-h-10 items-center rounded-control border-l-2 px-3 text-sm transition-colors ${
                    active
                      ? 'border-cherie-brass bg-white/10 font-semibold text-white'
                      : 'border-transparent text-white/72 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
