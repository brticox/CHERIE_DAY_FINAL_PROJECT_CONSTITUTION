import Link from 'next/link';
import {
  ADMIN_ROLES,
  capabilitiesFor,
  roleLabel,
  type AdminCapability,
} from '@/lib/admin/permissions';
import { requireStaff } from '@/lib/auth/guards';
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
  'content.read',
  'content.write',
  'content.publish',
  'finance.read',
  'legal.read',
  'legal.publish',
  'system.read',
  'staff.manage',
  'audit.read',
];
export default async function Page() {
  await requireStaff('/admin/roles');
  return (
    <div className="space-y-6 p-4 md:p-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-cherie-brass">
          Yetki modeli
        </p>
        <h1 className="font-display text-4xl">Rol ve izin matrisi</h1>
        <p className="text-sm text-cherie-soft-ink">
          İzinler uygulama yetenekleri üzerinden fail-closed uygulanır. Değişiklikler{' '}
          <Link href="/admin/users" className="text-cherie-burgundy">
            Personel kullanıcıları
          </Link>{' '}
          ekranından yapılır.
        </p>
      </header>
      <div className="overflow-x-auto rounded-card-lg border border-cherie-lace">
        <table className="min-w-[1600px] text-center text-xs">
          <thead className="bg-cherie-paper">
            <tr>
              <th className="sticky left-0 bg-cherie-paper p-3 text-left">Rol</th>
              {capabilities.map((x) => (
                <th key={x} className="p-2 [writing-mode:vertical-rl]">
                  {x}
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
