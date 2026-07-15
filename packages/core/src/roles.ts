/**
 * Canonical additive RBAC model.
 *
 * Do not use numeric comparisons for authorization. The organization has two
 * lateral branches (sales and service), so access is determined by the
 * explicit inheritance graph below.
 */
export const CANONICAL_ROLES = [
  'customer',
  'sales_executive',
  'store_executive',
  'sales_agent',
  'service_engineer',
  'support',
  'delivery',
  'warehouse',
  'hr',
  'marketing_executive',
  'accounts',
  'sales_manager',
  'service_manager',
  'marketing_manager',
  'admin',
  'superadmin',
] as const;

export type CanonicalRole = (typeof CANONICAL_ROLES)[number];

export const STAFF_ASSIGNABLE_ROLES = [
  'sales_executive',
  'store_executive',
  'sales_agent',
  'service_engineer',
  'support',
  'delivery',
  'warehouse',
  'hr',
  'marketing_executive',
  'accounts',
  'sales_manager',
  'service_manager',
  'marketing_manager',
  'admin',
] as const;

export const USER_ASSIGNABLE_ROLES = [
  'customer',
  ...STAFF_ASSIGNABLE_ROLES,
] as const;

export type AssignableRole = (typeof USER_ASSIGNABLE_ROLES)[number];

/** @deprecated Accepted during the staged migration to canonical role names. */
export type LegacyRole = 'sales' | 'sales-staff' | 'sales-external' | 'manager';
export type UserRole = CanonicalRole | LegacyRole;

export const ALL_ROLES: UserRole[] = [
  ...CANONICAL_ROLES,
  'sales',
  'sales-staff',
  'sales-external',
  'manager',
];

const ROLE_ALIASES: Readonly<Record<string, UserRole>> = {
  super_admin: 'superadmin',
  'super-admin': 'superadmin',
  'super admin': 'superadmin',
  sales_staff: 'sales-staff',
  'sales staff': 'sales-staff',
  sales_external: 'sales-external',
  'sales external': 'sales-external',
  'sales executive': 'sales_executive',
  'store executive': 'store_executive',
  'sales agent': 'sales_agent',
  'sales manager': 'sales_manager',
  'service manager': 'service_manager',
  'service engineer': 'service_engineer',
};

const LEGACY_EQUIVALENTS: Readonly<Record<LegacyRole, CanonicalRole>> = {
  sales: 'sales_executive',
  'sales-staff': 'store_executive',
  'sales-external': 'sales_agent',
  manager: 'sales_manager',
};

type AuthorizationRole = CanonicalRole;

function authorizationRole(role: UserRole): AuthorizationRole {
  return role in LEGACY_EQUIVALENTS
    ? LEGACY_EQUIVALENTS[role as LegacyRole]
    : role as CanonicalRole;
}

export function normalizeRole(value: unknown): UserRole | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  if ((ALL_ROLES as string[]).includes(normalized)) return normalized as UserRole;
  return ROLE_ALIASES[normalized] ?? null;
}

