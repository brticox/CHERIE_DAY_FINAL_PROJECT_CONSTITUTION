'use client';
import { useEffect, useState } from 'react';
export function SavedOrderViews() {
  const [views, setViews] = useState<{ name: string; query: string }[]>([]);
  useEffect(() => {
    try {
      setViews(JSON.parse(localStorage.getItem('cherie-order-views') || '[]'));
    } catch {
      setViews([]);
    }
  }, []);
  const save = () => {
    const name = window.prompt('Görünüm adı');
    if (!name) return;
    const next = [
      ...views,
      { name: name.slice(0, 60), query: window.location.search },
    ].slice(-8);
    localStorage.setItem('cherie-order-views', JSON.stringify(next));
    setViews(next);
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={save} className="cherie-button-secondary">
        Geçerli görünümü kaydet
      </button>
      {views.map((view, index) => (
        <a
          key={`${view.name}-${index}`}
          href={`/admin/commerce/orders${view.query}`}
          className="rounded-full border border-cherie-lace px-3 py-2 text-xs font-bold"
        >
          {view.name}
        </a>
      ))}
    </div>
  );
}
