export const ADMIN_ROLES = [
  'superadmin',
  'admin',
  'commerce_manager',
  'product_editor',
  'order_operations',
  'service_operations',
  'proof_designer',
  'support_agent',
  'finance_viewer',
  'content_editor',
  'content_publisher',
  'sales_crm',
  'operations',
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];
export type AdminCapability =
  | 'dashboard.read'
  | 'catalog.read'
  | 'catalog.write'
  | 'catalog.publish'
  | 'orders.read'
  | 'orders.transition'
  | 'proofs.write'
  | 'services.read'
  | 'services.write'
  | 'crm.read'
  | 'crm.write'
  | 'content.read'
  | 'content.write'
  | 'content.publish'
  | 'finance.read'
  | 'legal.read'
  | 'legal.publish'
  | 'system.read'
  | 'staff.manage'
  | 'audit.read';

const ROLE_CAPABILITIES: Record<AdminRole, readonly AdminCapability[]> = {
  superadmin: [
    'dashboard.read',
    'catalog.read',
    'catalog.write',
    'catalog.publish',
    'orders.read',
    'orders.transition',
    'proofs.write',
    'services.read',
    'services.write',
    'crm.read',
    'crm.write',
    'content.read',
    'content.write',
    'content.publish',
    'finance.read',
    'legal.read',
    'legal.publish',
    'system.read',
    'staff.manage',
    'audit.read',
  ],
  admin: [
    'dashboard.read',
    'catalog.read',
    'catalog.write',
    'catalog.publish',
    'orders.read',
    'orders.transition',
    'proofs.write',
    'services.read',
    'services.write',
    'crm.read',
    'crm.write',
    'content.read',
    'content.write',
    'content.publish',
    'finance.read',
    'legal.read',
    'legal.publish',
    'system.read',
    'audit.read',
  ],
  commerce_manager: [
    'dashboard.read',
    'catalog.read',
    'catalog.write',
    'catalog.publish',
    'orders.read',
    'orders.transition',
    'services.read',
    'finance.read',
  ],
  product_editor: ['dashboard.read', 'catalog.read', 'catalog.write'],
  order_operations: [
    'dashboard.read',
    'orders.read',
    'orders.transition',
    'proofs.write',
  ],
  service_operations: ['dashboard.read', 'services.read', 'services.write'],
  proof_designer: ['dashboard.read', 'orders.read', 'proofs.write'],
  support_agent: ['dashboard.read', 'orders.read', 'crm.read'],
  finance_viewer: ['dashboard.read', 'finance.read', 'audit.read'],
  content_editor: [
    'dashboard.read',
    'catalog.read',
    'content.read',
    'content.write',
    'legal.read',
  ],
  content_publisher: [
    'dashboard.read',
    'catalog.read',
    'catalog.publish',
    'content.read',
    'content.write',
    'content.publish',
    'legal.read',
  ],
  sales_crm: ['dashboard.read', 'services.read', 'crm.read', 'crm.write'],
  operations: [
    'dashboard.read',
    'orders.read',
    'orders.transition',
    'proofs.write',
    'services.read',
    'services.write',
    'system.read',
  ],
};

export function isAdminRole(role: string): role is AdminRole {
  return ADMIN_ROLES.includes(role as AdminRole);
}

export function can(role: string, capability: AdminCapability) {
  return isAdminRole(role) && ROLE_CAPABILITIES[role].includes(capability);
}
export function capabilitiesFor(role: string): readonly AdminCapability[] {
  return isAdminRole(role) ? ROLE_CAPABILITIES[role] : [];
}

export const ROLE_LABELS: Record<AdminRole, string> = {
  superadmin: 'Süper Yönetici',
  admin: 'Yönetici',
  commerce_manager: 'Ticaret Yöneticisi',
  product_editor: 'Ürün Editörü',
  order_operations: 'Sipariş Operasyonları',
  service_operations: 'Hizmet Operasyonları',
  proof_designer: 'Tasarım Ekibi',
  support_agent: 'Müşteri Destek',
  finance_viewer: 'Finans',
  content_editor: 'İçerik Editörü',
  content_publisher: 'İçerik Yayıncısı',
  sales_crm: 'Satış ve Müşteri İlişkileri',
  operations: 'Operasyon',
};

export function roleLabel(role: string) {
  return isAdminRole(role) ? ROLE_LABELS[role] : role;
}
