/**
 * Guest (pre-login) favorites persistence — a minimal, first-party localStorage
 * layer that stores ONLY product ids. It never stores prices, names, or any
 * server-authoritative data: the storefront always recomputes those from the
 * catalog. Every read tolerates malformed/legacy/foreign values by falling back
 * to an empty list, so a corrupted blob can never throw in the UI.
 *
 * Client-only. All functions are safe to call during SSR (they early-return).
 */
import {
  GUEST_FAVORITES_KEY,
  GUEST_FAVORITES_VERSION,
  MAX_FAVORITES,
  isLikelyUuid,
} from './constants';

type GuestPayload = { v: number; ids: string[] };

function hasWindow(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/** Read guest favorites, deduplicated and validated. Returns [] on any problem. */
export function readGuestFavorites(): string[] {
  if (!hasWindow()) return [];
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(GUEST_FAVORITES_KEY);
  } catch {
    return [];
  }
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      (parsed as GuestPayload).v !== GUEST_FAVORITES_VERSION ||
      !Array.isArray((parsed as GuestPayload).ids)
    ) {
      return [];
    }
    const ids = (parsed as GuestPayload).ids.filter(isLikelyUuid);
    return Array.from(new Set(ids)).slice(0, MAX_FAVORITES);
  } catch {
    return [];
  }
}

function persist(ids: string[]): string[] {
  const unique = Array.from(new Set(ids.filter(isLikelyUuid))).slice(0, MAX_FAVORITES);
  if (!hasWindow()) return unique;
  try {
    const payload: GuestPayload = { v: GUEST_FAVORITES_VERSION, ids: unique };
    window.localStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(payload));
  } catch {
    /* quota / disabled storage — state still lives in memory for this session */
  }
  return unique;
}

export function addGuestFavorite(id: string): string[] {
  if (!isLikelyUuid(id)) return readGuestFavorites();
  return persist([...readGuestFavorites(), id]);
}

export function removeGuestFavorite(id: string): string[] {
  return persist(readGuestFavorites().filter((existing) => existing !== id));
}

/** Clear guest storage — called ONLY after successful server persistence on merge. */
export function clearGuestFavorites(): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.removeItem(GUEST_FAVORITES_KEY);
  } catch {
    /* ignore */
  }
}
