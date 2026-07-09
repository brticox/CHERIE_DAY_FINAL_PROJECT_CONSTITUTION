/**
 * Legal document keys + consent types (docs/24, docs/42 §7, docs/45 §5).
 * Legal text is versioned; every order/reservation snapshots the exact rendered
 * version + timestamp into consent_records. Phase 1: keys/structure only.
 */

export const LEGAL_DOC_KEYS = [
  'kvkk_aydinlatma',
  'gizlilik',
  'cerez',
  'acik_riza',
  'kullanim_kosullari',
  'on_bilgilendirme',
  'mesafeli_satis',
  'iade_iptal',
  'teslimat',
  'kisisellestirilmis_urun',
  'hizmet_rezervasyon',
  'satici_bilgileri',
] as const;

export type LegalDocKey = (typeof LEGAL_DOC_KEYS)[number];

export type ConsentType =
  | 'kvkk'
  | 'distance_sales'
  | 'pre_info'
  | 'cookie'
  | 'marketing'
  | 'explicit'
  | 'photo_publish';

/** Cookie consent categories (docs/24 §Cookie Lock, docs/44 §7). */
export type CookieCategory = 'necessary' | 'analytics' | 'marketing';
