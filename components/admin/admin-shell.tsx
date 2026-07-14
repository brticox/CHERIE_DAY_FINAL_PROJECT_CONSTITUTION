'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Banknote,
  Bell,
  Boxes,
  CalendarHeart,
  ChevronDown,
  Command,
  CornerDownLeft,
  FileText,
  LayoutDashboard,
  Megaphone,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Scale,
  Search,
  Settings,
  ShoppingBag,
  Users,
  X,
} from 'lucide-react';

import { ADMIN_NAVIGATION, type AdminNavGroup } from '@/lib/admin/navigation';
import { can, roleLabel } from '@/lib/admin/permissions';

type Props = { children: React.ReactNode; staff: { name: string; role: string } };
type PaletteItem = {
  key: string;
  label: string;
  hint?: string;
  href: string;
  group: string;
};
type IconType = React.ComponentType<{ className?: string }>;

const routePath = (href: string) => href.split('?')[0] ?? href;
const routeQuery = (href: string) => href.split('?')[1];
const GROUP_ORDER = ['Sayfalar', 'Siparişler', 'Ürünler', 'Müşteriler'];
const PRIMARY_ROUTES = new Set([
  '/admin/dashboard',
  '/admin/commerce/orders',
  '/admin/commerce/production',
  '/admin/commerce/products',
  '/admin/crm/leads',
]);

function matchesNavItem(href: string, pathname: string, query: string) {
  const base = routePath(href);
  const itemQuery = routeQuery(href);
  if (itemQuery) {
    return pathname === base && new URLSearchParams(itemQuery).toString() === query;
  }
  return (
    pathname === base || (href !== '/admin/dashboard' && pathname.startsWith(`${base}/`))
  );
}

// One restrained icon per top-level group — clarifies hierarchy without noise.
const GROUP_ICONS: Record<string, IconType> = {
  'Genel Bakış': LayoutDashboard,
  Siparişler: ShoppingBag,
  Katalog: Boxes,
  Hizmetler: CalendarHeart,
  'Müşteriler & CRM': Users,
  İçerik: FileText,
  'Ödemeler & Finans': Banknote,
  Hukuk: Scale,
  Pazarlama: Megaphone,
  Sistem: Settings,
};

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toLocaleUpperCase('tr') ?? '')
      .join('') || 'CD'
  );
}

