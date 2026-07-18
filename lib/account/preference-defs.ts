/**
 * Shared notification-preference definitions for Tercihlerim. Imported by both
 * the client form and the server loader/saver, so this module stays free of
 * server-only / browser-only imports.
 *
 * A preference row in public.notification_preferences is keyed by
 * (customer_id, channel, category). We expose a fixed, curated matrix rather
 * than free-form categories so the UI is coherent and the stored data bounded.
 */

export const PREFERENCE_CHANNELS = [
  { key: 'email', label: 'E-posta' },
  { key: 'whatsapp', label: 'WhatsApp' },
] as const;

export type PreferenceChannel = (typeof PREFERENCE_CHANNELS)[number]['key'];

export const PREFERENCE_CATEGORIES = [
  {
    key: 'order_updates',
    title: 'Sipariş ve üretim güncellemeleri',
    description: 'Siparişiniz, tasarım onaylarınız ve kargonuzla ilgili gelişmeler.',
  },
  {
    key: 'reservation_updates',
    title: 'Rezervasyon ve etkinlik hatırlatmaları',
    description: 'Yaklaşan etkinlik ve rezervasyonlarınıza dair nazik hatırlatmalar.',
  },
  {
    key: 'private_offers',
    title: 'Maison ayrıcalıkları',
    description: 'Size özel jestler, davetler ve atölye avantajları.',
  },
] as const;

export type PreferenceCategory = (typeof PREFERENCE_CATEGORIES)[number]['key'];

/** Stable form field name for a channel/category cell. */
export function preferenceFieldName(category: string, channel: string): string {
  return `pref__${category}__${channel}`;
}

export type PreferencesActionState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};
export const INITIAL_PREFERENCES_STATE: PreferencesActionState = { status: 'idle' };
