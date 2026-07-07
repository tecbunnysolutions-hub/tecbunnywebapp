import type { CartItem, CustomerCategory, AutoOffer, Coupon } from "./types";
/**
 * Enhanced Offer and Discount Service
 * Handles auto-offers and manual discounts with combination rules
 */
export declare class OfferDiscountService {
    private get supabase();
    /**
     * Get all active auto-offers
     */
    getActiveOffers(): Promise<AutoOffer[]>;
    private fetchMarketingOffersFallback;
    private mapMarketingOffersToAutoOffers;
    private mapMarketingOffersToCoupons;
    private fetchMarketingOffersPayload;
    private normalizeOffers;
    private normalizeCustomerEligibility;
    getActiveCoupons(): Promise<Coupon[]>;
    /**
     * Check if an offer is applicable to the cart
     */
    isOfferApplicable(offer: AutoOffer, cartItems: CartItem[], customerCategory?: CustomerCategory, cartTotal?: number): boolean;
    /**
     * Check if a coupon is applicable to the cart
     */
    isCouponApplicable(coupon: Coupon, cartItems: CartItem[], cartTotal?: number): boolean;
    /**
     * Calculate offer discount amount
     */
    calculateOfferDiscount(offer: AutoOffer, cartItems: CartItem[], cartTotal: number): number;
    /**
     * Calculate coupon discount amount
     */
    calculateCouponDiscount(coupon: Coupon, cartItems: CartItem[], cartTotal: number): number;
    /**
     * Find the best applicable offer for the cart
     */
    getBestOffer(cartItems: CartItem[], customerCategory?: CustomerCategory, cartTotal?: number): Promise<AutoOffer | null>;
    /**
     * Get applicable coupons for the cart
     */
    getApplicableCoupons(cartItems: CartItem[], cartTotal?: number): Promise<Coupon[]>;
    /**
     * Calculate cart pricing with offers and discounts
     */
    calculateCartPricing(cartItems: CartItem[], customerCategory?: CustomerCategory, selectedCoupon?: Coupon): Promise<{
        subtotal: number;
        bestOffer: AutoOffer | null;
        offerDiscount: number;
        couponDiscount: number;
        totalDiscount: number;
        finalTotal: number;
        availableCoupons: Coupon[];
        canCombine: boolean;
    }>;
    /**
     * Check if offer and coupon can be combined
     */
    private canCombineOfferAndCoupon;
    private normalizeCouponType;
    private parseNumber;
    private isWithinDateRange;
}
export declare const offerDiscountService: OfferDiscountService;
//# sourceMappingURL=offer-discount-service.d.ts.map