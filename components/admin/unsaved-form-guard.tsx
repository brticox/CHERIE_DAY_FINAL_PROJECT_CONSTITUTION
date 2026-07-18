'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, CircleAlert } from 'lucide-react';

export function UnsavedFormGuard({ formId }: { formId: string }) {
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const form = document.getElementById(formId);
    if (!(form instanceof HTMLFormElement)) return;
    const markDirty = () => setDirty(true);
    const markSaving = () => setDirty(false);
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    form.addEventListener('input', markDirty);
    form.addEventListener('change', markDirty);
    form.addEventListener('submit', markSaving);
    window.addEventListener('beforeunload', warn);
    return () => {
      form.removeEventListener('input', markDirty);
      form.removeEventListener('change', markDirty);
      form.removeEventListener('submit', markSaving);
      window.removeEventListener('beforeunload', warn);
    };
  }, [dirty, formId]);

  return (
    <p
      aria-live="polite"
      className={`flex items-center gap-2 text-xs font-semibold ${dirty ? 'text-cherie-warning' : 'text-cherie-success'}`}
    >
      {dirty ? (
        <CircleAlert className="size-4" aria-hidden="true" />
      ) : (
        <CheckCircle2 className="size-4" aria-hidden="true" />
      )}
      {dirty ? 'Kaydedilmemiş değişiklikler var' : 'Tüm değişiklikler kaydedildi'}
    </p>
  );
}
