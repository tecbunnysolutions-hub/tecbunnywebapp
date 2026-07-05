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
  'sales_manager',
  'service_manager',
  'admin',
  'superadmin',
] as const;

export type CanonicalRole = (typeof CANONICAL_ROLES)[number];

export const STAFF_ASSIGNABLE_ROLES = [
  'sales_executive',
  'store_executive',
  'sales_agent',
  'service_engineer',
  'sales_manager',
  'service_manager',
  'accounts',
  'admin',
] as const;

export const USER_ASSIGNABLE_ROLES = [
  'customer',
  ...STAFF_ASSIGNABLE_ROLES,
] as const;

export type AssignableRole = (typeof USER_ASSIGNABLE_ROLES)[number];

/** @deprecated Accepted during the staged migration to canonical role names. */
export type LegacyRole = 'sales' | 'sales-staff' | 'sales-external' | 'manager' | 'accounts';
export type UserRole = CanonicalRole | LegacyRole;

export const ALL_ROLES: UserRole[] = [
  ...CANONICAL_ROLES,
  'sales',
  'sales-staff',
  'sales-external',
  'manager',
  'accounts',
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

const LEGACY_EQUIVALENTS: Readonly<Record<LegacyRole, CanonicalRole | 'accounts'>> = {
  sales: 'sales_executive',
  'sales-staff': 'store_executive',
  'sales-external': 'sales_agent',
  manager: 'sales_manager',
  accounts: 'accounts',
};

type AuthorizationRole = CanonicalRole | 'accounts';

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
  accounts: 2,
  sales_manager: 2,
  service_manager: 2,
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
  accounts: ['customer'],
  sales_manager: ['sales_executive', 'store_executive', 'sales_agent'],
  service_manager: ['service_engineer'],
  admin: ['sales_manager', 'service_manager', 'accounts'],
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
  PRODUCT_VIEW: 'product:view',
  ORDER_VIEW_SELF: 'order:view:self',
  USER_ALL: 'user:all',
  SYSTEM_CONFIG: 'system:config',
  AI_CONFIG: 'ai:config',
  CATALOG_ALL: 'catalog:all',
  ORDERS_ALL: 'orders:all',
  CRM_ALL: 'crm:all',
  REPORTS_ALL: 'reports:all',
  ADMIN_USERS: 'admin:users',
  ADMIN_INVENTORY: 'admin:inventory',
  ADMIN_CRM: 'admin:crm',
  ADMIN_ORDERS: 'admin:orders',
  ADMIN_SERVICES: 'admin:services',
  ADMIN_REPORTS: 'admin:reports',
  /** @deprecated Use ADMIN_INVENTORY. */
  INVENTORY_MANAGE: 'admin:inventory',
  TEAM_READ_AREA: 'team:read:area',
  ORDERS_DISPATCH_AREA: 'orders:dispatch:area',
  LEADS_ASSIGN_AREA: 'leads:assign:area',
  LEADS_WRITE: 'leads:write',
  ORDERS_CREATE: 'orders:create',
  ORDERS_PROCESS: 'orders:process',
  BILLING_QUICK: 'billing:quick',
  ORDERS_CREATE_DELEGATE: 'orders:create:delegate',
  COMMISSION_READ: 'commission:read',
  SERVICE_ORDERS_DISPATCH: 'service_orders:dispatch',
  ENGINEERS_ASSIGN: 'engineers:assign',
  SERVICE_ORDERS_UPDATE_OWN: 'service_orders:update:own',
  REPORTS_SUBMIT: 'reports:submit',
  INVOICE_MANAGE: 'invoice:manage',
  REPORT_VIEW: 'report:view',
  AUDIT_LOG_VIEW: 'system:audit-logs',
  ROLE_MANAGE: 'system:roles',
  /** @deprecated Use SYSTEM_CONFIG. */
  SETTINGS_MANAGE: 'system:config',
  /** @deprecated Use AI_CONFIG. */
  AI_ORCHESTRATION: 'ai:config',
} as const;

export type Permission = (typeof PERMS)[keyof typeof PERMS];

const DIRECT_PERMISSIONS: Record<AuthorizationRole, readonly Permission[]> = {
  customer: [PERMS.PRODUCT_VIEW, PERMS.ORDER_VIEW_SELF],
  sales_executive: [PERMS.LEADS_WRITE, PERMS.ORDERS_CREATE],
  store_executive: [PERMS.ORDERS_PROCESS, PERMS.BILLING_QUICK],
  sales_agent: [PERMS.ORDERS_CREATE_DELEGATE, PERMS.COMMISSION_READ],
  service_engineer: [PERMS.SERVICE_ORDERS_UPDATE_OWN, PERMS.REPORTS_SUBMIT],
  accounts: [PERMS.INVOICE_MANAGE, PERMS.REPORT_VIEW],
  sales_manager: [
    PERMS.TEAM_READ_AREA,
    PERMS.ORDERS_DISPATCH_AREA,
    PERMS.LEADS_ASSIGN_AREA,
  ],
  service_manager: [
    PERMS.TEAM_READ_AREA,
    PERMS.SERVICE_ORDERS_DISPATCH,
    PERMS.ENGINEERS_ASSIGN,
  ],
  admin: [
    PERMS.ADMIN_USERS,
    PERMS.ADMIN_INVENTORY,
    PERMS.ADMIN_CRM,
    PERMS.ADMIN_ORDERS,
    PERMS.ADMIN_SERVICES,
    PERMS.ADMIN_REPORTS,
  ],
  superadmin: [
    PERMS.USER_ALL,
    PERMS.SYSTEM_CONFIG,
    PERMS.AI_CONFIG,
    PERMS.CATALOG_ALL,
    PERMS.ORDERS_ALL,
    PERMS.CRM_ALL,
    PERMS.REPORTS_ALL,
    PERMS.AUDIT_LOG_VIEW,
    PERMS.ROLE_MANAGE,
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
  sales_manager: 'Sales Manager',
  service_manager: 'Service Manager',
  admin: 'Administrator',
  superadmin: 'System Super Administrator',
  sales: 'Sales Executive (Legacy)',
  'sales-staff': 'Store Executive (Legacy)',
  'sales-external': 'Sales Agent (Legacy)',
  manager: 'Sales Manager (Legacy)',
  accounts: 'Accounts (Legacy)',
};

export const ROLE_DESCRIPTION: Record<CanonicalRole | 'accounts', string> = {
  customer: 'Customer storefront access and own-order visibility.',
  sales_executive: 'Regional lead capture and product-order creation.',
  store_executive: 'Store order processing and quick billing.',
  sales_agent: 'Delegated customer orders and own commission reporting.',
  service_engineer: 'Assigned service jobs and field-report submission.',
  sales_manager: 'Regional sales team, order dispatch, and lead assignment.',
  service_manager: 'Regional service dispatch and engineer assignment.',
  accounts: 'Invoice management and financial report visibility.',
  admin: 'Day-to-day user, inventory, CRM, order, service, and report operations.',
  superadmin: 'Root system governance, role management, configuration, and unrestricted oversight.',
};

export function getDisplayName(role: UserRole): string {
  return ROLE_DISPLAY_NAME[role];
}
