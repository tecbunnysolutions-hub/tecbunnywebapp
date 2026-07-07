import type { CartItem, CustomerCategory, Coupon, AutoOffer } from '@tecbunny/core';
export interface CheckoutEngineRequest {
    items: CartItem[];
    userId?: string;
    customerCategory?: CustomerCategory;
    couponCode?: string;
    salesAgentId?: string;
    customerState?: string;
}
export interface CheckoutEngineResponse {
    subtotal: number;
    totalDiscount: number;
    autoOfferDiscount: number;
    couponDiscount: number;
    gstAmount: number;
    cgstAmount?: number;
    sgstAmount?: number;
    igstAmount?: number;
    finalTotal: number;
    bestOffer: AutoOffer | null;
    appliedCoupon: Coupon | null;
    availableCoupons: Coupon[];
    canCombineDiscounts: boolean;
    itemPrices: Array<{
        product_id: string;
        quantity: number;
        unit_price: number;
        total_price: number;
        discount_amount: number;
        pricing_info: any;
        isService?: boolean;
        hsnCode?: string | null;
        sacCode?: string | null;
        gstRate?: number;
        taxableBase?: number;
        gstAmount?: number;
        cgst?: number;
        sgst?: number;
        igst?: number;
    }>;
    commissionEstimate?: {
        agent_id: string;
        commission_amount: number;
        commission_rate: number;
    };
    /**
     * Internal database product metadata mapping used for validation
     * and downstream marketing logic.
     */
    dbProductMap?: Map<string, any>;
}
export declare class CheckoutEngine {
    /**
     * Unified calculation for the entire cart.
     * This is the single mathematical source of truth.
     */
    calculate(request: CheckoutEngineRequest): Promise<CheckoutEngineResponse>;
    private emptyResponse;
}
export declare const checkoutEngine: CheckoutEngine;
//# sourceMappingURL=checkout-engine.d.ts.map