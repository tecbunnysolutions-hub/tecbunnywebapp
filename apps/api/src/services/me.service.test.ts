import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getMyOrder } from './me.service';

describe('getMyOrder payment claim projection', () => {
  it('exposes claim-submitted state without returning the transaction reference', async () => {
    const query = {
      select: vi.fn(() => query),
      eq: vi.fn(() => query),
      maybeSingle: vi.fn(async () => ({
        data: {
          id: 'order-1',
          customer_id: 'customer-1',
          payment_status: 'Payment Confirmation Pending',
          payment_reference: '123456ABC789',
        },
        error: null,
      })),
    };
    const db = { from: vi.fn(() => query) } as unknown as SupabaseClient;

    const result = await getMyOrder(db, 'customer-1', 'order-1');

    expect(result.order).toEqual({
      id: 'order-1',
      customer_id: 'customer-1',
      payment_status: 'Payment Confirmation Pending',
      payment_claim_submitted: true,
    });
    expect(result.order).not.toHaveProperty('payment_reference');
    expect(query.eq).toHaveBeenNthCalledWith(2, 'customer_id', 'customer-1');
  });

  it('reports no submitted claim when the order has no stored reference', async () => {
    const query = {
      select: vi.fn(() => query),
      eq: vi.fn(() => query),
      maybeSingle: vi.fn(async () => ({
        data: { id: 'order-1', payment_reference: null },
        error: null,
      })),
    };
    const db = { from: vi.fn(() => query) } as unknown as SupabaseClient;

    const result = await getMyOrder(db, 'customer-1', 'order-1');

    expect(result.order.payment_claim_submitted).toBe(false);
  });
});
