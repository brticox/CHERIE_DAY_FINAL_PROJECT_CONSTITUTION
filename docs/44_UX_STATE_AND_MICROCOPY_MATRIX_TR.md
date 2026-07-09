# UX STATE AND MICROCOPY MATRIX (TR)

Every screen must define its non-happy-path states. `25`, `29`, `31` set tokens and acceptance; this file gives the **complete state matrix with Turkish microcopy** so builders never invent copy or ship a blank state. This is functional/UX, not creative — the frozen opening (`38`) is out of scope.

Voice: warm but precise (`19 §2`, `12`). Empty/confirmation states may be warm; errors/legal/payment stay clear and calm. Do not over-poeticize functional states (`27`).

---

## 1. Universal State Set

Every data-driven view must handle: **loading, empty, error, offline, partial, unauthorized, forbidden**. Every form must handle: **idle, focus, validating, invalid, submitting, success, server-error**. Every list must handle: **loading (skeleton), empty, filtered-empty, error, end-of-results**.

### Global microcopy
| State | Turkish |
|---|---|
| Generic loading | `Yükleniyor…` (prefer skeletons over spinners for content) |
| Generic error + retry | `Bir şeyler ters gitti. Lütfen tekrar deneyin.` / button `Tekrar Dene` |
| Offline | `Bağlantınız kesildi. İnternet bağlantınızı kontrol edip tekrar deneyin.` |
| 404 (`/not-found`) | `Aradığınız sayfayı bulamadık. Dilerseniz mağazamıza göz atabilirsiniz.` + CTA `Mağazaya Dön` |
| 500 (`/hata`) | `Şu an bir aksaklık yaşıyoruz. Ekibimiz durumdan haberdar. Birazdan tekrar deneyebilirsiniz.` |
| Forbidden (wrong owner) | `Bu içeriğe erişim yetkiniz yok.` |
| Session expired | `Oturumunuzun süresi doldu. Güvenliğiniz için tekrar giriş yapın.` |

---

## 2. Commerce State Matrix

### Product listing / department
| State | Turkish |
|---|---|
| Loading | product-card skeletons (image + 2 lines) |
| Empty department | `Bu bölüm yakında zarif seçimlerle dolacak. O zamana kadar koleksiyonlarımıza göz atabilirsiniz.` |
| Filtered-empty | `Seçtiğiniz filtrelere uygun ürün bulunamadı. Filtreleri sadeleştirmeyi deneyin.` + `Filtreleri Temizle` |
| End of results | `Şimdilik hepsi bu kadar.` |

### Product detail
| State | Turkish |
|---|---|
| Out of stock / unavailable | badge `Şu an mevcut değil` + `Haber ver` (stock notify) or `Ürün Hakkında Sor` |
| Made-to-order | `Siparişe özel üretilir · Üretim: [X] iş günü` |
| Variant unavailable | disabled, visible, tooltip `Bu seçenek şu an mevcut değil` (`33` rule) |
| Proof-required | `Bu ürün Tasarım Onayı ile üretilir. Onayınızdan sonra üretim başlar.` |
| Quote-required | price shows `Teklif ile` + CTA `Teklif Al` |

### Cart (`Seçimlerim`)
| State | Turkish |
|---|---|
| Empty | `Seçimleriniz henüz boş. Size yakışacak parçaları birlikte bulalım.` + `Mağazayı Keşfet` (`25`) |
| Item removed | `Parça seçimlerinizden çıkarıldı.` + `Geri Al` |
| Price/stock changed since add | `Bazı ürünlerin bilgileri güncellendi. Lütfen sepetinizi gözden geçirin.` |
| Ineligible item present | inline note routing to quote/reservation path |

### Checkout / payment
See `43 §5` for outcome copy. Field-level:
| State | Turkish |
|---|---|
| Required field | `Bu alan gerekli.` |
| Invalid email | `Geçerli bir e-posta girin.` |
| Invalid TR phone | `Geçerli bir telefon numarası girin (5xx xxx xx xx).` |
| Invalid TCKN/VKN | `Geçerli bir kimlik/vergi numarası girin.` |
| Non-TR delivery attempt | `Şu anda yalnızca Türkiye içi teslimat yapıyoruz.` |
| Consent not checked | `Devam etmek için sözleşmeleri onaylamanız gerekir.` |
| Submitting | button spinner + `İşleminiz güvenle tamamlanıyor…` (never leave button un-disabled) |

### Order / reservation tracking
Use canonical status labels (`43 §4`, `41 §5`). Empty: `Henüz bir siparişiniz bulunmuyor.` / `Henüz bir rezervasyonunuz bulunmuyor.` with a gentle CTA.

---

## 3. Account & Auth State Matrix

