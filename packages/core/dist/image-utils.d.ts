/**
 * Image utilities for validating and filtering product images
 */
/**
 * Normalize image URLs, including Supabase Storage paths.
 */
export declare function normalizeImageUrl(url: any): string | null;
/**
 * Checks if an image URL is valid and not a placeholder/empty string
 */
export declare function isValidImageUrl(url: any): url is string;
/**
 * Gets the first valid image from an array of images
 */
export declare function getFirstValidImage(imageArray: any[]): string | null;
/**
 * Filters an array to only include valid image URLs
 */
export declare function filterValidImages(imageArray: any[]): string[];
/**
 * Gets the primary display image for a product, checking all possible sources
 */
export declare function getProductDisplayImage(product: any, _options?: {
    fallbackText?: string;
    fallbackSize?: string;
}): string | null;
/**
 * Gets all valid images for a product from all sources
 */
export declare function getAllProductImages(product: any): string[];
/**
 * Cleans up product data by removing invalid images
 */
export declare function cleanupProductImages(product: any): any;
//# sourceMappingURL=image-utils.d.ts.map