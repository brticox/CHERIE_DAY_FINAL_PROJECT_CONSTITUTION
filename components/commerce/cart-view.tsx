'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  Trash2,
} from 'lucide-react';

import { formatTRY } from '@/lib/format';
import { Button } from '@/components/ui/button';

type CartItem = {
  id: string;
  quantity: number;
  unit_price_snapshot: number;
  total_price_snapshot: number;
  removed_at: string | null;
  requires_proof: boolean;
  product_snapshot: {
    name?: string;
    slug?: string;
    variant?: { title?: string } | null;
    production_time_days?: number | null;
  };
  personalization_json: Record<
    string,
    { label?: string; value?: string | number | boolean }
  >;
  selected_addons_json: { id: string; name: string; price: number; price_type: string }[];
  uploaded_file_ids: string[];
  price_breakdown_json: { addon_total?: number; tier_min_qty?: number | null };
};

export type Cart = { id: string | null; items: CartItem[]; count: number; total: number };

export function CartView({
  initialCart,
  configured,
}: {
  initialCart: Cart | null;
  configured: boolean;
}) {
  const [cart, setCart] = useState(initialCart);
  const [busyId, setBusyId] = useState<string>();
  const [notice, setNotice] = useState<string>();

  if (!configured)
    return (
      <State
        title="Seçimlerim şu anda kullanılamıyor"
        description="Supabase ve güvenli sunucu anahtarı yapılandırıldığında seçimleriniz bu cihazda ve hesabınızda saklanacaktır."
      />
    );
  if (!cart)
    return (
      <State
        title="Seçimleriniz yüklenemedi"
        description="Bağlantıyı kontrol edip sayfayı yeniden deneyin."
      />
    );
  const active = cart.items.filter((item) => !item.removed_at);
  const removed = cart.items.filter((item) => item.removed_at);

  async function refresh() {
    const response = await fetch('/api/cart', { cache: 'no-store' });
    const result = await response.json();
    if (!response.ok || !result.ok)
      throw new Error(result.message ?? 'Seçimleriniz yenilenemedi.');
    setCart(result.cart);
  }

  async function mutate(
    item: CartItem,
    method: 'PATCH' | 'DELETE',
    body?: Record<string, unknown>,
  ) {
    setBusyId(item.id);
    setNotice(undefined);
    try {
      const response = await fetch(`/api/cart/items/${item.id}`, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const result = await response.json();
      if (!response.ok || !result.ok)
        throw new Error(result.message ?? 'İşlem tamamlanamadı.');
      await refresh();
      setNotice(
        method === 'DELETE'
          ? 'Seçim kaldırıldı. Dilerseniz geri alabilirsiniz.'
          : 'Seçiminiz güncellendi.',
      );
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'İşlem tamamlanamadı.');
    } finally {
      setBusyId(undefined);
    }
  }

  if (active.length === 0 && removed.length === 0)
    return (
      <State
        title="Henüz bir seçiminiz yok"
        description="Beğendiğiniz ürünü kişiselleştirip burada saklayabilirsiniz."
        action
      />
    );

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-card-lg border border-cherie-lace bg-cherie-paper/55 px-5 py-4 text-xs text-cherie-soft-ink">
          <span className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-cherie-brass" /> Sunucu doğrulamalı fiyat
          </span>
          <span className="flex items-center gap-2">
            <BadgeCheck className="size-4 text-cherie-brass" /> Tasarım onayı güvencesi
          </span>
        </div>
        {notice && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-control border border-cherie-lace bg-cherie-paper px-4 py-3 text-sm text-cherie-soft-ink"
          >
            {notice}
          </div>
        )}
        {active.map((item) => (
          <CartLine
            key={item.id}
            item={item}
            busy={busyId === item.id}
            onQuantity={(quantity) => void mutate(item, 'PATCH', { quantity })}
            onRemove={() => void mutate(item, 'DELETE')}
          />
        ))}
        {removed.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-4 rounded-card border border-dashed border-cherie-lace bg-cherie-paper/40 px-5 py-4"
          >
            <div>
              <p className="font-medium text-cherie-ink">
                {item.product_snapshot.name ?? 'Ürün'}
              </p>
              <p className="text-xs text-cherie-soft-ink">Bu seçim kaldırıldı.</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={busyId === item.id}
              onClick={() => void mutate(item, 'PATCH', { restore: true })}
            >
              <RotateCcw /> Geri al
            </Button>
          </div>
        ))}
      </div>
      <aside className="cherie-surface h-fit rounded-card-lg p-6 lg:sticky lg:top-28">
        <p className="cherie-kicker">Seçimlerim özeti</p>
        <div className="mt-5 flex justify-between text-sm text-cherie-soft-ink">
          <span>{cart.count} ürün</span>
          <span>Ara toplam</span>
        </div>
        <div className="mt-2 flex items-end justify-between border-b border-cherie-lace pb-5">
          <span className="font-medium text-cherie-ink">Toplam</span>
          <strong className="cherie-price font-display text-3xl text-cherie-burgundy">
            {formatTRY(cart.total)}
          </strong>
        </div>
        <p className="mt-4 text-xs leading-5 text-cherie-soft-ink">
          Fiyatlar her değişiklikte sunucuda yeniden doğrulanır. Sonraki adımda teslimat,
          fatura ve yasal onaylarınızı tamamlarsınız.
        </p>
        <Button asChild className="mt-6 w-full" size="lg">
          <Link href="/odeme">
            Güvenli Checkout’a Geç <ArrowRight />
          </Link>
        </Button>
        <Link
          href="/magaza"
          className="mt-4 block text-center text-sm font-medium text-cherie-burgundy hover:underline"
        >
          Mağazaya dön
        </Link>
      </aside>
    </div>
  );
}

