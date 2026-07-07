/**
 * Enhanced Pricing Service for B2C/B2B Pricing
 * Handles dual pricing, customer type detection, and pricing calculations
 */
import type { Product, CustomerType, CustomerCategory, B2BCategory } from '@tecbunny/core';
export interface PricingContext {
    customer_type: CustomerType;
    customer_category?: CustomerCategory | B2BCategory;
    user_id?: string;
    quantity?: number;
}
export interface ProductPrice {
    original_price: number;
    sale_price: number;
    b2b_price?: number;
    final_price: number;
    customer_type: CustomerType;
    discount_percentage?: number;
    pricing_tier?: string;
    quantity_based?: boolean;
}
export declare class PricingService {
    private getSupabaseClient;
    /**
     * Get pricing for a product based on customer context
     */
    getProductPrice(product: Product, context: PricingContext): Promise<ProductPrice>;
    /**
     * Get B2C pricing with category-based discounts
     */
    private getB2CPrice;
    /**
     * Get B2B pricing with business-specific rates
     */
    private getB2BPrice;
    /**
     * Get customer pricing context from user profile
     * SECURITY: Ensure the requested userId matches the authenticated user to prevent price-tier scraping
     */
    getCustomerPricingContext(userId?: string): Promise<PricingContext>;
    /**
     * Calculate cart total with customer-specific pricing
     */
    calculateCartTotal(items: Array<{
        product: Product;
        quantity: number;
    }>, context: PricingContext): Promise<{
        subtotal: number;
        gst_amount: number;
        total: number;
        total_discount: number;
        customer_type: CustomerType;
        pricing_tier: CustomerCategory | B2BCategory | undefined;
        item_prices: {
            product_id: string;
            quantity: number;
            unit_price: number;
            total_price: number;
            discount_amount: number;
            pricing_info: ProductPrice;
        }[];
    }>;
    /**
     * Verify GST for B2B customer upgrade
     */
    verifyGSTIN(gstin: string, businessName: string): Promise<{
        valid: boolean;
        details?: any;
        error?: string;
    }>;
    /**
     * Update customer to B2B status
     */
    upgradeToB2B(userId: string, gstinDetails: {
        gstin: string;
        business_name: string;
        business_address: string;
        b2b_category?: B2BCategory;
    }): Promise<any>;
}
export declare const pricingService: PricingService;
//# sourceMappingURL=pricing-service.d.ts.map