/**
 * Compatibility-only display tier. Never use this object to authorize access.
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  customer: 0,
  sales_executive: 1,
  store_executive: 1,
  sales_agent: 1,
  service_engineer: 1,
  support: 1,
  delivery: 1,
  warehouse: 1,
  hr: 2,
  marketing_executive: 1,
  accounts: 2,
  sales_manager: 2,
  service_manager: 2,
  marketing_manager: 2,
  admin: 3,
  superadmin: 4,
  sales: 1,
  'sales-staff': 1,
  'sales-external': 1,
  manager: 2,
};

const ROLE_PARENTS: Readonly<Record<AuthorizationRole, readonly AuthorizationRole[]>> = {
  customer: [],
  sales_executive: ['customer'],
  store_executive: ['customer'],
  sales_agent: ['customer'],
  service_engineer: ['customer'],
  support: ['customer'],
  delivery: ['customer'],
  warehouse: ['customer'],
  hr: ['customer'],
  marketing_executive: ['customer'],
  accounts: ['customer'],
  sales_manager: ['sales_executive', 'store_executive', 'sales_agent'],
  service_manager: ['service_engineer'],
  marketing_manager: ['marketing_executive'],
  admin: ['sales_manager', 'service_manager', 'accounts', 'hr', 'marketing_manager', 'warehouse', 'delivery', 'support'],
  superadmin: ['admin'],
};

function roleInherits(actual: AuthorizationRole, required: AuthorizationRole, seen = new Set<AuthorizationRole>()): boolean {
  if (actual === required) return true;
  if (seen.has(actual)) return false;
  seen.add(actual);
  return ROLE_PARENTS[actual].some((parent) => roleInherits(parent, required, seen));
}

export function isAtLeast(actual: UserRole, required: UserRole): boolean {
  if (!ALL_ROLES.includes(actual) || !ALL_ROLES.includes(required)) return false;
  return roleInherits(authorizationRole(actual), authorizationRole(required));
}

export const PERMS = {
  PRODUCTS_READ: 'products:read',
  PRODUCTS_CREATE: 'products:create',
  PRODUCTS_UPDATE: 'products:update',
  PRODUCTS_DELETE: 'products:delete',
  PRODUCTS_ALL: 'products:all',
  
  ORDERS_READ: 'orders:read',
  ORDERS_READ_OWN: 'orders:read:own',
  ORDERS_CREATE: 'orders:create',
  ORDERS_CREATE_DELEGATE: 'orders:create:delegate',
  ORDERS_UPDATE: 'orders:update',
  ORDERS_DELETE: 'orders:delete',
  ORDERS_DISPATCH: 'orders:dispatch',
  ORDERS_DISPATCH_AREA: 'orders:dispatch:area',
  ORDERS_ALL: 'orders:all',

  INVENTORY_READ: 'inventory:read',
  INVENTORY_CREATE: 'inventory:create',
  INVENTORY_UPDATE: 'inventory:update',
  INVENTORY_DELETE: 'inventory:delete',
  INVENTORY_ALL: 'inventory:all',

  CRM_READ: 'crm:read',
  CRM_WRITE: 'crm:write',
  CRM_ASSIGN_AREA: 'crm:assign:area',
  CRM_DELETE: 'crm:delete',
  CRM_ALL: 'crm:all',

  USERS_READ: 'users:read',
  USERS_READ_TEAM: 'users:read:team',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  USERS_MANAGE: 'users:manage',
  USERS_ALL: 'users:all',

  BILLING_READ: 'billing:read',
  BILLING_QUICK: 'billing:quick',
  BILLING_INVOICE_MANAGE: 'billing:invoice:manage',
  BILLING_ALL: 'billing:all',

  REPORTS_READ: 'reports:read',
  REPORTS_SUBMIT: 'reports:submit',
  REPORTS_ALL: 'reports:all',

  COMMISSION_READ: 'commission:read',

  SERVICES_READ: 'services:read',
  SERVICES_UPDATE_OWN: 'services:update:own',
  SERVICES_DISPATCH: 'services:dispatch',
  SERVICES_ENGINEERS_ASSIGN: 'services:engineers:assign',
  SERVICES_ALL: 'services:all',

  SUPPORT_TICKETS_READ: 'support:tickets:read',
  SUPPORT_TICKETS_WRITE: 'support:tickets:write',
  SUPPORT_ALL: 'support:all',

  DELIVERY_READ: 'delivery:read',
  DELIVERY_UPDATE: 'delivery:update',
  DELIVERY_ALL: 'delivery:all',

  SYSTEM_CONFIG: 'system:config',
  SYSTEM_ROLES: 'system:roles',
  SYSTEM_AUDIT_LOGS: 'system:audit-logs',
  SYSTEM_ALL: 'system:all',
  
  AI_CONFIG: 'ai:config',
  AI_ALL: 'ai:all',

  MARKETING_READ: 'marketing:read',
  MARKETING_WRITE: 'marketing:write',
  MARKETING_APPROVE: 'marketing:approve',
  MARKETING_ALL: 'marketing:all',
} as const;

export type Permission = (typeof PERMS)[keyof typeof PERMS];

const DIRECT_PERMISSIONS: Record<AuthorizationRole, readonly Permission[]> = {
  customer: [PERMS.PRODUCTS_READ, PERMS.ORDERS_READ_OWN],
  sales_executive: [PERMS.CRM_WRITE, PERMS.ORDERS_CREATE],
  store_executive: [PERMS.ORDERS_UPDATE, PERMS.BILLING_QUICK],
  sales_agent: [PERMS.ORDERS_CREATE_DELEGATE, PERMS.COMMISSION_READ],
  service_engineer: [PERMS.SERVICES_UPDATE_OWN, PERMS.REPORTS_SUBMIT],
  support: [PERMS.SUPPORT_TICKETS_READ, PERMS.SUPPORT_TICKETS_WRITE],
  delivery: [PERMS.DELIVERY_READ, PERMS.DELIVERY_UPDATE],
  warehouse: [PERMS.INVENTORY_READ, PERMS.INVENTORY_UPDATE, PERMS.ORDERS_DISPATCH],
  hr: [PERMS.USERS_MANAGE],
  marketing_executive: [PERMS.PRODUCTS_UPDATE, PERMS.CRM_READ, PERMS.MARKETING_READ, PERMS.MARKETING_WRITE],
  marketing_manager: [PERMS.MARKETING_APPROVE, PERMS.REPORTS_READ],
  accounts: [PERMS.BILLING_INVOICE_MANAGE, PERMS.REPORTS_READ],
  sales_manager: [
    PERMS.USERS_READ_TEAM,
    PERMS.ORDERS_DISPATCH_AREA,
    PERMS.CRM_ASSIGN_AREA,
    PERMS.REPORTS_READ,
  ],
  service_manager: [
    PERMS.USERS_READ_TEAM,
    PERMS.SERVICES_DISPATCH,
    PERMS.SERVICES_ENGINEERS_ASSIGN,
    PERMS.REPORTS_READ,
  ],
  admin: [
    PERMS.USERS_MANAGE,
    PERMS.INVENTORY_CREATE,
    PERMS.INVENTORY_UPDATE,
    PERMS.INVENTORY_DELETE,
    PERMS.CRM_DELETE,
    PERMS.ORDERS_DELETE,
    PERMS.PRODUCTS_CREATE,
    PERMS.PRODUCTS_DELETE,
    PERMS.REPORTS_ALL,
  ],
  superadmin: [
    PERMS.PRODUCTS_ALL,
    PERMS.ORDERS_ALL,
    PERMS.INVENTORY_ALL,
    PERMS.CRM_ALL,
    PERMS.USERS_ALL,
    PERMS.BILLING_ALL,
    PERMS.REPORTS_ALL,
    PERMS.SERVICES_ALL,
    PERMS.SUPPORT_ALL,
    PERMS.DELIVERY_ALL,
    PERMS.MARKETING_ALL,
    PERMS.SYSTEM_ALL,
    PERMS.AI_ALL,
  ],
};

function collectPermissions(role: AuthorizationRole, result = new Set<Permission>()): Set<Permission> {
  for (const parent of ROLE_PARENTS[role]) collectPermissions(parent, result);
  for (const permission of DIRECT_PERMISSIONS[role]) result.add(permission);
  return result;
}

export const EFFECTIVE_PERMISSIONS = Object.fromEntries(
  ALL_ROLES.map((role) => [role, collectPermissions(authorizationRole(role))]),
) as Record<UserRole, Set<Permission>>;

export function permissionImplies(granted: string, required: string): boolean {
  if (granted === required || granted === '*') return true;
  const grantedParts = granted.split(':');
  const requiredParts = required.split(':');
  if (grantedParts.at(-1) === 'all' && grantedParts[0] === requiredParts[0]) return true;
  return grantedParts.length === requiredParts.length
    && grantedParts.every((part, index) => part === '*' || part === requiredParts[index]);
}

export function hasPermission(role: UserRole, permission: Permission | string): boolean {
  if (authorizationRole(role) === 'superadmin') return true;
  return [...EFFECTIVE_PERMISSIONS[role]].some((granted) => permissionImplies(granted, permission));
}

export const ROLE_DISPLAY_NAME: Record<UserRole, string> = {
  customer: 'Customer',
  sales_executive: 'Sales Executive',
  store_executive: 'Store Executive',
  sales_agent: 'Sales Agent',
  service_engineer: 'Service Engineer',
  support: 'Customer Support',
  delivery: 'Delivery Agent',
  warehouse: 'Warehouse Staff',
  hr: 'HR Manager',
  marketing_executive: 'Marketing Executive',
  marketing_manager: 'Marketing Manager',
  accounts: 'Accounts',
  sales_manager: 'Sales Manager',
  service_manager: 'Service Manager',
  admin: 'Administrator',
  superadmin: 'System Super Administrator',
  sales: 'Sales Executive (Legacy)',
  'sales-staff': 'Store Executive (Legacy)',
  'sales-external': 'Sales Agent (Legacy)',
  manager: 'Sales Manager (Legacy)',
};

export const ROLE_DESCRIPTION: Record<CanonicalRole, string> = {
  customer: 'Customer storefront access and own-order visibility.',
  sales_executive: 'Regional lead capture and product-order creation.',
  store_executive: 'Store order processing and quick billing.',
  sales_agent: 'Delegated customer orders and own commission reporting.',
  service_engineer: 'Assigned service jobs and field-report submission.',
  support: 'Customer support ticket and query resolution.',
  delivery: 'Order delivery management and updates.',
  warehouse: 'Stock management, packing, and dispatch.',
  hr: 'Human resources and staff management.',
  marketing_executive: 'Create campaigns, manage templates, view analytics.',
  marketing_manager: 'Approve campaigns, audience management, team analytics.',
  accounts: 'Invoice management and financial report visibility.',
  sales_manager: 'Regional sales team, order dispatch, and lead assignment.',
  service_manager: 'Regional service dispatch and engineer assignment.',
  admin: 'Day-to-day user, inventory, CRM, order, service, and report operations.',
  superadmin: 'Root system governance, role management, configuration, and unrestricted oversight.',
};

export function getDisplayName(role: UserRole): string {
  return ROLE_DISPLAY_NAME[role];
}
