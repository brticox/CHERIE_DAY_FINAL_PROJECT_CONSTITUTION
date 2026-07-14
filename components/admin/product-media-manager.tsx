'use client';
/* eslint-disable @next/next/no-img-element -- Operator media URLs are validated upstream. */

import { useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, TriangleAlert, X } from 'lucide-react';

import { setProductMedia } from '@/app/admin/commerce/products/actions';

type Asset = { id: string; label: string; url: string | null; alt: string | null };

export function ProductMediaManager({
  productId,
  assets,
  initialIds,
}: {
  productId: string;
  assets: Asset[];
  initialIds: string[];
}) {
  const [ids, setIds] = useState(initialIds);
  const selected = ids
    .map((id) => assets.find((asset) => asset.id === id))
    .filter((asset): asset is Asset => Boolean(asset));
  const available = assets.filter((asset) => !ids.includes(asset.id));
  const missingAlt = selected.filter((asset) => !asset.alt?.trim()).length;
  const move = (index: number, delta: number) =>
    setIds((current) => {
      const next = [...current];
      const target = index + delta;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });

  return (
    <section id="medya" className="admin-surface scroll-mt-28 p-5 md:p-7">
      <div className="flex flex-col justify-between gap-4 border-b border-cherie-lace pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="admin-eyebrow">03 · Görsel anlatı</p>
          <h2 className="mt-1 font-display text-3xl text-cherie-ink">Ürün medyası</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-cherie-soft-ink">
            İlk görsel kapaktır. Sıralamayı ürün sayfasındaki anlatı akışına göre
            düzenleyin.
          </p>
        </div>
        <a href="/admin/media" className="cherie-button-secondary min-h-11 gap-2">
          <ImagePlus className="size-4" aria-hidden="true" />
          Medya kütüphanesini aç
        </a>
      </div>

      {missingAlt > 0 && (
        <p
          role="status"
          className="mt-5 flex items-center gap-2 rounded-control border border-cherie-warning/30 bg-cherie-warning/10 p-3 text-sm text-cherie-warning"
        >
          <TriangleAlert className="size-4" aria-hidden="true" />
          {missingAlt} görselde alternatif metin eksik. Yayın öncesinde medya
          kütüphanesinden tamamlayın.
        </p>
      )}

      <div className="mt-5 space-y-3">
        {selected.map((asset, index) => (
          <article
            key={asset.id}
            className="grid gap-4 rounded-card border border-cherie-lace bg-cherie-ivory p-3 sm:grid-cols-[5rem_1fr_auto] sm:items-center"
          >
            <div className="aspect-square overflow-hidden rounded-control bg-cherie-paper">
              {asset.url ? (
                <img src={asset.url} alt="" className="size-full object-cover" />
              ) : (
                <span className="grid size-full place-items-center text-xs text-cherie-soft-ink">
                  Önizleme yok
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-cherie-brass">
                {index === 0 ? 'Kapak görseli' : `${index + 1}. görsel`}
              </p>
              <strong className="mt-1 block truncate text-sm text-cherie-ink">
                {asset.label}
              </strong>
              <span
                className={`mt-1 block truncate text-xs ${asset.alt ? 'text-cherie-soft-ink' : 'font-semibold text-cherie-warning'}`}
              >
                {asset.alt || 'Alternatif metin eksik'}
              </span>
            </div>
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                aria-label={`${asset.label} görselini yukarı taşı`}
                onClick={() => move(index, -1)}
                disabled={index === 0}
                className="grid size-11 place-items-center rounded-control text-cherie-soft-ink hover:bg-cherie-paper hover:text-cherie-burgundy disabled:opacity-30"
              >
                <ArrowUp className="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label={`${asset.label} görselini aşağı taşı`}
                onClick={() => move(index, 1)}
                disabled={index === selected.length - 1}
                className="grid size-11 place-items-center rounded-control text-cherie-soft-ink hover:bg-cherie-paper hover:text-cherie-burgundy disabled:opacity-30"
              >
                <ArrowDown className="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label={`${asset.label} görselini üründen kaldır`}
                onClick={() =>
                  setIds((current) => current.filter((id) => id !== asset.id))
                }
                className="grid size-11 place-items-center rounded-control text-cherie-error hover:bg-cherie-error/10"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
        {selected.length === 0 && (
          <div className="rounded-card bg-cherie-paper/55 p-6 text-center">
            <ImagePlus className="mx-auto size-6 text-cherie-brass" aria-hidden="true" />
            <p className="mt-3 font-semibold text-cherie-ink">
              Ürün görseli henüz seçilmedi
            </p>
            <p className="mt-1 text-sm text-cherie-soft-ink">
              Yayın hazırlığı için kütüphaneden en az bir görsel ekleyin.
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-3 border-t border-cherie-lace pt-5 sm:grid-cols-[1fr_auto]">
        <select
          aria-label="Ürüne eklenecek medya"
          defaultValue=""
          onChange={(event) => {
            if (event.target.value) setIds((current) => [...current, event.target.value]);
            event.target.value = '';
          }}
          className="cherie-field"
        >
          <option value="">Kütüphaneden görsel ekle…</option>
          {available.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.label}
            </option>
          ))}
        </select>
        <form action={setProductMedia}>
          <input type="hidden" name="id" value={productId} />
          <input type="hidden" name="media_ids" value={ids.join(',')} />
          <button className="cherie-button-primary min-h-12 w-full">
            Medya sırasını kaydet
          </button>
        </form>
      </div>
    </section>
  );
}
