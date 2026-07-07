import type { Product, CartItem, CustomerCategory, AutoOffer, Coupon } from '../types';
export interface CartPricing {
    subtotal: number;
    autoOffer: AutoOffer | null;
    autoOfferDiscount: number;
    appliedCoupon: Coupon | null;
    couponDiscount: number;
    totalDiscount: number;
    gstAmount: number;
    finalTotal: number;
    availableCoupons: Coupon[];
    canCombineDiscounts: boolean;
    marketingAlert?: {
        type: string;
        title: string;
        message: string;
        action: string;
    };
    bulkUpsells?: Array<{
        productId: string;
        message: string;
    }>;
}
export interface CartState {
    cartItems: CartItem[];
    pricing: CartPricing;
    isSessionExpired: boolean;
    isHydrated: boolean;
    isMergingAccountCart: boolean;
    addToCart: (item: Product, quantity: number, user: any, trackEvent: any) => void;
    removeFromCart: (itemId: string, user: any, trackEvent: any) => void;
    updateQuantity: (itemId: string, quantity: number, user: any) => void;
    clearCart: (user: any) => void;
    applyCoupon: (coupon: Coupon, user: any, customerCategory?: CustomerCategory) => Promise<boolean>;
    removeCoupon: (user: any, customerCategory?: CustomerCategory) => void;
    refreshPricing: (currentAppliedCoupon: Coupon | null | undefined, user: any, customerCategory?: CustomerCategory, customerState?: string) => Promise<void>;
    resetGuestSession: () => void;
    clearCartMemory: () => void;
    loadCartFromStorage: (user: any) => void;
    saveCartToStorage: (user: any) => void;
    checkSessionExpiry: (user: any) => void;
    checkAbandonedCart: (user: any) => void;
    mergeGuestCartWithUserCart: (userId: string, supabaseClient: any) => Promise<void>;
}
export declare const useCartStore: import("zustand").UseBoundStore<import("zustand").StoreApi<CartState>>;
//# sourceMappingURL=cartStore.d.ts.map