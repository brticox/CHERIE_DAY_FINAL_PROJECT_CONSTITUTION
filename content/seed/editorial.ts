import type { Article, Experience, Faq, PortfolioProject, Testimonial } from '@/lib/data/types';

export const experiences: Experience[] = [
  { id: 'exp-dugun', name: 'Düğün', slug: 'dugun', summary: 'Konseptten davetiyeye, günün akışına kadar tek bir estetik dil.', process_steps: [
    { title: 'Keşfet', description: 'Hikâyenizi ve konseptinizi birlikte belirleriz.' },
    { title: 'Tasarla', description: 'Davetiye, dekor ve detayları imzamızla kurgularız.' },
    { title: 'Koordine Et', description: 'Gününüzü baştan sona biz yönetiriz.' },
  ] },
  { id: 'exp-nisan-soz', name: 'Nişan & Söz', slug: 'nisan-soz', summary: 'Sözün en güzel hâli; tepsiden hediyeye.', process_steps: [] },
  { id: 'exp-isteme', name: 'İsteme', slug: 'isteme', summary: 'İki ailenin buluştuğu ilk zarif adım.', process_steps: [] },
  { id: 'exp-kina', name: 'Kına', slug: 'kina', summary: 'Geleneğin sıcaklığı, modern bir zarafetle.', process_steps: [] },
  { id: 'exp-nikah', name: 'Nikah', slug: 'nikah', summary: 'İnci bir sabah, sade bir tören.', process_steps: [] },
  { id: 'exp-dogum-gunu', name: 'Doğum Günü', slug: 'dogum-gunu', summary: 'Bir günü, tek bir hikâyeye dönüştürüyoruz.', process_steps: [] },
  { id: 'exp-baby-shower', name: 'Baby Shower', slug: 'baby-shower', summary: 'İlk kutlama, en yumuşak tonlarla.', process_steps: [] },
  { id: 'exp-gender-reveal', name: 'Gender Reveal', slug: 'gender-reveal', summary: 'Bir sürprizin, en zarif açılışı.', process_steps: [] },
  { id: 'exp-kurumsal', name: 'Kurumsal & Özel Etkinlik', slug: 'kurumsal', summary: 'Markanıza yakışan, ölçülü bir kutlama.', process_steps: [] },
  { id: 'exp-ozel-davetler', name: 'Özel Davetler', slug: 'ozel-davetler', summary: 'Sizin için tasarlanan, bir kereye özgü anlar.', process_steps: [] },
];

const REHBER: { title: string; excerpt: string; category: string }[] = [
  { title: 'Evde söz nasıl organize edilir?', excerpt: 'Küçük bir salonu, sıcak bir törene çevirmenin yolları.', category: 'nisan-soz' },
  { title: 'Nişan masası nasıl hazırlanır?', excerpt: 'Tepsiden çiçeğe, dengeli bir masa kurmanın adımları.', category: 'nisan-soz' },
  { title: 'Davetiye modelleri rehberi', excerpt: 'Kağıt, mühür ve tipografi; doğru davetiyeyi seçmek.', category: 'davetiye' },
  { title: 'Dijital davetiye ne zaman doğru seçim?', excerpt: 'Işıkla yazılan davetin avantajları ve incelikleri.', category: 'dijital' },
  { title: 'Düğün web sitesi rehberi', excerpt: 'Misafirlerinizi tek bir bağlantıda buluşturmak.', category: 'dijital' },
  { title: 'Hediyelik fikirleri', excerpt: 'Her misafire yakışan, hafif ama anlamlı jestler.', category: 'hediyelik' },
  { title: 'Kına gecesi hazırlığı', excerpt: 'Geleneği zarafetle buluşturan bir akşam kurmak.', category: 'organizasyon' },
  { title: 'Düğün bütçesi nasıl planlanır?', excerpt: 'Öncelikleri belirleyip huzurla ilerlemenin yolu.', category: 'planlama' },
  { title: 'Türkiye’de düğün planlama rehberi', excerpt: 'Sezon, mekân ve zamanlama üzerine sakin bir kılavuz.', category: 'planlama' },
  { title: 'İsteme için küçük dokunuşlar', excerpt: 'İki aileyi ısıtan, ölçülü detaylar.', category: 'nisan-soz' },
  { title: 'Nikah şekeri seçimi', excerpt: 'Tat ve sunumu dengede tutan seçimler.', category: 'hediyelik' },
  { title: 'Karşılama panosu fikirleri', excerpt: 'Kapıdaki ilk selamı zarifleştiren detaylar.', category: 'davetiye' },
];

