import type { AdminCapability } from '@/lib/admin/permissions';

export type ManagedField = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'datetime' | 'tags' | 'json';
  required?: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: string;
  placeholder?: string;
  options?: readonly { value: string; label: string }[];
};

export type ManagedResource = {
  key: string;
  table:
    | 'coupons'
    | 'campaigns'
    | 'articles'
    | 'faqs'
    | 'galleries'
    | 'testimonials'
    | 'suppliers'
    | 'teams';
  title: string;
  singular: string;
  listPath: string;
  readCapability: AdminCapability;
  writeCapability: AdminCapability;
  writeRoles: readonly string[];
  fields: readonly ManagedField[];
  deleteAllowed: boolean;
};

const contentStatus = [
  { value: 'draft', label: 'Taslak' },
  { value: 'published', label: 'Yayında' },
] as const;

export const MANAGED_RESOURCES = {
  coupons: {
    key: 'coupons',
    table: 'coupons',
    title: 'Kuponlar',
    singular: 'Kupon',
    listPath: '/admin/marketing/coupons',
    readCapability: 'catalog.read',
    writeCapability: 'catalog.write',
    writeRoles: ['superadmin', 'admin', 'commerce_manager'],
    deleteAllowed: true,
    fields: [
      { key: 'code', label: 'Kod', type: 'text', required: true, maxLength: 60, placeholder: 'CHERIE10' },
      { key: 'description', label: 'Açıklama', type: 'textarea', maxLength: 500 },
      { key: 'discount_type', label: 'İndirim türü', type: 'select', required: true, options: [
        { value: 'percentage', label: 'Yüzde' }, { value: 'fixed', label: 'Sabit tutar' },
      ] },
      { key: 'discount_value', label: 'İndirim değeri', type: 'number', required: true, min: 0.01, step: '0.01' },
      { key: 'scope', label: 'Kapsam', type: 'select', options: [
        { value: '', label: 'Genel' }, { value: 'collection', label: 'Koleksiyon' },
        { value: 'category', label: 'Kategori' }, { value: 'product', label: 'Ürün' },
        { value: 'service', label: 'Hizmet' }, { value: 'global', label: 'Tüm mağaza' },
      ] },
      { key: 'scope_id', label: 'Kapsam kayıt kimliği', type: 'text', maxLength: 36 },
      { key: 'min_order_amount', label: 'Minimum sepet', type: 'number', min: 0, step: '0.01' },
      { key: 'usage_limit', label: 'Toplam kullanım limiti', type: 'number', min: 1, step: '1' },
      { key: 'per_customer_limit', label: 'Müşteri başına limit', type: 'number', min: 1, step: '1' },
      { key: 'starts_at', label: 'Başlangıç', type: 'datetime' },
      { key: 'ends_at', label: 'Bitiş', type: 'datetime' },
      { key: 'is_active', label: 'Etkin', type: 'boolean' },
    ],
  },
  campaigns: {
    key: 'campaigns', table: 'campaigns', title: 'Kampanyalar', singular: 'Kampanya',
    listPath: '/admin/marketing/campaigns', readCapability: 'catalog.read', writeCapability: 'catalog.write',
    writeRoles: ['superadmin', 'admin', 'commerce_manager'],
    deleteAllowed: true,
    fields: [
      { key: 'name', label: 'Ad', type: 'text', required: true, maxLength: 160 },
      { key: 'description', label: 'Açıklama', type: 'textarea', maxLength: 1000 },
      { key: 'channel', label: 'Kanal', type: 'select', options: [
        { value: '', label: 'Kanal seçilmedi' }, { value: 'email', label: 'E-posta' },
        { value: 'sms', label: 'SMS' }, { value: 'whatsapp', label: 'WhatsApp' },
        { value: 'onsite', label: 'Site içi' },
      ] },
      { key: 'scope', label: 'Kapsam', type: 'text', maxLength: 120 },
      { key: 'starts_at', label: 'Başlangıç', type: 'datetime' },
      { key: 'ends_at', label: 'Bitiş', type: 'datetime' },
      { key: 'is_active', label: 'Etkin', type: 'boolean' },
    ],
  },
  articles: {
    key: 'articles', table: 'articles', title: 'Makaleler', singular: 'Makale',
    listPath: '/admin/cms/articles', readCapability: 'content.read', writeCapability: 'content.write',
    writeRoles: ['superadmin', 'admin', 'content_editor', 'content_publisher'],
    deleteAllowed: true,
    fields: [
      { key: 'title', label: 'Başlık', type: 'text', required: true, maxLength: 180 },
      { key: 'slug', label: 'Adres kısa adı', type: 'text', required: true, maxLength: 160, placeholder: 'ornek-makale' },
      { key: 'excerpt', label: 'Özet', type: 'textarea', maxLength: 500 },
      { key: 'body', label: 'İçerik (JSON)', type: 'json', required: true, placeholder: '{\n  "blocks": []\n}' },
      { key: 'category', label: 'Kategori', type: 'text', maxLength: 100 },
      { key: 'author_display', label: 'Yazar', type: 'text', required: true, maxLength: 120 },
      { key: 'status', label: 'Yayın durumu', type: 'select', required: true, options: contentStatus },
    ],
  },
  faqs: {
    key: 'faqs', table: 'faqs', title: 'SSS', singular: 'Soru',
    listPath: '/admin/cms/faqs', readCapability: 'content.read', writeCapability: 'content.write',
    writeRoles: ['superadmin', 'admin', 'content_editor', 'content_publisher'],
    deleteAllowed: true,
    fields: [
      { key: 'question', label: 'Soru', type: 'text', required: true, maxLength: 300 },
      { key: 'answer', label: 'Yanıt', type: 'textarea', required: true, maxLength: 4000 },
      { key: 'category', label: 'Kategori', type: 'select', required: true, options: [
        'process','products','digital','rsvp','production','location','budget','customization','language','memory',
      ].map((value) => ({ value, label: value })) },
      { key: 'linked_entity_type', label: 'Bağlı içerik türü', type: 'text', maxLength: 80 },
      { key: 'linked_entity_id', label: 'Bağlı kayıt kimliği', type: 'text', maxLength: 36 },
      { key: 'sort_order', label: 'Sıra', type: 'number', min: 0, step: '1' },
      { key: 'status', label: 'Yayın durumu', type: 'select', required: true, options: contentStatus },
    ],
  },
  galleries: {
    key: 'galleries', table: 'galleries', title: 'Galeriler', singular: 'Galeri',
    listPath: '/admin/cms/galleries', readCapability: 'content.read', writeCapability: 'content.write',
    writeRoles: ['superadmin', 'admin', 'content_editor', 'content_publisher'],
    deleteAllowed: true,
    fields: [
      { key: 'title', label: 'Başlık', type: 'text', maxLength: 180 },
      { key: 'media_ids', label: 'Medya kimlikleri', type: 'tags', placeholder: 'Her satıra veya virgülle bir UUID' },
      { key: 'linked_entity_type', label: 'Bağlı içerik türü', type: 'text', maxLength: 80 },
      { key: 'linked_entity_id', label: 'Bağlı kayıt kimliği', type: 'text', maxLength: 36 },
      { key: 'status', label: 'Yayın durumu', type: 'select', required: true, options: contentStatus },
    ],
  },
  testimonials: {
    key: 'testimonials', table: 'testimonials', title: 'Müşteri yorumları', singular: 'Yorum',
    listPath: '/admin/cms/testimonials', readCapability: 'content.read', writeCapability: 'content.write',
    writeRoles: ['superadmin', 'admin', 'content_editor', 'content_publisher'],
    deleteAllowed: true,
    fields: [
      { key: 'client_display_name', label: 'Görünen müşteri adı', type: 'text', maxLength: 100 },
      { key: 'quote', label: 'Yorum', type: 'textarea', required: true, maxLength: 2000 },
      { key: 'event_type', label: 'Etkinlik türü', type: 'text', maxLength: 100 },
      { key: 'location', label: 'Konum', type: 'text', maxLength: 120 },
      { key: 'status', label: 'Yayın durumu', type: 'select', required: true, options: contentStatus },
    ],
  },
  suppliers: {
    key: 'suppliers', table: 'suppliers', title: 'Tedarikçiler', singular: 'Tedarikçi',
    listPath: '/admin/operations/suppliers', readCapability: 'system.read', writeCapability: 'system.read',
    writeRoles: ['superadmin', 'admin', 'operations'],
    deleteAllowed: true,
    fields: [
      { key: 'name', label: 'Ad', type: 'text', required: true, maxLength: 160 },
      { key: 'contact_info', label: 'İletişim bilgileri (JSON)', type: 'json', required: true, placeholder: '{\n  "phone": "...",\n  "email": "..."\n}' },
      { key: 'capability_tags', label: 'Yetenek etiketleri', type: 'tags' },
      { key: 'internal_rating', label: 'İç puan', type: 'number', min: 1, max: 5, step: '1' },
      { key: 'notes', label: 'Notlar', type: 'textarea', maxLength: 2000 },
      { key: 'status', label: 'Durum', type: 'select', required: true, options: [
        { value: 'active', label: 'Aktif' }, { value: 'inactive', label: 'Pasif' },
      ] },
    ],
  },
  teams: {
    key: 'teams', table: 'teams', title: 'Ekipler', singular: 'Ekip',
    listPath: '/admin/operations/teams', readCapability: 'system.read', writeCapability: 'system.read',
    writeRoles: ['superadmin', 'admin', 'operations'],
    deleteAllowed: true,
    fields: [
      { key: 'name', label: 'Ekip adı', type: 'text', required: true, maxLength: 160 },
      { key: 'member_names', label: 'Üyeler', type: 'tags' },
      { key: 'capability_tags', label: 'Yetenek etiketleri', type: 'tags' },
      { key: 'notes', label: 'Notlar', type: 'textarea', maxLength: 2000 },
    ],
  },
} as const satisfies Record<string, ManagedResource>;

export type ManagedResourceKey = keyof typeof MANAGED_RESOURCES;

export function getManagedResource(value: string) {
  return MANAGED_RESOURCES[value as ManagedResourceKey] ?? null;
}

export function canWriteManagedResource(role: string, resource: ManagedResource) {
  return resource.writeRoles.includes(role);
}
