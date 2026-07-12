'use client';

import Link from 'next/link';
import { useState } from 'react';

import type { Product, ProductPersonalizationField } from '@/lib/data/types';
import { formatTRY } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { CheckCircle2, LoaderCircle, ShoppingBag } from 'lucide-react';

type Notice = { tone: 'success' | 'error'; message: string };

export function ProductOptions({
  product,
  intakePath,
  baseParams,
  primaryLabel,
}: {
  product: Product;
  intakePath: string;
  baseParams: string;
  primaryLabel: string;
}) {
  const [variantId, setVariantId] = useState(product.variants?.[0]?.id ?? '');
  const [quantity, setQuantity] = useState(product.price_tiers?.[0]?.min_qty ?? 1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [personalization, setPersonalization] = useState<
    Record<string, string | number | boolean>
  >({});
  const [uploadIds, setUploadIds] = useState<string[]>([]);
  const [notice, setNotice] = useState<Notice>();
  const [busy, setBusy] = useState(false);
  const variant = product.variants?.find((item) => item.id === variantId);
  const tier = [...(product.price_tiers ?? [])]
    .filter(
      (item) =>
        (!item.variant_id || item.variant_id === variantId) && item.min_qty <= quantity,
    )
    .sort((a, b) => b.min_qty - a.min_qty)[0];
  const unitPrice = tier?.unit_price ?? variant?.price ?? product.base_price;
  const addons = (product.addons ?? []).filter((addon) =>
    selectedAddons.includes(addon.id),
  );
  const estimatedTotal =
    unitPrice == null
      ? null
      : addons.reduce(
          (sum, addon) =>
            sum +
            (addon.price_type === 'percentage'
              ? unitPrice * quantity * (addon.price / 100)
              : addon.price),
          unitPrice * quantity,
        );
  const choiceSummary = [
    variant ? `Varyant: ${variant.title}` : null,
    `Adet: ${quantity}`,
    addons.length ? `Ekler: ${addons.map((addon) => addon.name_tr).join(', ')}` : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const href = `${intakePath}?${baseParams}&message=${encodeURIComponent(choiceSummary)}`;
  const disabled = product.stock_mode === 'unavailable';
  const cartEligible =
    product.behavior_type === 'cart_enabled' ||
    product.behavior_type === 'proof_required_cart';
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  async function uploadFile(file: File) {
    setBusy(true);
    setNotice(undefined);
    try {
      const form = new FormData();
      form.set('file', file);
      const response = await fetch('/api/cart/upload', { method: 'POST', body: form });
      const result = await response.json();
      if (!response.ok || !result.ok)
        throw new Error(result.message ?? 'Dosya yüklenemedi.');
      setUploadIds((current) => [...current, result.file.id]);
      setNotice({ tone: 'success', message: `${file.name} güvenle yüklendi.` });
    } catch (error) {
      setNotice({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Dosya yüklenemedi.',
      });
    } finally {
      setBusy(false);
    }
  }

  async function addToCart() {
    const missing = product.personalization_fields?.find((field) => {
      if (!field.required) return false;
      if (field.field_type === 'file') return uploadIds.length === 0;
      const value = personalization[field.id];
      return value === undefined || value === '' || value === false;
    });
    if (missing)
      return setNotice({ tone: 'error', message: `${missing.label} alanı zorunludur.` });
    setBusy(true);
    setNotice(undefined);
    try {
      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          variantId: variantId || null,
          quantity,
          personalization,
          addonIds: selectedAddons,
          uploadIds,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok)
        throw new Error(result.message ?? 'Ürün eklenemedi.');
      setNotice({ tone: 'success', message: 'Seçiminiz güvenle kaydedildi.' });
    } catch (error) {
      setNotice({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Ürün eklenemedi.',
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="cherie-surface mt-7 space-y-7 rounded-card-lg p-5 sm:p-6">
      <div>
        <p className="cherie-kicker">Seçiminizi oluşturun</p>
        <h2 className="mt-2 font-display text-2xl text-cherie-ink">
          Size özel ayrıntılar
        </h2>
        <p className="mt-1 text-sm leading-6 text-cherie-soft-ink">
          Seçenekleri belirleyin; toplamınız her adımda şeffafça güncellensin.
        </p>
      </div>
      {(product.variants?.length ?? 0) > 0 && (
        <VariantPicker product={product} variantId={variantId} onChange={setVariantId} />
      )}

      <label className="block">
        <span className="text-sm font-semibold text-cherie-ink">Adet</span>
        <input
          type="number"
          min={1}
          max={10000}
          value={quantity}
          onChange={(event) =>
            setQuantity(Math.min(10000, Math.max(1, Number(event.target.value) || 1)))
          }
          className="cherie-field mt-2 w-28"
        />
        {tier && (
          <span className="ml-3 text-xs text-cherie-success">
            {tier.min_qty}+ adet fiyatı uygulandı
          </span>
        )}
      </label>

      {(product.addons?.length ?? 0) > 0 && (
        <fieldset>
          <legend className="text-sm font-semibold text-cherie-ink">
            İsteğe bağlı dokunuşlar
          </legend>
          <div className="mt-3 space-y-2">
            {product.addons?.map((addon) => (
              <label
                key={addon.id}
                className="flex min-h-12 cursor-pointer items-center gap-3 rounded-control border border-transparent px-3 text-sm text-cherie-soft-ink transition hover:border-cherie-lace hover:bg-cherie-ivory"
              >
                <input
                  type="checkbox"
                  checked={selectedAddons.includes(addon.id)}
                  onChange={(event) =>
                    setSelectedAddons((current) =>
                      event.target.checked
                        ? [...current, addon.id]
                        : current.filter((id) => id !== addon.id),
                    )
                  }
                  className="cherie-check"
                />
                <span className="flex-1">{addon.name_tr}</span>
                <span>
                  +
                  {addon.price_type === 'percentage'
                    ? `%${addon.price}`
                    : formatTRY(addon.price)}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {(product.personalization_fields?.length ?? 0) > 0 && (
        <fieldset>
          <legend className="text-sm font-semibold text-cherie-ink">
            Size özel bilgiler
          </legend>
          <div className="mt-3 grid gap-4">
            {product.personalization_fields?.map((field) => (
              <PersonalizationInput
                key={field.id}
                field={field}
                busy={busy}
                onValue={(value) =>
                  setPersonalization((current) => ({ ...current, [field.id]: value }))
                }
                onFile={uploadFile}
              />
            ))}
          </div>
        </fieldset>
      )}

      <div className="border-t border-cherie-lace pt-5">
        {estimatedTotal != null && (
          <div className="mb-4 flex items-end justify-between gap-4">
            <span className="text-sm text-cherie-soft-ink">Tahmini toplam</span>
            <strong className="font-display text-2xl text-cherie-burgundy">
              {formatTRY(estimatedTotal)}
            </strong>
          </div>
        )}
        {disabled ? (
          <Unavailable />
        ) : cartEligible ? (
          configured ? (
            <Button
              type="button"
              size="lg"
              className="w-full"
              disabled={busy}
              onClick={() => void addToCart()}
            >
              {busy ? (
                <>
                  <LoaderCircle className="animate-spin" /> Kaydediliyor…
                </>
              ) : (
                <>
                  <ShoppingBag /> Seçimlerim’e Ekle
                </>
              )}
            </Button>
          ) : (
            <Unavailable message="Seçimlerim altyapısı yapılandırıldıktan sonra bu ürün eklenebilir." />
          )
        ) : (
          <Button asChild size="lg" className="w-full">
            <Link href={href}>{primaryLabel}</Link>
          </Button>
        )}
        {notice && (
          <div
            role="status"
            aria-live="polite"
            className={`mt-3 rounded-control px-3 py-2 text-sm ${notice.tone === 'success' ? 'bg-cherie-success/10 text-cherie-success' : 'bg-cherie-error/10 text-cherie-error'}`}
          >
            {notice.tone === 'success' && <CheckCircle2 className="mr-2 inline size-4" />}
            {notice.message}
            {notice.tone === 'success' && (
              <Link href="/secilimlerim" className="ml-2 font-semibold underline">
                Seçimlerimi aç
              </Link>
            )}
          </div>
        )}
        <p className="mt-3 text-xs leading-5 text-cherie-soft-ink">
          {cartEligible
            ? 'Fiyat, ürün eklenirken sunucuda yeniden doğrulanır. Ödeme bu aşamada alınmaz.'
            : 'Seçimleriniz talep formuna ön not olarak aktarılır. Kesin fiyat ve uygunluk ekip onayından sonra netleşir.'}
        </p>
      </div>
    </div>
  );
}

function VariantPicker({
  product,
  variantId,
  onChange,
}: {
  product: Product;
  variantId: string;
  onChange: (id: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-cherie-ink">Seçenek</legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {product.variants?.map((item) => (
          <label
            key={item.id}
            className="flex min-h-14 cursor-pointer items-center gap-3 rounded-control border border-cherie-lace bg-cherie-ivory px-4 py-3 text-sm transition hover:border-cherie-brass has-[:checked]:border-cherie-burgundy has-[:checked]:bg-cherie-paper"
          >
            <input
              type="radio"
              name="variant"
              value={item.id}
              checked={variantId === item.id}
              onChange={() => onChange(item.id)}
              className="cherie-check"
            />
            <span className="flex-1 text-cherie-ink">{item.title}</span>
            {item.price != null && (
              <span className="text-cherie-soft-ink">{formatTRY(item.price)}</span>
            )}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function PersonalizationInput({
  field,
  busy,
  onValue,
  onFile,
}: {
  field: ProductPersonalizationField;
  busy: boolean;
  onValue: (value: string | number | boolean) => void;
  onFile: (file: File) => Promise<void>;
}) {
  const inputClass = 'cherie-field';
  return (
    <label className="block text-sm text-cherie-ink">
      <span className="mb-2 block font-medium">
        {field.label}
        {field.required && <span className="ml-1 text-cherie-error">*</span>}
      </span>
      {field.field_type === 'textarea' ? (
        <textarea
          rows={3}
          maxLength={2000}
          onChange={(event) => onValue(event.target.value)}
          className={`${inputClass} h-auto py-3`}
        />
      ) : field.field_type === 'select' ? (
        <select onChange={(event) => onValue(event.target.value)} className={inputClass}>
          <option value="">Seçin</option>
          {(field.options ?? []).map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      ) : field.field_type === 'file' ? (
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void onFile(file);
          }}
          className="block w-full rounded-control border border-dashed border-cherie-brass bg-cherie-ivory px-3 py-3 text-sm file:mr-3 file:border-0 file:bg-cherie-paper file:px-3 file:py-2"
        />
      ) : field.field_type === 'checkbox' ? (
        <input
          type="checkbox"
          onChange={(event) => onValue(event.target.checked)}
          className="cherie-check"
        />
      ) : (
        <input
          type={
            field.field_type === 'date'
              ? 'date'
              : field.field_type === 'number'
                ? 'number'
                : 'text'
          }
          maxLength={field.field_type === 'text' ? 500 : undefined}
          onChange={(event) =>
            onValue(
              field.field_type === 'number'
                ? Number(event.target.value)
                : event.target.value,
            )
          }
          className={inputClass}
        />
      )}
      {field.helper_text && (
        <span className="mt-1 block text-xs text-cherie-soft-ink">
          {field.helper_text}
        </span>
      )}
    </label>
  );
}

function Unavailable({
  message = 'Bu seçim şu anda siparişe kapalı.',
}: {
  message?: string;
}) {
  return (
    <div className="rounded-control bg-cherie-mist px-4 py-3 text-sm text-cherie-soft-ink">
      {message}
    </div>
  );
}
