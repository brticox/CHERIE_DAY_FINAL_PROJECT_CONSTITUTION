import { describe, expect, it } from 'vitest';
import { can, roleLabel } from '@/lib/admin/permissions';

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
});
