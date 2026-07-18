import Link from 'next/link';
import { SearchX } from 'lucide-react';
export default function AdminNotFound() {
  return (
    <div className="mx-auto grid min-h-[calc(100dvh-5rem)] max-w-3xl place-items-center p-5 md:p-8">
      <section className="admin-surface w-full px-6 py-10 text-center sm:px-10">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-cherie-paper text-cherie-burgundy">
          <SearchX className="size-6" aria-hidden="true" />
        </span>
        <p className="admin-eyebrow mt-5">Kayıt bulunamadı</p>
        <h1 className="mt-2 font-display text-4xl text-cherie-ink sm:text-5xl">
          Bu çalışma alanı mevcut değil
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-cherie-soft-ink">
          Bağlantı güncelliğini yitirmiş veya kayıt artık erişilebilir olmayabilir.
          Yönetim özetine güvenle dönebilirsiniz.
        </p>
        <Link
          href="/admin/dashboard"
          className="cherie-button-primary mt-7 min-h-12 px-5"
        >
          Yönetim özetine dön
        </Link>
      </section>
    </div>
  );
}
