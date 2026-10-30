import type { UserRole } from './roles';

import { ALL_ROLES, STAFF_ASSIGNABLE_ROLES, normalizeRole } from './roles';

// Include persisted aliases for callers that have not yet normalized a session.
export const STAFF_PANEL_ROLES = new Set<UserRole>(
  ALL_ROLES.filter(role => (STAFF_ASSIGNABLE_ROLES as readonly string[]).includes(normalizeRole(role) ?? '')),
);

export function getPanelHome(role: UserRole | null | undefined): string {
  switch (normalizeRole(role)) {
    case 'superadmin':
      return '/superadmin/mgmt/dashboard';
    case 'admin':
      return '/mgmt/admin';
    case 'sales_manager':
      return '/mgmt/manager';
    case 'service_manager':
      return '/mgmt/service-manager';
    case 'sales_executive':
      return '/mgmt/sales';
    case 'store_executive':
      return '/mgmt/sales-staff';
    case 'sales_agent':
      return '/mgmt/sales-external';
    case 'service_engineer':
      return '/mgmt/service-engineer';
    case 'accounts':
      return '/mgmt/accounts';
    case 'support':
    case 'delivery':
    case 'warehouse':
    case 'hr':
    case 'marketing_executive':
    case 'marketing_manager':
      return '/mgmt';
    default:
      return '/';
  }
}
