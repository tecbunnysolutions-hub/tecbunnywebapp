import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  order: {
    id: '9b061e13-7853-4ef0-9013-079fcab53d8b',
    customer_id: 'customer-1',
    payment_method: 'upi',
    payment_status: 'Awaiting Payment',
    payment_reference: null as string | null,
    status: 'Pending',
  },
  updated: { id: '9b061e13-7853-4ef0-9013-079fcab53d8b' } as { id: string } | null,
  caller: { userId: 'customer-1' } as { userId: string } | null,
  rateLimit: vi.fn(),
  resolveCaller: vi.fn(),
  verifyGuest: vi.fn(),
  update: vi.fn(),
  from: vi.fn(),
}));

vi.mock('@tecbunny/core/server', () => ({
  getTrustedClientIp: () => '203.0.113.9',
  rateLimit: mocks.rateLimit,
}));
vi.mock('@tecbunny/database/admin', () => ({
  createSupabaseServiceClient: () => ({ from: mocks.from }),
  isSupabaseServiceConfigured: true,
}));
vi.mock('../../../../lib/v1-auth', () => ({
  resolveCaller: mocks.resolveCaller,
}));
vi.mock('../../../../lib/guest-order-access', () => ({
  verifyGuestOrderAccessToken: mocks.verifyGuest,
}));

import { POST } from './route';

const makeRequest = (body: unknown, headers: Record<string, string> = {}) =>
  new NextRequest('https://api.test/api/orders/payment-claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });

describe('POST /api/orders/payment-claim', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(mocks.order, {
      id: '9b061e13-7853-4ef0-9013-079fcab53d8b',
      customer_id: 'customer-1',
      payment_method: 'upi',
      payment_status: 'Awaiting Payment',
      payment_reference: null,
      status: 'Pending',
    });
    mocks.updated = { id: mocks.order.id };
    mocks.caller = { userId: 'customer-1' };
    mocks.rateLimit.mockResolvedValue({ allowed: true });
    mocks.resolveCaller.mockImplementation(async () => mocks.caller);
    mocks.verifyGuest.mockReturnValue(false);
    const readQuery = {
      eq: vi.fn(() => readQuery),
      maybeSingle: vi.fn(async () => ({ data: { ...mocks.order }, error: null })),
    };
    const updateQuery = {
      eq: vi.fn(() => updateQuery),
      is: vi.fn(() => updateQuery),
      select: vi.fn(() => updateQuery),
      maybeSingle: vi.fn(async () => ({ data: mocks.updated, error: null })),
    };
    mocks.from.mockImplementation(() => ({
      select: vi.fn(() => readQuery),
      update: vi.fn((values) => {
        mocks.update(values);
        return updateQuery;
      }),
    }));
  });

  afterEach(() => vi.clearAllMocks());

  it('stores the reference as verification-pending without changing order status', async () => {
    const response = await POST(makeRequest({ orderId: mocks.order.id, utr: '123456ABC789' }));
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.paymentStatus).toBe('Payment Confirmation Pending');
    expect(mocks.update).toHaveBeenCalledWith({
      payment_reference: '123456ABC789',
      payment_status: 'Payment Confirmation Pending',
    });
  });

  it.each(['short', 'A'.repeat(36), 'reference with spaces', 'reference/123', ''])(
    'rejects malformed transaction references (%s)',
    async (utr) => {
      const response = await POST(makeRequest({ orderId: mocks.order.id, utr }));
      expect(response.status).toBe(400);
      expect(mocks.from).not.toHaveBeenCalled();
    },
  );

  it('requires the authenticated caller to own the order', async () => {
    mocks.caller = { userId: 'someone-else' };
    const response = await POST(makeRequest({ orderId: mocks.order.id, utr: '123456ABC789' }));

    expect(response.status).toBe(403);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('rejects unauthenticated requests without a valid guest capability', async () => {
    mocks.caller = null;
    const response = await POST(makeRequest({ orderId: mocks.order.id, utr: '123456ABC789' }));

    expect(response.status).toBe(401);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('accepts a valid guest capability for the matching order', async () => {
    mocks.verifyGuest.mockReturnValue(true);
    const response = await POST(
      makeRequest({ orderId: mocks.order.id, utr: '123456ABC789' }, { 'x-guest-order-token': 'valid-capability' }),
    );

    expect(response.status).toBe(200);
    expect(mocks.resolveCaller).not.toHaveBeenCalled();
  });

  it('does not permit a customer to submit a claim for an already-paid order', async () => {
    mocks.order.payment_status = 'Payment Confirmed';
    const response = await POST(makeRequest({ orderId: mocks.order.id, utr: '123456ABC789' }));

    expect(response.status).toBe(409);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('allows a pending reference to be corrected with a compare-and-swap on the old value', async () => {
    mocks.order.payment_reference = 'FIRST123456';
    mocks.order.payment_status = 'Payment Confirmation Pending';
    const response = await POST(makeRequest({ orderId: mocks.order.id, utr: 'SECOND123456' }));

    expect(response.status).toBe(200);
    expect(mocks.update).toHaveBeenCalledWith({
      payment_reference: 'SECOND123456',
      payment_status: 'Payment Confirmation Pending',
    });
  });

  it('rejects resubmitting the identical reference', async () => {
    mocks.order.payment_reference = 'FIRST123456';
    const response = await POST(makeRequest({ orderId: mocks.order.id, utr: 'FIRST123456' }));

    expect(response.status).toBe(409);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('returns 409 when another request changed the order first', async () => {
    mocks.order.payment_reference = 'FIRST123456';
    mocks.updated = null;
    const response = await POST(makeRequest({ orderId: mocks.order.id, utr: 'SECOND123456' }));

    expect(response.status).toBe(409);
  });
});
