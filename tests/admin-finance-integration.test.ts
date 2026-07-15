import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { ADMIN_NAVIGATION } from '@/lib/admin/navigation';
import { can, canManageFinance } from '@/lib/admin/permissions';
import { adminEventLabel, adminValueLabel } from '@/lib/admin/presentation';
import { formatTRYMinor } from '@/lib/format';

describe('integrated finance authorization and routing', () => {
  it('keeps finance mutation stricter than finance read access', () => {
    expect(canManageFinance('superadmin')).toBe(true);
    expect(canManageFinance('admin')).toBe(true);
    expect(canManageFinance('finance_viewer')).toBe(false);
    expect(canManageFinance('commerce_manager')).toBe(false);
    expect(canManageFinance('product_editor')).toBe(false);
    expect(can('finance_viewer', 'audit.read')).toBe(true);
    expect(can('commerce_manager', 'audit.read')).toBe(false);
  });

  it('publishes only canonical finance destinations in admin navigation', () => {
    const finance = ADMIN_NAVIGATION.find((group) => group.capability === 'finance.read');
    expect(finance?.items.map((item) => item.href)).toEqual([
      '/admin/finance',
      '/admin/finance/payments',
      '/admin/finance/reconciliation',
      '/admin/finance/refunds',
      '/admin/finance/audit',
    ]);
    expect(finance?.items.at(-1)?.capability).toBe('audit.read');
    expect(
      ADMIN_NAVIGATION.flatMap((group) => group.items).some(
        (item) =>
          item.href.startsWith('/admin/commerce/payments') ||
          item.href.startsWith('/admin/commerce/refunds'),
      ),
    ).toBe(false);
  });

  it('uses the central capability gate before service-role finance reads', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'lib/payments/finance-auth.ts'),
      'utf8',
    );
    expect(source).toContain("requireCapability('finance.read', next)");
    expect(source).toContain("requireCapability('audit.read', next)");
    expect(source).not.toContain('READ_ROLES');
  });
});

describe('integrated finance presentation', () => {
  it('maps Phase 3 finance values to Turkish labels', () => {
    for (const value of [
      'investigating',
      'resolved',
      'provider_paid_local_unpaid',
      'conflicting_callback',
      'refund_failure',
      'not_submitted',
      'succeeded',
      'customer_request',
      'payment.succeeded',
      'checkout_initialized',
    ]) {
      expect(adminValueLabel(value)).not.toBe('Tanımlı durum');
      expect(adminValueLabel(value)).not.toBe(value);
    }
    expect(adminEventLabel('refund_succeeded')).toBe(
      'İade sağlayıcı tarafından tamamlandı',
    );
  });

  it('formats the integer kuruş source without losing fractional value', () => {
    expect(formatTRYMinor(12_550)).toContain('125,50');
    expect(formatTRYMinor(1)).toContain('0,01');
  });
});

describe('cross-phase order cockpit contract', () => {
  it('orders order items by a real schema column', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'app/admin/commerce/orders/[id]/page.tsx'),
      'utf8',
    );
    expect(source).toContain(
      "from('order_items').select('*').eq('order_id', id).order('id')",
    );
    expect(source).not.toContain(
      "from('order_items').select('*').eq('order_id', id).order('created_at')",
    );
  });

  it('orders customer order items by a real schema column', () => {
    const source = readFileSync(resolve(process.cwd(), 'lib/orders/customer.ts'), 'utf8');
    expect(source).toContain(
      "supabase.from('order_items').select('*').eq('order_id', orderRow.id).order('id')",
    );
    expect(source).not.toContain("orderRow.id).order('created_at')");
  });

  it('presents customer proof status in Turkish', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'app/(site)/hesap/siparisler/[order-number]/page.tsx'),
      'utf8',
    );
    expect(source).toContain('proofStatusLabel(proof.status)');
    expect(source).not.toContain('{proof.status}');
  });
});
