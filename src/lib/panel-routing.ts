import type { UserRole } from './roles';

export const STAFF_PANEL_ROLES = new Set<UserRole>([
  'admin',
  'sales_manager',
  'service_manager',
  'sales_executive',
  'store_executive',
  'sales_agent',
  'service_engineer',
  'manager',
  'sales',
  'sales-staff',
  'sales-external',
  'accounts',
]);

export function getPanelHome(role: UserRole | null | undefined): string {
  switch (role) {
    case 'superadmin':
      return '/superadmin/mgmt/dashboard';
    case 'admin':
      return '/mgmt/admin';
    case 'sales_manager':
    case 'manager':
      return '/mgmt/manager';
    case 'service_manager':
      return '/mgmt/service-manager';
    case 'sales_executive':
    case 'sales':
      return '/mgmt/sales';
    case 'store_executive':
    case 'sales-staff':
      return '/mgmt/sales-staff';
    case 'sales_agent':
    case 'sales-external':
      return '/mgmt/sales-external';
    case 'service_engineer':
      return '/mgmt/service-engineer';
    case 'accounts':
      return '/mgmt/accounts';
    default:
      return '/';
  }
}
