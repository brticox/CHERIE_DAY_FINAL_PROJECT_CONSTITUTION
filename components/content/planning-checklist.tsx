'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';

import { cn } from '@/lib/utils';

export type ChecklistGroup = {
  phase: string;
  when: string;
  items: { id: string; label: string }[];
};

const STORAGE_KEY = 'cherie:planning-checklist:v1';

/**
 * Client-only planning checklist. State lives in localStorage under a single
 * namespaced key — no account, no server write, no personal data leaves the
 * device. Fully keyboard operable; reduced-motion safe (no essential motion).
 */
export function PlanningChecklist({ groups }: { groups: ChecklistGroup[] }) {
  const allIds = useMemo(
    () => groups.flatMap((g) => g.items.map((i) => i.id)),
    [groups],
  );
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDone(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(done));
    } catch {
      /* storage may be unavailable (private mode) */
    }
  }, [done, hydrated]);

  const completed = allIds.filter((id) => done[id]).length;
  const total = allIds.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div>
      {/* Progress */}
      <div className="sticky top-[4.75rem] z-10 rounded-card border border-cherie-lace bg-cherie-ivory/90 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-cherie-ink">
            {hydrated ? (
              <>
                {completed} / {total} adım tamam
                <span className="ml-2 text-cherie-soft-ink">· %{pct}</span>
              </>
            ) : (
              <span className="text-cherie-soft-ink">Listeniz hazırlanıyor…</span>
            )}
          </p>
          <button
            type="button"
            onClick={() => setDone({})}
            className="inline-flex items-center gap-1.5 rounded-control px-2.5 py-1.5 text-xs text-cherie-soft-ink transition-colors hover:text-cherie-burgundy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cherie-focus"
          >
            <RotateCcw className="size-3.5" strokeWidth={1.8} />
            Sıfırla
          </button>
        </div>
        <div
          className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-cherie-paper"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Tamamlanan adımlar"
        >
          <div
            className="h-full rounded-full bg-cherie-burgundy transition-[width] duration-500 ease-cherie"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Groups */}
      <div className="mt-8 space-y-10">
        {groups.map((group) => (
          <section key={group.phase}>
            <div className="flex items-baseline justify-between border-b border-cherie-lace pb-2">
              <h2 className="text-h3 text-cherie-ink">{group.phase}</h2>
              <span className="text-xs uppercase tracking-[0.14em] text-cherie-brass">
                {group.when}
              </span>
            </div>
            <ul className="mt-4 space-y-1">
              {group.items.map((item) => {
                const checked = Boolean(done[item.id]);
                return (
                  <li key={item.id}>
                    <label
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-control px-3 py-2.5 transition-colors hover:bg-cherie-paper/60',
                        checked && 'text-cherie-soft-ink',
                      )}
                    >
                      <span
                        className={cn(
                          'grid size-5 shrink-0 place-items-center rounded-[6px] border transition-colors',
                          checked
                            ? 'border-cherie-burgundy bg-cherie-burgundy text-cherie-ivory'
                            : 'border-cherie-lace bg-cherie-ivory',
                        )}
                      >
                        {checked && <Check className="size-3.5" strokeWidth={2.5} />}
                      </span>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={() =>
                          setDone((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                        }
                      />
                      <span className={cn('text-sm', checked && 'line-through')}>
                        {item.label}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-8 text-xs text-cherie-soft-ink">
        İşaretledikleriniz yalnızca bu tarayıcıda saklanır; hesabınıza kaydedilmez.
      </p>
    </div>
  );
}
