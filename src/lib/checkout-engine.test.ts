import { describe, expect, it, vi, beforeEach } from 'vitest';
import { checkoutEngine } from './checkout-engine';
import { pricingService } from './pricing-service';
import { offerDiscountService } from './offer-discount-service';

// Mock dependencies
vi.mock('./pricing-service', () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    in: vi.fn().mockImplementation(function (this: any, field: string, ids: string[]) {
      // Mock database behavior for in filter
      if (ids.includes('invalid-id')) {
        return Promise.resolve({ data: [], error: null });
      }
      if (ids.includes('deleted-id')) {
        return Promise.resolve({
          data: [{ id: 'deleted-id', title: 'Deleted', status: 'active', is_deleted: true }],
          error: null,
        });
      }
      if (ids.includes('inactive-id')) {
        return Promise.resolve({
          data: [{ id: 'inactive-id', title: 'Inactive', status: 'inactive', is_deleted: false }],
          error: null,
        });
      }
      if (ids.includes('db-error-id')) {
        return Promise.resolve({ data: null, error: new Error('DB Error') });
      }
      
      const products = [
        {
          id: 'prod-1',
          title: 'Product 1',
          price: 100,
          mrp: 120,
          status: 'active',
          is_deleted: false,
          gstRate: 18,
          offer_price: null,
          stock_quantity: 10,
        },
        {
          id: 'prod-2',
          title: 'Product 2',
          price: 200,
          mrp: 200,
          status: 'active',
          is_deleted: false,
          gstRate: 12,
          offer_price: 180,
          stock_quantity: 5,
        }
      ].filter(p => ids.includes(p.id));

      return Promise.resolve({ data: products, error: null });
    }),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockImplementation(() => {
      return Promise.resolve({ data: { commission_rate: 10 }, error: null });
    }),
  };

  const service = {
    getCustomerPricingContext: vi.fn().mockResolvedValue({
      customer_type: 'B2C',
      customer_category: 'Normal'
    }),
    getSupabaseClient: vi.fn().mockResolvedValue(mockSupabase),
    calculateCartTotal: vi.fn().mockImplementation(async (items) => {
      const item_prices = items.map((item: any) => {
        const basePrice = item.product.price;
        return {
          product_id: item.product.id,
          unit_price: basePrice,
          total_price: basePrice * item.quantity,
          discount_amount: 0,
          pricing_info: { final_price: basePrice }
        };
      });
      return {
        item_prices,
        subtotal: item_prices.reduce((sum: number, i: any) => sum + i.total_price, 0)
      };
    })
  };

  return {
    pricingService: service
  };
});

vi.mock('./offer-discount-service', () => {
  return {
    offerDiscountService: {
      getActiveCoupons: vi.fn().mockResolvedValue([
        { code: 'SAVE10', type: 'percentage', value: 10 }
      ]),
      calculateCartPricing: vi.fn().mockImplementation(async (items, category, coupon) => {
        let couponDiscount = 0;
        let offerDiscount = 0;

        if (coupon && coupon.code === 'SAVE10') {
          const totalGross = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
          couponDiscount = totalGross * 0.1;
        }

        return {
          totalDiscount: couponDiscount + offerDiscount,
          offerDiscount,
          couponDiscount,
          bestOffer: null,
          availableCoupons: [],
          canCombine: false
        };
      })
    }
  };
});

describe('CheckoutEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculate', () => {
    it('should return empty response if cart items are empty', async () => {
      const result = await checkoutEngine.calculate({ items: [] });
      expect(result.subtotal).toBe(0);
      expect(result.finalTotal).toBe(0);
      expect(result.itemPrices).toEqual([]);
    });

    it('should calculate base B2C pricing under normal conditions', async () => {
      const items = [
        { id: 'prod-1', price: 100, quantity: 2, name: 'Product 1' }
      ];

      const result = await checkoutEngine.calculate({ items: items as any });

      // Prod-1 base price is 100, GST rate is 18%.
      // Total price is 200 (GST inclusive).
      // Base subtotal = 200 / 1.18 = 169.49
      // GST Amount = 200 - 169.49 = 30.51
      // Final Total = 200
      expect(result.subtotal).toBe(169.49);
      expect(result.gstAmount).toBe(30.51);
      expect(result.finalTotal).toBe(200);
      expect(result.totalDiscount).toBe(0);
      expect(result.itemPrices).toHaveLength(1);
      expect(result.itemPrices[0].product_id).toBe('prod-1');
      expect(result.itemPrices[0].quantity).toBe(2);
      expect(result.itemPrices[0].total_price).toBe(169.49);
    });

    it('should distribute discount proportionally to items', async () => {
      const items = [
        { id: 'prod-1', price: 100, quantity: 2, name: 'Product 1' }
      ];

      const result = await checkoutEngine.calculate({
        items: items as any,
        couponCode: 'SAVE10'
      });

      // Total gross is 200. 10% coupon discount is 20.
      // Final total is 180 (GST inclusive).
      // Base subtotal = 180 / 1.18 = 152.54.
      // GST Amount = 180 - 152.54 = 27.46.
      expect(result.totalDiscount).toBe(20);
      expect(result.finalTotal).toBe(180);
      expect(result.subtotal).toBe(152.54);
      expect(result.gstAmount).toBe(27.46);
    });

    it('should throw validation error if product does not exist in db', async () => {
      const items = [{ id: 'invalid-id', price: 100, quantity: 1, name: 'Invalid' }];
      await expect(checkoutEngine.calculate({ items: items as any })).rejects.toThrow(
        'Product invalid-id is invalid or no longer available.'
      );
    });

    it('should throw validation error if product is deleted', async () => {
      const items = [{ id: 'deleted-id', price: 100, quantity: 1, name: 'Deleted' }];
      await expect(checkoutEngine.calculate({ items: items as any })).rejects.toThrow(
        'Product deleted-id is invalid or no longer available.'
      );
    });

    it('should throw validation error if product is inactive', async () => {
      const items = [{ id: 'inactive-id', price: 100, quantity: 1, name: 'Inactive' }];
      await expect(checkoutEngine.calculate({ items: items as any })).rejects.toThrow(
        'Product inactive-id is invalid or no longer available.'
      );
    });

    it('should throw validation error if stock requested exceeds stock available', async () => {
      const items = [{ id: 'prod-1', price: 100, quantity: 11, name: 'Product 1' }];
      await expect(checkoutEngine.calculate({ items: items as any })).rejects.toThrow(
        'Insufficient stock for "Product 1". Only 10 units available.'
      );
    });

    it('should handle general database errors gracefully', async () => {
      const items = [{ id: 'db-error-id', price: 100, quantity: 1, name: 'DB Error' }];
      await expect(checkoutEngine.calculate({ items: items as any })).rejects.toThrow(
        'Checkout engine calculation failed due to internal execution errors.'
      );
    });
  });
});