function CartLine({
  item,
  busy,
  onQuantity,
  onRemove,
}: {
  item: CartItem;
  busy: boolean;
  onQuantity: (quantity: number) => void;
  onRemove: () => void;
}) {
  const details = Object.values(item.personalization_json ?? {});
  return (
    <article
      className={`rounded-card-lg border border-cherie-lace bg-cherie-ivory p-5 shadow-sm transition sm:p-6 ${busy ? 'opacity-65' : ''}`}
      aria-busy={busy}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-cherie-brass">
            {item.requires_proof ? 'Tasarım onayı gerekli' : 'Ürün seçimi'}
          </p>
          <h2 className="mt-1 font-display text-2xl text-cherie-ink">
            {item.product_snapshot.name ?? 'Ürün'}
          </h2>
          {item.product_snapshot.variant?.title && (
            <p className="mt-1 text-sm text-cherie-soft-ink">
              {item.product_snapshot.variant.title}
            </p>
          )}
        </div>
        <strong className="cherie-price text-lg text-cherie-burgundy">
          {formatTRY(item.total_price_snapshot)}
        </strong>
      </div>
      <div className="mt-5 grid gap-4 border-t border-cherie-lace pt-5 sm:grid-cols-2">
        {details.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cherie-soft-ink">
              Kişiselleştirme
            </p>
            <dl className="mt-2 space-y-1 text-sm">
              {details.map((detail, index) => (
                <div key={`${detail.label}-${index}`} className="flex gap-2">
                  <dt className="text-cherie-soft-ink">{detail.label}:</dt>
                  <dd className="text-cherie-ink">{String(detail.value)}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
        {item.selected_addons_json?.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cherie-soft-ink">
              Ek seçimler
            </p>
            <ul className="mt-2 space-y-1 text-sm text-cherie-ink">
              {item.selected_addons_json.map((addon) => (
                <li key={addon.id}>{addon.name}</li>
              ))}
            </ul>
          </div>
        )}
        {item.uploaded_file_ids?.length > 0 && (
          <p className="text-sm text-cherie-success">
            {item.uploaded_file_ids.length} dosya güvenle bağlı
          </p>
        )}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex items-center rounded-control border border-cherie-lace">
          <button
            type="button"
            aria-label="Adedi azalt"
            disabled={busy || item.quantity <= 1}
            onClick={() => onQuantity(item.quantity - 1)}
            className="flex size-11 cursor-pointer items-center justify-center transition hover:bg-cherie-paper disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus />
          </button>
          <span className="min-w-12 text-center text-sm font-semibold" aria-live="polite">
            {item.quantity}
          </span>
          <button
            type="button"
            aria-label="Adedi artır"
            disabled={busy || item.quantity >= 10000}
            onClick={() => onQuantity(item.quantity + 1)}
            className="flex size-11 cursor-pointer items-center justify-center transition hover:bg-cherie-paper disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus />
          </button>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={onRemove}
          className="inline-flex min-h-11 items-center gap-2 text-sm text-cherie-soft-ink hover:text-cherie-error disabled:opacity-50"
        >
          <Trash2 /> Kaldır
        </button>
      </div>
    </article>
  );
}

function State({
  title,
  description,
  action = false,
}: {
  title: string;
  description: string;
  action?: boolean;
}) {
  return (
    <div className="rounded-card-lg border border-cherie-lace bg-cherie-paper/50 px-6 py-14 text-center">
      <h2 className="font-display text-3xl text-cherie-ink">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-cherie-soft-ink">
        {description}
      </p>
      {action && (
        <Button asChild className="mt-6">
          <Link href="/magaza">Mağazayı keşfet</Link>
        </Button>
      )}
    </div>
  );
}
