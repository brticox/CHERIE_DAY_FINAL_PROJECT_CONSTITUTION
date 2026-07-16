import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import { enqueueNotification } from './enqueue';

type AccountNotification = 'welcome' | 'password_changed';

const definitions = {
  welcome: {
    eventType: 'auth_welcome',
    templateKey: 'account_welcome',
    category: 'transactional' as const,
  },
  password_changed: {
    eventType: 'auth_password_changed',
    templateKey: 'auth-password-changed',
    category: 'security' as const,
  },
};

export async function enqueueAccountNotification(
  authUserId: string,
  kind: AccountNotification,
  eventReference?: string,
) {
  const admin = createAdminClient();
  const { data: customer, error } = await admin
    .from('customers')
    .select('id,email,name')
    .eq('auth_user_id', authUserId)
    .maybeSingle();
  if (error) throw new Error(`Account notification lookup failed: ${error.code}`);
  if (!customer?.email) return null;
  const definition = definitions[kind];
  if (kind === 'password_changed' && !eventReference) {
    throw new Error('Password change notification requires an event reference.');
  }
  return enqueueNotification({
    eventType: definition.eventType,
    aggregateType: 'customer',
    aggregateId: customer.id,
    recipientKind: 'customer',
    recipientEmail: customer.email,
    customerId: customer.id,
    templateKey: definition.templateKey,
    payload: { customer_name: customer.name },
    idempotencyKey: [definition.eventType, authUserId, eventReference]
      .filter(Boolean)
      .join(':'),
    category: definition.category,
  });
}
