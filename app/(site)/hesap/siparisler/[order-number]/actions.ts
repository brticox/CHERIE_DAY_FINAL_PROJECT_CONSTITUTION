'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';

type ProofResponseArgs =
  Database['public']['Functions']['respond_to_product_proof']['Args'];
type ProofResponseRpc = (
  name: 'respond_to_product_proof',
  args: ProofResponseArgs,
) => Promise<{ error: { message: string } | null }>;

export async function respondToProofAction(formData: FormData) {
  const orderNumber = String(formData.get('orderNumber') ?? '').trim();
  const proofId = String(formData.get('proofId') ?? '').trim();
  const action = String(formData.get('action') ?? '');
  const comment = String(formData.get('comment') ?? '').trim();
  const target = `/hesap/siparisler/${encodeURIComponent(orderNumber)}`;

  if (!orderNumber || !proofId || !['approve', 'request_revision'].includes(action)) {
    redirect(`${target}?proof=invalid`);
  }
  if (action === 'request_revision' && comment.length < 3) {
    redirect(`${target}?proof=comment_required`);
  }
  if (comment.length > 2000) redirect(`${target}?proof=comment_too_long`);

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect(`/hesap/giris?next=${encodeURIComponent(target)}`);

  // Supabase's PostgREST 14 overload currently loses this generated RPC's
  // argument type; narrow only this call while retaining the generated contract.
  const respondToProof = supabase.rpc.bind(supabase) as unknown as ProofResponseRpc;
  const { error } = await respondToProof('respond_to_product_proof', {
    p_proof_id: proofId,
    p_action: action,
    p_comment: comment || undefined,
  });
  if (error) redirect(`${target}?proof=failed`);

  revalidatePath(target);
  redirect(`${target}?proof=${action === 'approve' ? 'approved' : 'revision_requested'}`);
}
