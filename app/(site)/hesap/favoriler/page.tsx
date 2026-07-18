import type { Metadata } from 'next';

import { requireUser } from '@/lib/auth/guards';
import { getProducts } from '@/lib/data/catalog';
import { formatTRY } from '@/lib/format';
import { FAVORITE_ITEM_TYPE } from '@/lib/favorites/constants';
import { cartConfigured } from '@/lib/cart/server';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { ROUTES } from '@/lib/data/routes';
import {
  FavoritesGallery,
  type FavoriteProduct,
} from '@/components/commerce/favorites-gallery';

export const metadata: Metadata = {
  title: 'Seçtiklerim',
  robots: { index: false, follow: false },
};

export default async function Page() {
  const { supabase } = await requireUser('/hesap/favoriler');

  // Favorited product ids, newest first. RLS restricts rows to this customer.
  const { data } = await supabase
    .from('favorites')
    .select('item_id, created_at')
    .eq('item_type', FAVORITE_ITEM_TYPE)
    .order('created_at', { ascending: false });
  const favoriteIds = (data ?? []).map((row) => String(row.item_id));

  // Prices and availability always come from the live catalog, never from a
  // stored snapshot. Ids absent from the published catalog are unpublished or
  // deleted and are surfaced as a gentle "artık sunulmuyor" state.
  const catalog = favoriteIds.length ? await getProducts() : [];
  const byId = new Map(catalog.map((product) => [product.id, product]));

  const items: FavoriteProduct[] = [];
  const unavailableIds: string[] = [];
  for (const id of favoriteIds) {
    const product = byId.get(id);
    if (!product) {
      unavailableIds.push(id);
      continue;
    }
    items.push({
      id: product.id,
      name: product.name,
      slug: product.slug,
      departmentSlug: product.department_slug,
      priceLabel: formatTRY(product.base_price),
      mediaUrl: product.media?.[0]?.url ?? null,
      mediaAlt: product.media?.[0]?.alt_text ?? product.name,
      behaviorType: product.behavior_type,
      available: product.stock_mode !== 'unavailable',
    });
  }

  return (
    <div className="cherie-container py-14">
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'Hesabım', path: ROUTES.hesap },
          { name: 'Seçtiklerim', path: '/hesap/favoriler' },
        ]}
      />
      <PageHeader
        eyebrow="Hesabım"
        title="Seçtiklerim"
        lead="Beğenip bir kenara ayırdıklarınız. Karar vermeye hazır olduğunuzda hepsi burada, sizi bekliyor."
      />
      <div className="mt-10">
        <FavoritesGallery
          items={items}
          unavailableIds={unavailableIds}
          cartConfigured={cartConfigured()}
        />
      </div>
    </div>
  );
}
