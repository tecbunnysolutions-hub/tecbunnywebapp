import { type ClassValue } from "clsx";
/**
 * Utility function to merge Tailwind CSS classes with conditional logic
 * Combines clsx for conditional classes and tailwind-merge for proper class merging
 */
export declare function cn(...inputs: ClassValue[]): string;
export declare function revealDelayClass(delayMs: number): string;
/**
 * Formats a number as currency (Indian Rupees)
 */
export declare function formatCurrency(amount: number): string;
/**
 * Formats a number with Indian number system (lakhs, crores)
 */
export declare function formatNumber(num: number): string;
/**
 * Truncates text to a specified length with ellipsis
 */
export declare function truncateText(text: string, maxLength: number): string;
/**
 * Generates a random string of specified length
 */
export declare function generateRandomString(length?: number): string;
/**
 * Validates email format
 */
export declare function isValidEmail(email: string): boolean;
/**
 * Validates Indian mobile number format
 */
export declare function isValidMobile(mobile: string): boolean;
export interface CategoryGstRates {
    [category: string]: number;
}
/**
 * Gets the GST rate for a specific category
 * Falls back to 18% for unknown categories
 */
export declare function getGstRateForCategory(category: string, categoryGstRates?: CategoryGstRates): number;
/**
 * Gets the GST rate for a product, prioritizing product-specific rate over category rate
 */
export declare function getGstRateForProduct(product: {
    category?: string;
    gstRate?: number;
}, categoryGstRates?: CategoryGstRates): number;
/**
 * Calculates GST amount for a given price and rate
 */
export declare function calculateGstAmount(price: number, gstRate: number): number;
/**
 * Calculates total amount including GST
 */
export declare function calculateTotalWithGst(price: number, gstRate: number): number;
//# sourceMappingURL=utils.d.ts.map