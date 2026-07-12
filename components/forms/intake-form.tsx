'use client';

import Link from 'next/link';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { ROUTES } from '@/lib/data/routes';
import {
  intakeSchema,
  type IntakePayload,
  type IntakeSourceContext,
  type IntakeType,
} from '@/lib/validation/intake';
import { Button } from '@/components/ui/button';

const MODULES = [
  ['products', 'Ürünler'],
  ['services', 'Organizasyon & Hizmet'],
  ['digital', 'Dijital Davetiye'],
  ['memory', 'Fotoğraf & Film'],
  ['planning', 'Planlama'],
] as const;

const EVENT_TYPES = [
  'Düğün',
  'Nişan & Söz',
  'İsteme',
  'Kına',
  'Nikah',
  'Doğum Günü',
  'Baby Shower',
  'Kurumsal',
  'Diğer',
] as const;

const FORM_COPY: Record<IntakeType, { submit: string; success: string }> = {
  contact: { submit: 'Mesajı Gönder', success: 'Mesajınız alındı.' },
  quote: { submit: 'Teklif Talebini Gönder', success: 'Teklif talebiniz alındı.' },
  dream: { submit: 'Hayalimi Paylaş', success: 'Hayaliniz bize ulaştı.' },
  appointment: {
    submit: 'Randevu Talebini Gönder',
    success: 'Randevu talebiniz alındı.',
  },
};

