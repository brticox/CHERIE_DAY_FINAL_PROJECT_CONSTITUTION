/**
 * Normalized public data types. Field names mirror the Phase 2 `*_public`
 * views (docs/23) so Supabase rows map through with minimal transformation and
 * the local seed uses the identical shape. These types expose ONLY public-safe
 * fields — never internal_cost, supplier, moderation, or draft columns.
 */

export type ProductBehavior =
  | 'cart_enabled'
  | 'proof_required_cart'
  | 'digital_checkout'
  | 'quote_required'
  | 'inquiry_only'
  | 'reservation_request'
  | 'city_dependent_service';

export type ServiceBehavior =
  'quote_required' | 'reservation_request' | 'city_dependent_service' | 'inquiry_only';

export type PriceBand = 'inquiry_only' | 'starter' | 'premium' | 'luxury' | 'bespoke';
export type StockMode = 'in_stock' | 'made_to_order' | 'preorder' | 'unavailable';
export type PriceDisplay = 'from_price' | 'price_band' | 'quote_only';

export interface Department {
  id: string;
  name_tr: string;
  slug: string;
  description: string | null;
  sort_order: number;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  story: string | null;
  palette: string[];
  is_featured: boolean;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  department_slug: string;
  collection_slug: string | null;
  description: string | null;
  material_story: string | null;
  behavior_type: ProductBehavior;
  base_price: number | null;
  currency: string;
  stock_mode: StockMode;
  production_time_days: number | null;
  price_band: PriceBand | null;
  proof_required: boolean;
  is_personalizable: boolean;
  return_note: string | null;
  delivery_note: string | null;
  media_ids: string[];
  category_slug?: string | null;
  category_name?: string | null;
  sku?: string | null;
  gift_wrapping_available?: boolean;
  variants?: ProductVariant[];
  price_tiers?: ProductPriceTier[];
  addons?: ProductAddon[];
  personalization_fields?: ProductPersonalizationField[];
  colors?: ProductAttribute[];
  materials?: ProductAttribute[];
  media?: ProductMedia[];
}

export interface ProductMedia {
  id: string;
  url: string | null;
  alt_text: string | null;
  sort_order: number | null;
}

export interface ProductVariant {
  id: string;
  title: string;
  sku: string | null;
  option_values: Record<string, string>;
  price: number | null;
  stock_quantity: number | null;
}

export interface ProductPriceTier {
  id: string;
  variant_id: string | null;
  min_qty: number;
  unit_price: number;
}

export interface ProductAddon {
  id: string;
  name_tr: string;
  addon_type: 'gift_wrap' | 'rush' | 'extra_revision' | 'upgrade' | 'other';
  price: number;
  price_type: 'fixed' | 'percentage';
  is_optional: boolean;
}

export interface ProductPersonalizationField {
  id: string;
  label: string;
  field_type: 'text' | 'textarea' | 'date' | 'select' | 'file' | 'number' | 'checkbox';
  required: boolean;
  options: string[] | null;
  helper_text: string | null;
}

export interface ProductAttribute {
  id: string;
  name_tr: string;
  slug: string;
  hex?: string | null;
}

export interface Category {
  id: string;
  department_id: string | null;
  department_slug?: string | null;
  name: string;
  slug: string;
  parent_id: string | null;
  description: string | null;
  sort_order: number;
}

export interface DigitalProduct {
  id: string;
  name_tr: string;
  slug: string;
  digital_type: string;
  behavior: 'digital_checkout' | 'proof_required' | 'quote_required';
  base_price: number | null;
  summary: string | null;
}

export interface ServicePackage {
  id: string;
  name: string;
  slug: string;
  service_category: string;
  summary: string | null;
  description: string | null;
  behavior_type: ServiceBehavior;
  price_display: PriceDisplay;
  base_from_price: number | null;
  price_band: PriceBand | null;
  min_lead_time_days: number;
  requires_event_date: boolean;
  requires_venue: boolean;
}

export interface ServiceCity {
  id: string;
  city_name: string;
  city_slug: string;
  travel_fee_model: 'none' | 'fixed' | 'per_km' | 'quote';
  notes_tr: string | null;
}

export interface Experience {
  id: string;
  name: string;
  slug: string;
  summary: string | null;
  process_steps: { title: string; description: string }[];
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body_tr: string | null;
  category: string | null;
  author_display: string;
  published_at: string | null;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  client_display_name: string | null;
  event_type: string | null;
  location: string | null;
}

export interface PortfolioProject {
  id: string;
  title: string;
  slug: string;
  event_type: string | null;
  city: string | null;
  guest_count_band: string | null;
}

export interface LegalDocument {
  slug: string;
  doc_key: string;
  title_tr: string;
  body_tr: string;
  needs_lawyer_review: boolean;
  effective_from: string | null;
}

export type SearchEntityType =
  'product' | 'service_package' | 'collection' | 'experience' | 'article';

export interface SearchResult {
  id: string;
  type: SearchEntityType;
  title: string;
  excerpt: string | null;
  href: string;
}
