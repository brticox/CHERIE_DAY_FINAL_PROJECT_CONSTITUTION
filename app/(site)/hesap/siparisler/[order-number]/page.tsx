import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Box, CheckCircle2, Clock3, Route, Truck } from 'lucide-react';

import { JourneyStepper } from '@/components/portal/journey-stepper';
import { NextActionCard } from '@/components/portal/next-action-card';
import { formatTRY } from '@/lib/format';
import { orderJourney, orderNextAction } from '@/lib/orders/journey';
import { getCustomerOrderDetail, jsonText } from '@/lib/orders/customer';
import {
  orderStatusLabel,
  paymentStatusLabel,
  proofStatusLabel,
  shipmentStatusLabel,
} from '@/lib/orders/presentation';
import { respondToProofAction } from './actions';

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<Record<string, string>>;
  searchParams: Promise<{ proof?: string }>;
}) {
  const orderNumber = (await params)['order-number'];
  if (!orderNumber) notFound();
  const detail = await getCustomerOrderDetail(orderNumber);
  if (!detail) notFound();
  const { order, items, events, shipments, proofs } = detail;
  const proofMessage = proofFeedback((await searchParams).proof);
  const legalVersions = orderLegalVersions(order.legal_snapshot);
  const journey = orderJourney(order.status);
  const nextAction = orderNextAction({
    status: order.status,
    order_number: order.order_number,
  });
  return (
    <div className="cherie-container py-12 md:py-16">
      <Link
        href="/hesap/siparisler"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-cherie-burgundy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <ArrowLeft className="size-4" aria-hidden /> Siparişlerime dön
      </Link>
      <div className="mt-5 flex flex-col gap-5 border-b border-cherie-lace pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="cherie-kicker">Sipariş kokpiti</p>
          <h1 className="text-h1 mt-3">{order.order_number}</h1>
          <p className="mt-2 text-sm text-cherie-soft-ink">
            {orderStatusLabel(order.status)} · {paymentStatusLabel(order.payment_status)}
          </p>
        </div>
        <p className="cherie-price font-display text-3xl text-cherie-burgundy">
          {formatTRY(Number(order.total_amount))}
        </p>
      </div>

      <div className="mt-8 space-y-6">
        <NextActionCard action={nextAction} eyebrow="Bu sipariş" />
        <section
          aria-label="Sipariş ilerlemesi"
          className="rounded-card-lg border border-cherie-lace bg-cherie-ivory p-5 shadow-sm md:p-6"
        >
          <h2 className="flex items-center gap-2 font-display text-2xl">
            <Route className="size-5 text-cherie-brass" strokeWidth={1.6} aria-hidden />
            İlerleme
          </h2>
          <JourneyStepper journey={journey} className="mt-5" />
        </section>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_.65fr]">
        <div className="space-y-8">
          <Section title="Siparişinizdeki parçalar" icon={Box}>
            <div className="divide-y divide-cherie-lace">
              {items.map((item) => (
                <div key={item.id} className="grid gap-2 py-5 sm:grid-cols-[1fr_auto]">
                  <div>
                    <p className="font-semibold">
                      {jsonText(item.product_snapshot, 'name', 'CHERIE DAY ürünü')}
                    </p>
                    <p className="mt-1 text-sm text-cherie-soft-ink">
                      {item.quantity} adet
                    </p>
                  </div>
                  <p className="cherie-price font-semibold">
                    {formatTRY(Number(item.total_price))}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Yolculuk" icon={Clock3}>
            {events.length ? (
              <ol className="space-y-5">
                {events.map((event) => (
                  <li key={event.id} className="grid grid-cols-[1.5rem_1fr] gap-3">
                    <CheckCircle2
                      className="mt-0.5 size-5 text-cherie-success"
                      strokeWidth={1.6}
                    />
                    <div>
                      <p className="font-semibold">{event.title_tr}</p>
                      {event.detail_tr && (
                        <p className="mt-1 text-sm text-cherie-soft-ink">
                          {event.detail_tr}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-cherie-soft-ink">
                        {new Intl.DateTimeFormat('tr-TR', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                          timeZone: 'Europe/Istanbul',
                        }).format(new Date(event.created_at))}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-cherie-soft-ink">
                İlk durum güncellemesi burada görünecek.
              </p>
            )}
          </Section>
        </div>

        <aside className="space-y-6">
          <Section title="Teslimat" icon={Truck} id="teslimat">
            <p className="text-sm leading-7 text-cherie-soft-ink">
              {jsonText(order.delivery_address_snapshot ?? {}, 'full_name')}
              <br />
              {jsonText(order.delivery_address_snapshot ?? {}, 'address_line')}
              <br />
              {jsonText(order.delivery_address_snapshot ?? {}, 'district')},{' '}
              {jsonText(order.delivery_address_snapshot ?? {}, 'city')}
            </p>
            {shipments.map((shipment) => (
              <div
                key={shipment.id}
                className="mt-4 rounded-control bg-cherie-paper p-3 text-sm"
              >
                <p className="font-semibold text-cherie-ink">
                  {shipmentStatusLabel(shipment.status)}
                </p>
                <p className="mt-1 text-cherie-soft-ink">
                  {shipment.carrier_name ?? 'Kargo'} ·{' '}
                  {shipment.tracking_number ?? 'Takip numarası hazırlanıyor'}
                </p>
              </div>
            ))}
          </Section>
          {legalVersions.length > 0 && (
            <Section title="Kabul ettiğiniz metinler" icon={CheckCircle2}>
              <ul className="space-y-3 text-sm">
                {legalVersions.map((version) => (
                  <li key={version.id}>
                    <Link
                      href={`/hesap/siparisler/${order.order_number}/yasal/${version.id}`}
                      className="font-semibold text-cherie-burgundy hover:underline"
                    >
                      {legalDocumentLabel(version.key)} · {version.version}
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {proofs.length > 0 && (
            <Section title="Tasarım onayı" icon={CheckCircle2} id="prova">
              {proofMessage && (
                <p className="mb-4 rounded-control bg-cherie-paper p-3 text-sm text-cherie-soft-ink">
                  {proofMessage}
                </p>
              )}
              <div className="space-y-5">
                {proofs.map((proof) => (
                  <article
                    key={proof.id}
                    className="rounded-control border border-cherie-lace p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">Tasarım v{proof.version}</p>
                      <span className="rounded-full bg-cherie-paper px-2.5 py-1 text-xs font-semibold text-cherie-ink">

                        {proofStatusLabel(proof.status)}
                      </span>
                    </div>
                    {proof.status === 'sent' && (
                      <p className="mt-3 rounded-control bg-cherie-paper/70 px-3 py-2 text-xs text-cherie-soft-ink">
                        Bu onaydan sonra üretim hazırlığı başlar.
                      </p>
                    )}
                    {proof.status === 'sent' && (
                      <form action={respondToProofAction} className="mt-4 space-y-3">
                        <input
                          type="hidden"
                          name="orderNumber"
                          value={order.order_number}
                        />
                        <input type="hidden" name="proofId" value={proof.id} />
                        <label
                          className="block text-sm font-semibold"
                          htmlFor={`comment-${proof.id}`}
                        >
                          Revizyon notunuz
                        </label>
                        <textarea
                          id={`comment-${proof.id}`}
                          name="comment"
                          maxLength={2000}
                          className="cherie-field min-h-24"
                          placeholder="Değişmesini istediğiniz ayrıntıyı açıkça yazın."
                        />
                        <div className="grid gap-2 sm:grid-cols-2">
                          <button
                            name="action"
                            value="approve"
                            className="min-h-11 rounded-control bg-cherie-success px-4 text-sm font-semibold text-white"
                          >
                            Tasarımı onayla
                          </button>
                          <button
                            name="action"
                            value="request_revision"
                            className="min-h-11 rounded-control border border-cherie-burgundy px-4 text-sm font-semibold text-cherie-burgundy"
                          >
                            Revizyon iste
                          </button>
                        </div>
                      </form>
                    )}
                  </article>
                ))}
              </div>
            </Section>
          )}
        </aside>
      </div>
    </div>
  );
}

function orderLegalVersions(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
  return Object.entries(value).flatMap(([key, entry]) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return [];
    const record = entry as { id?: unknown; version?: unknown };
    return typeof record.id === 'string' && typeof record.version === 'string'
      ? [{ key, id: record.id, version: record.version }]
      : [];
  });
}

function legalDocumentLabel(key: string) {
  const labels: Record<string, string> = {
    on_bilgilendirme: 'Ön Bilgilendirme Formu',
    mesafeli_satis: 'Mesafeli Satış Sözleşmesi',
    kvkk_aydinlatma: 'KVKK Aydınlatma Metni',
    kisisellestirilmis_urun: 'Kişiselleştirilmiş Ürün Şartları',
  };
  return labels[key] ?? key;
}

function proofFeedback(value?: string) {
  const messages: Record<string, string> = {
    approved: 'Tasarım onayınız kaydedildi. Üretim hazırlığı başladı.',
    revision_requested: 'Revizyon talebiniz tasarım ekibine iletildi.',
    comment_required: 'Revizyon için en az üç karakterlik açıklama yazın.',
    comment_too_long: 'Revizyon notu 2000 karakteri aşamaz.',
    failed: 'Bu tasarım artık yanıtlanabilir durumda değil. Sayfayı yenileyin.',
    invalid: 'Tasarım yanıtı doğrulanamadı.',
  };
  return value ? messages[value] : undefined;
}

function Section({
  title,
  icon: Icon,
  id,
  children,
}: {
  title: string;
  icon: typeof Box;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-card-lg border border-cherie-lace bg-cherie-ivory p-5 shadow-sm md:p-6"
    >
      <h2 className="flex items-center gap-2 font-display text-2xl">
        <Icon className="size-5 text-cherie-brass" strokeWidth={1.6} aria-hidden />
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}
