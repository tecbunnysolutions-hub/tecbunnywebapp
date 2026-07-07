/**
 * Fetch a setting value by its key from the settings table
 */
export declare function getSettingValue(key: string, fallback: string): Promise<string>;
/**
 * Get dynamic support phone number
 */
export declare function getSupportPhone(): Promise<string>;
/**
 * Get dynamic support email address
 */
export declare function getSupportEmail(): Promise<string>;
/**
 * Get dynamic WhatsApp template contact link
 */
export declare function getWhatsAppLink(): Promise<string>;
/**
 * Get dynamic Facebook tracking pixel ID
 */
export declare function getFacebookPixelId(): Promise<string>;
/**
 * Get default GST rate percentage (e.g. 18)
 */
export declare function getDefaultGstPercentage(): Promise<number>;
/**
 * Resolve product GST rate dynamically based on product settings and HSN codes
 */
export declare function resolveProductGstRate(productId: string, dbGstRate?: number | null, dbHsnCode?: string | null): Promise<number>;
/**
 * Get policy page content from policies table or page_content fallback
 */
export declare function getPolicyContent(pageKey: string, defaultTitle: string): Promise<any>;
//# sourceMappingURL=settings.d.ts.map