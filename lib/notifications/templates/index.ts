import { NotificationError } from '../errors';
import type { NotificationPayload, RenderedEmail } from '../types';

type Definition = { subject: string; title: string; intro: string; cta: string };

export const templateDefinitions: Record<string, Definition> = {
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
  const name = escapeHtml(rawName);
  const identifier = escapeHtml(rawIdentifier);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const isStaff = templateKey.startsWith('staff_');
  const href = isStaff
    ? `${baseUrl}/admin/marketing/notifications`
    : rawIdentifier
      ? `${baseUrl}/hesap/siparisler/${encodeURIComponent(rawIdentifier)}`
      : baseUrl;
  const subjectSuffix = identifier ? ` · ${identifier}` : '';
  const preheader = `${definition.title}. ${definition.intro}`;
  const text = `${definition.title}\n\n${rawName},\n\n${definition.intro}${rawIdentifier ? `\n\nReferans: ${rawIdentifier}` : ''}\n\n${definition.cta}: ${href}\n\nDestek: ${process.env.NOTIFICATION_REPLY_TO_EMAIL ?? 'CHERIE DAY destek ekibi'}\n\nBu ileti hizmet/operasyon bilgilendirmesidir; pazarlama iletisi değildir.`;
  return {
    subject: `${definition.subject}${subjectSuffix}`,
    preheader,
    text,
    html: emailShell({ name, identifier, definition, href, preheader }),
  };
}

function emailShell({
  name,
  identifier,
  definition,
  href,
  preheader,
}: {
  name: string;
  identifier: string;
  definition: Definition;
  href: string;
  preheader: string;
}) {
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f6f0e7;color:#321b20;font-family:Arial,sans-serif"><div style="display:none;max-height:0;overflow:hidden">${escapeHtml(preheader)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="100%" style="max-width:620px;background:#fffaf2;border:1px solid #dfd1c0;border-radius:18px" cellspacing="0" cellpadding="0"><tr><td style="padding:28px 32px;border-bottom:1px solid #dfd1c0;color:#771d32;font-family:Georgia,serif;font-size:24px">CHERIE DAY</td></tr><tr><td style="padding:36px 32px"><p style="margin:0 0 16px;color:#806b62;font-size:14px">${name},</p><h1 style="margin:0 0 18px;font-family:Georgia,serif;font-size:34px;line-height:1.15;color:#4d1725">${escapeHtml(definition.title)}</h1><p style="margin:0 0 18px;font-size:16px;line-height:1.7">${escapeHtml(definition.intro)}</p>${identifier ? `<p style="margin:0 0 24px;color:#806b62;font-size:14px">Referans: <strong>${identifier}</strong></p>` : ''}<a href="${escapeHtml(href)}" style="display:inline-block;padding:13px 20px;background:#6f1730;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold">${escapeHtml(definition.cta)}</a></td></tr><tr><td style="padding:22px 32px;border-top:1px solid #dfd1c0;color:#806b62;font-size:12px;line-height:1.6">Bu ileti hizmet veya operasyon bilgilendirmesidir; pazarlama iletisi değildir.<br>CHERIE DAY · İstanbul, Türkiye</td></tr></table></td></tr></table></body></html>`;
}

export function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char] ??
      char,
  );
}

function textValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}
