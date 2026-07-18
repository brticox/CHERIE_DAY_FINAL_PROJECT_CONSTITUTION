'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import {
  Check,
  LoaderCircle,
  LockKeyhole,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { prepareCheckoutAction } from '@/app/(site)/odeme/actions';
import { INITIAL_CHECKOUT_STATE } from '@/lib/validation/checkout';
import { formatTRY } from '@/lib/format';
import { Button } from '@/components/ui/button';
import type { ProviderReadiness } from '@/lib/payments';
import { checkoutTotal } from '@/lib/checkout/totals';

type Shipping = { id: string; name: string; base_price: number; type: string };
type Summary = { count: number; total: number; proofRequired: boolean };
type SavedAddress = {
  id: string;
  label: string | null;
  fullName: string;
  phone: string | null;
  city: string | null;
  district: string | null;
  neighborhood: string | null;
  addressLine: string | null;
  postalCode: string | null;
  isDefaultShipping: boolean;
};
const CHECKOUT_STEPS: { label: string; Icon: LucideIcon }[] = [
  { label: 'Teslimat', Icon: Truck },
  { label: 'Fatura', Icon: ReceiptText },
  { label: 'Onay', Icon: PackageCheck },
  { label: 'Ödeme', Icon: LockKeyhole },
];

