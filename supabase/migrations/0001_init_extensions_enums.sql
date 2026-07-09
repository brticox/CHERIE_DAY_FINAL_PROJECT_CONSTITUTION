-- =============================================================================
-- CHERIE DAY — 0001 · Extensions, shared enums, utility functions
-- Turkey-only luxury celebration commerce + services maison.
-- Schema = union of docs/08 + docs/41 + docs/42. Security posture: docs/23.
-- All customer-facing data is TRY / Turkey-only. Fail-closed RLS is applied
-- in a later migration; this file only defines types + helpers.
-- =============================================================================

create extension if not exists pgcrypto;      -- gen_random_uuid()
create extension if not exists pg_trgm;        -- fuzzy/typo-tolerant search (docs/42 §8)
create extension if not exists unaccent;       -- Turkish diacritic tolerance (docs/44 §5)

-- ---------------------------------------------------------------------------
-- Shared updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Content / lifecycle status (docs/08)
-- ---------------------------------------------------------------------------
create type public.content_status as enum ('draft', 'published');

-- ---------------------------------------------------------------------------
-- Catalog / product enums (docs/08, docs/26, docs/37, docs/42)
-- ---------------------------------------------------------------------------
-- Behavior type drives the checkout path (docs/26, docs/43 §1).
create type public.product_behavior as enum (
  'cart_enabled',
  'proof_required_cart',
  'digital_checkout',
  'quote_required',
  'inquiry_only',
  'reservation_request',
  'city_dependent_service'
);

create type public.stock_mode as enum ('in_stock', 'made_to_order', 'preorder', 'unavailable');
create type public.price_band as enum ('inquiry_only', 'starter', 'premium', 'luxury', 'bespoke');
create type public.variant_status as enum ('active', 'inactive');
create type public.personalization_field_type as enum (
  'text', 'textarea', 'date', 'select', 'file', 'number', 'checkbox'
);
create type public.addon_type as enum ('gift_wrap', 'rush', 'extra_revision', 'upgrade', 'other');
create type public.price_type as enum ('fixed', 'percentage');

-- ---------------------------------------------------------------------------
-- Digital product enums (docs/42 §2)
-- ---------------------------------------------------------------------------
create type public.digital_type as enum (
  'dijital_davetiye', 'web_davetiye', 'animasyonlu_davetiye', 'qr_kart', 'dijital_album', 'indirilebilir'
);
create type public.digital_behavior as enum ('digital_checkout', 'proof_required', 'quote_required');
create type public.digital_delivery_mode as enum ('link', 'download', 'hosted_page');
create type public.digital_project_status as enum (
  'draft', 'in_design', 'proof_sent', 'approved', 'delivered', 'expired'
);

-- ---------------------------------------------------------------------------
-- Service enums (docs/41)
-- ---------------------------------------------------------------------------
create type public.service_category as enum (
  'organizasyon', 'nisan_soz_setup', 'dogum_gunu', 'baby_shower', 'gender_reveal',
  'dekor_konsept', 'muzik_dj', 'foto_video', 'sehir_hizmeti', 'ozel'
);
create type public.service_behavior as enum (
  'quote_required', 'reservation_request', 'city_dependent_service', 'inquiry_only'
);
create type public.price_display as enum ('from_price', 'price_band', 'quote_only');
create type public.deposit_model as enum ('none', 'fixed', 'percentage');
create type public.travel_fee_model as enum ('none', 'fixed', 'per_km', 'quote');
create type public.consultation_channel as enum ('online', 'phone', 'whatsapp', 'in_person');
create type public.consultation_status as enum ('requested', 'confirmed', 'completed', 'no_show', 'cancelled');
create type public.quote_status as enum ('draft', 'sent', 'viewed', 'accepted', 'declined', 'expired', 'converted');
create type public.reservation_status as enum (
  'requested', 'quote_pending', 'confirmed', 'deposit_paid', 'in_planning',
  'ready', 'in_progress', 'completed', 'cancelled', 'rescheduled', 'no_show'
);
create type public.milestone_type as enum ('deposit', 'interim_payment', 'final_payment', 'delivery_step', 'approval_step');
create type public.milestone_status as enum ('pending', 'paid', 'done', 'waived', 'overdue');

