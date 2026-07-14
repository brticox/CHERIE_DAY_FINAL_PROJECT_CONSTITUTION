'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export function ProofUploader({ items }: { items: { id: string; label: string }[] }) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  return (
    <form
      className="rounded-card-lg border border-cherie-lace bg-white/60 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/admin/proofs/upload');
        xhr.upload.onprogress = (e) =>
          e.lengthComputable && setProgress(Math.round((e.loaded / e.total) * 100));
        xhr.onload = () => {
          const result = JSON.parse(xhr.responseText) as { error?: string };
          if (xhr.status >= 200 && xhr.status < 300) {
            setStatus('Yeni prova sürümü gönderildi; müşteri bildirimi kuyruğa alındı.');
            setProgress(100);
            router.refresh();
          } else setStatus(result.error ?? 'Yükleme başarısız.');
        };
        xhr.onerror = () => setStatus('Ağ hatası nedeniyle yüklenemedi.');
        xhr.send(form);
      }}
    >
      <h2 className="font-display text-2xl">Yeni prova sürümü gönder</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          Sipariş kalemi
          <select name="order_item_id" required className="cherie-field">
            <option value="">Seçin</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold">
          PDF / görsel
          <input
            name="file"
            type="file"
            required
            accept="application/pdf,image/png,image/jpeg,image/webp"
            className="cherie-field"
          />
        </label>
        <label className="grid gap-2 text-sm font-bold md:col-span-2">
          Müşteriye mesaj
          <textarea name="message" maxLength={1000} className="cherie-field" />
        </label>
      </div>
      {progress > 0 && <progress value={progress} max={100} className="mt-3 w-full" />}
      {status && (
        <p role="status" className="mt-3 text-sm">
          {status}
        </p>
      )}
      <button className="cherie-button-primary mt-4">Doğrula, sürümle ve gönder</button>
    </form>
  );
}
