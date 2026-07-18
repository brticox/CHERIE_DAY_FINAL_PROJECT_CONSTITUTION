'use client';

import { useActionState, useEffect, useId, useState } from 'react';
import { Check, LoaderCircle, MapPin, Pencil, Plus, Trash2, X } from 'lucide-react';

import {
  createAddressAction,
  deleteAddressAction,
  updateAddressAction,
} from '@/app/(site)/hesap/adresler/actions';
import { INITIAL_ADDRESS_STATE } from '@/lib/validation/address';
import type { CustomerAddress } from '@/lib/addresses/server';
import { Button } from '@/components/ui/button';

type Mode = { kind: 'closed' } | { kind: 'new' } | { kind: 'edit'; address: CustomerAddress };

export function AddressBook({ addresses }: { addresses: CustomerAddress[] }) {
  const [mode, setMode] = useState<Mode>({ kind: 'closed' });

  return (
    <div className="space-y-6">
      {mode.kind === 'closed' && (
        <div className="flex justify-end">
          <Button type="button" onClick={() => setMode({ kind: 'new' })}>
            <Plus /> Yeni adres
          </Button>
        </div>
      )}

      {mode.kind !== 'closed' && (
        <AddressForm
          key={mode.kind === 'edit' ? mode.address.id : 'new'}
          address={mode.kind === 'edit' ? mode.address : null}
          onDone={() => setMode({ kind: 'closed' })}
        />
      )}

      {addresses.length === 0 && mode.kind === 'closed' ? (
        <div className="rounded-card-lg border border-cherie-lace bg-cherie-paper/50 px-6 py-14 text-center">
          <MapPin className="mx-auto size-6 text-cherie-brass" strokeWidth={1.6} />
          <h2 className="mt-3 font-display text-2xl text-cherie-ink">
            Henüz kayıtlı adresiniz yok
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-cherie-soft-ink">
            İlk adresinizi ekleyin; bir sonraki siparişinizde tek dokunuşla seçin.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={() => setMode({ kind: 'edit', address })}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function AddressCard({
  address,
  onEdit,
}: {
  address: CustomerAddress;
  onEdit: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  return (
    <li className="flex flex-col rounded-card-lg border border-cherie-lace bg-cherie-ivory p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg text-cherie-ink">
            {address.label?.trim() || address.fullName}
          </p>
          {address.label?.trim() && (
            <p className="text-sm text-cherie-soft-ink">{address.fullName}</p>
          )}
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          {address.isDefaultShipping && (
            <span className="rounded-full border border-cherie-brass/50 bg-cherie-paper px-2.5 py-0.5 text-[11px] font-semibold text-cherie-burgundy">
              Varsayılan teslimat
            </span>
          )}
          {address.isDefaultBilling && (
            <span className="rounded-full border border-cherie-lace bg-cherie-paper px-2.5 py-0.5 text-[11px] font-semibold text-cherie-soft-ink">
              Varsayılan fatura
            </span>
          )}
        </div>
      </div>
      <div className="mt-3 space-y-1 text-sm text-cherie-soft-ink">
        {address.phone && <p>{address.phone}</p>}
        <p>
          {[address.neighborhood, address.addressLine].filter(Boolean).join(' ')}
        </p>
        <p>
          {[address.district, address.city].filter(Boolean).join(' / ')}
          {address.postalCode ? ` · ${address.postalCode}` : ''}
        </p>
        {address.notes && (
          <p className="text-xs italic text-cherie-soft-ink">Not: {address.notes}</p>
        )}
      </div>
      <div className="mt-4 flex items-center gap-3 border-t border-cherie-lace/70 pt-4">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-cherie-burgundy hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <Pencil className="size-4" /> Düzenle
        </button>
        {confirming ? (
          <form action={deleteAddressAction} className="flex items-center gap-2">
            <input type="hidden" name="addressId" value={address.id} />
            <span className="text-xs text-cherie-soft-ink">Emin misiniz?</span>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-cherie-error hover:underline"
            >
              <Check className="size-4" /> Evet, sil
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="inline-flex min-h-11 items-center text-sm text-cherie-soft-ink hover:underline"
            >
              Vazgeç
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="ml-auto inline-flex min-h-11 items-center gap-1.5 text-sm text-cherie-soft-ink transition-colors hover:text-cherie-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <Trash2 className="size-4" /> Sil
          </button>
        )}
      </div>
    </li>
  );
}

function AddressForm({
  address,
  onDone,
}: {
  address: CustomerAddress | null;
  onDone: () => void;
}) {
  const isEdit = Boolean(address);
  const [state, action, pending] = useActionState(
    isEdit ? updateAddressAction : createAddressAction,
    INITIAL_ADDRESS_STATE,
  );

  useEffect(() => {
    if (state.status === 'success') onDone();
  }, [state.status, onDone]);

  return (
    <form
      action={action}
      className="rounded-card-lg border border-cherie-lace bg-cherie-ivory p-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-cherie-ink">
          {isEdit ? 'Adresi düzenle' : 'Yeni adres'}
        </h2>
        <button
          type="button"
          onClick={onDone}
          aria-label="Kapat"
          className="grid size-9 place-items-center rounded-full text-cherie-soft-ink hover:bg-cherie-paper"
        >
          <X className="size-4" />
        </button>
      </div>

      {isEdit && <input type="hidden" name="addressId" value={address!.id} />}

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Field name="label" label="Adres başlığı (örn. Ev, İş)" defaultValue={address?.label ?? ''} optional error={state.fieldErrors?.label} />
        <Field name="fullName" label="Ad Soyad" defaultValue={address?.fullName ?? ''} autoComplete="name" error={state.fieldErrors?.fullName} />
        <Field name="phone" label="Telefon" type="tel" defaultValue={address?.phone ?? ''} autoComplete="tel" error={state.fieldErrors?.phone} />
        <Field name="city" label="İl" defaultValue={address?.city ?? ''} autoComplete="address-level1" error={state.fieldErrors?.city} />
        <Field name="district" label="İlçe" defaultValue={address?.district ?? ''} autoComplete="address-level2" error={state.fieldErrors?.district} />
        <Field name="neighborhood" label="Mahalle" defaultValue={address?.neighborhood ?? ''} optional autoComplete="address-level3" error={state.fieldErrors?.neighborhood} />
        <Field name="postalCode" label="Posta Kodu" defaultValue={address?.postalCode ?? ''} optional inputMode="numeric" autoComplete="postal-code" error={state.fieldErrors?.postalCode} />
        <Field name="addressLine" label="Açık Adres" defaultValue={address?.addressLine ?? ''} autoComplete="street-address" className="sm:col-span-2" error={state.fieldErrors?.addressLine} />
        <Field name="notes" label="Teslimat notu" defaultValue={address?.notes ?? ''} optional className="sm:col-span-2" error={state.fieldErrors?.notes} />
      </div>

      <fieldset className="mt-5 flex flex-wrap gap-5">
        <Checkbox name="isDefaultShipping" label="Varsayılan teslimat adresi" defaultChecked={address?.isDefaultShipping ?? false} />
        <Checkbox name="isDefaultBilling" label="Varsayılan fatura adresi" defaultChecked={address?.isDefaultBilling ?? false} />
      </fieldset>

      {state.status === 'error' && state.message && (
        <p role="alert" className="mt-4 rounded-control bg-cherie-error/10 px-4 py-3 text-sm text-cherie-error">
          {state.message}
        </p>
      )}

      <div className="mt-6 flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? <LoaderCircle className="animate-spin" /> : <Check />}
          {isEdit ? 'Güncelle' : 'Kaydet'}
        </Button>
        <Button type="button" variant="secondary" onClick={onDone}>
          Vazgeç
        </Button>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  error,
  className,
  optional = false,
  ...props
}: {
  name: string;
  label: string;
  error?: string[];
  className?: string;
  optional?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <label htmlFor={id} className={className}>
      <span className="mb-2 block text-sm font-medium text-cherie-ink">{label}</span>
      <input
        id={id}
        name={name}
        required={!optional}
        className={`cherie-field ${error ? 'border-cherie-error' : ''}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error?.[0] && (
        <p id={`${id}-error`} className="mt-1 text-sm text-cherie-error">
          {error[0]}
        </p>
      )}
    </label>
  );
}

function Checkbox({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-cherie-ink">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="cherie-check" />
      {label}
    </label>
  );
}