export function CheckoutForm({
  shippingMethods,
  paymentProviders,
  savedAddresses = [],
  summary,
}: {
  shippingMethods: Shipping[];
  paymentProviders: ProviderReadiness[];
  savedAddresses?: SavedAddress[];
  summary: Summary;
}) {
  const [state, action, pending] = useActionState(
    prepareCheckoutAction,
    INITIAL_CHECKOUT_STATE,
  );
  const [invoiceType, setInvoiceType] = useState<'bireysel' | 'kurumsal'>('bireysel');
  const [selectedShippingId, setSelectedShippingId] = useState('');
  // Signed-in customers can pre-fill the delivery fields from a saved address.
  // The fields stay uncontrolled (the order still snapshots whatever is
  // submitted), so editing after selecting — or a one-time manual entry — works
  // exactly as before; picking an address just reseeds the defaults.
  const defaultAddressId =
    savedAddresses.find((address) => address.isDefaultShipping)?.id ?? '';
  const [selectedAddressId, setSelectedAddressId] = useState(defaultAddressId);
  const selectedAddress = savedAddresses.find(
    (address) => address.id === selectedAddressId,
  );
  const fieldValue = (key: keyof SavedAddress) =>
    (selectedAddress?.[key] as string | null | undefined) ?? '';
  const selectedShipping = shippingMethods.find(
    (method) => method.id === selectedShippingId,
  );
  const payable = checkoutTotal(
    summary.total,
    selectedShipping ? selectedShipping.base_price : null,
  );
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <form action={action} className="space-y-8">
        <div className="relative rounded-card-lg border border-cherie-lace bg-cherie-paper/55 p-4 sm:p-5">
          <span
            aria-hidden
            className="absolute left-[12.5%] right-[12.5%] top-[2.55rem] h-px bg-cherie-lace sm:top-[2.8rem]"
          />
          <ol className="relative grid grid-cols-4 gap-2" aria-label="Ödeme adımları">
            {CHECKOUT_STEPS.map(({ label, Icon }, index) => (
              <li key={label} className="relative text-center">
                <span
                  className={`relative mx-auto flex size-11 items-center justify-center rounded-full border-4 border-cherie-paper ${index < 3 ? 'bg-cherie-burgundy text-cherie-ivory' : 'bg-cherie-mist text-cherie-soft-ink'}`}
                >
                  <Icon />
                </span>
                <span className="mt-2 block text-xs text-cherie-soft-ink">{label}</span>
              </li>
            ))}
          </ol>
        </div>
        <Section
          title="Teslimat bilgileri"
          lead="Türkiye içindeki teslimat adresinizi girin."
        >
          {savedAddresses.length > 0 && (
            <div className="mb-5">
              <label
                htmlFor="saved-address"
                className="mb-2 block text-sm font-medium text-cherie-ink"
              >
                Kayıtlı adreslerimden seç
              </label>
              <select
                id="saved-address"
                value={selectedAddressId}
                onChange={(event) => setSelectedAddressId(event.target.value)}
                className="cherie-field"
              >
                <option value="">Yeni adres gir</option>
                {savedAddresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {(address.label?.trim() || address.fullName) +
                      (address.district ? ` — ${address.district}` : '')}
                  </option>
                ))}
              </select>
            </div>
          )}
          {/* Keyed so choosing a saved address reseeds these uncontrolled fields. */}
          <div key={selectedAddressId || 'manual'} className="grid gap-5 sm:grid-cols-2">
            <Field
              name="fullName"
              label="Ad Soyad"
              defaultValue={fieldValue('fullName')}
              error={state.fieldErrors?.fullName}
              autoComplete="name"
            />
            <Field
              name="phone"
              label="Telefon"
              type="tel"
              defaultValue={fieldValue('phone')}
              error={state.fieldErrors?.phone}
              autoComplete="tel"
            />
            <Field
              name="city"
              label="İl"
              defaultValue={fieldValue('city')}
              error={state.fieldErrors?.city}
              autoComplete="address-level1"
            />
            <Field
              name="district"
              label="İlçe"
              defaultValue={fieldValue('district')}
              error={state.fieldErrors?.district}
              autoComplete="address-level2"
            />
            <Field
              name="neighborhood"
              label="Mahalle"
              defaultValue={fieldValue('neighborhood')}
              autoComplete="address-level3"
            />
            <Field
              name="postalCode"
              label="Posta Kodu"
              defaultValue={fieldValue('postalCode')}
              inputMode="numeric"
              error={state.fieldErrors?.postalCode}
              autoComplete="postal-code"
            />
            <Field
              name="addressLine"
              label="Açık Adres"
              defaultValue={fieldValue('addressLine')}
              error={state.fieldErrors?.addressLine}
              autoComplete="street-address"
              className="sm:col-span-2"
            />
          </div>
          <fieldset className="mt-6">
            <legend className="text-sm font-semibold text-cherie-ink">
              Teslimat yöntemi
            </legend>
            <div className="mt-3 grid gap-3">
              {shippingMethods.map((method) => (
                <label
                  key={method.id}
                  className="flex min-h-16 cursor-pointer items-center gap-3 rounded-control border border-cherie-lace bg-cherie-ivory px-4 transition hover:border-cherie-brass has-[:checked]:border-cherie-burgundy has-[:checked]:bg-cherie-paper"
                >
                  <input
                    type="radio"
                    name="shippingMethodId"
                    value={method.id}
                    required
                    checked={selectedShippingId === method.id}
                    onChange={() => setSelectedShippingId(method.id)}
                    className="cherie-check"
                  />
                  <span className="flex-1 text-sm text-cherie-ink">{method.name}</span>
                  <span className="text-sm font-semibold">
                    {method.base_price ? formatTRY(method.base_price) : 'Ücretsiz'}
                  </span>
                </label>
              ))}
            </div>
            {state.fieldErrors?.shippingMethodId?.[0] && (
              <ErrorText text={state.fieldErrors.shippingMethodId[0]} />
            )}
          </fieldset>
        </Section>
        <Section
          title="Fatura bilgileri"
          lead="Faturanızı doğru hazırlayabilmemiz için bilgileri eksiksiz girin."
        >
          <div className="mb-5 flex gap-3">
            {(['bireysel', 'kurumsal'] as const).map((type) => (
              <label
                key={type}
                className="flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-control border border-cherie-lace bg-cherie-ivory text-sm transition hover:border-cherie-brass has-[:checked]:border-cherie-burgundy has-[:checked]:bg-cherie-paper has-[:checked]:font-semibold"
              >
                <input
                  type="radio"
                  name="invoiceType"
                  value={type}
                  checked={invoiceType === type}
                  onChange={() => setInvoiceType(type)}
                  className="cherie-check"
                />
                {type === 'bireysel' ? 'Bireysel' : 'Kurumsal'}
              </label>
            ))}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              name="invoiceName"
              label={
                invoiceType === 'bireysel' ? 'Fatura Adı Soyadı' : 'Yetkili Adı Soyadı'
              }
              error={state.fieldErrors?.invoiceName}
              className="sm:col-span-2"
            />
            {invoiceType === 'bireysel' ? (
              <Field
                name="identityNumber"
                label="T.C. Kimlik No (isteğe bağlı)"
                inputMode="numeric"
                error={state.fieldErrors?.identityNumber}
                className="sm:col-span-2"
              />
            ) : (
              <>
                <Field
                  name="companyTitle"
                  label="Şirket Unvanı"
                  error={state.fieldErrors?.companyTitle}
                  className="sm:col-span-2"
                />
                <Field
                  name="taxNumber"
                  label="Vergi Numarası"
                  inputMode="numeric"
                  error={state.fieldErrors?.taxNumber}
                />
                <Field
                  name="taxOffice"
                  label="Vergi Dairesi"
                  error={state.fieldErrors?.taxOffice}
                />
              </>
            )}
          </div>
        </Section>
        <Section title="Üretim ve yasal onaylar" lead="Güveniniz, bizim de değerimiz.">
          <div className="space-y-4">
            {summary.proofRequired && (
              <Consent
                name="proofAcknowledged"
                error={state.fieldErrors?.proofAcknowledged}
                label="Kişiselleştirilmiş ürünlerde üretimin Tasarım Onayımdan sonra başlayacağını anladım."
                href="/kurumsal/kisisellestirilmis-urun-sartlari"
              />
            )}
            <Consent
              name="kvkkConsent"
              error={state.fieldErrors?.kvkkConsent}
              label="KVKK Aydınlatma Metni’ni okudum."
              href="/kurumsal/kvkk-aydinlatma"
            />
            <Consent
              name="preInfoConsent"
              error={state.fieldErrors?.preInfoConsent}
              label="Ön Bilgilendirme Formu’nu okudum ve kabul ediyorum."
              href="/kurumsal/on-bilgilendirme"
            />
            <Consent
              name="distanceSalesConsent"
              error={state.fieldErrors?.distanceSalesConsent}
              label="Mesafeli Satış Sözleşmesi’ni okudum ve kabul ediyorum."
              href="/kurumsal/mesafeli-satis"
            />
          </div>
        </Section>
        <Section
          title="Ödeme sağlayıcısı"
          lead="Kart bilgilerinizi CHERIE DAY değil, seçtiğiniz lisanslı ödeme kuruluşu alır."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {paymentProviders.map((provider) => (
              <label
                key={provider.provider}
                className={`flex min-h-20 items-start gap-3 rounded-control border px-4 py-4 transition ${provider.configured ? 'cursor-pointer border-cherie-lace bg-cherie-ivory hover:border-cherie-brass has-[:checked]:border-cherie-burgundy has-[:checked]:bg-cherie-paper' : 'cursor-not-allowed border-cherie-lace/70 bg-cherie-mist/60 opacity-70'}`}
              >
                <input
                  type="radio"
                  name="paymentProvider"
                  value={provider.provider}
                  disabled={!provider.configured}
                  className="cherie-check mt-0.5"
                />
                <span>
                  <span className="block text-sm font-semibold text-cherie-ink">
                    {provider.label}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-cherie-soft-ink">
                    {provider.configured
                      ? provider.mode === 'live'
                        ? 'Canlı güvenli ödeme'
                        : 'Test / sandbox modu'
                      : provider.reason}
                  </span>
                </span>
              </label>
            ))}
          </div>
          {!paymentProviders.some((provider) => provider.configured) && (
            <p className="mt-4 rounded-control bg-cherie-warning/10 px-4 py-3 text-sm leading-6 text-cherie-soft-ink">
              Sağlayıcı anahtarları henüz bağlı değil. Sipariş özeti hazırlanabilir;
              karttan tutar çekilmez.
            </p>
          )}
        </Section>
        {state.status !== 'idle' && (
          <div
            role={state.status === 'error' ? 'alert' : 'status'}
            aria-live="polite"
            className={`rounded-control px-4 py-3 text-sm ${state.status === 'success' ? 'bg-cherie-success/10 text-cherie-success' : 'bg-cherie-error/10 text-cherie-error'}`}
          >
            {state.status === 'success' && <Check className="mr-2 inline" />}
            {state.message}
            {state.paymentUrl && (
              <a
                href={state.paymentUrl}
                className="mt-3 flex min-h-11 w-fit items-center rounded-control bg-cherie-burgundy px-5 font-semibold text-cherie-ivory"
              >
                Güvenli ödeme ekranına geç
              </a>
            )}
          </div>
        )}
        <Button
          type="submit"
          size="lg"
          disabled={pending || state.status === 'success'}
          className="w-full sm:w-auto"
        >
          {pending ? (
            <>
              <LoaderCircle className="animate-spin" /> Güvenli özet hazırlanıyor…
            </>
          ) : (
            <>
              <ShieldCheck /> Sipariş Özetini Hazırla
            </>
          )}
        </Button>
      </form>
      <aside className="cherie-surface h-fit rounded-card-lg p-6 lg:sticky lg:top-28">
        <p className="cherie-kicker">Sipariş Özeti</p>
        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between gap-4 text-cherie-soft-ink">
            <dt>Ara toplam · {summary.count} ürün</dt>
            <dd className="cherie-price font-medium text-cherie-ink">
              {formatTRY(payable.subtotal)}
            </dd>
          </div>
          <div className="flex justify-between gap-4 text-cherie-soft-ink">
            <dt>Teslimat</dt>
            <dd className="cherie-price font-medium text-cherie-ink">
              {payable.shipping == null
                ? 'Yöntem seçin'
                : payable.shipping === 0
                  ? 'Ücretsiz'
                  : formatTRY(payable.shipping)}
            </dd>
          </div>
        </dl>
        <div className="mt-5 flex items-end justify-between gap-4 border-t border-cherie-lace pt-5">
          <span className="font-semibold text-cherie-ink">Ödenecek toplam</span>
          <strong
            aria-live="polite"
            className="cherie-price text-right font-display text-3xl text-cherie-burgundy"
          >
            {payable.total == null ? '—' : formatTRY(payable.total)}
          </strong>
        </div>
        <div className="mt-6 space-y-3 border-t border-cherie-lace pt-5 text-xs leading-5 text-cherie-soft-ink">
          <p className="flex gap-2">
            <LockKeyhole className="mt-0.5 size-4 shrink-0" /> Fiyatlar sunucuda yeniden
            doğrulanır.
          </p>
          <p className="flex gap-2">
            <Truck className="mt-0.5 size-4 shrink-0" /> Yalnızca Türkiye içi teslimat.
          </p>
        </div>
        <p className="mt-6 rounded-control bg-cherie-mist px-4 py-3 text-xs leading-5 text-cherie-soft-ink">
          Canlı kart ödemesi henüz açılmadı. Bu adım ödeme çekmez; güvenli checkout
          kaydını hazırlar.
        </p>
      </aside>
    </div>
  );
}

