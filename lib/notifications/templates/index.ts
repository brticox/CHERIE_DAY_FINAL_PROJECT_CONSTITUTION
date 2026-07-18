import { NotificationError } from '../errors';
import type { NotificationPayload, RenderedEmail } from '../types';
import { notificationBaseUrl } from '../config';
import { escapeHtml, renderBrandedEmail, renderPlainText } from './components';

export { escapeHtml } from './components';

export type Definition = { subject: string; title: string; intro: string; cta: string };

const d = (subject: string, title: string, intro: string, cta = 'Ayrıntıları Gör'): Definition => ({
  subject, title, intro, cta,
});

// Canonical inventory required for launch. Entries without a database trigger are
// marked as such in the event catalog and remain previewable with safe fixture data.
const requiredTemplateDefinitions: Record<string, Definition> = {
  'auth-email-confirmation': d('E-posta adresinizi doğrulayın', 'Maison hesabınızı doğrulayın', 'Hesabınızı güvenle tamamlamak için doğrulama bağlantısını kullanın.', 'E-postamı Doğrula'),
  'auth-welcome': d('CHERIE DAY’e hoş geldiniz', 'Maison’a hoş geldiniz', 'Hesabınız hazır. Seçimlerinizi ve sipariş yolculuğunuzu tek yerden izleyebilirsiniz.', 'Hesabımı Aç'),
  'auth-password-reset': d('Şifrenizi güvenle yenileyin', 'Şifre yenileme talebiniz', 'Bu talebi siz oluşturduysanız güvenli bağlantı üzerinden yeni şifrenizi belirleyin.', 'Şifremi Yenile'),
  'auth-password-changed': d('Şifreniz değiştirildi', 'Güvenlik güncellemesi tamamlandı', 'Hesap şifreniz değiştirildi. Bu işlem size ait değilse destek ekibimizle hemen iletişime geçin.', 'Hesap Güvenliğini Aç'),
  'auth-email-changed': d('E-posta adresiniz değiştirildi', 'Hesap iletişim adresi güncellendi', 'Hesabınıza bağlı e-posta adresi güvenli biçimde güncellendi.', 'Hesabımı Aç'),
  'auth-new-login-alert': d('Hesabınıza yeni giriş', 'Yeni bir oturum algılandı', 'Tanımadığınız bir girişse şifrenizi yenileyin ve destek ekibimize ulaşın.', 'Hesap Güvenliğini Aç'),
  'auth-account-disabled-support': d('Hesap erişiminiz hakkında', 'Hesabınız destek incelemesinde', 'Güvenli erişim için destek ekibimiz kaydınızı incelemektedir.', 'Destek Al'),
  'order-received': d('Siparişinizi aldık', 'Siparişiniz kaydedildi', 'Sipariş ayrıntılarınız güvenli biçimde kaydedildi.', 'Siparişi Gör'),
  'order-confirmed': d('Siparişiniz onaylandı', 'Hazırlık yolculuğu başladı', 'Siparişiniz onaylandı ve operasyon planına alındı.', 'Siparişi İzle'),
  'order-updated': d('Siparişiniz güncellendi', 'Sipariş ayrıntıları yenilendi', 'Siparişinizdeki son değişiklik hesabınıza işlendi.', 'Siparişi Gör'),
  'order-cancelled': d('Siparişiniz iptal edildi', 'İptal kaydınız tamamlandı', 'Sipariş durumunuz güncellendi; finansal bir işlem varsa ayrıca bildirilecektir.', 'Siparişi Gör'),
  'order-completed': d('Siparişiniz tamamlandı', 'Yolculuğunuz tamamlandı', 'Bu özel güne eşlik etmemize izin verdiğiniz için teşekkür ederiz.', 'Siparişi Gör'),
  'payment-pending': d('Ödemeniz bekleniyor', 'Sipariş özetiniz hazır', 'Ödeme doğrulandıktan sonra siparişiniz bir sonraki adıma geçecektir.', 'Ödemeyi İncele'),
  'payment-paid': d('Ödemeniz alındı', 'Ödemeniz güvenle doğrulandı', 'Siparişinizi hazırlık sırasına aldık.', 'Siparişi İzle'),
  'payment-failed': d('Ödeme tamamlanamadı', 'Ödemeniz doğrulanamadı', 'Kartınızdan tahsilat doğrulanmadı; güvenli ödeme adımını yeniden deneyebilirsiniz.', 'Ödemeyi Yeniden Dene'),
  'payment-review-required': d('Ödemeniz inceleniyor', 'Güvenli finans incelemesi', 'Ödeme kaydınız finans ekibimizin güvenli inceleme sırasındadır.', 'Siparişi Gör'),
  'payment-refunded': d('İadeniz tamamlandı', 'İade sonucu doğrulandı', 'Ödeme sağlayıcısı iade işlemini başarılı olarak bildirdi.', 'İadeyi Gör'),
  'payment-refund-failed': d('İade işlemi inceleniyor', 'İade henüz tamamlanmadı', 'Finans ekibimiz sağlayıcı sonucunu güvenle incelemektedir.', 'İadeyi Gör'),
  'payment-receipt-ready': d('Ödeme belgeniz hazır', 'Sipariş ve ödeme özetiniz', 'Bu belge yasal fatura yerine geçmez; doğrulanmış işlem özetinizi hesabınızdan görebilirsiniz.', 'Özeti Aç'),
  invoice_issued: d('Faturanız hazır', 'Faturanız düzenlendi', 'Siparişinize ait fatura kaydı doğrulandı ve hesabınıza işlendi.', 'Faturayı Gör'),
  'proof-ready': d('Tasarımınız onaya hazır', 'Provanız sizi bekliyor', 'Üretim öncesi tasarımınızı inceleyebilir, onaylayabilir veya revizyon isteyebilirsiniz.', 'Tasarıma Bak'),
  'proof-reminder': d('Tasarımınız onayınızı bekliyor', 'Nazik bir prova hatırlatması', 'Üretim planının ilerlemesi için tasarım provanızı incelemenizi rica ederiz.', 'Tasarıma Bak'),
  'proof-revision-received': d('Revizyon talebinizi aldık', 'Notunuz tasarım ekibimizde', 'Güncellenen prova hazır olduğunda sizi bilgilendireceğiz.', 'Siparişi Gör'),
  'proof-updated': d('Tasarım provanız güncellendi', 'Yeni prova hazır', 'Revizyon notlarınıza göre hazırlanan yeni tasarımı inceleyebilirsiniz.', 'Yeni Provayı Aç'),
  'proof-approved': d('Tasarım onayınız kaydedildi', 'Onayınız tamamlandı', 'Onaylanan tasarım üretim hazırlığına geçti.', 'Siparişi İzle'),
  'production-started': d('Üretim başladı', 'Atölye süreci başladı', 'Onaylanan ayrıntılarla siparişiniz özenle hazırlanıyor.', 'Siparişi İzle'),
  'quality-issue': d('Siparişiniz için ek inceleme', 'Kalite ekibimiz ayrıntıları inceliyor', 'Teslimat standardımızı korumak için siparişiniz ek kalite kontrolüne alındı.', 'Siparişi Gör'),
  'shipment-dispatched': d('Siparişiniz yola çıktı', 'Gönderiniz yolda', 'Mevcut takip bilgilerini hesabınızdan görebilirsiniz.', 'Gönderiyi İzle'),
  'shipment-delayed': d('Gönderinizde gecikme var', 'Teslimat planı güncelleniyor', 'Kargo hareketini izliyor, yeni bilgiyi hesabınıza yansıtıyoruz.', 'Gönderiyi İzle'),
  'shipment-delivered': d('Siparişiniz teslim edildi', 'Teslimat tamamlandı', 'Siparişinizin teslim edildiği bilgisi bize ulaştı.', 'Siparişi Gör'),
  'shipment-problem': d('Gönderiniz için destek gerekiyor', 'Teslimat kaydı inceleniyor', 'Operasyon ekibimiz gönderi kaydındaki sorunu çözmek için çalışıyor.', 'Destek Kaydını Aç'),
  shipment_in_transit: d('Gönderiniz hareket halinde', 'Gönderiniz yolda', 'Kargo hareketi güncellendi; güncel takip bilgilerini hesabınızdan görebilirsiniz.', 'Gönderiyi İzle'),
  shipment_returned: d('Gönderiniz için destek gerekiyor', 'Gönderi iade kaydı oluştu', 'Operasyon ekibimiz gönderinin iade sürecini inceleyip sizinle iletişime geçecektir.', 'Destek Kaydını Aç'),
  'contact-received': d('Mesajınızı aldık', 'Talebiniz bize ulaştı', 'Notunuzu özenle inceleyip verdiğiniz iletişim bilgileri üzerinden dönüş yapacağız.', 'CHERIE DAY’i Keşfet'),
  'quote-requested': d('Teklif talebinizi aldık', 'Hayaliniz için ilk not alındı', 'İhtiyaçlarınızı inceleyip kapsamı netleştirmek için sizinle iletişime geçeceğiz.', 'Talebi Gör'),
  'quote-ready': d('Teklifiniz hazır', 'Size özel çalışma hazırlandı', 'Teklif ayrıntılarını güvenli hesabınızdan inceleyebilirsiniz.', 'Teklifi Aç'),
  'appointment-requested': d('Randevu talebinizi aldık', 'Buluşma talebiniz kaydedildi', 'Uygunluk kontrolünün ardından sizinle iletişime geçeceğiz.', 'Talebi Gör'),
  'appointment-confirmed': d('Randevunuz onaylandı', 'Buluşma planınız hazır', 'Randevu ayrıntıları güvenli biçimde kaydedildi.', 'Randevuyu Gör'),
  'appointment-reminder': d('Randevunuz yaklaşıyor', 'Buluşmamız için küçük bir hatırlatma', 'Randevu saati ve ayrıntılarını hesabınızdan kontrol edebilirsiniz.', 'Randevuyu Gör'),
  'appointment-rescheduled': d('Randevunuz güncellendi', 'Yeni buluşma zamanı kaydedildi', 'Güncel tarih ve saat bilgilerini hesabınızdan görebilirsiniz.', 'Randevuyu Gör'),
  'appointment-cancelled': d('Randevunuz iptal edildi', 'İptal kaydı tamamlandı', 'Yeni bir zaman planlamak isterseniz concierge ekibimiz yanınızdadır.', 'Yeni Randevu İste'),
  'reservation-confirmed': d('Rezervasyonunuz onaylandı', 'Rezervasyon planınız hazır', 'Rezervasyon ayrıntıları güvenli biçimde kaydedildi.', 'Rezervasyonu Gör'),
  'support-case-created': d('Destek talebinizi aldık', 'Destek kaydınız oluşturuldu', 'Ekibimiz talebinizi inceleyip kayıt üzerinden size dönüş yapacaktır.', 'Destek Kaydını Aç'),
  'support-case-updated': d('Destek kaydınız güncellendi', 'Talebinizde yeni bir gelişme var', 'Son yanıtı ve kayıt ayrıntılarını güvenli hesabınızdan görebilirsiniz.', 'Destek Kaydını Aç'),
  'support-case-resolved': d('Destek kaydınız çözüldü', 'Talebiniz sonuçlandı', 'Çözüm ayrıntıları destek kaydınıza işlendi.', 'Çözümü Gör'),
  'legal-request-received': d('Yasal talebinizi aldık', 'Gizlilik talebiniz kaydedildi', 'Talebiniz yetkili ekip tarafından güvenli biçimde incelenecektir.', 'Talebi Gör'),
  'staff-new-order': d('Yeni sipariş operasyon bekliyor', 'Yeni sipariş kaydı', 'Doğrulanmış sipariş operasyon sırasına alınabilir.', 'Siparişi Aç'),
  'staff-payment-failure': d('Ödeme hatası inceleme gerektiriyor', 'Başarısız ödeme bildirimi', 'Müşteri ve sağlayıcı kaydı finans incelemesi bekliyor.', 'Ödemeyi Aç'),
  'staff-payment-mismatch': d('Ödeme tutarı uyuşmuyor', 'Finansal eşleşme incelemesi', 'Sipariş ve sağlayıcı tutarları arasında fark algılandı.', 'İncelemeyi Aç'),
  'staff-refund-review': d('İade incelemesi bekliyor', 'Finans onayı gerekiyor', 'İade kaydı güvenli manuel değerlendirme bekliyor.', 'İadeyi Aç'),
  'staff-proof-overdue': d('Prova onayı gecikti', 'Operasyon takibi gerekiyor', 'Prova zaman eşiğini aştı ve takip bekliyor.', 'Provayı Aç'),
  'staff-shipment-failure': d('Gönderi sorunu inceleme gerektiriyor', 'Teslimat müdahalesi gerekiyor', 'Kargo kaydı operasyon ekibinin incelemesini bekliyor.', 'Gönderiyi Aç'),
  'staff-email-failure': d('Bildirim teslim edilemedi', 'E-posta müdahalesi gerekiyor', 'Kalıcı teslimat hatası güvenli inceleme bekliyor.', 'Bildirimleri Aç'),
  'staff-auth-failure': d('Kimlik doğrulama hata eşiği aşıldı', 'Hesap erişimi incelemesi', 'Staging kimlik akışında olağandışı hata artışı algılandı.', 'Kimlik Kayıtlarını Aç'),
  'staff-worker-failure': d('Bildirim işçisi çalışamadı', 'Kuyruk müdahalesi gerekiyor', 'Bildirim işleme görevi güvenli inceleme bekliyor.', 'Bildirimleri Aç'),
  'staff-reconciliation-critical': d('Kritik mutabakat farkı', 'Finansal müdahale gerekiyor', 'Ödeme mutabakatında kritik bir fark algılandı.', 'Mutabakatı Aç'),
};

