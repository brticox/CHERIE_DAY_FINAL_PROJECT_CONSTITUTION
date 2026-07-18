import { requireCapability } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { ADMIN_ROLES, can, roleLabel } from '@/lib/admin/permissions';
import { AdminDate, StateBadge } from '@/components/admin/resource-list';
import { updateStaff } from './actions';
import { AdminNotice, AdminPageHeader } from '@/components/admin/admin-workspace';
export const dynamic = 'force-dynamic';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const state = await searchParams;
  const { staff } = await requireCapability('system.read', '/admin/users');
  const { data, error } = await createAdminClient()
    .from('staff_users')
    .select('id,name,email,role,is_active,created_at,updated_at')
    .order('name');
  const manageable = can(staff.role, 'staff.manage');
  return (
    <div className="space-y-7 p-4 md:p-8">
      <AdminPageHeader
        eyebrow="Asgari yetki ilkesi"
        title="Personel kullanıcıları"
        description="Kimlik ve gizli bilgiler gösterilmez; her rol ve etkinlik değişikliği denetim günlüğüne kaydedilir."
      />
      {state.error && (
        <AdminNotice tone="danger" title="Personel işlemi tamamlanamadı">
          Hiçbir yetki değiştirilmedi. Alanları kontrol edip güvenle yeniden
          deneyebilirsiniz.
        </AdminNotice>
      )}
      {error ? (
        <AdminNotice tone="danger" title="Personel kayıtları okunamıyor">
          Hiçbir yetki değiştirilmedi. Bağlantıyı doğruladıktan sonra sayfayı güvenle
          yenileyebilirsiniz.
        </AdminNotice>
      ) : (
        <div className="admin-surface overflow-hidden">
          <div className="divide-y divide-cherie-lace p-5 md:hidden">
            {(data ?? []).map((person) => (
              <article key={person.id} className="admin-mobile-entity">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <strong>{person.name}</strong>
                    <p className="mt-1 text-xs text-cherie-soft-ink">
                      {person.email ?? 'E-posta yok'} · {roleLabel(person.role)}
                    </p>
                  </div>
                  <StateBadge value={person.is_active ? 'active' : 'inactive'} />
                </div>
                <div className="mt-4">
                  <StaffControls person={person} manageable={manageable} />
                </div>
              </article>
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-cherie-paper">
                <tr>
                  <th className="p-3 text-left">Personel</th>
                  <th>Rol</th>
                  <th>Durum</th>
                  <th>Son güncelleme</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {(data ?? []).map((x) => (
                  <tr key={x.id} className="border-t border-cherie-lace">
                    <td className="p-3">
                      <strong>{x.name}</strong>
                      <small className="block">{x.email ?? 'E-posta yok'}</small>
                    </td>
                    <td>{roleLabel(x.role)}</td>
                    <td>
                      <StateBadge value={x.is_active ? 'active' : 'inactive'} />
                    </td>
                    <td>
                      <AdminDate value={x.updated_at} />
                    </td>
                    <td>
                      <StaffControls person={x} manageable={manageable} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

type StaffPerson = {
  id: string;
  name: string;
  email: string | null;
  role: (typeof ADMIN_ROLES)[number];
  is_active: boolean;
};

function StaffControls({
  person,
  manageable,
}: {
  person: StaffPerson;
  manageable: boolean;
}) {
  if (!manageable) return <span className="text-xs">Salt okunur</span>;
  return (
    <form action={updateStaff} className="flex flex-wrap items-center gap-2 md:min-w-80">
      <input type="hidden" name="id" value={person.id} />
      <select name="role" defaultValue={person.role} className="cherie-field min-w-44">
        {ADMIN_ROLES.map((role) => (
          <option key={role} value={role}>
            {roleLabel(role)}
          </option>
        ))}
      </select>
      <label className="flex min-h-11 items-center gap-2 whitespace-nowrap text-sm">
        <input type="checkbox" name="is_active" defaultChecked={person.is_active} />
        Aktif
      </label>
      <button className="cherie-button-secondary">Kaydet</button>
    </form>
  );
}