| Screen | State | Turkish |
|---|---|---|
| Login | wrong credentials | `E-posta veya şifre hatalı. Tekrar deneyin.` |
| Login | unverified (if email verify used) | `Hesabınızı doğrulamanız gerekiyor. E-postanızı kontrol edin.` |
| Register | email exists | `Bu e-posta ile bir hesap zaten var. Giriş yapabilirsiniz.` |
| Register | weak password | `Şifreniz en az 8 karakter olmalı.` |
| Forgot password | sent | `Şifre sıfırlama bağlantısını e-postanıza gönderdik.` |
| Protected route, logged out | redirect to `/hesap/giris` + `Devam etmek için giriş yapın.` |
| Empty favorites | `Beğendiğiniz parçaları burada saklayabilirsiniz.` |
| Empty notifications | `Yeni bir bildiriminiz yok.` |
| Empty support | `Henüz bir destek talebiniz yok. Size nasıl yardımcı olabiliriz?` |
| Empty digital projects | `Henüz dijital bir tasarımınız yok.` |

Auth quality (from `11`): visible labels, correct input types, autocomplete, 44px targets, no English labels (`Giriş Yap`, `Üye Ol`, `Şifremi Unuttum`).

---

## 4. Proof Approval States (customer)

| State | Turkish |
|---|---|
| Proof ready | `Tasarımınız hazır. İncelemenizi bekliyor.` + `Tasarımı Onayla` / `Küçük Bir Revizyon İste` |
| Approved | `Tasarımı onayladınız. Üretim sürecini sizin için başlatıyoruz.` |
| Revision requested | `Revizyon talebiniz alındı. Güncel tasarımı en kısa sürede paylaşacağız.` |
| Revision limit reached | `Bu ürün için ücretsiz revizyon hakkınız doldu. Ek revizyon için sizinle iletişime geçelim.` (`26`) |

---

## 5. Search (`/arama`) — Behavior & States

### Behavior
- Query params: `q`, `tur` (urun/hizmet/koleksiyon/rehber), plus facet filters.
- Turkish-character tolerant + diacritic-normalized (`ç/c, ş/s, ı/i/İ, ğ/g, ö/o, ü/u`), typo-tolerant, case-insensitive (`33`, `42 §8`).
- Searches: product names, department/category, materials, occasions, tags, service packages, collections, rehber titles. **Never returns suppliers/vendors/internal data.**
- Results grouped by type with counts; instant/suggest dropdown from header `Arama`.
- Only `published` entities; respects RLS.

### States
| State | Turkish |
|---|---|
| Idle (open, no query) | show popular searches + departments: `Popüler aramalar` |
| Loading | result skeletons |
| No results | `“[query]” için sonuç bulamadık. Yazımı kontrol edebilir veya kategorilere göz atabilirsiniz.` + suggested departments/collections + WhatsApp `Aradığınızı bulamadıysanız size yardımcı olalım.` |
| Too short | `Aramak için en az 2 karakter girin.` |
| Error | generic error + retry |

No-result must always offer a **path forward** (categories, popular items, WhatsApp), never a dead end.

---

## 6. Service / Reservation States (customer)

| State | Turkish |
|---|---|
| City not served | `Bu hizmeti henüz [şehir] için sunmuyoruz. İlgilenirseniz sizi bekleme listemize ekleyelim.` (creates `city_waitlist` lead, `41`) |
| Date unavailable | `Seçtiğiniz tarih dolu görünüyor. Size en yakın uygun tarihleri önerelim mi?` |
| Reservation submitted | `Rezervasyon talebiniz alındı. En kısa sürede sizinle iletişime geçeceğiz.` |
| Deposit required | `Rezervasyonunuzu kesinleştirmek için ön ödeme adımına geçebilirsiniz.` |
| Quote sent | `Size özel teklifiniz hazır. Hesabınızdan inceleyebilirsiniz.` |

---

## 7. Cookie & Consent UX

- Cookie banner on first visit: `Deneyiminizi iyileştirmek için çerezler kullanıyoruz.` with **three** clear actions: `Tümünü Kabul Et` · `Yalnızca Gerekli` · `Tercihleri Yönet` (`24 §Cookie Lock`). No optional scripts fire before choice.
- Preferences reachable anytime via footer `Çerez Tercihleri`.
- Marketing consent is a separate, unbundled opt-in (never pre-checked) (`20 §5`).

---

## 8. Accessibility & Motion Acceptance (reinforces `29`)

- All interactive states keyboard reachable; visible focus ring (`--cherie-focus`, `25`).
- Every form control has a visible `<label>`; errors are programmatically associated and announced.
- Payment/critical errors use `aria-live` (`29`).
- `prefers-reduced-motion`: disable scroll-driven and decorative motion; keep content fully usable; opening degrades to static (`38` fallback).
- Color contrast WCAG AA on all text incl. status badges.
- Skeletons reserve final dimensions (no CLS, `29`).
- Toasts/inline confirmations never replace an accessible status region for critical flows.

## 9. Builder Acceptance

A screen is not done until its loading, empty, error, and (where relevant) unauthorized/forbidden/no-result states exist with the Turkish copy above (or an approved equivalent) and are covered by at least a render/smoke test (`29`).
