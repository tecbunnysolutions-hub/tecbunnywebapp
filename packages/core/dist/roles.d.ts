/**
 * Canonical additive RBAC model.
 *
 * Do not use numeric comparisons for authorization. The organization has two
 * lateral branches (sales and service), so access is determined by the
 * explicit inheritance graph below.
 */
export declare const CANONICAL_ROLES: readonly ["customer", "sales_executive", "store_executive", "sales_agent", "service_engineer", "sales_manager", "service_manager", "admin", "superadmin"];
export type CanonicalRole = (typeof CANONICAL_ROLES)[number];
export declare const STAFF_ASSIGNABLE_ROLES: readonly ["sales_executive", "store_executive", "sales_agent", "service_engineer", "sales_manager", "service_manager", "accounts", "admin"];
export declare const USER_ASSIGNABLE_ROLES: readonly ["customer", "sales_executive", "store_executive", "sales_agent", "service_engineer", "sales_manager", "service_manager", "accounts", "admin"];
export type AssignableRole = (typeof USER_ASSIGNABLE_ROLES)[number];
/** @deprecated Accepted during the staged migration to canonical role names. */
export type LegacyRole = 'sales' | 'sales-staff' | 'sales-external' | 'manager' | 'accounts';
export type UserRole = CanonicalRole | LegacyRole;
export declare const ALL_ROLES: UserRole[];
export declare function normalizeRole(value: unknown): UserRole | null;
/**
 * Compatibility-only display tier. Never use this object to authorize access.
 */
export declare const ROLE_HIERARCHY: Record<UserRole, number>;
export declare function isAtLeast(actual: UserRole, required: UserRole): boolean;
export declare const PERMS: {
    readonly PRODUCT_VIEW: "product:view";
    readonly ORDER_VIEW_SELF: "order:view:self";
    readonly USER_ALL: "user:all";
    readonly SYSTEM_CONFIG: "system:config";
    readonly AI_CONFIG: "ai:config";
    readonly CATALOG_ALL: "catalog:all";
    readonly ORDERS_ALL: "orders:all";
    readonly CRM_ALL: "crm:all";
    readonly REPORTS_ALL: "reports:all";
    readonly ADMIN_USERS: "admin:users";
    readonly ADMIN_INVENTORY: "admin:inventory";
    readonly ADMIN_CRM: "admin:crm";
    readonly ADMIN_ORDERS: "admin:orders";
    readonly ADMIN_SERVICES: "admin:services";
    readonly ADMIN_REPORTS: "admin:reports";
    /** @deprecated Use ADMIN_INVENTORY. */
    readonly INVENTORY_MANAGE: "admin:inventory";
    readonly TEAM_READ_AREA: "team:read:area";
    readonly ORDERS_DISPATCH_AREA: "orders:dispatch:area";
    readonly LEADS_ASSIGN_AREA: "leads:assign:area";
    readonly LEADS_WRITE: "leads:write";
    readonly ORDERS_CREATE: "orders:create";
    readonly ORDERS_PROCESS: "orders:process";
    readonly BILLING_QUICK: "billing:quick";
    readonly ORDERS_CREATE_DELEGATE: "orders:create:delegate";
    readonly COMMISSION_READ: "commission:read";
    readonly SERVICE_ORDERS_DISPATCH: "service_orders:dispatch";
    readonly ENGINEERS_ASSIGN: "engineers:assign";
    readonly SERVICE_ORDERS_UPDATE_OWN: "service_orders:update:own";
    readonly REPORTS_SUBMIT: "reports:submit";
    readonly INVOICE_MANAGE: "invoice:manage";
    readonly REPORT_VIEW: "report:view";
    readonly AUDIT_LOG_VIEW: "system:audit-logs";
    readonly ROLE_MANAGE: "system:roles";
    /** @deprecated Use SYSTEM_CONFIG. */
    readonly SETTINGS_MANAGE: "system:config";
    /** @deprecated Use AI_CONFIG. */
    readonly AI_ORCHESTRATION: "ai:config";
};
export type Permission = (typeof PERMS)[keyof typeof PERMS];
export declare const EFFECTIVE_PERMISSIONS: Record<UserRole, Set<Permission>>;
export declare function permissionImplies(granted: string, required: string): boolean;
export declare function hasPermission(role: UserRole, permission: Permission | string): boolean;
export declare const ROLE_DISPLAY_NAME: Record<UserRole, string>;
export declare const ROLE_DESCRIPTION: Record<CanonicalRole | 'accounts', string>;
export declare function getDisplayName(role: UserRole): string;
//# sourceMappingURL=roles.d.ts.map