'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  addGuestFavorite,
  clearGuestFavorites,
  readGuestFavorites,
  removeGuestFavorite,
} from '@/lib/favorites/storage';
import { FAVORITES_CHANGED_EVENT } from '@/lib/favorites/constants';

type ToggleResult = { saved: boolean; ok: boolean; message?: string };

type FavoritesContextValue = {
  ready: boolean;
  authenticated: boolean;
  count: number;
  has: (productId: string) => boolean;
  isPending: (productId: string) => boolean;
  toggle: (productId: string) => Promise<ToggleResult>;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

async function readJson(response: Response): Promise<{ ok?: boolean; ids?: unknown; message?: string }> {
  try {
    return (await response.json()) as { ok?: boolean; ids?: unknown; message?: string };
  } catch {
    return {};
  }
}

function idsFrom(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<Set<string>>(() => new Set());
  const [authenticated, setAuthenticated] = useState(false);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState<Set<string>>(() => new Set());
  const authedRef = useRef(false);

  const broadcast = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(FAVORITES_CHANGED_EVENT));
    }
  }, []);

  // One-time hydration: learn auth state from the server, then either merge the
  // guest list (authenticated) or adopt it (guest).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const guestIds = readGuestFavorites();
      let serverAuthed = false;
      let serverIds: string[] = [];
      try {
        const response = await fetch('/api/favorites', { cache: 'no-store' });
        const body = await readJson(response);
        serverAuthed = Boolean(body.ok && (body as { authenticated?: boolean }).authenticated);
        serverIds = idsFrom(body.ids);
      } catch {
        serverAuthed = false;
      }
      if (cancelled) return;

      if (serverAuthed) {
        authedRef.current = true;
        setAuthenticated(true);
        if (guestIds.length > 0) {
          try {
            const response = await fetch('/api/favorites/merge', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids: guestIds }),
            });
            const body = await readJson(response);
            if (response.ok && body.ok) {
              // Clear local guest data ONLY after the server confirms persistence.
              clearGuestFavorites();
              serverIds = idsFrom(body.ids);
            }
          } catch {
            /* keep guest data for a later retry; fall through to server ids */
          }
        }
        if (!cancelled) setIds(new Set(serverIds));
      } else {
        authedRef.current = false;
        setAuthenticated(false);
        setIds(new Set(guestIds));
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Cross-tab sync for guests (storage fires in OTHER tabs only).
  useEffect(() => {
    function onStorage() {
      if (!authedRef.current) setIds(new Set(readGuestFavorites()));
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setPendingFor = useCallback((productId: string, on: boolean) => {
    setPending((prev) => {
      const next = new Set(prev);
      if (on) next.add(productId);
      else next.delete(productId);
      return next;
    });
  }, []);

  const toggle = useCallback(
    async (productId: string): Promise<ToggleResult> => {
      const currentlySaved = ids.has(productId);
      const willSave = !currentlySaved;

      // Optimistic update.
      setIds((prev) => {
        const next = new Set(prev);
        if (willSave) next.add(productId);
        else next.delete(productId);
        return next;
      });

      if (!authedRef.current) {
        // Guest: persist to localStorage, no network.
        const nextList = willSave
          ? addGuestFavorite(productId)
          : removeGuestFavorite(productId);
        setIds(new Set(nextList));
        broadcast();
        return { saved: willSave, ok: true };
      }

      setPendingFor(productId, true);
      try {
        const response = await fetch('/api/favorites', {
          method: willSave ? 'POST' : 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });
        const body = await readJson(response);
        if (!response.ok || !body.ok) {
          // Roll back to the pre-toggle state.
          setIds((prev) => {
            const next = new Set(prev);
            if (willSave) next.delete(productId);
            else next.add(productId);
            return next;
          });
          return { saved: currentlySaved, ok: false, message: body.message };
        }
        setIds(new Set(idsFrom(body.ids)));
        broadcast();
        return { saved: willSave, ok: true };
      } catch {
        setIds((prev) => {
          const next = new Set(prev);
          if (willSave) next.delete(productId);
          else next.add(productId);
          return next;
        });
        return { saved: currentlySaved, ok: false, message: 'Bağlantı hatası. Tekrar deneyin.' };
      } finally {
        setPendingFor(productId, false);
      }
    },
    [ids, broadcast, setPendingFor],
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({
      ready,
      authenticated,
      count: ids.size,
      has: (productId: string) => ids.has(productId),
      isPending: (productId: string) => pending.has(productId),
      toggle,
    }),
    [ready, authenticated, ids, pending, toggle],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites, <FavoritesProvider> içinde kullanılmalıdır.');
  }
  return context;
}
