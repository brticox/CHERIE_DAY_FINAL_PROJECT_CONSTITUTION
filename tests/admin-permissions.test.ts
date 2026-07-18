import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  ADMIN_ROLES,
  can,
  capabilitiesFor,
  roleLabel,
  type AdminCapability,
} from '@/lib/admin/permissions';

describe('admin permission matrix', () => {
  it('keeps product editors in draft scope', () => {
    expect(can('product_editor', 'catalog.write')).toBe(true);
    expect(can('product_editor', 'catalog.publish')).toBe(false);
  });
  it('separates finance visibility from order transitions', () => {
    expect(can('finance_viewer', 'finance.read')).toBe(true);
    expect(can('finance_viewer', 'orders.transition')).toBe(false);
  });
  it('grants superadmin the full declared surface', () => {
    expect(can('superadmin', 'staff.manage')).toBe(true);
    expect(can('superadmin', 'legal.publish')).toBe(true);
  });
  it('fails closed for an unknown database role', () => {
    expect(can('customer', 'dashboard.read')).toBe(false);
    expect(roleLabel('customer')).toBe('customer');
  });
  it('limits support mutations to the dedicated write capability', () => {
    expect(can('support_agent', 'support.write')).toBe(true);
    expect(can('sales_crm', 'support.write')).toBe(true);
    expect(can('finance_viewer', 'support.write')).toBe(false);
    expect(can('product_editor', 'support.write')).toBe(false);

    const actions = readFileSync(
      resolve(process.cwd(), 'app/admin/support/actions.ts'),
      'utf8',
    );
    expect(actions.match(/requireCapability\('support\.write'/g)).toHaveLength(2);
    expect(actions).not.toContain('requireStaff(');
  });
});

/**
 * Read-gating regression guard. Admin read pages fetch with the service-role
 * client (RLS bypassed), so `requireCapability` is the only barrier — RLS tests
 * cannot catch a missing check here. These assertions encode the exact
 * cross-role read exposures that the excellence pass closed: a role must be
 * denied any read capability outside its declared set when it deep-links a
 * module route directly.
 */
describe('admin read-gating (service-role routes)', () => {
  // Read capabilities that gate a module's list/detail pages.
  const READ_CAPABILITIES: AdminCapability[] = [
    'catalog.read',
    'orders.read',
    'finance.read',
    'crm.read',
    'services.read',
    'content.read',
    'legal.read',
    'system.read',
    'audit.read',
  ];

  it('denies a product editor every non-catalog module', () => {
    expect(can('product_editor', 'catalog.read')).toBe(true);
    for (const cap of ['finance.read', 'legal.read', 'crm.read', 'orders.read'] as const) {
      expect(can('product_editor', cap)).toBe(false);
    }
  });

  it('denies a support agent finance, legal and system modules', () => {
    expect(can('support_agent', 'crm.read')).toBe(true);
    expect(can('support_agent', 'orders.read')).toBe(true);
    for (const cap of ['finance.read', 'legal.read', 'system.read'] as const) {
      expect(can('support_agent', cap)).toBe(false);
    }
  });

  it('denies a finance viewer customer, order and catalog data', () => {
    expect(can('finance_viewer', 'finance.read')).toBe(true);
    for (const cap of ['crm.read', 'orders.read', 'catalog.read', 'legal.read'] as const) {
      expect(can('finance_viewer', cap)).toBe(false);
    }
  });

  it('denies a content editor finance and order operations', () => {
    expect(can('content_editor', 'content.read')).toBe(true);
    for (const cap of ['finance.read', 'orders.read'] as const) {
      expect(can('content_editor', cap)).toBe(false);
    }
  });

  it('never grants a read capability outside a role’s declared set', () => {
    for (const role of ADMIN_ROLES) {
      const granted = new Set(capabilitiesFor(role));
      for (const cap of READ_CAPABILITIES) {
        expect(can(role, cap)).toBe(granted.has(cap));
      }
    }
  });

  it('gives superadmin and admin every read capability', () => {
    for (const cap of READ_CAPABILITIES) {
      expect(can('superadmin', cap)).toBe(true);
      expect(can('admin', cap)).toBe(true);
    }
  });
});