export function AdminShell({ children, staff }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);
  const drawerTrigger = useRef<HTMLButtonElement>(null);
  const drawerPanel = useRef<HTMLElement>(null);
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

  useEffect(() => {
    if (!drawer) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      drawerPanel.current
        ?.querySelector<HTMLElement>(
          'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        ?.focus();
    });
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [drawer]);

  const env = process.env.NODE_ENV === 'production' ? 'Canlı' : 'Yerel';

  const sidebar = (drawerMode: boolean) => {
    const isCollapsed = collapsed && !drawerMode;
    return (
      <div className="flex h-full flex-col">
        {/* Brand header */}
        <div
          className={`flex h-24 shrink-0 items-center border-b border-white/15 ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'}`}
        >
          <Link
            href="/admin/dashboard"
            aria-label="CHERIE DAY yönetim paneli"
            className={
              isCollapsed
                ? 'grid size-12 place-items-center rounded-control focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cherie-brass'
                : 'relative flex h-14 w-40 items-center overflow-hidden rounded-control focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cherie-brass'
            }
          >
            {isCollapsed ? (
              <Image
                src="/brand/CDD.svg"
                alt=""
                width={72}
                height={48}
                priority
                className="h-9 w-auto max-w-none brightness-0 invert"
              />
            ) : (
              <Image
                src="/brand/logo.svg"
                alt=""
                width={192}
                height={128}
                priority
                className="absolute left-1/2 top-1/2 h-36 w-52 max-w-none -translate-x-1/2 -translate-y-1/2 brightness-0 invert"
              />
            )}
          </Link>
          {!isCollapsed && (
            <button
              className="grid size-11 place-items-center rounded-control text-cherie-lace transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cherie-brass"
              onClick={() => {
                if (drawerMode) {
                  setDrawer(false);
                  requestAnimationFrame(() => drawerTrigger.current?.focus());
                } else {
                  setCollapsed(true);
                }
              }}
              aria-label={drawerMode ? 'Menüyü kapat' : 'Menüyü daralt'}
            >
              {drawerMode ? (
                <X className="size-5" />
              ) : (
                <PanelLeftClose className="size-5" />
              )}
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav
          aria-label="Yönetim menüsü"
          className={`flex-1 space-y-1 overflow-y-auto py-5 ${isCollapsed ? 'px-2' : 'px-3'}`}
        >
          {isCollapsed && (
            <button
              onClick={() => setCollapsed(false)}
              aria-label="Menüyü genişlet"
              title="Menüyü genişlet"
              className="mb-3 grid h-11 w-full place-items-center rounded-control text-cherie-lace transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cherie-brass"
            >
              <PanelLeftOpen className="size-5" />
            </button>
          )}
          {groups.map((group, index) => (
            <NavGroup
              key={group.label}
              group={group}
              pathname={pathname}
              query={query}
              collapsed={isCollapsed}
              withSeparator={index > 0}
              initiallyOpen={
                index < 3 ||
                group.items.some((item) => pathname.startsWith(routePath(item.href)))
              }
              onNavigate={() => setDrawer(false)}
            />
          ))}
        </nav>

        {/* Pinned identity footer */}
        <div className="shrink-0 border-t border-white/15 p-3">
          {isCollapsed ? (
            <div
              className="flex flex-col items-center gap-2"
              title={`${staff.name} · ${roleLabel(staff.role)}`}
            >
              <span className="grid size-9 place-items-center rounded-full bg-cherie-brass/20 text-xs font-semibold text-cherie-brass">
                {initials(staff.name)}
              </span>
              <span
                className="size-2 rounded-full bg-cherie-warning"
                title={`Ortam: ${env}`}
                aria-label={`Ortam: ${env}`}
              />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-cherie-brass/20 text-sm font-semibold text-cherie-brass">
                {initials(staff.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{staff.name}</p>
                <p className="truncate text-xs font-medium leading-5 text-cherie-lace">
                  {roleLabel(staff.role)}
                </p>
              </div>
              <span className="rounded-full border border-cherie-warning/40 bg-cherie-warning/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cherie-warning">
                {env}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const breadcrumb = groups
    .flatMap((group) => group.items.map((item) => ({ ...item, group: group.label })))
    .sort(
      (a, b) => Number(Boolean(routeQuery(b.href))) - Number(Boolean(routeQuery(a.href))),
    )
    .find((item) => matchesNavItem(item.href, pathname, query));

  return (
    <div data-admin-root className="admin-root min-h-dvh bg-cherie-ivory text-cherie-ink">
      <a
        href="#admin-content"
        className="fixed left-3 top-3 z-[100] -translate-y-24 rounded-control bg-cherie-velvet px-4 py-3 text-sm text-white focus:translate-y-0"
      >
        Ana içeriğe geç
      </a>
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden bg-cherie-velvet shadow-lift md:block ${collapsed ? 'w-20' : 'w-72'}`}
      >
        {sidebar(false)}
      </aside>
      {drawer && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="Menü dışını kapat"
            className="absolute inset-0 bg-cherie-ink/55"
            onClick={() => setDrawer(false)}
          />
          <aside
            ref={drawerPanel}
            role="dialog"
            aria-modal="true"
            aria-label="Yönetim menüsü"
            className="relative h-full w-[min(88vw,320px)] bg-cherie-velvet shadow-lift"
          >
            {sidebar(true)}
          </aside>
        </div>
      )}
      <div className={collapsed ? 'md:pl-20' : 'md:pl-72'}>
        <header className="sticky top-0 z-30 flex min-h-20 items-center gap-3 border-b border-cherie-lace/80 bg-cherie-ivory/95 px-4 backdrop-blur md:px-7">
          <button
            ref={drawerTrigger}
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
            className="hidden h-11 min-w-64 items-center gap-3 rounded-control border border-cherie-lace bg-white/60 px-3 text-sm text-cherie-soft-ink shadow-sm transition-colors hover:border-cherie-brass lg:flex"
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
          <Link
            href="/admin/marketing/notifications"
            className="relative grid size-11 place-items-center rounded-control border border-cherie-lace bg-white/45 text-cherie-soft-ink hover:border-cherie-brass hover:bg-white hover:text-cherie-burgundy"
            aria-label="Bildirim merkezini aç"
          >
            <Bell className="size-5" />
          </Link>
          <div className="hidden min-w-0 border-l border-cherie-lace pl-3 xl:block">
            <p className="max-w-40 truncate text-sm font-semibold text-cherie-ink">
              {staff.name}
            </p>
            <p className="max-w-40 truncate text-xs text-cherie-soft-ink">
              {roleLabel(staff.role)}
            </p>
          </div>
        </header>
        <main
          id="admin-content"
          tabIndex={-1}
          className="admin-main min-h-[calc(100dvh-5rem)]"
        >
          {children}
        </main>
      </div>
      <CommandPalette open={palette} onClose={closePalette} navGroups={groups} />
    </div>
  );
}

function NavGroup({
  group,
  pathname,
  query,
  collapsed,
  initiallyOpen,
  withSeparator,
  onNavigate,
}: {
  group: AdminNavGroup;
  pathname: string;
  query: string;
  collapsed: boolean;
  initiallyOpen: boolean;
  withSeparator: boolean;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(initiallyOpen);
  const Icon = GROUP_ICONS[group.label] ?? LayoutDashboard;
  const groupActive = group.items.some((item) =>
    matchesNavItem(item.href, pathname, query),
  );
  const specificMatch = group.items.some(
    (item) =>
      Boolean(routeQuery(item.href)) && matchesNavItem(item.href, pathname, query),
  );

  if (collapsed) {
    return (
      <Link
        href={group.items[0]?.href ?? '/admin/dashboard'}
        onClick={onNavigate}
        title={group.label}
        aria-label={group.label}
        className={`grid h-12 w-full place-items-center rounded-control transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cherie-brass ${
          groupActive
            ? 'border-l-2 border-cherie-brass bg-white/10 text-cherie-brass'
            : 'border-l-2 border-transparent text-cherie-lace hover:bg-white/5 hover:text-white'
        }`}
      >
        <Icon className="size-5" />
      </Link>
    );
  }

  return (
    <section className={withSeparator ? 'mt-2 border-t border-white/15 pt-2' : ''}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 w-full items-center gap-2.5 rounded-control px-2.5 text-left text-[13px] font-bold uppercase leading-5 tracking-[.11em] text-cherie-brass transition-colors hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cherie-brass"
        aria-expanded={open}
      >
        <Icon className="size-4 shrink-0 opacity-90" />
        <span className="flex-1">{group.label}</span>
        <ChevronDown
          className={`size-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <ul className="mb-1.5 mt-1 space-y-1">
          {group.items.map((item, itemIndex) => {
            const active =
              matchesNavItem(item.href, pathname, query) &&
              (Boolean(routeQuery(item.href)) || !specificMatch);
            return (
              <li key={item.href}>
                <Link
                  onClick={onNavigate}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex min-h-10 items-center rounded-r-control border-l pl-4 pr-3 text-[15px] leading-5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cherie-brass ${
                    active
                      ? 'border-cherie-brass bg-white/10 font-semibold text-white'
                      : 'border-transparent text-cherie-lace hover:border-white/25 hover:bg-white/5 hover:text-white'
                  } ${PRIMARY_ROUTES.has(routePath(item.href)) || itemIndex === 0 ? 'font-semibold' : 'font-medium'}`}
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
        `${item.label} ${item.keywords?.join(' ') ?? ''}`
          .toLocaleLowerCase('tr')
          .includes(q),
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

  useEffect(() => {
    if (!open) {
      setQuery('');
      setEntities([]);
      setActive(0);
    } else {
      inputRef.current?.focus();
    }
  }, [open]);

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
      <button
        aria-label="Komut paletini kapat"
        className="absolute inset-0"
        onClick={onClose}
      />
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
        <div
          id="command-palette-list"
          ref={listRef}
          className="max-h-[55vh] overflow-y-auto p-2"
          role="listbox"
        >
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
                        <span className="shrink-0 text-xs text-cherie-soft-ink">
                          {item.hint}
                        </span>
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
