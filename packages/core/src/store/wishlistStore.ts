import { create } from 'zustand';
import type { Product } from '../types';
import { toast } from '@tecbunny/ui';

export interface WishlistState {
  wishlistItems: Product[];
  wishlistCount: number;
  ownerKey: string;
  toggleWishlist: (item: Product) => void;
  isInWishlist: (itemId: string) => boolean;
  setWishlistOwner: (ownerKey: string) => void;
  clearWishlistMemory: () => void;
  syncFromServer: (apiBase?: string) => Promise<void>;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

const getWishlistStorageKey = (ownerKey: string) => `wishlist_${ownerKey || 'guest'}`;

const readWishlist = (ownerKey: string): Product[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(getWishlistStorageKey(ownerKey));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeWishlist = (ownerKey: string, items: Product[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(getWishlistStorageKey(ownerKey), JSON.stringify(items));
};

export const useWishlistStore = create<WishlistState>()((set, get) => ({
  wishlistItems: [],
  wishlistCount: 0,
  ownerKey: 'guest',
  _hasHydrated: false,
  setHasHydrated: (state) => {
    set({ _hasHydrated: state });
  },
  setWishlistOwner: (ownerKey) => {
    const nextOwnerKey = ownerKey || 'guest';
    const currentOwnerKey = get().ownerKey;
    if (currentOwnerKey === nextOwnerKey && get()._hasHydrated) return;

    set({ wishlistItems: [], wishlistCount: 0, ownerKey: nextOwnerKey, _hasHydrated: false });
    const items = readWishlist(nextOwnerKey);
    set({ wishlistItems: items, wishlistCount: items.length, _hasHydrated: true });
  },
  clearWishlistMemory: () => {
    if (typeof window !== 'undefined') {
      try {
        const owner = get().ownerKey;
        window.localStorage.removeItem(getWishlistStorageKey(owner));
        window.localStorage.removeItem(getWishlistStorageKey('guest'));
      } catch (e) {}
    }
    set({ wishlistItems: [], wishlistCount: 0, ownerKey: 'guest', _hasHydrated: true });
  },
  toggleWishlist: (item) => {
    const state = get();
    const existingItem = state.wishlistItems.find((wItem) => wItem.id === item.id);
    const itemName = item.name || item.title || 'Product';
    let newItems: Product[];
    const action = existingItem ? 'remove' : 'add';

    if (existingItem) {
      toast({
        title: "Removed from wishlist",
        description: `${itemName} has been removed from your wishlist.`,
      });
      newItems = state.wishlistItems.filter((wItem) => wItem.id !== item.id);
    } else {
      toast({
        title: "Added to wishlist",
        description: `${itemName} has been added to your wishlist.`,
      });
      newItems = [...state.wishlistItems, item];
    }

    writeWishlist(state.ownerKey, newItems);
    set({ wishlistItems: newItems, wishlistCount: newItems.length });

    // Fire-and-forget API sync (only runs in browser when logged in)
    if (typeof window !== 'undefined' && state.ownerKey !== 'guest') {
      fetch('/api/user/wishlist', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: item.id, action }),
      }).catch(() => { /* silently ignore network errors */ });
    }
  },
  isInWishlist: (itemId) => {
    return get().wishlistItems.some((item) => item.id === itemId);
  },
  syncFromServer: async (apiBase = '') => {
    try {
      const res = await fetch(`${apiBase}/api/user/wishlist`, { credentials: 'include' });
      if (!res.ok) return;
      const { wishlist } = await res.json();
      if (!Array.isArray(wishlist)) return;
      // Merge server list with local — server is authoritative
      const serverProducts: Product[] = wishlist
        .map((entry: any) => entry.products)
        .filter(Boolean);
      const state = get();
      writeWishlist(state.ownerKey, serverProducts);
      set({ wishlistItems: serverProducts, wishlistCount: serverProducts.length });
    } catch {
      // Silently fail — local state remains in tact
    }
  },
}));
