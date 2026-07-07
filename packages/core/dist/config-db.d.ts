/**
 * Fetch settings from DB with cache
 */
export declare const getAppSettings: () => Promise<Record<string, any>>;
/**
 * Fetch GST rates
 */
export declare const getGstRatesFromDb: () => Promise<Record<string, number>>;
/**
 * Fetch Role Permissions
 */
export declare const getRolePermissionsFromDb: () => Promise<Record<string, Record<string, boolean>>>;
/**
 * Fetch Customer Categories
 */
export declare const getCustomerCategoriesFromDb: () => Promise<any[]>;
/**
 * Fetch Custom Setup Constants
 */
export declare const getCustomSetupConstantsFromDb: () => Promise<Record<string, number>>;
/**
 * Fetch Custom Setup Inventory
 */
export declare const getCustomSetupInventoryFromDb: () => Promise<any[]>;
//# sourceMappingURL=config-db.d.ts.map