'use client';

import { useActionState } from 'react';
import { Check, LoaderCircle } from 'lucide-react';

import { savePreferencesAction } from '@/app/(site)/hesap/tercihler/actions';
import {
  INITIAL_PREFERENCES_STATE,
  PREFERENCE_CATEGORIES,
  PREFERENCE_CHANNELS,
  preferenceFieldName,
} from '@/lib/account/preference-defs';
import { Button } from '@/components/ui/button';

export function PreferencesForm({
  notifications,
}: {
  notifications: Record<string, boolean>;
}) {
  const [state, action, pending] = useActionState(
    savePreferencesAction,
    INITIAL_PREFERENCES_STATE,
  );

  return (
    <form action={action} className="space-y-8">
      <section className="rounded-card-lg border border-cherie-lace bg-cherie-ivory p-6">
        <h2 className="font-display text-2xl text-cherie-ink">Bildirim tercihleri</h2>
        <p className="mt-1 text-sm text-cherie-soft-ink">
          Sizi hangi konularda ve hangi kanaldan bilgilendirelim?
        </p>
        <ul className="mt-6 space-y-5">
          {PREFERENCE_CATEGORIES.map((category) => (
            <li
              key={category.key}
              className="grid gap-3 border-t border-cherie-lace/70 pt-5 first:border-t-0 first:pt-0 sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div>
                <p className="font-medium text-cherie-ink">{category.title}</p>
                <p className="text-sm text-cherie-soft-ink">{category.description}</p>
              </div>
              <div className="flex flex-wrap gap-4">
                {PREFERENCE_CHANNELS.map((channel) => (
                  <label
                    key={channel.key}
                    className="flex cursor-pointer items-center gap-2 text-sm text-cherie-ink"
                  >
                    <input
                      type="checkbox"
                      name={preferenceFieldName(category.key, channel.key)}
                      defaultChecked={notifications[`${category.key}:${channel.key}`] ?? false}
                      className="cherie-check"
                    />
                    {channel.label}
                  </label>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {state.status !== 'idle' && state.message && (
        <p
          role={state.status === 'error' ? 'alert' : 'status'}
          aria-live="polite"
          className={`rounded-control px-4 py-3 text-sm ${
            state.status === 'success'
              ? 'bg-cherie-success/10 text-cherie-success'
              : 'bg-cherie-error/10 text-cherie-error'
          }`}
        >
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? <LoaderCircle className="animate-spin" /> : <Check />}
        Tercihleri kaydet
      </Button>
    </form>
  );
}
