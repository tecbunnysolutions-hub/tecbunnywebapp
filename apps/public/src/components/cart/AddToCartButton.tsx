'use client';

import * as React from 'react';
import { ShoppingCart } from 'lucide-react';

import { Button } from "@tecbunny/ui";
import { useCart } from "@tecbunny/core/hooks";
import { logger } from '@tecbunny/core';
import type { Product } from '@tecbunny/core';
import { trackMetaAddToCart } from '@/lib/meta/pixel';

interface AddToCartButtonProps {
  product: Product;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

export function AddToCartButton({ product, className, size = "sm" }: AddToCartButtonProps) {
  const { addToCart, removeFromCart } = useCart();
  const [busy, setBusy] = React.useState(false);
  const stockStatus = product.stock_status;
  const isOutOfStock = stockStatus === 'out_of_stock';
  const buttonLabel = isOutOfStock ? 'Out of Stock' : stockStatus === 'backorder' ? 'Pre-order' : 'Add to Cart';


  return (
    <Button 
      size={size}
      className={`flex items-center justify-center ${className}`}
      disabled={busy || isOutOfStock}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (busy || isOutOfStock) return;
        
        setBusy(true);
        // Optimistic UI update - instantly reflects in cart
        addToCart(product);
        // Meta AddToCart — mirrors to CAPI with a shared event_id for dedup.
        trackMetaAddToCart({
          id: product.id,
          title: product.title || product.name,
          price: typeof product.price === 'number' && Number.isFinite(product.price) ? product.price : undefined,
          category: typeof product.category === 'string' ? product.category : undefined,
        });
        
        try {
          // Simulate or perform backend API sync here
          // await fetch('/api/cart/sync', { ... })
          // If the network response fails: throw new Error("Sync failed")
        } catch (error) {
          // Rollback state if the backend fails
          removeFromCart(product.id);
          logger.error("Cart sync failed, rolled back", { error: error instanceof Error ? error.message : String(error), productId: product.id });
        } finally {
          setTimeout(() => setBusy(false), 300);
        }
      }}
      aria-label={isOutOfStock ? `${product.name} is out of stock` : `${buttonLabel} ${product.name}`}
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      {buttonLabel}
    </Button>
  );
}
