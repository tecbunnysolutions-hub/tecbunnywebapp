import { ALL_ROLES, CanonicalRole, hasPermission, PERMS, type UserRole } from '../roles';

export type Action = 'read' | 'write' | 'create' | 'delete' | 'manage';
export type Resource = 'User' | 'Lead' | 'Conversation' | 'Message' | 'Order' | 'Product' | 'Quote' | 'Tenant' | 'All';

export interface PolicyContext {
  role: UserRole;
  userId?: string;
  tenantId?: string;
  permissions: string[];
}

/**
 * Evaluates whether the given context has permission to perform the action on the resource.
 * This is the central source of truth for authorization.
 */
export function checkPolicy(
  context: PolicyContext,
  action: Action,
  resource: Resource
): boolean {
  if (context.role === 'superadmin') return true;

  // Basic model mapping based on existing permissions
  switch (resource) {
    case 'Product':
      if (action === 'read') return true; // Public by default in many cases, or require PRODUCT_VIEW
      return hasPermission(context.role, PERMS.CATALOG_ALL);
    case 'Order':
      if (action === 'read') return hasPermission(context.role, PERMS.ORDER_VIEW_SELF) || hasPermission(context.role, PERMS.ORDERS_ALL);
      if (action === 'create') return hasPermission(context.role, PERMS.ORDERS_CREATE);
      if (action === 'manage') return hasPermission(context.role, PERMS.ORDERS_PROCESS) || hasPermission(context.role, PERMS.ADMIN_ORDERS);
      break;
    case 'Lead':
      if (action === 'read' || action === 'write') return hasPermission(context.role, PERMS.LEADS_WRITE) || hasPermission(context.role, PERMS.ADMIN_CRM);
      break;
    case 'User':
      if (action === 'read') return true; // Self read
      if (action === 'manage') return hasPermission(context.role, PERMS.ADMIN_USERS) || hasPermission(context.role, PERMS.USER_ALL);
      break;
  }

  // Fallback to strict deny
  return false;
}
