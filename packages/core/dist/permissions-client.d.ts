import type { User as CustomUser, UserRole } from '@tecbunny/core';
export declare function isCustomerClient(user: CustomUser | null): boolean;
export declare function isSalesClient(user: CustomUser | null): boolean;
export declare function isAccountsClient(user: CustomUser | null): boolean;
export declare function isManagerClient(user: CustomUser | null): boolean;
export declare function isAdminClient(user: CustomUser | null): boolean;
export declare function hasRoleClient(user: CustomUser | null, requiredRole: UserRole): boolean;
export declare function getRoleDisplayName(role: UserRole): string;
export declare function getUserPermissions(role: UserRole): string[];
export declare function isSuperadminClient(user: CustomUser | null): boolean;
//# sourceMappingURL=permissions-client.d.ts.map