export const articles: Article[] = REHBER.map((a, i) => ({
  id: `art-${i + 1}`,
  title: a.title,
  slug: a.title
    .replace(/[çğıöşüİ]/g, (c) => ({ ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', İ: 'i' })[c] ?? c)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, ''),
  excerpt: a.excerpt,
  body_tr: `${a.excerpt}\n\nBu rehber yazısı yakında CHERIE DAY editör ekibinin özenli içeriğiyle tamamlanacak. O zamana kadar sorularınız için bize danışabilirsiniz.`,
  category: a.category,
  author_display: 'CHERIE DAY Ekibi',
  published_at: '2026-06-01',
}));

export const faqs: Faq[] = [
  { id: 'faq-1', question: 'Siparişim ne zaman teslim edilir?', answer: 'Üretim süresi her ürün sayfasında belirtilir; teslimat Türkiye geneli yapılır.', category: 'process' },
  { id: 'faq-2', question: 'Tasarım onayı nasıl çalışır?', answer: 'Kişiselleştirilmiş ürünlerde tasarımınızı size gönderiririz; onayınızdan sonra üretim başlar.', category: 'production' },
  { id: 'faq-3', question: 'Hangi şehirlerde hizmet veriyorsunuz?', answer: 'Başlangıç olarak İstanbul, Ankara, İzmir, Bursa ve Antalya’da hizmet sunuyoruz.', category: 'location' },
  { id: 'faq-4', question: 'İade koşulları nelerdir?', answer: 'Standart ürünlerde 14 gün içinde iade; kişiselleştirilmiş ürünlerde farklı koşullar geçerlidir.', category: 'budget' },
  { id: 'faq-5', question: 'Kişiye özel tasarım yapıyor musunuz?', answer: 'Evet. Bespoke tasarımlar için “Teklif Al” adımından bize ulaşabilirsiniz.', category: 'customization' },
  { id: 'faq-6', question: 'Ödeme nasıl yapılır?', answer: 'Türkiye içi siparişlerde güvenli ödeme altyapısı kullanılır; detaylar ödeme adımında paylaşılır.', category: 'process' },
];

export const testimonials: Testimonial[] = [
  { id: 'tst-1', quote: 'Her detay, tek bir dilden konuşuyordu.', client_display_name: 'A. & M.', event_type: 'Düğün', location: 'İstanbul' },
  { id: 'tst-2', quote: 'Nişanımız, tam hayal ettiğimiz kadar sakin ve zarifti.', client_display_name: 'E. & K.', event_type: 'Nişan', location: 'Ankara' },
  { id: 'tst-3', quote: 'Davetiyeyi görünce günün tonunu anladık.', client_display_name: 'S. & B.', event_type: 'Söz', location: 'İzmir' },
];

export const portfolio: PortfolioProject[] = [
  { id: 'pf-1', title: 'Bahçe Düğünü', slug: 'bahce-dugunu', event_type: 'Düğün', city: 'İstanbul', guest_count_band: '151-300' },
  { id: 'pf-2', title: 'Şehir Nişanı', slug: 'sehir-nisani', event_type: 'Nişan', city: 'Ankara', guest_count_band: '76-150' },
  { id: 'pf-3', title: 'Yalı Söz Gecesi', slug: 'yali-soz-gecesi', event_type: 'Söz', city: 'İzmir', guest_count_band: '26-75' },
];
