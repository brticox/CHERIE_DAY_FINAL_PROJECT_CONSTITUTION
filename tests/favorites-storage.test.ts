import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  addGuestFavorite,
  clearGuestFavorites,
  readGuestFavorites,
  removeGuestFavorite,
} from '@/lib/favorites/storage';
import { GUEST_FAVORITES_KEY, isLikelyUuid } from '@/lib/favorites/constants';

// Minimal localStorage stub (vitest runs in the node environment).
class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string) {
    this.store.set(key, String(value));
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

const A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const B = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

beforeEach(() => {
  (globalThis as unknown as { window: unknown }).window = {
    localStorage: new MemoryStorage(),
  };
});
afterEach(() => {
  delete (globalThis as unknown as { window?: unknown }).window;
});

function raw() {
  return (globalThis as unknown as { window: { localStorage: MemoryStorage } }).window.localStorage.getItem(
    GUEST_FAVORITES_KEY,
  );
}

describe('guest favorites storage', () => {
  it('starts empty', () => {
    expect(readGuestFavorites()).toEqual([]);
  });

  it('adds and persists a versioned payload with only ids', () => {
    addGuestFavorite(A);
    expect(readGuestFavorites()).toEqual([A]);
    const parsed = JSON.parse(raw()!);
    expect(parsed).toMatchObject({ v: 1, ids: [A] });
  });

  it('deduplicates repeated saves', () => {
    addGuestFavorite(A);
    addGuestFavorite(A);
    expect(readGuestFavorites()).toEqual([A]);
  });

  it('removes an id', () => {
    addGuestFavorite(A);
    addGuestFavorite(B);
    removeGuestFavorite(A);
    expect(readGuestFavorites()).toEqual([B]);
  });

  it('ignores non-uuid values on write', () => {
    addGuestFavorite('not-a-uuid');
    expect(readGuestFavorites()).toEqual([]);
  });

  it('falls back to empty on malformed JSON', () => {
    (globalThis as unknown as { window: { localStorage: MemoryStorage } }).window.localStorage.setItem(
      GUEST_FAVORITES_KEY,
      '{not valid json',
    );
    expect(readGuestFavorites()).toEqual([]);
  });

  it('discards a payload with a mismatched version', () => {
    (globalThis as unknown as { window: { localStorage: MemoryStorage } }).window.localStorage.setItem(
      GUEST_FAVORITES_KEY,
      JSON.stringify({ v: 99, ids: [A] }),
    );
    expect(readGuestFavorites()).toEqual([]);
  });

  it('drops foreign / malformed entries inside a valid payload', () => {
    (globalThis as unknown as { window: { localStorage: MemoryStorage } }).window.localStorage.setItem(
      GUEST_FAVORITES_KEY,
      JSON.stringify({ v: 1, ids: [A, 123, null, 'x', B] }),
    );
    expect(readGuestFavorites()).toEqual([A, B]);
  });

  it('clears storage only when asked', () => {
    addGuestFavorite(A);
    clearGuestFavorites();
    expect(raw()).toBeNull();
    expect(readGuestFavorites()).toEqual([]);
  });

  it('is safe during SSR (no window)', () => {
    delete (globalThis as unknown as { window?: unknown }).window;
    expect(readGuestFavorites()).toEqual([]);
    expect(() => addGuestFavorite(A)).not.toThrow();
  });
});

describe('isLikelyUuid', () => {
  it('accepts a uuid and rejects junk', () => {
    expect(isLikelyUuid(A)).toBe(true);
    expect(isLikelyUuid('nope')).toBe(false);
    expect(isLikelyUuid(42)).toBe(false);
    expect(isLikelyUuid(null)).toBe(false);
  });
});