-- ---------------------------------------------------------------------------
-- Cart / checkout / order / payment enums (docs/08, docs/43)
-- ---------------------------------------------------------------------------
create type public.cart_status as enum ('active', 'converted', 'abandoned', 'expired');
create type public.checkout_status as enum ('open', 'pending_payment', 'paid', 'failed', 'expired', 'converted');
create type public.order_status as enum (
  'pending_payment', 'paid', 'in_design', 'proof_sent', 'revision_requested', 'proof_approved',
  'in_production', 'quality_check', 'packed', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded'
);
create type public.payment_status as enum (
  'pending', 'authorized', 'paid', 'failed', 'cancelled', 'refunded', 'partially_refunded'
);
create type public.fulfillment_status as enum ('not_started', 'preparing', 'shipped', 'delivered', 'returned');
create type public.payable_type as enum ('order', 'reservation_deposit', 'reservation_balance', 'quote');
create type public.payment_provider as enum ('iyzico', 'paytr', 'bank_transfer', 'manual');
create type public.invoice_type as enum ('bireysel', 'kurumsal');
create type public.einvoice_status as enum ('not_required', 'pending', 'issued', 'failed');
create type public.refund_reason as enum ('customer_request', 'defect', 'cancellation', 'duplicate', 'goodwill', 'other');
create type public.refund_type as enum ('full', 'partial');
create type public.refund_status as enum ('requested', 'approved', 'processing', 'completed', 'rejected');

-- ---------------------------------------------------------------------------
-- Fulfillment / proof enums (docs/08, docs/28)
-- ---------------------------------------------------------------------------
create type public.shipping_method_type as enum ('cargo', 'courier', 'pickup');
create type public.shipment_status as enum ('preparing', 'shipped', 'in_transit', 'delivered', 'returned');
create type public.proof_status as enum ('draft', 'sent', 'approved', 'revision_requested');

-- ---------------------------------------------------------------------------
-- Account / UGC enums (docs/42 §3-5)
-- ---------------------------------------------------------------------------
create type public.favorite_item_type as enum ('product', 'service_package', 'collection', 'digital_product');
create type public.notification_type as enum (
  'order_update', 'proof_ready', 'payment', 'shipment', 'reservation_update',
  'quote_ready', 'support_reply', 'digital_delivery', 'marketing'
);
create type public.notification_channel as enum ('email', 'sms', 'whatsapp', 'onsite');
create type public.review_subject_type as enum ('product', 'service_package', 'order', 'experience', 'brand');
create type public.review_status as enum ('pending', 'approved', 'rejected', 'hidden');

-- ---------------------------------------------------------------------------
-- Support / CRM enums (docs/08)
-- ---------------------------------------------------------------------------
create type public.support_source as enum ('account', 'order', 'product', 'contact');
create type public.support_status as enum ('open', 'waiting_customer', 'waiting_team', 'closed');
create type public.support_sender_type as enum ('customer', 'staff');
create type public.lead_source_type as enum (
  'hayalini_tasarla', 'quote_request', 'product_inquiry', 'contact_form', 'memory_request', 'whatsapp', 'city_waitlist'
);
create type public.lead_status as enum ('new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost');
create type public.contact_inquiry_type as enum ('general', 'press', 'partnership', 'other');
create type public.contact_status as enum ('new', 'replied', 'closed');
create type public.client_status as enum ('active', 'past', 'archived');

-- ---------------------------------------------------------------------------
-- Legal / consent enums (docs/24, docs/42 §7)
-- ---------------------------------------------------------------------------
create type public.legal_doc_key as enum (
  'kvkk_aydinlatma', 'gizlilik', 'cerez', 'acik_riza', 'kullanim_kosullari',
  'on_bilgilendirme', 'mesafeli_satis', 'iade_iptal', 'teslimat',
  'kisisellestirilmis_urun', 'hizmet_rezervasyon', 'satici_bilgileri'
);
create type public.consent_type as enum (
  'kvkk', 'distance_sales', 'pre_info', 'cookie', 'marketing', 'explicit', 'photo_publish'
);
create type public.cookie_action as enum ('accept_all', 'reject_optional', 'configure');

-- ---------------------------------------------------------------------------
-- Content / CMS enums (docs/08)
-- ---------------------------------------------------------------------------
create type public.digital_offering_type as enum (
  'wedding_website', 'digital_invitation', 'rsvp', 'qr', 'guest_list', 'countdown', 'location_map', 'couple_story', 'gallery'
);
create type public.memory_offering_type as enum ('photo', 'film', 'drone', 'reels', 'love_story', 'family_memory', 'event_trailer');
create type public.faq_category as enum (
  'process', 'products', 'digital', 'rsvp', 'production', 'location', 'budget', 'customization', 'language', 'memory'
);
create type public.media_type as enum ('image', 'video', 'document');

-- ---------------------------------------------------------------------------
-- Search enum (docs/42 §8)
-- ---------------------------------------------------------------------------
create type public.search_entity_type as enum (
  'product', 'service_package', 'collection', 'experience', 'digital_product', 'article'
);

-- ---------------------------------------------------------------------------
-- Internal / staff enums (docs/23, docs/45 §7)
-- Superset so both docs/08 ('operations') and docs/45 granular roles resolve.
-- ---------------------------------------------------------------------------
create type public.staff_role as enum (
  'superadmin', 'admin', 'commerce_manager', 'product_editor', 'order_operations',
  'service_operations', 'proof_designer', 'support_agent', 'finance_viewer',
  'content_editor', 'content_publisher', 'sales_crm', 'operations'
);
create type public.assignment_status as enum ('proposed', 'confirmed', 'completed');
