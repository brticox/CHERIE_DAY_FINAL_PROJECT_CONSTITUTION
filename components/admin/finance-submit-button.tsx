'use client';

import { LoaderCircle } from 'lucide-react';
import { useFormStatus } from 'react-dom';

export function FinanceSubmitButton({
  idleLabel,
  pendingLabel,
  className = '',
}: {
  idleLabel: string;
  pendingLabel: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`cherie-button-primary min-h-12 justify-center gap-2 ${className}`}
    >
      {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
