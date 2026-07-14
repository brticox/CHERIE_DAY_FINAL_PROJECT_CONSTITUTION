# CHERIE DAY — Hukuk İçeriği Teslim Paketi

> Bu belge hukuki görüş değildir. Platform gerçeklerini, hukuk danışmanından beklenen kararları ve teknik teslim biçimini açıklar.

## Belge envanteri

| `doc_key` | Başlık | Kamu rotası | Kullanım | Durum |
|---|---|---|---|---|
| `kvkk_aydinlatma` | KVKK Aydınlatma Metni | `/kurumsal/kvkk-aydinlatma` | Formlar/hesap/checkout | Hukuk onayı bekliyor |
| `gizlilik` | Gizlilik Politikası | `/kurumsal/gizlilik` | Genel site | Hukuk onayı bekliyor |
| `cerez` | Çerez Politikası | `/kurumsal/cerez-politikasi` | Çerez banner/tercihler | Hukuk onayı bekliyor |
| `acik_riza` | Açık Rıza Metni | `/kurumsal/acik-riza` | Açık rıza gereken noktalar | Hukuk onayı bekliyor |
| `kullanim_kosullari` | Kullanım Koşulları | `/kurumsal/kullanim-kosullari` | Site/hesap | Hukuk onayı bekliyor |
| `on_bilgilendirme` | Ön Bilgilendirme Formu | `/kurumsal/on-bilgilendirme` | Checkout zorunlu | Hukuk onayı bekliyor |
| `mesafeli_satis` | Mesafeli Satış Sözleşmesi | `/kurumsal/mesafeli-satis` | Checkout zorunlu | Hukuk onayı bekliyor |
| `iade_iptal` | İade ve İptal Politikası | `/kurumsal/iade-iptal` | Satış sonrası | Hukuk onayı bekliyor |
| `teslimat` | Teslimat Politikası | `/kurumsal/teslimat` | Fiziksel ürün | Hukuk onayı bekliyor |
| `kisisellestirilmis_urun` | Kişiselleştirilmiş Ürün Şartları | `/kurumsal/kisisellestirilmis-urun-sartlari` | Prova/üretim | Hukuk onayı bekliyor |
| `hizmet_rezervasyon` | Hizmet ve Rezervasyon Şartları | `/kurumsal/hizmet-rezervasyon-sartlari` | Hizmet/depozito | Hukuk onayı bekliyor |
| `satici_bilgileri` | Satıcı Bilgileri | `/kurumsal/satici-bilgileri` | Genel/checkout | Şirket bilgileri bekliyor |

`/kurumsal/cerez-tercihleri`, `cerez` belgesine bağlı tercih yüzeyidir; ayrı hukuki sürüm anahtarı değildir.

## Platform gerçekleri

- Pazar Türkiye, para birimi TRY, arayüz dili `tr-TR`.
- Ödeme sağlayıcı hazırlıkları iyzico/PayTR alanlarını içerir; canlı sağlayıcı doğrulaması bu fazda yapılmamıştır.
- Checkout teslimat/fatura adresi, sepet tutarları, ödeme durumu, kabul edilen belge sürüm kimlikleri ve checkbox metnini kaydeder.
- Kişiselleştirilmiş ürünlerde prova onayı sonrası üretim akışı bulunur; iade/iptal sonucu kod tarafından hukuken kararlaştırılmaz.
- Hizmet talepleri; iletişim, teklif, randevu ve “hayalini tasarla” intake akışlarıdır. Gerçek rezervasyon/depozito koşulları ayrıca onaylanmalıdır.
- Türkiye içi gönderim verisi ve manuel takip alanı vardır; taşıyıcı entegrasyonu yoktur.
- Formlarda ad, e-posta/telefon, etkinlik bilgileri, adres, fatura bilgileri, kişiselleştirme ve destek notları işlenebilir.
- Çerez tercih sistemi gerekli/analitik/pazarlama ayrımını destekler; gerçek analitik ve pazarlama sağlayıcı listesi teyit edilmelidir.
- Transactional/operational bildirimler pazarlama izninden ayrıdır; pazarlama e-postası bu fazda uygulanmamıştır.

## Hukuk danışmanından gereken bilgiler ve kararlar

- Ticaret unvanı, MERSİS, vergi dairesi/no, ticaret sicili, açık adres, KEP, telefon ve destek e-postası.
- Veri sorumlusu/işleyen rolleri; saklama süreleri; aktarım/alıcı grupları; yurtdışı aktarım değerlendirmesi.
- Resend, Supabase, Vercel ve ödeme sağlayıcılarının metinlerde nasıl tanımlanacağı.
- Çerez kategorileri, sağlayıcıları, süreleri ve açık rıza gereksinimi.
- Kişiselleştirilmiş ürünlerde cayma hakkı istisnasının kapsamı ve prova onayının etkisi.
- Standart ürün iade/iptal, ayıplı ürün, teslimat, kargo hasarı ve ücret iadesi süre/kanalları.
- Hizmet rezervasyonu, ön ödeme/depozito, tarih değişikliği, iptal, mücbir sebep ve tedarikçi davranışı.
- Elektronik ticari ileti/onay/ret ve İYS yükümlülükleri (marketing bu fazın dışında).
- Zorunlu checkbox metinleri ve hangilerinin sözleşme kabulü, aydınlatma veya açık rıza olduğu.

## Teslim formatı ve yayınlama

Her metin `content/legal-import.example.json` biçiminde teslim edilir. Zorunlu alanlar: `doc_key`, `locale`, benzersiz `version`, başlık, özet, tam body, yürürlük tarihi, kaynak/yazar ve hukuk onay zamanı. `npm` testleri doğrulamayı ve SHA-256 içerik hash’ini kontrol eder.

Akış: `draft` → `awaiting_legal_review` → `approved` → `published`. Yayın, mevcut sürümü `superseded` yapar; geçmiş sürüm ve sipariş kabul kaydı değiştirilemez. Placeholder veya `needs_lawyer_review=true` içerik veritabanı kısıtıyla yayınlanamaz.

## Onay gelene kadar blokaj

Production checkout, onaylı ve yayımlanmış `on_bilgilendirme` ile `mesafeli_satis` sürümü olmadan devam etmez. İlgili hizmet/depozito akışı da onaylı hizmet şartları olmadan açılmamalıdır. Kod veya bu belge hukuki onay iddiasında bulunmaz.
