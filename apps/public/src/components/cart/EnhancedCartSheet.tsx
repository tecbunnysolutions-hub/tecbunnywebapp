'use client';

import * as React from 'react';
import Link from 'next/link';

import { Gift, Tag, X, Sparkles } from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@tecbunny/ui";
import { Button } from "@tecbunny/ui";
import { ScrollArea } from "@tecbunny/ui";
import { Separator } from "@tecbunny/ui";
import { Badge } from "@tecbunny/ui";
import { useCart } from "@tecbunny/core/hooks";
import { formatCurrency } from "@tecbunny/core/utils";
import { logger } from '@tecbunny/core';

import type { Coupon } from '@tecbunny/core';
import { Input } from "@tecbunny/ui";
import { useToast } from "@tecbunny/ui";
import { trpc } from "@/components/providers/TRPCProvider";

import { CartItemCard } from './CartItemCard';

interface EnhancedCartSheetProps {
    children: React.ReactNode;
}

export function EnhancedCartSheet({ children }: EnhancedCartSheetProps) {
  const {
    cartItems,
    cartCount,
    cartSubtotal,
    cartGst,
    cartTotal,
    pricing,
    applyCoupon,
    removeCoupon,
    refreshPricing,
    isHydrated,
  } = useCart();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [couponCode, setCouponCode] = React.useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = React.useState(false);

  const utils = trpc.useUtils();
  const fetchCouponByCode = React.useCallback(async (code: string): Promise<Coupon | null> => {
    try {
      const data = await utils.coupons.getByCode.fetch({ code });
      return data?.coupon as unknown as Coupon;
    } catch (error) {
      logger.error('cart_fetch_coupon_failed', { error, code });
      return null;
    }
  }, [utils]);

  const availableCoupons = React.useMemo(
    () => pricing?.availableCoupons ?? [],
    [pricing?.availableCoupons]
  );
  const appliedCoupon = pricing?.appliedCoupon ?? null;
  const autoOffer = pricing?.autoOffer ?? null;
  const autoOfferDiscount = pricing?.autoOfferDiscount ?? 0;
  const couponDiscount = pricing?.couponDiscount ?? 0;
  const totalDiscount = pricing?.totalDiscount ?? autoOfferDiscount + couponDiscount;
  const canCombineDiscounts = pricing?.canCombineDiscounts ?? false;
  const subtotalDisplay = pricing?.subtotal ?? cartSubtotal;
  const gstDisplay = pricing?.gstAmount ?? cartGst;
  const finalTotal = pricing?.finalTotal ?? Math.max(0, cartTotal - totalDiscount);

  React.useEffect(() => {
    if (open) {
      refreshPricing(pricing?.appliedCoupon ?? undefined);
    }
  }, [open, refreshPricing, pricing?.appliedCoupon]);

  const handleApplyCoupon = React.useCallback(async () => {
    const trimmed = couponCode.trim().toUpperCase();
    if (!trimmed || isApplyingCoupon) return;

    let coupon = availableCoupons.find((c) => c.code.toUpperCase() === trimmed);
    if (!coupon) {
      const fetchedCoupon = await fetchCouponByCode(trimmed);
      coupon = fetchedCoupon ?? coupon;
    }
    if (!coupon) {
      toast({
        title: 'Coupon Not Available',
        description: 'This code is not applicable to your current cart.',
        variant: 'destructive',
      });
      return;
    }

    setIsApplyingCoupon(true);
    const success = await applyCoupon(coupon);
    setIsApplyingCoupon(false);
    if (success) {
      setCouponCode('');
    }
  }, [couponCode, isApplyingCoupon, availableCoupons, applyCoupon, toast, fetchCouponByCode]);

  const handleRemoveCoupon = React.useCallback(() => {
    removeCoupon();
    setCouponCode('');
  }, [removeCoupon]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader className="px-6">
          <SheetTitle>Shopping Cart ({cartCount})</SheetTitle>
        </SheetHeader>
        <Separator className="my-4" />

        {!isHydrated ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-pulse space-y-4 text-center">
              <div className="h-12 w-12 rounded-full bg-muted/20 mx-auto" />
              <div className="h-4 w-24 bg-muted/20 rounded mx-auto" />
            </div>
          </div>
        ) : cartCount > 0 ? (
          <>
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
              {/* Cart Items */}
              <ScrollArea className="flex-1 px-6">
                <div className="flex flex-col gap-6">
                  {cartItems.map((item) => (
                    <CartItemCard key={item.id} item={item} />
                  ))}
                </div>
                <Separator className="my-6" />

              {/* Offers and Discounts Section */}
              <div className="space-y-4 pb-4">
                {/* Auto-Applied Offer */}
                {autoOffer && autoOfferDiscount > 0 && (
                  <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-success" />
                      <span className="font-medium text-success">Auto-Applied Offer</span>
                      <Badge variant="secondary" className="bg-success/10 text-success">
                        {formatCurrency(autoOfferDiscount)} OFF
                      </Badge>
                    </div>
                    <p className="text-sm text-success">{autoOffer.title}</p>
                    <p className="text-xs text-success mt-1">{autoOffer.description}</p>
                  </div>
                )}

                {/* Applied Coupon */}
                {appliedCoupon && couponDiscount > 0 && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary" />
                        <span className="font-medium text-primary">Applied Discount</span>
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          {appliedCoupon.code}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveCoupon}
                        className="h-6 w-6 p-0 text-primary hover:text-primary"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-primary">
                        {appliedCoupon.type === 'fixed'
                          ? `₹${appliedCoupon.value} off`
                          : `${appliedCoupon.value}% off`
                        }
                      </span>
                      <span className="font-medium text-primary">
                        -{formatCurrency(couponDiscount)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Combination Notice */}
                {autoOffer && appliedCoupon && canCombineDiscounts && (
                  <div className="bg-warning/10 border border-warning/20 rounded-lg p-2">
                    <p className="text-xs text-warning text-center">
                      🎉 Great! Your offer and discount are combined for maximum savings
                    </p>
                  </div>
                )}

                {/* Coupon Input */}
                {!appliedCoupon && (
                  <div>
                    <h4 className="font-medium mb-2">Apply Discount Code</h4>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            void handleApplyCoupon();
                          }
                        }}
                      />
                      <Button
                        onClick={() => void handleApplyCoupon()}
                        disabled={!couponCode.trim() || isApplyingCoupon}
                        size="sm"
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                )}

                {!appliedCoupon && (
                  <p className="text-xs text-muted-foreground">
                    Have a coupon? Enter the code above to redeem it. Eligible codes still work even if they are not listed here.
                  </p>
                )}
              </div>
              </ScrollArea>
            </div>

            {/* Cart Summary */}
            <SheetFooter className="px-6 bg-secondary/50 pt-4 pb-6 mt-auto">
              <div className="w-full space-y-2">
                <div className="flex justify-between text-base">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotalDisplay)}</span>
                </div>

                {/* Auto Offer Discount */}
                {autoOfferDiscount > 0 && (
                  <div className="flex justify-between text-base text-success">
                    <span>Auto Offer ({autoOffer?.title})</span>
                    <span>-{formatCurrency(autoOfferDiscount)}</span>
                  </div>
                )}

                {/* Manual Coupon Discount */}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-base text-primary">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>-{formatCurrency(couponDiscount)}</span>
                  </div>
                )}

                {/* Total Savings */}
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-base font-medium text-success bg-success/10 px-2 py-1 rounded">
                    <span>Total Savings</span>
                    <span>{formatCurrency(totalDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-base">
                  <span>GST</span>
                  <span>{formatCurrency(gstDisplay)}</span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Grand Total</span>
                  <span>{formatCurrency(finalTotal)}</span>
                </div>

                <p className="text-xs text-muted-foreground">Shipping calculated at checkout.</p>

                <Button className="w-full" size="lg" asChild>
                  <Link
                    href="/checkout"
                    onClick={() => setOpen(false)}
                  >
                    Proceed to Checkout
                  </Link>
                </Button>
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <Gift className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6">Find cameras, computers and networking equipment for your setup.</p>
            <Button asChild>
              <Link href="/products">Browse products</Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
