import type { User as CustomUser } from './types';
import { type UserRole } from './roles';
export declare function isCustomerClient(user: CustomUser | null): boolean;
export declare function isSalesClient(user: CustomUser | null): boolean;
export declare function isAccountsClient(user: CustomUser | null): boolean;
export declare function isServiceEngineerClient(user: CustomUser | null): boolean;
export declare function isManagerClient(user: CustomUser | null): boolean;
export declare function isAdminClient(user: CustomUser | null): boolean;
export declare function isSuperadminClient(user: CustomUser | null): boolean;
export declare function getRolePermissions(role: UserRole): string[];
//# sourceMappingURL=permissions.client.d.ts.map