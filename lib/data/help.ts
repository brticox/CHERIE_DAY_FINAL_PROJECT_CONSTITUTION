import { ROUTES } from './routes';

/**
 * Editorial help-centre content (static; not DB-driven). Each topic routes the
 * customer to the correct contextual mailbox (docs Phase 4H ownership split):
 * order questions → orders@, payment → payments@, legal → legal@, else support@.
 */

export type HelpMailbox = 'support' | 'orders' | 'payments' | 'legal';

export const HELP_EMAILS: Record<HelpMailbox, string> = {
  support: 'support@cherieday.eu',
  orders: 'orders@cherieday.eu',
  payments: 'payments@cherieday.eu',
  legal: 'legal@cherieday.eu',
};

export interface HelpTopic {
  slug: string;
  title: string;
  summary: string;
  intro: string;
  faqs: { q: string; a: string }[];
  related: { label: string; href: string }[];
  mailbox: HelpMailbox;
}

export const helpTopics: HelpTopic[] = [
  {
    slug: 'siparis-takibi',
    title: 'Siparişimi nasıl takip ederim?',
    summary: 'Sipariş durumunuzu görmenin ve güncel kalmanın yolları.',
    intro:
      'Siparişinizin her adımı — onay, üretim, kargo — hesabınızdaki sipariş sayfasında görünür. Önemli her aşamada ayrıca bilgilendirme alırsınız.',
    faqs: [
      {
        q: 'Sipariş durumumu nereden görürüm?',
        a: 'Hesabınıza giriş yapıp “Siparişlerim” bölümünden ilgili siparişi açtığınızda güncel durumu ve varsa kargo bilgisini görebilirsiniz.',
      },
      {
        q: 'Kişiye özel ürünümün üretimi ne zaman başlar?',
        a: 'Tasarım onaylı ürünlerde üretim, tasarımınızı onayladıktan sonra başlar. Üretim süresi ürün sayfasında iş günü olarak belirtilir.',
      },
      {
        q: 'Kargoya verildi mi, nasıl anlarım?',
        a: 'Siparişiniz kargolandığında durumu “Kargoda” olarak güncellenir ve takip bilgisi paylaşılır.',
      },
    ],
    related: [
      { label: 'Siparişlerim', href: ROUTES.hesap + '/siparisler' },
      { label: 'Teslimat & Kargo', href: `${ROUTES.kurumsal}/teslimat` },
    ],
    mailbox: 'orders',
  },
  {
    slug: 'teslimat-kargo',
    title: 'Teslimat ve kargo',
    summary: 'Türkiye içi teslimat süreçleri ve süreleri.',
    intro:
      'Ürünlerimizi Türkiye geneline özenli paketlemeyle gönderiyoruz. Teslimat süresi, üretim süresine kargo süresinin eklenmesiyle oluşur.',
    faqs: [
      {
        q: 'Teslimat ne kadar sürer?',
        a: 'Toplam süre; ürünün üretim süresi (ürün sayfasında belirtilir) ile kargo süresinin toplamıdır. Kişiye özel ürünlerde onay tarihi başlangıç kabul edilir.',
      },
      {
        q: 'Hangi bölgelere gönderim yapıyorsunuz?',
        a: 'Türkiye’nin tamamına gönderim yapıyoruz. Organizasyon ve kurulum hizmetleri ise belirli şehirlerde sunulur.',
      },
      {
        q: 'Kırılabilir ürünler nasıl gönderiliyor?',
        a: 'Tepsi, cam ve seramik gibi ürünler koruyucu ambalajla, taşımaya dayanıklı biçimde paketlenir.',
      },
    ],
    related: [
      { label: 'Teslimat Koşulları', href: `${ROUTES.kurumsal}/teslimat` },
      { label: 'Şehir Hizmetleri', href: ROUTES.hizmetlerSehir },
    ],
    mailbox: 'orders',
  },
  {
    slug: 'tasarim-onayi',
    title: 'Tasarım onayı nasıl işler?',
    summary: 'Kişiye özel ürünlerde onay adımı ve süreç.',
    intro:
      'Kişiye özel baskı işlerinde son söz her zaman sizindir. Tasarımınızı size gönderir, onayınızı bekleriz; üretim yalnızca onaydan sonra başlar.',
    faqs: [
      {
        q: 'Kaç kez revizyon isteyebilirim?',
        a: 'Standart süreçte belirli sayıda düzeltme hakkınız vardır. Kapsamlı değişiklikler için ek revizyon seçeneği sunulabilir.',
      },
      {
        q: 'Onaylamazsam ne olur?',
        a: 'Onayınızı vermeden üretim başlamaz. Birlikte tasarımı istediğiniz noktaya getiririz.',
      },
      {
        q: 'Yazım hatalarından kim sorumlu?',
        a: 'Onayladığınız metin baskıya esas alınır; bu yüzden onay öncesi isim, tarih ve metinleri dikkatle kontrol etmenizi rica ederiz.',
      },
    ],
    related: [
      { label: 'Tasarım Onaylarım', href: ROUTES.hesap + '/tasarim-onaylari' },
      {
        label: 'Kişiselleştirilmiş Ürün Şartları',
        href: `${ROUTES.kurumsal}/kisisellestirilmis-urun-sartlari`,
      },
    ],
    mailbox: 'support',
  },
  {
    slug: 'iade-degisim',
    title: 'İade ve değişim',
    summary: 'İade koşulları ve kişiye özel ürünlerde durum.',
    intro:
      'Standart ürünlerde yasal iade hakkınız saklıdır. Kişiye özel üretilen ürünlerde ise, size özel hazırlandıkları için farklı koşullar geçerlidir.',
    faqs: [
      {
        q: 'Standart ürünü iade edebilir miyim?',
        a: 'Evet. Kullanılmamış standart ürünleri teslim aldıktan sonra yasal süre içinde iade edebilirsiniz.',
      },
      {
        q: 'Kişiye özel ürünler iade edilebilir mi?',
        a: 'Kişiselleştirilmiş ürünler size özel üretildiğinden, ayıplı olmadıkça iade kapsamı dışındadır. Ayıplı üründe elbette yanınızdayız.',
      },
      {
        q: 'Ürün hasarlı geldiyse ne yapmalıyım?',
        a: 'Paketi açtığınızda hasar fark ederseniz görselleriyle birlikte bize ulaşın; en kısa sürede çözüme kavuştururuz.',
      },
    ],
    related: [
      { label: 'İade & İptal Koşulları', href: `${ROUTES.kurumsal}/iade-iptal` },
      { label: 'Mesafeli Satış Sözleşmesi', href: `${ROUTES.kurumsal}/mesafeli-satis` },
    ],
    mailbox: 'orders',
  },
  {
    slug: 'odeme-guvenlik',
    title: 'Ödeme ve güvenlik',
    summary: 'Güvenli ödeme ve fiyat doğrulaması.',
    intro:
      'Ödemeler güvenli altyapı üzerinden alınır. Sipariş tutarı, ödeme adımında her zaman sunucuda yeniden doğrulanır — ekranda gördüğünüzle ödediğiniz aynıdır.',
    faqs: [
      {
        q: 'Fiyatlar neden ödeme adımında yeniden hesaplanıyor?',
        a: 'Güncel fiyat, kişiselleştirme ve adet gibi seçimlerinizle birlikte sunucuda doğrulanır. Bu, sürprizsiz ve şeffaf bir ödeme sağlar.',
      },
      {
        q: 'Kart bilgilerim güvende mi?',
        a: 'Ödeme bilgileriniz güvenli ödeme altyapısında işlenir; kart verileriniz sitemizde saklanmaz.',
      },
      {
        q: 'Hizmetlerde ön ödeme var mı?',
        a: 'Tarihe bağlı hizmetlerde, tarihi ayırmak için ön ödeme (depozito) istenebilir. Koşullar teklifinizde açıkça belirtilir.',
      },
    ],
    related: [
      { label: 'Mesafeli Satış Sözleşmesi', href: `${ROUTES.kurumsal}/mesafeli-satis` },
      {
        label: 'Hizmet & Rezervasyon Şartları',
        href: `${ROUTES.kurumsal}/hizmet-rezervasyon-sartlari`,
      },
    ],
    mailbox: 'payments',
  },
  {
    slug: 'dijital-teslimat',
    title: 'Dijital ürün teslimatı',
    summary: 'Dijital davetiye, QR ve web davetiye teslimatı.',
    intro:
      'Dijital ürünlerde fiziksel kargo yoktur. Hazır şablonlar hızla teslim edilir; kişiye özel dijital işlerde önce tasarım onayınızı alırız.',
    faqs: [
      {
        q: 'Dijital davetiyemi ne zaman alırım?',
        a: 'Hazır şablonlar ödeme sonrası kısa sürede teslim edilir. Kişiye özel tasarımlarda süre, onay adımına göre değişir.',
      },
      {
        q: 'Dosyayı nasıl paylaşırım?',
        a: 'Dijital davetiyeniz bir bağlantı veya dosya olarak size ulaşır; sevdiklerinize tek dokunuşla iletebilirsiniz.',
      },
      {
        q: 'Sonradan düzeltme yapabilir miyim?',
        a: 'Teslim sonrası küçük düzeltmeler için bize yazın; kapsamına göre değerlendirelim.',
      },
    ],
    related: [
      { label: 'Dijital Ürünler', href: ROUTES.dijital },
      { label: 'Dijital Projelerim', href: ROUTES.hesap + '/dijital' },
    ],
    mailbox: 'support',
  },
];

export function getHelpTopics(): HelpTopic[] {
  return helpTopics;
}

export function getHelpTopicBySlug(slug: string): HelpTopic | undefined {
  return helpTopics.find((t) => t.slug === slug);
}
