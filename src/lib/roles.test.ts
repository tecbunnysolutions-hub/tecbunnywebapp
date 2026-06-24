import { describe, expect, it } from 'vitest';

import { hasPermission, isAtLeast, PERMS } from './roles';

describe('additive RBAC inheritance', () => {
  it('keeps the sales and service branches isolated', () => {
    expect(isAtLeast('sales_manager', 'sales_executive')).toBe(true);
    expect(isAtLeast('sales_manager', 'service_engineer')).toBe(false);
    expect(isAtLeast('service_manager', 'service_engineer')).toBe(true);
    expect(isAtLeast('service_manager', 'sales_executive')).toBe(false);
  });

  it('allows admin and superadmin to inherit both operational branches', () => {
    expect(isAtLeast('admin', 'sales_manager')).toBe(true);
    expect(isAtLeast('admin', 'service_manager')).toBe(true);
    expect(isAtLeast('superadmin', 'admin')).toBe(true);
  });

  it('preserves legacy role behavior during migration', () => {
    expect(isAtLeast('manager', 'sales_executive')).toBe(true);
    expect(isAtLeast('manager', 'service_engineer')).toBe(false);
    expect(hasPermission('sales-staff', PERMS.BILLING_QUICK)).toBe(true);
  });

  it('does not leak privileged configuration permissions downward', () => {
    expect(hasPermission('admin', PERMS.SYSTEM_CONFIG)).toBe(false);
    expect(hasPermission('sales_manager', PERMS.ADMIN_USERS)).toBe(false);
    expect(hasPermission('superadmin', PERMS.SYSTEM_CONFIG)).toBe(true);
  });
});
