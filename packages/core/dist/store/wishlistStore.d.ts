import type { Product } from '../types';
export interface WishlistState {
    wishlistItems: Product[];
    wishlistCount: number;
    ownerKey: string;
    toggleWishlist: (item: Product) => void;
    isInWishlist: (itemId: string) => boolean;
    setWishlistOwner: (ownerKey: string) => void;
    clearWishlistMemory: () => void;
    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
}
export declare const useWishlistStore: import("zustand").UseBoundStore<import("zustand").StoreApi<WishlistState>>;
//# sourceMappingURL=wishlistStore.d.ts.map