function Section({
  title,
  lead,
  children,
}: {
  title: string;
  lead: string;
  children: React.ReactNode;
}) {
  return (
    <section className="cherie-surface rounded-card-lg p-5 sm:p-7">
      <h2 className="font-display text-3xl text-cherie-ink">{title}</h2>
      <p className="mt-1 text-sm text-cherie-soft-ink">{lead}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}
function Field({
  name,
  label,
  error,
  className,
  ...props
}: {
  name: string;
  label: string;
  error?: string[];
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = `checkout-${name}`;
  return (
    <label htmlFor={id} className={className}>
      <span className="mb-2 block text-sm font-medium text-cherie-ink">{label}</span>
      <input
        id={id}
        name={name}
        required={
          !label.includes('isteğe bağlı') &&
          name !== 'neighborhood' &&
          name !== 'postalCode'
        }
        className={`cherie-field ${error ? 'border-cherie-error' : ''}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error?.[0] && <ErrorText id={`${id}-error`} text={error[0]} />}
    </label>
  );
}
function Consent({
  name,
  label,
  href,
  error,
}: {
  name: string;
  label: string;
  href: string;
  error?: string[];
}) {
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-cherie-soft-ink">
        <input
          type="checkbox"
          name={name}
          required
          className="cherie-check mt-1 shrink-0"
        />
        <span>
          <Link
            href={href}
            target="_blank"
            className="font-medium text-cherie-burgundy underline"
          >
            {label}
          </Link>
        </span>
      </label>
      {error?.[0] && <ErrorText text={error[0]} />}
    </div>
  );
}
function ErrorText({ text, id }: { text: string; id?: string }) {
  return (
    <p id={id} className="mt-1 text-sm text-cherie-error">
      {text}
    </p>
  );
}
