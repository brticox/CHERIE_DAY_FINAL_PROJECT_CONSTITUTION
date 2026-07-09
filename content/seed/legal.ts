import type { LegalDocument } from '@/lib/data/types';

/**
 * Legal document placeholders (docs/24, docs/40 §3.13). Slugs match the
 * /kurumsal/* routes. Body is PLACEHOLDER text and every document is flagged
 * `needs_lawyer_review` — real Turkish legal copy requires lawyer approval
 * before launch (docs/22 remaining dependencies).
 */
const PLACEHOLDER =
  'Bu metin yer tutucudur ve yürürlüğe girmeden önce hukuk danışmanı tarafından incelenip onaylanacaktır. Sorularınız için CHERIE DAY ekibiyle iletişime geçebilirsiniz.';

function doc(
  slug: string,
  doc_key: string,
  title_tr: string,
  intro: string,
): LegalDocument {
  return {
    slug,
    doc_key,
    title_tr,
    body_tr: `${intro}\n\n${PLACEHOLDER}`,
    needs_lawyer_review: true,
    effective_from: null,
  };
}

export const legalDocuments: LegalDocument[] = [
  doc('kvkk-aydinlatma', 'kvkk_aydinlatma', 'KVKK Aydınlatma Metni', 'Kişisel verilerinizin hangi amaçlarla işlendiğini ve haklarınızı bu metinde açıklarız.'),
  doc('gizlilik', 'gizlilik', 'Gizlilik Politikası', 'Verilerinizi nasıl koruduğumuzu ve kullandığımızı burada bulabilirsiniz.'),
  doc('cerez-politikasi', 'cerez', 'Çerez Politikası', 'Deneyiminizi iyileştirmek için kullandığımız çerezleri açıklarız.'),
  doc('cerez-tercihleri', 'cerez', 'Çerez Tercihleri', 'Çerez tercihlerinizi buradan yönetebilirsiniz: zorunlu, analitik ve pazarlama.'),
  doc('acik-riza', 'acik_riza', 'Açık Rıza Metni', 'Belirli veri işleme faaliyetleri için açık rızanızı bu metinle alırız.'),
  doc('kullanim-kosullari', 'kullanim_kosullari', 'Kullanım Koşulları', 'Siteyi ve hizmetleri kullanırken geçerli olan koşulları açıklarız.'),
  doc('on-bilgilendirme', 'on_bilgilendirme', 'Ön Bilgilendirme Formu', 'Siparişiniz öncesinde ürün, fiyat ve teslimat bilgilerini burada paylaşırız.'),
  doc('mesafeli-satis', 'mesafeli_satis', 'Mesafeli Satış Sözleşmesi', 'Mesafeli satışa ilişkin tarafların hak ve yükümlülüklerini düzenler.'),
  doc('iade-iptal', 'iade_iptal', 'İade ve İptal Politikası', 'Standart ve kişiselleştirilmiş ürünlerde iade/iptal koşullarını açıklarız.'),
  doc('teslimat', 'teslimat', 'Teslimat Politikası', 'Türkiye içi teslimat süreçlerini ve sürelerini burada bulabilirsiniz.'),
  doc('kisisellestirilmis-urun-sartlari', 'kisisellestirilmis_urun', 'Kişiselleştirilmiş Ürün ve Tasarım Onayı Şartları', 'Tasarım onayı sonrası üretime geçen ürünlerin özel koşullarını düzenler.'),
  doc('hizmet-rezervasyon-sartlari', 'hizmet_rezervasyon', 'Hizmet ve Rezervasyon Şartları', 'Hizmet rezervasyonu, ön ödeme ve iptal koşullarını açıklar.'),
  doc('satici-bilgileri', 'satici_bilgileri', 'Satıcı Bilgileri', 'Satıcıya ait ticari bilgiler ve iletişim detayları burada yer alır.'),
];
