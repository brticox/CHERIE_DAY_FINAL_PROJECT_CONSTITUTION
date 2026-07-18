import Link from 'next/link';
import { requireCapability } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { AdminDate, StateBadge } from '@/components/admin/resource-list';
import { AdminPagination } from '@/components/admin/pagination';
const PAGE_SIZE = 50;
export const dynamic = 'force-dynamic';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { q, status, page: rawPage } = await searchParams;
  const page = Math.max(1, Number.parseInt(rawPage ?? '1', 10) || 1);
  await requireCapability('crm.read', '/admin/customers');
  const db = createAdminClient();
  let query = db
    .from('customers')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });
  if (q)
    query = query.or(
      `name.ilike.%${safe(q)}%,email.ilike.%${safe(q)}%,phone.ilike.%${safe(q)}%`,
    );
  if (status) query = query.eq('status', status);
  const { data, count, error } = await query.range(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE - 1,
  );
  return (
    <div className="space-y-6 p-4 md:p-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-cherie-brass">
          Müşteri ilişkileri
        </p>
        <h1 className="font-display text-4xl">Müşteriler</h1>
        <p className="mt-2 text-sm text-cherie-soft-ink">
          {count ?? 0} müşteri · Hassas iletişim bilgileri liste görünümünde maskelenir.
        </p>
      </header>
      <form className="grid gap-3 rounded-card-lg border border-cherie-lace p-4 md:grid-cols-[1fr_220px_auto]">
        <input
          aria-label="Müşteri ara"
          name="q"
          defaultValue={q}
          placeholder="Ad, e-posta veya telefon"
          className="cherie-field"
        />
        <select
          aria-label="Müşteri durumu"
          name="status"
          defaultValue={status ?? ''}
          className="cherie-field"
        >
          <option value="">Tüm durumlar</option>
          <option value="active">Aktif</option>
          <option value="inactive">Pasif</option>
          <option value="blocked">Engelli</option>
        </select>
        <button className="cherie-button-primary">Ara</button>
      </form>
      {error ? (
        <p role="alert">Müşteriler okunamadı.</p>
      ) : (
        <div className="overflow-x-auto rounded-card-lg border border-cherie-lace">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-cherie-paper">
              <tr>
                <th className="p-4">Müşteri</th>
                <th className="p-4">İletişim</th>
                <th className="p-4">Onaylar</th>
                <th className="p-4">Durum</th>
                <th className="p-4">Kayıt</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((customer) => (
                <tr key={customer.id} className="border-t border-cherie-lace">
                  <td className="p-4">
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="font-bold text-cherie-burgundy hover:underline"
                    >
                      {customer.name || 'İsimsiz müşteri'}
                    </Link>
                  </td>
                  <td className="p-4">
                    <span>{maskEmail(customer.email)}</span>
                    <small className="block text-cherie-soft-ink">
                      {maskPhone(customer.phone)}
                    </small>
                  </td>
                  <td className="p-4 text-xs">
                    KVKK {customer.kvkk_consent_at ? '✓' : '—'} · Pazarlama{' '}
                    {customer.marketing_consent_at ? '✓' : '—'}
                  </td>
                  <td className="p-4">
                    <StateBadge value={customer.status} />
                  </td>
                  <td className="p-4">
                    <AdminDate value={customer.created_at} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <AdminPagination
        path="/admin/customers"
        page={page}
        pageSize={PAGE_SIZE}
        total={count ?? 0}
        query={{ q, status }}
        label="Müşteri sayfalama"
      />
    </div>
  );
}
const safe = (v: string) => v.replace(/[,%]/g, '');
const maskEmail = (v: string | null) => {
  if (!v) return '—';
  const [a, b] = v.split('@');
  return `${a?.slice(0, 2) ?? ''}•••@${b ?? '•••'}`;
};
const maskPhone = (v: string | null) => (v ? v.replace(/.(?=.{4})/g, '•') : '—');
