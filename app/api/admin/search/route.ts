import { NextResponse } from 'next/server';

import { can } from '@/lib/admin/permissions';
import { requireStaff } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

type Result = {
  key: string;
  label: string;
  hint?: string;
  href: string;
  group: string;
};

/**
 * Command-palette entity search. Reads with the service-role client, so every
 * entity is gated by the caller's capability — a role only searches the records
 * it is allowed to open. Matches the read-gating on the module pages themselves.
 */
export async function GET(request: Request) {
  const { staff } = await requireStaff('/admin');
  const role = staff.role;
  const q = (new URL(request.url).searchParams.get('q') ?? '')
    .trim()
    .replace(/[,%]/g, '')
    .slice(0, 60);
  if (q.length < 2) return NextResponse.json({ results: [] });

  const db = createAdminClient();
  const results: Result[] = [];
  const tasks: Promise<void>[] = [];

  if (can(role, 'orders.read')) {
    tasks.push(
      (async () => {
        const { data } = await db
          .from('orders')
          .select('id,order_number,status')
          .ilike('order_number', `%${q}%`)
          .limit(5);
        for (const o of data ?? [])
          results.push({
            key: `order:${o.id}`,
            label: o.order_number ?? o.id,
            hint: o.status ? String(o.status) : undefined,
            href: `/admin/commerce/orders/${o.id}`,
            group: 'Siparişler',
          });
      })(),
    );
  }

  if (can(role, 'catalog.read')) {
    tasks.push(
      (async () => {
        const { data } = await db
          .from('products')
          .select('id,name,status')
          .ilike('name', `%${q}%`)
          .limit(5);
        for (const p of data ?? [])
          results.push({
            key: `product:${p.id}`,
            label: p.name ?? p.id,
            hint: p.status ? String(p.status) : undefined,
            href: `/admin/commerce/products/${p.id}`,
            group: 'Ürünler',
          });
      })(),
    );
  }

  if (can(role, 'crm.read')) {
    tasks.push(
      (async () => {
        const { data } = await db
          .from('customers')
          .select('id,name,email')
          .or(`name.ilike.%${q}%,email.ilike.%${q}%`)
          .limit(5);
        for (const c of data ?? [])
          results.push({
            key: `customer:${c.id}`,
            label: c.name ?? c.email ?? 'Müşteri',
            hint: c.email ?? undefined,
            href: `/admin/customers/${c.id}`,
            group: 'Müşteriler',
          });
      })(),
    );
  }

  await Promise.all(tasks);
  return NextResponse.json({ results });
}
