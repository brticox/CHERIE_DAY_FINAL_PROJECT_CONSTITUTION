'use client';
import { AlertTriangle, RefreshCw } from 'lucide-react';
export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto grid min-h-[calc(100dvh-5rem)] max-w-3xl place-items-center p-5 md:p-8">
      <section
        role="alert"
        className="admin-surface w-full px-6 py-10 text-center sm:px-10"
      >
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-cherie-error/10 text-cherie-error">
          <AlertTriangle className="size-6" aria-hidden="true" />
        </span>
        <p className="admin-eyebrow mt-5">Güvenli hata durumu</p>
        <h1 className="mt-2 font-display text-4xl text-cherie-ink sm:text-5xl">
          Çalışma alanı açılamadı
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-cherie-soft-ink">
          İstenen bilgiler görüntülenemedi. Hiçbir kayıt değiştirilmedi; bağlantı hazır
          olduğunda yeniden deneyebilirsiniz.
        </p>
        <button
          onClick={reset}
          className="cherie-button-primary mt-7 min-h-12 gap-2 px-5"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Güvenle yeniden dene
        </button>
      </section>
    </div>
  );
}
