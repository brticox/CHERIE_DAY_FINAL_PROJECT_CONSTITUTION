import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireStaff } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { AdminDate, StateBadge } from '@/components/admin/resource-list';
import { replySupport, updateSupport } from '../actions';
export const dynamic = 'force-dynamic';
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ 'thread-id': string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const id = (await params)['thread-id'];
  const state = await searchParams;
  await requireStaff(`/admin/support/${id}`);
  const db = createAdminClient();
  const [threadQ, messagesQ, staffQ] = await Promise.all([
    db
      .from('customer_support_threads')
      .select('*,customers(name,email),orders(order_number)')
      .eq('id', id)
      .single(),
    db
      .from('customer_support_messages')
      .select('*')
      .eq('thread_id', id)
      .order('created_at'),
    db.from('staff_users').select('id,name').eq('is_active', true).order('name'),
  ]);
  const thread = threadQ.data;
  if (!thread) notFound();
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <header>
        <Link href="/admin/support" className="text-sm text-cherie-burgundy">
          ← Destek listesi
        </Link>
        <div className="mt-5 flex justify-between">
          <div>
            <h1 className="font-display text-4xl">{thread.subject || 'Destek talebi'}</h1>
            <p>
              {thread.customers?.name ?? thread.customers?.email}{' '}
              {thread.orders?.order_number && `· ${thread.orders.order_number}`}
            </p>
          </div>
          <StateBadge value={thread.status} />
        </div>
      </header>
      {state.error && <p role="alert">{state.error}</p>}
      <form
        action={updateSupport}
        className="flex flex-wrap gap-3 rounded-card-lg border border-cherie-lace p-4"
      >
        <input type="hidden" name="id" value={id} />
        <select
          name="status"
          defaultValue={thread.status}
          className="cherie-field max-w-xs"
        >
          {['open', 'waiting_customer', 'waiting_team', 'closed'].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <select
          name="assigned_staff_id"
          defaultValue={thread.assigned_staff_id ?? ''}
          className="cherie-field max-w-xs"
        >
          <option value="">Atanmadı</option>
          {(staffQ.data ?? []).map((x) => (
            <option key={x.id} value={x.id}>
              {x.name}
            </option>
          ))}
        </select>
        <button className="cherie-button-secondary">Atama/durum kaydet</button>
      </form>
      <ol className="space-y-3">
        {(messagesQ.data ?? []).map((x) => (
          <li
            key={x.id}
            className={`rounded-card-lg border p-4 ${x.is_internal_note ? 'border-cherie-warning bg-cherie-warning/10' : x.sender_type === 'staff' ? 'ml-8 border-cherie-lace bg-white' : 'mr-8 border-cherie-lace bg-cherie-paper'}`}
          >
            <div className="flex justify-between text-xs">
              <strong>
                {x.is_internal_note
                  ? 'İç not'
                  : x.sender_type === 'staff'
                    ? 'Ekip'
                    : 'Müşteri'}
              </strong>
              <AdminDate value={x.created_at} />
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm">{x.message}</p>
          </li>
        ))}
      </ol>
      <form
        action={replySupport}
        className="rounded-card-lg border border-cherie-lace p-5"
      >
        <input type="hidden" name="id" value={id} />
        <textarea
          name="message"
          required
          maxLength={4000}
          className="cherie-field"
          placeholder="Yanıt veya iç not"
        />
        <div className="mt-3 flex items-center justify-between">
          <label className="text-sm">
            <input type="checkbox" name="is_internal_note" /> Yalnızca ekip iç notu
          </label>
          <button className="cherie-button-primary">Gönder</button>
        </div>
      </form>
    </div>
  );
}
