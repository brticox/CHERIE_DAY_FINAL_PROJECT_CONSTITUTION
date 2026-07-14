import { requireCapability } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { ADMIN_ROLES, can, roleLabel } from '@/lib/admin/permissions';
import { AdminDate, StateBadge } from '@/components/admin/resource-list';
import { updateStaff } from './actions';
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
    <div className="space-y-6 p-4 md:p-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-cherie-brass">
          Least privilege
        </p>
        <h1 className="font-display text-4xl">Personel kullanıcıları</h1>
        <p className="text-sm text-cherie-soft-ink">
          Auth kimlikleri ve secret bilgileri gösterilmez. Her rol/aktivasyon değişikliği
          audit edilir.
        </p>
      </header>
      {state.error && <p role="alert">{decodeURIComponent(state.error)}</p>}
      {error ? (
        <p>Kullanıcılar okunamadı.</p>
      ) : (
        <div className="overflow-x-auto rounded-card-lg border border-cherie-lace">
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
                    {manageable ? (
                      <form
                        action={updateStaff}
                        className="flex min-w-80 items-center gap-2"
                      >
                        <input type="hidden" name="id" value={x.id} />
                        <select
                          name="role"
                          defaultValue={x.role}
                          className="cherie-field"
                        >
                          {ADMIN_ROLES.map((role) => (
                            <option key={role} value={role}>
                              {roleLabel(role)}
                            </option>
                          ))}
                        </select>
                        <label className="whitespace-nowrap">
                          <input
                            type="checkbox"
                            name="is_active"
                            defaultChecked={x.is_active}
                          />{' '}
                          Aktif
                        </label>
                        <button className="cherie-button-secondary">Kaydet</button>
                      </form>
                    ) : (
                      <span className="text-xs">Salt okunur</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
