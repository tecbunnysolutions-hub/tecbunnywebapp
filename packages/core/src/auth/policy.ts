import { ALL_ROLES, CanonicalRole, hasPermission, PERMS, type UserRole } from '../roles';

export type Action = 'read' | 'write' | 'create' | 'update' | 'delete' | 'manage';
export type Resource = 'User' | 'Lead' | 'Conversation' | 'Message' | 'Order' | 'Product' | 'Quote' | 'Tenant' | 'Inventory' | 'Report' | 'All';

export interface PolicyContext {
  role: UserRole;
  userId?: string;
  tenantId?: string;
  branchId?: string;
  permissions: string[];
}

export interface ResourceContext {
  ownerId?: string;
  tenantId?: string;
  branchId?: string;
}

/**
 * Evaluates whether the given context has permission to perform the action on the resource.
 * This is the central source of truth for authorization.
 */
export function checkPolicy(
  context: PolicyContext,
  action: Action,
  resource: Resource,
  resourceContext?: ResourceContext
): boolean {
  if (context.role === 'superadmin') return true;

  // Tenant / Branch boundary check
  // If the resource belongs to a specific tenant/branch, the user must either belong to the same
  // or have a cross-tenant overarching role (which we can assume superadmin has, but here we enforce strict isolation for others)
  if (resourceContext?.tenantId && context.tenantId && resourceContext.tenantId !== context.tenantId) {
    return false;
  }
  if (resourceContext?.branchId && context.branchId && resourceContext.branchId !== context.branchId) {
    return false;
  }

  // Ownership check
  const isOwner = Boolean(context.userId && resourceContext?.ownerId && context.userId === resourceContext.ownerId);

  // Basic model mapping based on existing permissions
  switch (resource) {
    case 'Product':
      if (action === 'read') return hasPermission(context.role, PERMS.PRODUCTS_READ);
      if (action === 'create') return hasPermission(context.role, PERMS.PRODUCTS_CREATE);
      if (action === 'update' || action === 'manage') return hasPermission(context.role, PERMS.PRODUCTS_UPDATE);
      if (action === 'delete') return hasPermission(context.role, PERMS.PRODUCTS_DELETE);
      break;
    case 'Order':
      if (action === 'read') return isOwner ? hasPermission(context.role, PERMS.ORDERS_READ_OWN) : hasPermission(context.role, PERMS.ORDERS_READ);
      if (action === 'create') return hasPermission(context.role, PERMS.ORDERS_CREATE) || hasPermission(context.role, PERMS.ORDERS_CREATE_DELEGATE);
      if (action === 'update' || action === 'manage') return hasPermission(context.role, PERMS.ORDERS_UPDATE);
      if (action === 'delete') return hasPermission(context.role, PERMS.ORDERS_DELETE);
      break;
    case 'Lead':
      if (action === 'read') return isOwner ? true : (hasPermission(context.role, PERMS.CRM_READ) || hasPermission(context.role, PERMS.CRM_WRITE));
      if (action === 'write' || action === 'update') return hasPermission(context.role, PERMS.CRM_WRITE);
      if (action === 'delete') return hasPermission(context.role, PERMS.CRM_DELETE);
      break;
    case 'User':
      if (action === 'read') return isOwner ? true : (hasPermission(context.role, PERMS.USERS_READ) || hasPermission(context.role, PERMS.USERS_READ_TEAM));
      if (action === 'manage' || action === 'update' || action === 'delete') return hasPermission(context.role, PERMS.USERS_MANAGE);
      break;
    case 'Inventory':
      if (action === 'read') return hasPermission(context.role, PERMS.INVENTORY_READ);
      if (action === 'create') return hasPermission(context.role, PERMS.INVENTORY_CREATE);
      if (action === 'update' || action === 'manage') return hasPermission(context.role, PERMS.INVENTORY_UPDATE);
      if (action === 'delete') return hasPermission(context.role, PERMS.INVENTORY_DELETE);
      break;
  }

  // Fallback to strict deny
  return false;
}
