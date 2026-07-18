import Link from 'next/link';
import {
  ADMIN_ROLES,
  capabilitiesFor,
  roleLabel,
  type AdminCapability,
} from '@/lib/admin/permissions';
import { requireCapability } from '@/lib/auth/guards';
import { AdminPageHeader } from '@/components/admin/admin-workspace';
const capabilities: AdminCapability[] = [
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
  'support.write',
  'content.read',
  'content.write',
  'content.publish',
  'finance.read',
  'legal.read',
  'legal.publish',
  'system.read',
  'staff.manage',
  'audit.read',
  'notifications.manage',
];
const capabilityLabels: Record<AdminCapability, string> = {
  'dashboard.read': 'Genel bakışı görüntüleme',
  'catalog.read': 'Kataloğu görüntüleme',
  'catalog.write': 'Kataloğu düzenleme',
  'catalog.publish': 'Kataloğu yayımlama',
  'orders.read': 'Siparişleri görüntüleme',
  'orders.transition': 'Sipariş aşaması değiştirme',
  'proofs.write': 'Prova yönetimi',
  'services.read': 'Hizmetleri görüntüleme',
  'services.write': 'Hizmetleri düzenleme',
  'crm.read': 'Müşteri ilişkilerini görüntüleme',
  'crm.write': 'Müşteri ilişkilerini düzenleme',
  'support.write': 'Destek taleplerini yanıtlama ve güncelleme',
  'content.read': 'İçeriği görüntüleme',
  'content.write': 'İçeriği düzenleme',
  'content.publish': 'İçeriği yayımlama',
  'finance.read': 'Finansı görüntüleme',
  'legal.read': 'Yasal belgeleri görüntüleme',
  'legal.publish': 'Yasal belgeleri yayımlama',
  'system.read': 'Sistemi görüntüleme',
  'staff.manage': 'Personel yönetimi',
  'audit.read': 'Denetim günlüğünü görüntüleme',
  'notifications.manage': 'Bildirim teslimatını yönetme',
};
export default async function Page() {
  await requireCapability('system.read', '/admin/roles');
  return (
    <div className="space-y-7 p-4 md:p-8">
      <AdminPageHeader
        eyebrow="Yetki modeli"
        title="Rol ve izin matrisi"
        description="İzinler yalnızca açıkça tanımlanan yetkilere göre uygulanır. Bu ekran salt okunur bir karşılaştırma sunar."
        action={
          <Link href="/admin/users" className="cherie-button-secondary">
            Personeli yönet
          </Link>
        }
      />
      <div className="space-y-4 md:hidden">
        {ADMIN_ROLES.map((role) => (
          <section key={role} className="admin-surface p-5 shadow-none">
            <h2 className="font-display text-2xl">{roleLabel(role)}</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {capabilitiesFor(role).map((capability) => (
                <li key={capability} className="flex items-start gap-2">
                  <span className="mt-0.5 text-cherie-success" aria-hidden="true">
                    ✓
                  </span>
                  {capabilityLabels[capability]}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <div className="admin-surface hidden overflow-x-auto md:block">
        <table className="min-w-[1600px] text-center text-xs">
          <thead className="bg-cherie-paper">
            <tr>
              <th className="sticky left-0 bg-cherie-paper p-3 text-left">Rol</th>
              {capabilities.map((x) => (
                <th key={x} className="p-2 [writing-mode:vertical-rl]">
                  {capabilityLabels[x]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ADMIN_ROLES.map((role) => (
              <tr key={role} className="border-t border-cherie-lace">
                <th className="sticky left-0 bg-cherie-ivory p-3 text-left">
                  {roleLabel(role)}
                </th>
                {capabilities.map((cap) => (
                  <td
                    key={cap}
                    className={
                      capabilitiesFor(role).includes(cap)
                        ? 'text-cherie-success'
                        : 'text-cherie-soft-ink/30'
                    }
                  >
                    {capabilitiesFor(role).includes(cap) ? '✓' : '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
