import type { CategoryGstRates } from './utils';
import type { UserRole, CustomerCategory } from '@tecbunny/core';
/**
 * Fetch GST Rates dynamically
 */
export declare function getGstRates(): Promise<CategoryGstRates>;
/**
 * Fetch Role Permissions dynamically
 */
export declare function getRolePermissions(): Promise<Record<string, Record<string, boolean>>>;
/**
 * Fetch Customer Categories dynamically
 */
export declare function getCustomerCategories(): Promise<Record<string, {
    name: string;
    defaultDiscount: number;
    benefits: string[];
}>>;
/**
 * Fetch Validation Patterns
 */
export declare function getValidationPatterns(): Promise<any>;
/**
 * Fetch Order status flow
 */
export declare function getOrderStatusFlow(): Promise<any>;
/**
 * Fetch Service/repair setup lifecycle
 */
export declare function getServiceOrderStatusFlow(): Promise<any>;
/**
 * Fetch Error messages
 */
export declare function getErrorMessages(): Promise<any>;
/**
 * Check if user has permission for a specific action
 * Note: Now asynchronous because roles are in DB
 */
export declare function hasPermission(role: UserRole, permission: string): Promise<boolean>;
/**
 * Get customer category benefits
 * Note: Now asynchronous
 */
export declare function getCustomerBenefits(category: CustomerCategory): Promise<{
    name: string;
    defaultDiscount: number;
    benefits: string[];
}>;
//# sourceMappingURL=data.d.ts.map