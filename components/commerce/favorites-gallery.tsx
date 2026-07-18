'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowUpRight, ShoppingBag, Trash2 } from 'lucide-react';

import { ROUTES } from '@/lib/data/routes';
import { Button } from '@/components/ui/button';
import { MediaFrame } from './media-frame';
import { useFavorites } from './favorites-provider';

export type FavoriteProduct = {
  id: string;
  name: string;
  slug: string;
  departmentSlug: string;
  priceLabel: string | null;
  mediaUrl: string | null;
  mediaAlt: string | null;
  behaviorType: string;
  available: boolean;
};

const CART_BEHAVIORS = new Set(['cart_enabled', 'proof_required_cart']);

export function FavoritesGallery({
  items,
  unavailableIds,
  cartConfigured,
}: {
  items: FavoriteProduct[];
  unavailableIds: string[];
  cartConfigured: boolean;
}) {
  const { toggle } = useFavorites();
  const [visible, setVisible] = useState(items);
  const [orphans, setOrphans] = useState(unavailableIds);
  const [busyId, setBusyId] = useState<string>();
  const [notice, setNotice] = useState<string>();

  async function remove(id: string) {
    setBusyId(id);
    setNotice(undefined);
    const result = await toggle(id);
    if (result.ok && !result.saved) {
      setVisible((prev) => prev.filter((item) => item.id !== id));
      setOrphans((prev) => prev.filter((orphan) => orphan !== id));
      setNotice('Seçtiklerinizden çıkarıldı.');
    } else if (!result.ok) {
      setNotice(result.message ?? 'Çıkarılamadı. Tekrar deneyin.');
    }
    setBusyId(undefined);
  }

  async function addToCart(item: FavoriteProduct) {
    setBusyId(item.id);
    setNotice(undefined);
    try {
      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: item.id, quantity: 1 }),
      });
      const result = (await response.json()) as { ok?: boolean; message?: string };
      if (response.ok && result.ok) {
        setNotice('Seçimlerim’e eklendi.');
      } else {
        // Configurable products (variant / personalization / quote) need the PDP.
        setNotice(result.message ?? 'Bu ürün için ürün sayfasından devam edin.');
      }
    } catch {
      setNotice('Bağlantı hatası. Tekrar deneyin.');
    } finally {
      setBusyId(undefined);
    }
  }

  if (visible.length === 0 && orphans.length === 0) {
    return (
      <div className="rounded-card-lg border border-cherie-lace bg-cherie-paper/50 px-6 py-16 text-center">
        <h2 className="font-display text-3xl text-cherie-ink">
          Seçtikleriniz henüz boş
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-cherie-soft-ink">
          Bir koleksiyonda gönlünüze dokunan ilk parçayı işaretleyin; hikâyeniz burada,
          sizin ritminizde şekillensin.
        </p>
        <Button asChild className="mt-6">
          <Link href={ROUTES.magaza}>Mağazayı keşfedin</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {notice && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-control border border-cherie-lace bg-cherie-paper px-4 py-3 text-sm text-cherie-soft-ink"
        >
          {notice}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item) => {
          const href = `${ROUTES.magaza}/${item.departmentSlug}/${item.slug}`;
          const canAddToCart = cartConfigured && item.available && CART_BEHAVIORS.has(item.behaviorType);
          const busy = busyId === item.id;
          return (
            <article
              key={item.id}
              className={`group flex flex-col overflow-hidden rounded-card-lg border border-cherie-lace bg-cherie-ivory ${busy ? 'opacity-70' : ''}`}
              aria-busy={busy}
            >
              <Link
                href={href}
                className="relative block overflow-hidden rounded-t-card-lg bg-cherie-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                <MediaFrame
                  label={item.name}
                  src={item.mediaUrl ?? undefined}
                  alt={item.mediaAlt ?? item.name}
                  className="border-0 transition duration-card ease-cherie group-hover:scale-[1.015]"
                />
                {!item.available && (
                  <span className="absolute left-3 top-3 rounded-full bg-cherie-ink/80 px-3 py-1 text-xs text-cherie-ivory">
                    Şu an sunulmuyor
                  </span>
                )}
              </Link>
              <div className="flex flex-1 flex-col p-5">
                <Link
                  href={href}
                  className="font-display text-lg text-cherie-ink hover:text-cherie-burgundy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  {item.name}
                </Link>
                <p className="cherie-price mt-2 text-sm font-bold text-cherie-burgundy">
                  {item.priceLabel ?? 'Teklif ile'}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-cherie-lace/70 pt-4">
                  {canAddToCart ? (
                    <Button
                      type="button"
                      size="sm"
                      disabled={busy}
                      onClick={() => void addToCart(item)}
                    >
                      <ShoppingBag /> Seçimlerime ekle
                    </Button>
                  ) : (
                    <Button asChild size="sm" variant="secondary">
                      <Link href={href}>
                        Ürüne git <ArrowUpRight />
                      </Link>
                    </Button>
                  )}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void remove(item.id)}
                    className="inline-flex min-h-11 items-center gap-1.5 text-sm text-cherie-soft-ink transition-colors hover:text-cherie-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
                    aria-label={`Seçtiklerimden çıkar: ${item.name}`}
                  >
                    <Trash2 className="size-4" /> Çıkar
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {orphans.length > 0 && (
        <section className="rounded-card-lg border border-dashed border-cherie-lace bg-cherie-paper/40 p-6">
          <h2 className="font-display text-xl text-cherie-ink">Artık sunulmayan parçalar</h2>
          <p className="mt-2 text-sm text-cherie-soft-ink">
            Bu {orphans.length} parça şu anda koleksiyonumuzda yer almıyor. Dilerseniz
            seçtiklerinizden çıkarabilirsiniz.
          </p>
          <ul className="mt-4 space-y-2">
            {orphans.map((id) => (
              <li key={id} className="flex items-center justify-between gap-4">
                <span className="text-sm text-cherie-soft-ink">Sunulmayan ürün</span>
                <button
                  type="button"
                  disabled={busyId === id}
                  onClick={() => void remove(id)}
                  className="inline-flex min-h-11 items-center gap-1.5 text-sm text-cherie-soft-ink transition-colors hover:text-cherie-error disabled:opacity-50"
                >
                  <Trash2 className="size-4" /> Çıkar
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
