# TURKEY LEGAL PAYMENT POLICY LOCK

This file is an implementation policy lock, not final legal advice. A Turkish lawyer/accountant must review final public text before launch.

## Commerce Jurisdiction

MVP is Turkey-only:

- delivery inside Turkey only,
- Turkish checkout language,
- TRY storefront pricing,
- Turkey-first legal/KVKK documents,
- Turkey payment providers,
- no international shipping,
- no international storefront,
- no multi-currency storefront.

Foreign-issued card acceptance is allowed only as a payment compatibility feature for Turkey-only orders.

## Payment Provider Decision

Build a provider abstraction:

- `iyzico` primary,
- `paytr` secondary/fallback,
- `bank_transfer` manual fallback,
- `manual` for admin-recorded exceptional payments.

Required fields:

- provider,
- provider_payment_id,
- provider_conversation_id,
- normalized status,
- amount TRY,
- currency TRY,
- installment count,
- card family/network where safe,
- masked card only,
- raw webhook payload in admin-only `payment_events`.

## Payment UX Turkish Copy

Checkout trust line:

`Türkiye içi siparişlerde TROY, Visa, Mastercard ve desteklenen American Express kartlarıyla güvenli ödeme.`

Failure:

`Ödeme tamamlanamadı. Kart bilgilerinizi kontrol edebilir ya da bizimle WhatsApp üzerinden güvenle devam edebilirsiniz.`

Bank transfer fallback:

`Havale/EFT ile ilerlemek isterseniz siparişinizi sizin için ayırır, ödeme bilgilerini güvenli şekilde paylaşırız.`

## Legal Pages Required

- `KVKK Aydınlatma Metni`
- `Gizlilik Politikası`
- `Çerez Politikası`
- `Çerez Tercihleri`
- `Açık Rıza Metni` where needed
- `Kullanım Koşulları`
- `Ön Bilgilendirme Formu`
- `Mesafeli Satış Sözleşmesi`
- `İade ve İptal Politikası`
- `Teslimat Politikası`
- `Kişiselleştirilmiş Ürün ve Tasarım Onayı Şartları`
- `Satıcı Bilgileri`

## Consent Evidence

Store:

- consent type,
- policy version,
- timestamp,
- order id if relevant,
- user id/customer id if authenticated,
- IP/user-agent where legally appropriate,
- source route,
- checkbox label text version.

## Personalized Product Rule

For personalized/made-to-order products:

- product page must state proof requirement,
- checkout must state production begins after proof approval where relevant,
- return/cancellation text must distinguish standard products from personalized products,
- final lawyer review required for withdrawal exceptions.

## Invoice/Tax Lock

Engineering must support:

- sequential order number,
- invoice status,
- billing identity fields,
- billing address,
- tax identity/company fields if business customer flow is enabled later,
- exportable order/payment records for accounting.

MVP can collect individual customer billing details only unless business invoicing is explicitly scoped.

## Cookie Lock

Cookie UI must include:

- accept all,
- reject optional,
- configure,
- strictly necessary category,
- analytics category,
- marketing category,
- ability to change preferences later,
- no optional scripts before consent.

