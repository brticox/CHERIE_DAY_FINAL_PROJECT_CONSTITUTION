# CHECKOUT, PAYMENT AND ORDER STATE MACHINE

This file makes checkout and payment **deterministic and buildable**. It formalizes what `09`, `24`, `28`, and `33` described narratively: cart eligibility, mixed carts, the checkout step contract, the full order/payment/fulfillment state machine, deposits/installments, and failure/fraud states. Turkey-only per `19`/`24`.

---

## 1. Cart Composition Rules

A cart (`Seçimlerim`) may contain line items of these kinds:
- `product` (`cart_enabled`) — direct purchasable.
- `product_proof_required` (`proof_required_cart`) — purchasable; production gated by proof.
- `digital_product` (`digital_checkout`) — digital delivery.
- `product_addon` — attached to a parent line.

A cart may **not** directly contain:
- `quote_required` / `inquiry_only` items → these route to `/teklif` (add to a quote request, not the cart).
- `reservation_request` / `city_dependent_service` → route to reservation flow (`41`). Services are **separate payables**, never merged into the product cart.

If a user tries to add a non-cartable item, show the correct path in Turkish (e.g. `Bu ürün için size özel teklif hazırlıyoruz — Teklif Al`).

### Mixed payables
| Payable | Path | Payment |
|---|---|---|
| Product order (physical + digital + proof-required + addons) | `/secilimlerim` → `/odeme` | full or, where offered, installments |
| Service reservation | `41` reservation flow | deposit → milestones |
| Accepted quote | `/hesap/tekliflerim` | deposit or full per quote |

MVP does not combine a product order and a service deposit into a single transaction. Each produces its own `orders` row (`payable_type`, `42 §6`) and its own payment.

---

## 2. Checkout Step Contract (Turkey-only)

Order of steps (mobile: one step per screen; desktop: steps left, persistent `Sipariş Özeti` right — `11`, `31`):

1. **Giriş / Hesap** — login, register, or approved guest (§7). Return URL preserved.
2. **Teslimat** — Turkey delivery address (`customer_addresses`, country locked TR), delivery method (`shipping_methods`). Digital-only carts skip physical delivery but still collect billing/contact.
3. **Fatura** — billing identity: `invoice_type` bireysel/kurumsal → conditional fields (`42 §6`). Billing address (may equal delivery).
4. **Kişiselleştirme / Onay Özeti** — for proof-required items, confirm personalization inputs and show `Tasarım Onayı sonrası üretim başlar`.
5. **Ödeme** — provider selection (iyzico/PayTR/bank transfer), installment options where available, 3DS.
6. **Yasal Onaylar** — `Ön Bilgilendirme Formu` + `Mesafeli Satış Sözleşmesi` + KVKK consents, rendered from current versions, checkboxes near the pay button (`24`, `42 §7`). Store consent evidence.
7. **Sonuç** — success/failure/pending state (§5) + order tracking entry.

Guards (hard requirements before payment, per `26 §Checkout Eligibility`):
- delivery country = TR; reject otherwise with Turkish message (`29 smoke test`).
- every line item still eligible + in stock/made-to-order valid.
- required consents accepted (blocking).
- price re-validated server-side against `product_price_tiers`/variants (never trust client totals).
- personalization required fields present for proof items.

---

## 3. Checkout Session State

`checkout_sessions.status`: `open → pending_payment → paid | failed | expired | converted`.
- `open`: being filled.
- `pending_payment`: redirected/awaiting provider (3DS/bank transfer).
- `paid`: provider confirmed → create `order`.
- `failed`: provider declined → recovery (§5).
- `expired`: TTL passed (default 60 min) → cart preserved, session re-openable.
- `converted`: order created; session locked.
Idempotency: order creation keyed on `checkout_session_id` + provider payment id to prevent double orders on webhook + redirect race.

---

## 4. Order / Payment / Fulfillment State Machine

Three independent-but-linked status axes on `orders` (as in `08`), reconciled here as one authoritative machine. Aligns with `28` lifecycle and `33`/`11` labels.

### 4.1 `status` (order lifecycle — customer-facing)
```
pending_payment → paid → in_design → proof_sent ⇄ revision_requested → proof_approved
   → in_production → quality_check → packed → shipped → delivered → completed
Any → cancelled | refunded (with rules)
```
- Non-proof standard products skip `in_design/proof_*`: `paid → in_production/preparing → packed → shipped → delivered → completed`.
- Digital products: `paid → in_design → proof_sent ⇄ revision_requested → proof_approved → delivered → completed` (no shipment).

### 4.2 `payment_status`
`pending → authorized → paid → failed | cancelled | refunded | partially_refunded`.