export const requiredLaunchTemplateKeys = Object.freeze(
  Object.keys(requiredTemplateDefinitions),
);

export const templateDefinitions: Record<string, Definition> = {
  ...requiredTemplateDefinitions,
  account_welcome: {
    subject: 'CHERIE DAY’e hoş geldiniz',
    title: 'Maison’a hoş geldiniz',
    intro:
      'Hesabınız hazır. Seçimlerinizi ve sipariş yolculuğunuzu tek yerden izleyebilirsiniz.',
    cta: 'Hesabımı Aç',
  },
  intake_contact_received: {
    subject: 'Mesajınızı aldık',
    title: 'Talebiniz bize ulaştı',
    intro:
      'Notunuzu özenle inceleyip verdiğiniz iletişim bilgileri üzerinden dönüş yapacağız.',
    cta: 'CHERIE DAY’i Keşfet',
  },
  intake_appointment_received: {
    subject: 'Randevu talebinizi aldık',
    title: 'Buluşma talebiniz kaydedildi',
    intro: 'Uygunluk kontrolünün ardından sizinle iletişime geçeceğiz.',
    cta: 'Hizmetleri İncele',
  },
  intake_quote_received: {
    subject: 'Teklif talebinizi aldık',
    title: 'Hayaliniz için ilk not alındı',
    intro:
      'İhtiyaçlarınızı inceleyip kapsamı netleştirmek için sizinle iletişime geçeceğiz.',
    cta: 'Talep Sürecini İncele',
  },
  intake_dream_received: {
    subject: 'Hayalinizi aldık',
    title: 'Hikâyenizin ilk sayfası açıldı',
    intro: 'Paylaştığınız ayrıntıları maison ekibimiz özenle değerlendirecek.',
    cta: 'Maison’u Keşfet',
  },
  order_received: {
    subject: 'Siparişinizi aldık',
    title: 'Siparişiniz kaydedildi',
    intro: 'Sipariş yolculuğunuzu hesabınızdan takip edebilirsiniz.',
    cta: 'Siparişi Gör',
  },
  payment_pending: {
    subject: 'Ödemeniz bekleniyor',
    title: 'Sipariş özetiniz hazır',
    intro:
      'Siparişiniz kaydedildi; ödeme doğrulandıktan sonra bir sonraki adıma geçeceğiz.',
    cta: 'Siparişi Gör',
  },
  order_status_paid: {
    subject: 'Ödemeniz alındı',
    title: 'Ödemeniz güvenle doğrulandı',
    intro: 'Siparişinizi hazırlık sırasına aldık.',
    cta: 'Siparişi İzle',
  },
  order_status_failed: {
    subject: 'Ödeme tamamlanamadı',
    title: 'Ödemeniz doğrulanamadı',
    intro:
      'Kartınızdan tahsilat doğrulanmadı. Dilerseniz güvenli ödeme adımını yeniden deneyebilirsiniz.',
    cta: 'Siparişi Gör',
  },
  order_status_in_design: {
    subject: 'Tasarım süreci başladı',
    title: 'Tasarım masasına geçtik',
    intro: 'Kişiselleştirme ayrıntılarınız ekibimiz tarafından hazırlanıyor.',
    cta: 'Siparişi İzle',
  },
  order_status_proof_sent: {
    subject: 'Tasarımınız onaya hazır',
    title: 'Provanız sizi bekliyor',
    intro:
      'Üretim öncesi tasarımınızı inceleyip onaylayabilir veya revizyon isteyebilirsiniz.',
    cta: 'Tasarımı İncele',
  },
  order_status_revision_requested: {
    subject: 'Revizyon talebiniz alındı',
    title: 'Notunuz tasarım ekibimizde',
    intro:
      'Talebinizi kaydettik; güncellenen prova hazır olduğunda sizi bilgilendireceğiz.',
    cta: 'Siparişi Gör',
  },
  order_status_proof_approved: {
    subject: 'Tasarım onayınız kaydedildi',
    title: 'Onayınız tamamlandı',
    intro: 'Onaylanan tasarım üretim hazırlığına geçti.',
    cta: 'Siparişi İzle',
  },
  order_status_in_production: {
    subject: 'Üretim başladı',
    title: 'Atölye süreci başladı',
    intro: 'Onaylanan ayrıntılarla siparişiniz hazırlanıyor.',
    cta: 'Siparişi İzle',
  },
  order_status_quality_check: {
    subject: 'Siparişiniz kalite kontrolünde',
    title: 'Son kontroller yapılıyor',
    intro: 'Siparişiniz paketleme öncesi kontrol ediliyor.',
    cta: 'Siparişi İzle',
  },
  order_status_packed: {
    subject: 'Siparişiniz paketlendi',
    title: 'Özenle paketlendi',
    intro: 'Siparişiniz gönderim adımına hazırlanıyor.',
    cta: 'Siparişi İzle',
  },
  order_status_shipped: {
    subject: 'Siparişiniz yola çıktı',
    title: 'Gönderiniz yolda',
    intro: 'Mevcut takip bilgilerini hesabınızdan görebilirsiniz.',
    cta: 'Gönderiyi İzle',
  },
  order_status_delivered: {
    subject: 'Siparişiniz teslim edildi',
    title: 'Teslimat tamamlandı',
    intro: 'Siparişinizin teslim edildiği bilgisi bize ulaştı.',
    cta: 'Siparişi Gör',
  },
  order_status_completed: {
    subject: 'Siparişiniz tamamlandı',
    title: 'Yolculuğunuz tamamlandı',
    intro: 'Bu özel güne eşlik etmemize izin verdiğiniz için teşekkür ederiz.',
    cta: 'Siparişi Gör',
  },
  order_status_cancelled: {
    subject: 'Siparişiniz iptal edildi',
    title: 'İptal kaydınız tamamlandı',
    intro:
      'Sipariş durumunuz güncellendi. Finansal işlemler varsa ayrıca bildirilecektir.',
    cta: 'Siparişi Gör',
  },
  order_status_refund_processing: {
    subject: 'İade işleminiz başladı',
    title: 'İade süreci başlatıldı',
    intro: 'İade işleminiz ödeme kanalının işleyişine göre takip ediliyor.',
    cta: 'Siparişi Gör',
  },
  order_status_refunded: {
    subject: 'İade işleminiz tamamlandı',
    title: 'İade kaydı tamamlandı',
    intro: 'İade durumunuz hesabınıza işlendi.',
    cta: 'Siparişi Gör',
  },
  refund_requested: {
    subject: 'İade talebiniz kaydedildi',
    title: 'İade talebiniz incelemede',
    intro:
      'Talebiniz finans ekibinin güvenli inceleme sırasına alındı; henüz bankaya iade gönderilmedi.',
    cta: 'Siparişi Gör',
  },
  refund_approved: {
    subject: 'İade talebiniz onaylandı',
    title: 'İade onayı tamamlandı',
    intro: 'Onaylanan tutar ödeme sağlayıcısına gönderilmek üzere hazır.',
    cta: 'Siparişi Gör',
  },
  refund_submitted: {
    subject: 'İadeniz ödeme kanalına iletildi',
    title: 'İade işleniyor',
    intro: 'İade talebi ödeme sağlayıcısına iletildi; tamamlanma kanıtı bekleniyor.',
    cta: 'Siparişi Gör',
  },
  refund_succeeded: {
    subject: 'İadeniz tamamlandı',
    title: 'İade sonucu doğrulandı',
    intro: 'Ödeme sağlayıcısı iade işlemini başarılı olarak bildirdi.',
    cta: 'Siparişi Gör',
  },
  refund_failed: {
    subject: 'İade işlemi yeniden inceleniyor',
    title: 'İade henüz tamamlanmadı',
    intro:
      'Ödeme kanalı iade sonucunu onaylamadı; finans ekibimiz kaydı güvenle inceliyor.',
    cta: 'Siparişi Gör',
  },
  staff_new_contact: {
    subject: 'Yeni iletişim talebi',
    title: 'Yeni talep bekliyor',
    intro: 'Yeni iletişim kaydı operasyon incelemesine hazır.',
    cta: 'Talebi Aç',
  },
  staff_new_appointment: {
    subject: 'Yeni randevu talebi',
    title: 'Yeni randevu talebi',
    intro: 'Uygunluk ve dönüş planı için yeni kayıt bekliyor.',
    cta: 'Talebi Aç',
  },
  staff_new_quote: {
    subject: 'Yeni teklif talebi',
    title: 'Yeni teklif talebi',
    intro: 'Kapsamlandırılması gereken yeni bir talep var.',
    cta: 'Talebi Aç',
  },
  staff_new_dream: {
    subject: 'Yeni hayal planlama talebi',
    title: 'Yeni planlama brief’i',
    intro: 'Maison ekibinin değerlendirmesi için yeni brief kaydedildi.',
    cta: 'Talebi Aç',
  },
  staff_paid: {
    subject: 'Yeni ödenmiş sipariş',
    title: 'Ödeme doğrulandı',
    intro: 'Yeni sipariş operasyon sırasına alınabilir.',
    cta: 'Siparişi Aç',
  },
  staff_revision_requested: {
    subject: 'Tasarım revizyonu istendi',
    title: 'Revizyon notu bekliyor',
    intro: 'Müşteri yeni bir revizyon talebi bıraktı.',
    cta: 'Provayı Aç',
  },
  staff_proof_approved: {
    subject: 'Tasarım onaylandı',
    title: 'Üretim onayı geldi',
    intro: 'Onaylanan prova üretim planına alınabilir.',
    cta: 'Siparişi Aç',
  },
  staff_payment_failed: {
    subject: 'Ödeme hatası inceleme gerektiriyor',
    title: 'Başarısız ödeme bildirimi',
    intro: 'Müşteri ve sağlayıcı kaydı operasyon incelemesi bekliyor.',
    cta: 'Ödemeyi Aç',
  },
  staff_refund_failed: {
    subject: 'İade hatası finans incelemesi gerektiriyor',
    title: 'İade tamamlanamadı',
    intro:
      'Sağlayıcı sonucu ve tekrar denenebilirlik finans ekibi tarafından incelenmeli.',
    cta: 'İadeyi Aç',
  },
  staff_notification_permanently_failed: {
    subject: 'Bildirim kalıcı olarak başarısız',
    title: 'Teslim edilemeyen bildirim',
    intro: 'Deneme sınırına ulaşan veya kalıcı hata alan bir bildirim var.',
    cta: 'Bildirimleri Aç',
  },
};

