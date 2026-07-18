'use client';

import { useState } from 'react';
import { Download, ShieldCheck, TriangleAlert } from 'lucide-react';

import {
  requestDeletionAction,
  requestExportAction,
  setMarketingConsentAction,
} from '@/app/(site)/hesap/tercihler/privacy-actions';
import { DELETION_CONFIRM_PHRASE } from '@/lib/account/privacy-defs';
import type { DataRequestSummary } from '@/lib/account/privacy';
import { Button } from '@/components/ui/button';

function statusLabel(status: string): string {
  switch (status) {
    case 'pending':
      return 'Talebiniz alındı, en kısa sürede işleme alınacak.';
    case 'in_review':
      return 'Talebiniz inceleniyor.';
    default:
      return 'Talebiniz kaydedildi.';
  }
}

export function PrivacyControls({
  marketingConsent,
  hasOrders,
  exportRequest,
  deletionRequest,
}: {
  marketingConsent: boolean;
  hasOrders: boolean;
  exportRequest: DataRequestSummary;
  deletionRequest: DataRequestSummary;
}) {
  const [confirmText, setConfirmText] = useState('');
  const canDelete = confirmText.trim() === DELETION_CONFIRM_PHRASE;

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl text-cherie-ink">Gizlilik ve verilerim</h2>

      {/* Marketing consent (KVKK) — the only customer-writable consent path. */}
      <section className="rounded-card-lg border border-cherie-lace bg-cherie-ivory p-6">
        <h3 className="font-semibold text-cherie-ink">Pazarlama izni (KVKK)</h3>
        <form action={setMarketingConsentAction} className="mt-3">
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-cherie-soft-ink">
            <input
              type="checkbox"
              name="optIn"
              defaultChecked={marketingConsent}
              className="cherie-check mt-1 shrink-0"
            />
            <span>
              Kampanya, ayrıcalık ve yeniliklerden haberdar olmak için ticari elektronik
              ileti almayı onaylıyorum. Bu izin, bildirim tercihlerinizden bağımsızdır ve
              istediğiniz zaman geri çekilebilir.
            </span>
          </label>
          <Button type="submit" variant="secondary" size="sm" className="mt-4">
            İzin tercihini kaydet
          </Button>
        </form>
      </section>

      {/* Data export request */}
      <section className="rounded-card-lg border border-cherie-lace bg-cherie-ivory p-6">
        <h3 className="flex items-center gap-2 font-semibold text-cherie-ink">
          <Download className="size-4 text-cherie-brass" /> Verilerimi dışa aktar
        </h3>
        <p className="mt-2 text-sm leading-6 text-cherie-soft-ink">
          Hesabınızda tuttuğumuz kişisel verilerinizin bir kopyasını talep edebilirsiniz.
          Talebiniz hazırlandığında e-posta ile bilgilendirilirsiniz.
        </p>
        {exportRequest ? (
          <p className="mt-4 rounded-control border border-cherie-brass/40 bg-cherie-paper px-4 py-3 text-sm text-cherie-ink">
            {statusLabel(exportRequest.status)}
          </p>
        ) : (
          <form action={requestExportAction} className="mt-4">
            <Button type="submit" variant="secondary">
              Veri kopyası talep et
            </Button>
          </form>
        )}
      </section>

      {/* Account deletion request */}
      <section className="rounded-card-lg border border-cherie-error/30 bg-cherie-error/5 p-6">
        <h3 className="flex items-center gap-2 font-semibold text-cherie-ink">
          <TriangleAlert className="size-4 text-cherie-error" /> Hesabımı sil
        </h3>
        <p className="mt-2 text-sm leading-6 text-cherie-soft-ink">
          Hesabınızın silinmesini talep edebilirsiniz. Talebinizi aldıktan sonra sizinle
          iletişime geçeriz.
        </p>
        {hasOrders && (
          <p className="mt-3 flex items-start gap-2 rounded-control bg-cherie-paper px-4 py-3 text-sm leading-6 text-cherie-soft-ink">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-cherie-brass" />
            <span>
              Yürürlükteki mevzuat gereği fatura ve sipariş kayıtlarınız yasal saklama
              süresince korunur; bu kayıtlar hesap silme talebiyle birlikte
              silinemez.
            </span>
          </p>
        )}
        {deletionRequest ? (
          <p className="mt-4 rounded-control border border-cherie-error/40 bg-cherie-paper px-4 py-3 text-sm text-cherie-ink">
            {statusLabel(deletionRequest.status)}
          </p>
        ) : (
          <form action={requestDeletionAction} className="mt-4 space-y-3">
            <label className="block text-sm text-cherie-soft-ink">
              Onaylamak için{' '}
              <span className="font-semibold text-cherie-ink">{DELETION_CONFIRM_PHRASE}</span>{' '}
              yazın:
              <input
                name="confirm"
                value={confirmText}
                onChange={(event) => setConfirmText(event.target.value)}
                autoComplete="off"
                className="cherie-field mt-2"
              />
            </label>
            <Button type="submit" variant="secondary" disabled={!canDelete}>
              Hesap silme talebi gönder
            </Button>
          </form>
        )}
      </section>
    </div>
  );
}
