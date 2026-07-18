import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/public';

/**
 * KVKK self-service: marketing consent + data export/deletion REQUESTS.
 *
 * - Marketing consent is written through the set_marketing_consent RPC (the
 *   only customer-writable path to customers.marketing_consent_at; the table
 *   has no customer UPDATE policy by design).
 * - Export/deletion are auditable REQUESTS (public.customer_data_requests),
 *   never immediate destructive actions — operations fulfils them while
 *   retaining legally-required commercial records (orders, invoices, payments).
 *
 * Everything runs through the RLS-bound SSR client; no service role reaches the
 * browser, and RLS prevents any cross-customer access.
 */

export type DataRequestSummary = {
  status: string;
  requestedAt: string;
} | null;

export type PrivacyState = {
  marketingConsent: boolean;
  hasOrders: boolean;
  exportRequest: DataRequestSummary;
  deletionRequest: DataRequestSummary;
};

export function privacyConfigured(): boolean {
  return isSupabaseConfigured();
}

type SsrClient = Awaited<ReturnType<typeof createClient>>;

async function resolveCustomerId(supabase: SsrClient): Promise<string | null> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data } = await supabase
    .from('customers')
    .select('id, status')
    .eq('auth_user_id', auth.user.id)
    .maybeSingle();
  if (!data || data.status !== 'active') return null;
  return String(data.id);
}

export async function getPrivacyState(): Promise<PrivacyState> {
  const empty: PrivacyState = {
    marketingConsent: false,
    hasOrders: false,
    exportRequest: null,
    deletionRequest: null,
  };
  if (!privacyConfigured()) return empty;
  const supabase = await createClient();
  const customerId = await resolveCustomerId(supabase);
  if (!customerId) return empty;

  const [customerRes, ordersRes, requestsRes] = await Promise.all([
    supabase.from('customers').select('marketing_consent_at').eq('id', customerId).maybeSingle(),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('customer_id', customerId),
    supabase
      .from('customer_data_requests')
      .select('kind, status, requested_at')
      .in('status', ['pending', 'in_review'])
      .order('requested_at', { ascending: false }),
  ]);

  const marketingConsent = Boolean(
    (customerRes.data as { marketing_consent_at?: string | null } | null)?.marketing_consent_at,
  );
  const requests = (requestsRes.data ?? []) as {
    kind: string;
    status: string;
    requested_at: string;
  }[];
  const summarise = (kind: string): DataRequestSummary => {
    const row = requests.find((request) => request.kind === kind);
    return row ? { status: row.status, requestedAt: row.requested_at } : null;
  };

  return {
    marketingConsent,
    hasOrders: (ordersRes.count ?? 0) > 0,
    exportRequest: summarise('export'),
    deletionRequest: summarise('deletion'),
  };
}

export type PrivacyResult = { ok: boolean; message?: string };

export async function setMarketingConsent(optIn: boolean): Promise<PrivacyResult> {
  if (!privacyConfigured()) return { ok: false, message: 'Şu anda kaydedilemiyor.' };
  const supabase = await createClient();
  const customerId = await resolveCustomerId(supabase);
  if (!customerId) return { ok: false, message: 'Giriş yapmanız gerekir.' };
  const { error } = await supabase.rpc('set_marketing_consent', { p_opt_in: optIn });
  if (error) return { ok: false, message: 'İzin tercihiniz kaydedilemedi.' };
  return { ok: true };
}

async function requestDataAction(kind: 'export' | 'deletion'): Promise<PrivacyResult> {
  if (!privacyConfigured()) return { ok: false, message: 'Şu anda gönderilemiyor.' };
  const supabase = await createClient();
  const customerId = await resolveCustomerId(supabase);
  if (!customerId) return { ok: false, message: 'Giriş yapmanız gerekir.' };
  const { error } = await supabase.rpc('request_customer_data_action', {
    p_kind: kind,
  });
  if (error) return { ok: false, message: 'Talebiniz alınamadı. Lütfen tekrar deneyin.' };
  return { ok: true };
}

export function requestDataExport(): Promise<PrivacyResult> {
  return requestDataAction('export');
}

export function requestAccountDeletion(): Promise<PrivacyResult> {
  return requestDataAction('deletion');
}
