import { describe, expect, it } from 'vitest';
import { STAFF_PANEL_ROLES, getPanelHome } from './panel-routing';
import { STAFF_ASSIGNABLE_ROLES, ROLE_DISPLAY_NAME, normalizeRole, hasPermission } from './roles';

describe('canonical staff roles', () => {
  it.each([
    ['sales', 'sales_executive'],
    ['sales-staff', 'store_executive'],
    ['sales-external', 'sales_agent'],
    ['manager', 'sales_manager'],
    ['sales_staff', 'store_executive'],
    ['sales external', 'sales_agent'],
  ] as const)('normalizes existing %s accounts to %s', (oldRole, role) => {
    expect(normalizeRole(oldRole)).toBe(role);
    expect(getPanelHome(normalizeRole(oldRole))).toBe(getPanelHome(role));
  });

  it.each(STAFF_ASSIGNABLE_ROLES)('allows %s into an existing staff workspace', role => {
    expect(STAFF_PANEL_ROLES.has(role)).toBe(true);
    expect(getPanelHome(role)).toMatch(/^\/mgmt(?:\/|$)/);
  });

  it('keeps customer and root access separate from staff access', () => {
    expect(STAFF_PANEL_ROLES.has('customer')).toBe(false);
    expect(STAFF_PANEL_ROLES.has('superadmin')).toBe(false);
    expect(normalizeRole('super_admin')).toBe('superadmin');
    expect(normalizeRole('unknown')).toBeNull();
    expect(hasPermission('marketing_executive', 'system:all')).toBe(false);
    expect(hasPermission('sales_agent', 'users:all')).toBe(false);
  });

  it.each([
    ['sales', 'sales_executive'],
    ['sales-staff', 'store_executive'],
    ['sales-external', 'sales_agent'],
    ['manager', 'sales_manager'],
  ] as const)('shows the current label for persisted %s accounts', (oldRole, role) => {
    expect(ROLE_DISPLAY_NAME[oldRole]).toBe(ROLE_DISPLAY_NAME[role]);
  });
});