### 4.3 `fulfillment_status`
`not_started → preparing → shipped → delivered → returned`.

### 4.4 Legal transition rules
- `paid` requires a confirmed provider event (webhook), not just client redirect.
- Production (`in_production`) must not start for proof items until `proof_approved` (`26`, `28`). No silent auto-approval in MVP.
- `cancelled`/`refunded` for personalized/made-to-order items follow `Kişiselleştirilmiş Ürün ve Tasarım Onayı Şartları` (may exclude withdrawal once production started) — enforced by admin rules + policy text, lawyer-reviewed (`24`).
- Standard-product distance-sales withdrawal window (generally 14 days) applies per `İade ve İptal Politikası`.

### Customer-facing status labels (Turkish) — canonical
`Ödeme Bekleniyor`, `Ödeme Alındı`, `Tasarım Sürecinde`, `Tasarım Onayı Bekleniyor`, `Revizyon İstendi`, `Onaylandı`, `Üretimde`, `Kalite Kontrol`, `Paketleniyor`, `Kargoya Verildi`, `Teslim Edildi`, `Tamamlandı`, `İptal Edildi`, `İade Edildi`.

---

## 5. Payment Outcome States & Recovery

| State | Route | Turkish copy (from `24`/`11`) | Next action |
|---|---|---|---|
| Success | `/odeme/basarili` | `Siparişiniz özenle alındı. Sıradaki adımı hesabınızdan takip edebilirsiniz.` | order tracking, account |
| Failure | `/odeme/basarisiz` | `Ödeme tamamlanamadı. Kart bilgilerinizi kontrol edebilir ya da bizimle WhatsApp üzerinden güvenle devam edebilirsiniz.` | retry (cart preserved), switch method, WhatsApp |
| Pending (3DS/bank transfer) | `/odeme/beklemede` | `Havale/EFT ile ilerlemek isterseniz siparişinizi sizin için ayırır, ödeme bilgilerini güvenli şekilde paylaşırız.` | show transfer details / await 3DS |
| Cancelled by user | back to `/odeme` | neutral, no blame | resume |

Recovery rules: failed payment never destroys the cart; retry preserves personalization/addons; after N failures (default 3) surface WhatsApp/manual assistance; bank transfer reserves the order in `pending_payment` with an expiry.

## 6. Fraud / Risk States

- 3DS required by default for card payments (`20`). Non-3DS only where provider/merchant policy explicitly allows.
- Provider risk decline → treat as `failed` with generic Turkish copy; **never expose raw provider error or risk reason** to the customer (`29`, `33`).
- Admin-only `payment_events` store raw payloads/risk codes (`23`). High-risk orders can be flagged `needs_review` (admin) before production release.
- Velocity/mismatch signals (billing/delivery mismatch, repeated failures) raise an internal review flag, not a customer-visible message.

## 7. Guest Checkout Decision

- Guest checkout is **allowed only if legal/security review approves** (`19 §5`). Default MVP posture: **account-required for proof/personalized/digital and service payables** (needed for proof approval, digital access, reservation tracking); optional guest allowed for simple standard products if approved.
- Guest orders still require KVKK/distance-sales consent and an email for order tracking; a `/siparis-takip` token grants scoped read (`23`, no broad anon access).
- A guest may convert to an account post-purchase (link order to new `customer`).

## 8. Payment Provider Abstraction (locked, from `20`/`24`)

`payment_provider = iyzico | paytr | bank_transfer | manual`. Normalized fields: provider, provider_payment_id, provider_conversation_id, normalized status, amount TRY, currency TRY, installment_count, masked card only, card family/network where safe, raw payload → admin-only `payment_events`. Webhook: verify signature, idempotent by provider event id, transactional status update, never public payload (`23 §Payment Security`).

## 9. Deposit & Installment Checkout (services + high-value)

- Deposit checkout (`/odeme/depozito/[reservation-number]`) reuses steps 3/5/6 (billing, payment, legal — `Hizmet ve Rezervasyon Şartları` instead of distance-sales-for-goods). Creates `orders` row with `payable_type=reservation_deposit` linked to the reservation; on success → reservation `deposit_paid` (`41 §6`).
- Installments (taksit) shown only where `installment_options` + provider/BIN support it; the customer sees the per-installment breakdown in TRY before confirming. No fabricated installment marketing.
- Balance milestones trigger a milestone checkout near `balance_due_date` (`41 §6`).

## 10. Acceptance (builder)

Checkout passes only if: Turkey guard enforced; totals server-validated; proof gate enforced; consents stored with version + timestamp; success/failure/pending all reachable and Turkish; webhook idempotent; no raw provider error leaks; service deposit path works end-to-end; digital delivery gated by ownership token.