export function renderTemplate(
  templateKey: string,
  payload: NotificationPayload,
): RenderedEmail {
  const definition = templateDefinitions[templateKey];
  if (!definition)
    throw new NotificationError(
      `Template bulunamadı: ${templateKey}`,
      'template_not_found',
      false,
    );
  const rawName = textValue(payload.customer_name) || 'Değerli misafirimiz';
  const rawIdentifier = textValue(payload.order_number) || textValue(payload.lead_id);
  const identifier = escapeHtml(rawIdentifier);
  const baseUrl = notificationBaseUrl();
  const isStaff = templateKey.startsWith('staff_');
  const href = isStaff
    ? `${baseUrl}/admin/marketing/notifications`
    : rawIdentifier
      ? `${baseUrl}/hesap/siparisler/${encodeURIComponent(rawIdentifier)}`
      : baseUrl;
  const subjectSuffix = identifier ? ` · ${identifier}` : '';
  const preheader = `${definition.title}. ${definition.intro}`;
  const text = renderPlainText({
    content: definition,
    customerName: rawName,
    identifier: rawIdentifier,
    href,
    contact: process.env.NOTIFICATION_REPLY_TO_EMAIL ?? 'CHERIE DAY destek ekibi',
  });
  return {
    subject: `${definition.subject}${subjectSuffix}`,
    preheader,
    text,
    html: renderBrandedEmail({
      content: definition,
      customerName: rawName,
      identifier: rawIdentifier,
      href,
      preheader,
      logoUrl: `${baseUrl}/brand/logo.svg`,
    }),
  };
}

function textValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}
