import { notFound } from 'next/navigation';
import { DataWorkspace } from '@/components/admin/data-workspace';
const configs = {
  articles: {
    title: 'Makaleler',
    table: 'articles',
    fields: [
      { key: 'title', label: 'Başlık' },
      { key: 'slug', label: 'Slug' },
      { key: 'category', label: 'Kategori' },
    ],
    statusKey: 'status',
    dateKey: 'updated_at',
  },
  digital: {
    title: 'Dijital içerikler',
    table: 'digital_products',
    fields: [
      { key: 'name_tr', label: 'Ad' },
      { key: 'digital_type', label: 'Tür' },
      { key: 'delivery_mode', label: 'Teslim' },
    ],
    statusKey: 'status',
    dateKey: 'updated_at',
  },
  experiences: {
    title: 'Deneyimler',
    table: 'experiences',
    fields: [
      { key: 'name', label: 'Ad' },
      { key: 'slug', label: 'Slug' },
      { key: 'summary', label: 'Özet' },
    ],
    statusKey: 'status',
    dateKey: 'updated_at',
  },
  faqs: {
    title: 'SSS',
    table: 'faqs',
    fields: [
      { key: 'question', label: 'Soru' },
      { key: 'answer', label: 'Yanıt' },
      { key: 'category', label: 'Kategori' },
    ],
    statusKey: 'status',
  },
  galleries: {
    title: 'Galeriler',
    table: 'galleries',
    fields: [
      { key: 'title', label: 'Başlık' },
      { key: 'linked_entity_type', label: 'Bağlı tür' },
      { key: 'media_ids', label: 'Medya' },
    ],
    statusKey: 'status',
    dateKey: 'created_at',
  },
  memory: {
    title: 'Hatıra teklifleri',
    table: 'memory_offerings',
    fields: [
      { key: 'title_tr', label: 'Başlık' },
      { key: 'type', label: 'Tür' },
      { key: 'base_price', label: 'Fiyat' },
    ],
    statusKey: 'status',
  },
  portfolio: {
    title: 'Portfolyo',
    table: 'portfolio_projects',
    fields: [
      { key: 'title', label: 'Başlık' },
      { key: 'slug', label: 'Slug' },
      { key: 'city', label: 'Şehir' },
    ],
    statusKey: 'status',
    dateKey: 'created_at',
  },
  seo: {
    title: 'SEO kayıtları',
    table: 'seo_metadata',
    fields: [
      { key: 'title', label: 'Başlık' },
      { key: 'entity_type', label: 'Entity' },
      { key: 'canonical_url', label: 'Canonical' },
    ],
    dateKey: 'updated_at',
  },
  settings: {
    title: 'Site ayarları',
    table: 'site_settings',
    fields: [
      { key: 'business_name', label: 'İşletme' },
      { key: 'contact_email', label: 'E-posta' },
      { key: 'service_area_text', label: 'Hizmet alanı' },
    ],
    dateKey: 'updated_at',
  },
  testimonials: {
    title: 'Müşteri yorumları',
    table: 'testimonials',
    fields: [
      { key: 'client_display_name', label: 'Müşteri' },
      { key: 'quote', label: 'Yorum' },
      { key: 'event_type', label: 'Etkinlik' },
    ],
    statusKey: 'status',
    dateKey: 'created_at',
  },
} as const;
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ module: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { module } = await params;
  const config = configs[module as keyof typeof configs];
  if (!config) notFound();
  return (
    <DataWorkspace
      config={{
        path: `/admin/cms/${module}`,
        description:
          'İçerik kayıtlarının gerçek veritabanı görünümü; yayın durumu açıkça gösterilir.',
        ...config,
      }}
      query={(await searchParams).q}
    />
  );
}