type ApiResult = {
  ok?: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export function IntakeForm({
  type,
  source = {},
  initialMessage,
}: {
  type: IntakeType;
  source?: IntakeSourceContext;
  initialMessage?: string;
}) {
  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  const [serverState, setServerState] = useState<
    { tone: 'success' | 'error'; message: string } | undefined
  >();
  const copy = FORM_COPY[type];
  const contextualInquiryType =
    type === 'appointment'
      ? source.sourceLabel
      : source.sourceEntityType === 'product'
        ? 'product'
        : source.sourceEntityType === 'service'
          ? 'service'
          : 'general';

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<IntakePayload>({
    resolver: zodResolver(intakeSchema),
    defaultValues: {
      intakeType: type,
      inquiryType: contextualInquiryType,
      neededModules: [],
      consent: false,
      preferredChannel: 'phone',
      message: initialMessage,
      ...source,
    },
  });

  async function onSubmit(values: IntakePayload) {
    setServerState(undefined);
    try {
      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, ...source, intakeType: type }),
      });
      const result = (await response.json().catch(() => ({}))) as ApiResult;

      if (!response.ok || !result.ok) {
        if (result.fieldErrors) {
          for (const [field, messages] of Object.entries(result.fieldErrors)) {
            const message = messages?.[0];
            if (message)
              setError(field as keyof IntakePayload, { type: 'server', message });
          }
        }
        setServerState({
          tone: 'error',
          message: result.message ?? 'Bir şeyler ters gitti. Lütfen tekrar deneyin.',
        });
        return;
      }

      setServerState({ tone: 'success', message: result.message ?? copy.success });
      reset({
        intakeType: type,
        inquiryType: contextualInquiryType,
        neededModules: [],
        consent: false,
        preferredChannel: 'phone',
        message: initialMessage,
        ...source,
      });
    } catch {
      setServerState({
        tone: 'error',
        message:
          'Bağlantınız kesildi. İnternet bağlantınızı kontrol edip tekrar deneyin.',
      });
    }
  }

  const isQuoteLike = type === 'quote' || type === 'dream';

  if (!isConfigured) {
    return (
      <div
        role="status"
        className="rounded-card border border-cherie-warning/40 bg-cherie-warning/10 px-5 py-4"
      >
        <p className="font-medium text-cherie-ink">
          Talep sistemi şu anda kullanılamıyor.
        </p>
        <p className="mt-1 text-sm text-cherie-soft-ink">
          İletişim altyapısı yapılandırıldıktan sonra bu form güvenli biçimde kullanıma
          açılacaktır.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-6 [&>fieldset]:rounded-card-lg [&>fieldset]:border [&>fieldset]:border-cherie-lace [&>fieldset]:bg-cherie-ivory/75 [&>fieldset]:p-5 [&>fieldset]:shadow-sm sm:[&>fieldset]:p-7"
    >
      {source.sourceLabel && (
        <div className="rounded-card border border-cherie-lace bg-cherie-paper/50 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.16em] text-cherie-brass">
            İlgilendiğiniz seçim
          </p>
          <p className="mt-1 font-medium text-cherie-ink">{source.sourceLabel}</p>
        </div>
      )}

      <input type="hidden" {...register('intakeType')} value={type} />
      <div
        className="pointer-events-none absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
        aria-hidden="true"
      >
        <label htmlFor={`${type}-company`}>Şirket</label>
        <input
          id={`${type}-company`}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register('company')}
        />
      </div>

      <fieldset>
        <legend className="font-display text-2xl text-cherie-ink">
          İletişim Bilgileriniz
        </legend>
        <p className="mt-1 text-sm text-cherie-soft-ink">
          Size dönebilmemiz için e-posta veya telefon bilgilerinden en az birini paylaşın.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field
            label="Ad Soyad"
            error={errors.name?.message}
            required
            className="sm:col-span-2"
          >
            <input
              type="text"
              autoComplete="name"
              {...register('name')}
              className={inputClass(Boolean(errors.name))}
            />
          </Field>
          <Field label="E-posta" error={errors.email?.message}>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              {...register('email')}
              className={inputClass(Boolean(errors.email))}
            />
          </Field>
          <Field label="Telefon" error={errors.phone?.message}>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="5xx xxx xx xx"
              {...register('phone')}
              className={inputClass(Boolean(errors.phone))}
            />
          </Field>
        </div>
      </fieldset>

      {type === 'contact' && (
        <Field label="Konu" error={errors.inquiryType?.message}>
          <select
            {...register('inquiryType')}
            className={inputClass(Boolean(errors.inquiryType))}
          >
            <option value="general">Genel Bilgi</option>
            <option value="product">Ürün</option>
            <option value="service">Hizmet</option>
            <option value="press">Basın</option>
            <option value="partnership">İş Birliği</option>
            <option value="other">Diğer</option>
          </select>
        </Field>
      )}

      {isQuoteLike && (
        <fieldset>
          <legend className="font-display text-2xl text-cherie-ink">Kutlamanız</legend>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Kutlama Türü" error={errors.eventType?.message} required>
              <select
                {...register('eventType')}
                className={inputClass(Boolean(errors.eventType))}
              >
                <option value="">Seçin</option>
                {EVENT_TYPES.map((event) => (
                  <option key={event}>{event}</option>
                ))}
              </select>
            </Field>
            <Field label="Tarih veya Sezon" error={errors.eventDateOrSeason?.message}>
              <input
                type="text"
                placeholder="Örn. Eylül 2026"
                {...register('eventDateOrSeason')}
                className={inputClass(Boolean(errors.eventDateOrSeason))}
              />
            </Field>
            <Field label="Şehir / Mekân" error={errors.location?.message}>
              <input
                type="text"
                {...register('location')}
                className={inputClass(Boolean(errors.location))}
              />
            </Field>
            <Field label="Davetli Sayısı" error={errors.guestCountBand?.message}>
              <select
                {...register('guestCountBand')}
                className={inputClass(Boolean(errors.guestCountBand))}
              >
                <option value="">Seçin</option>
                <option value="0-25">0–25</option>
                <option value="26-75">26–75</option>
                <option value="76-150">76–150</option>
                <option value="151-300">151–300</option>
                <option value="300+">300+</option>
              </select>
            </Field>
            <Field label="Bütçe Yaklaşımı" error={errors.budgetBand?.message}>
              <select
                {...register('budgetBand')}
                className={inputClass(Boolean(errors.budgetBand))}
              >
                <option value="">Belirtmek istemiyorum</option>
                <option value="starter">Başlangıç</option>
                <option value="premium">Özenli Seçim</option>
                <option value="luxury">Kapsamlı</option>
                <option value="bespoke">Tamamen Size Özel</option>
              </select>
            </Field>
            {type === 'dream' && (
              <>
                <Field label="Renk / Atmosfer" error={errors.mood?.message}>
                  <input
                    type="text"
                    placeholder="Örn. bordo, mum ışığı, sade"
                    {...register('mood')}
                    className={inputClass(Boolean(errors.mood))}
                  />
                </Field>
                <Field
                  label="Koleksiyon İlhamı"
                  error={errors.collection?.message}
                  className="sm:col-span-2"
                >
                  <input
                    type="text"
                    {...register('collection')}
                    className={inputClass(Boolean(errors.collection))}
                  />
                </Field>
              </>
            )}
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium text-cherie-ink">
              Hangi alanlarda destek arıyorsunuz?
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {MODULES.map(([value, label]) => (
                <label
                  key={value}
                  className="flex min-h-12 cursor-pointer items-center gap-3 rounded-control border border-cherie-lace bg-cherie-ivory px-4 py-2 text-sm text-cherie-soft-ink transition hover:border-cherie-brass has-[:checked]:border-cherie-burgundy has-[:checked]:bg-cherie-paper has-[:checked]:text-cherie-ink"
                >
                  <input
                    type="checkbox"
                    value={value}
                    {...register('neededModules')}
                    className="cherie-check"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </fieldset>
      )}

      {type === 'appointment' && (
        <fieldset>
          <legend className="font-display text-2xl text-cherie-ink">
            Randevu Tercihiniz
          </legend>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field
              label="Görüşme Konusu"
              error={errors.inquiryType?.message}
              className="sm:col-span-2"
            >
              <input
                type="text"
                {...register('inquiryType')}
                className={inputClass(Boolean(errors.inquiryType))}
              />
            </Field>
            <Field label="Şehir" error={errors.location?.message}>
              <input
                type="text"
                {...register('location')}
                className={inputClass(Boolean(errors.location))}
              />
            </Field>
            <Field
              label="Tercih Edilen Tarih"
              error={errors.preferredDate?.message}
              required
            >
              <input
                type="date"
                {...register('preferredDate')}
                className={inputClass(Boolean(errors.preferredDate))}
              />
            </Field>
            <Field label="Saat Aralığı" error={errors.preferredTime?.message}>
              <input
                type="text"
                placeholder="Örn. 14.00–17.00"
                {...register('preferredTime')}
                className={inputClass(Boolean(errors.preferredTime))}
              />
            </Field>
            <Field label="Görüşme Kanalı" error={errors.preferredChannel?.message}>
              <select
                {...register('preferredChannel')}
                className={inputClass(Boolean(errors.preferredChannel))}
              >
                <option value="phone">Telefon</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="online">Çevrim İçi</option>
                <option value="in_person">Yüz Yüze</option>
              </select>
            </Field>
          </div>
        </fieldset>
      )}

      <Field
        label={type === 'contact' ? 'Mesajınız' : 'Notlarınız'}
        error={errors.message?.message}
      >
        <textarea
          rows={6}
          {...register('message')}
          className={inputClass(Boolean(errors.message))}
        />
      </Field>

      <div className="space-y-4 border-t border-cherie-lace pt-6">
        <label className="flex items-start gap-3 text-sm text-cherie-soft-ink">
          <input
            type="checkbox"
            {...register('consent')}
            className="cherie-check mt-1 shrink-0"
          />
          <span>
            <Link
              href={`${ROUTES.kurumsal}/kvkk-aydinlatma`}
              target="_blank"
              className="text-cherie-burgundy underline"
            >
              KVKK Aydınlatma Metni
            </Link>{' '}
            metnini okudum; talebime yanıt verilebilmesi için bilgilerimin işleneceği
            konusunda bilgilendirildim.
          </span>
        </label>
        {errors.consent?.message && (
          <p className="text-sm text-cherie-error">{errors.consent.message}</p>
        )}
      </div>

      {serverState && (
        <div
          role="status"
          aria-live="polite"
          className={
            serverState.tone === 'success'
              ? 'rounded-card border border-cherie-success/30 bg-cherie-success/10 px-4 py-3 text-sm text-cherie-success'
              : 'rounded-card border border-cherie-error/30 bg-cherie-error/10 px-4 py-3 text-sm text-cherie-error'
          }
        >
          {serverState.message}
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="w-full sm:w-auto"
      >
        {isSubmitting ? 'Gönderiliyor…' : copy.submit}
      </Button>
    </form>
  );
}

function Field({
  label,
  error,
  required,
  className,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-sm font-medium text-cherie-ink">
        {label}
        {required && (
          <span className="ml-1 text-cherie-error" aria-hidden>
            *
          </span>
        )}
      </span>
      {children}
      {error && (
        <span role="alert" className="mt-1 block text-sm text-cherie-error">
          {error}
        </span>
      )}
    </label>
  );
}

function inputClass(hasError: boolean) {
  return [
    'cherie-field placeholder:text-cherie-soft-ink/60',
    hasError ? 'border-cherie-error' : '',
  ].join(' ');
}
