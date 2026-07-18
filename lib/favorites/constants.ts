/**
 * Shared constants for the Seçtiklerim (favorites) feature. Imported by both
 * client (guest storage, provider) and server (API, merge) code, so this file
 * must stay free of any server-only or browser-only imports.
 */

/** localStorage key holding the guest (pre-login) favorites payload. */
export const GUEST_FAVORITES_KEY = 'cherie_favorites';

/** Payload schema version — bump when the stored shape changes so old blobs are discarded. */
export const GUEST_FAVORITES_VERSION = 1;

/** Hard cap on stored ids to keep the payload small and bound merge cost. */
export const MAX_FAVORITES = 200;

/** Only product favorites are exposed to customers in the launch MVP. */
export const FAVORITE_ITEM_TYPE = 'product' as const;

/** Broadcast on the window when favorites change so open tabs/components can resync. */
export const FAVORITES_CHANGED_EVENT = 'cherie:favorites-changed';

/** Loose UUID guard — rejects obviously malformed ids before they reach the server. */
export function isLikelyUuid(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
  );
}
