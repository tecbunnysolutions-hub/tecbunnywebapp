export declare const useWishlist: () => {
    wishlistItems: import("./types").Product[];
    toggleWishlist: (item: import("./types").Product) => void;
    isInWishlist: (itemId: string) => boolean;
    wishlistCount: number;
    isHydrated: boolean;
};
export declare const useAuth: () => import("./context/AuthProvider").AuthContextType;
export declare const useCart: () => {
    cartItems: import("./types").CartItem[];
    pricing: import("./store/cartStore").CartPricing;
    addToCart: (item: any, quantity?: number) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    applyCoupon: (coupon: any) => Promise<boolean>;
    removeCoupon: () => void;
    refreshPricing: (currentAppliedCoupon?: any, customerCategory?: any, customerState?: string) => Promise<void>;
    cartCount: number;
    cartSubtotal: number;
    cartGst: number;
    cartTotal: number;
    isSessionExpired: boolean;
    resetGuestSession: () => void;
    isHydrated: boolean;
};
export * from './hooks/use-debounce';
export * from './hooks/use-page-content';
export * from './hooks/use-payment-methods';
//# sourceMappingURL=hooks.d.ts.map