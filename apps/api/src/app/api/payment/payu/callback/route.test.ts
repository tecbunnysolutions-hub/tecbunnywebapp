import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const m = vi.hoisted(() => ({ rpc: vi.fn(), transaction: vi.fn(), signature: vi.fn() }));
vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({
  rpc: m.rpc,
  from: (table: string) => {
    if (table === 'settings') return { select: () => ({ in: async () => ({ data: [] }) }) };
    const query = { select: () => query, eq: () => query, maybeSingle: m.transaction };
    return query;
  },
}) }));
vi.mock('@tecbunny/core', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }, apiError: () => new Response(null, { status: 500 }) }));
vi.mock('@tecbunny/database', () => ({ requireSupabaseServiceEnv: () => ({ url: 'https://test.supabase.co', serviceKey: 'test' }) }));
vi.mock('@tecbunny/core/site-url', () => ({ resolveSiteUrl: () => 'https://test' }));
vi.mock('@tecbunny/core/payu-service', () => ({ normalisePayuEnvironment: () => 'test', verifyPayuHash: m.signature }));
vi.mock('@tecbunny/core/queue', () => ({ enqueuePaymentRecoveryWebhook: vi.fn() }));
import { POST } from './route';

describe('PayU callback durable confirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('PAYU_MERCHANT_KEY', 'test'); vi.stubEnv('PAYU_MERCHANT_SALT', 'test');
    m.signature.mockReturnValue(true);
    m.transaction.mockResolvedValue({ data: { order_id: 'order', amount: 100, status: 'initiated' } });
    m.rpc.mockResolvedValue({ data: { status: 'success' }, error: null });
  });
  const request = () => new NextRequest('https://test/api/payment/payu/callback', { method: 'POST', body: new URLSearchParams({ udf1: 'order', txnid: 'transaction', status: 'success', amount: '100.00', hash: 'test' }) });
  it('returns a retryable outcome when settlement fails', async () => {
    m.rpc.mockResolvedValue({ data: null, error: { message: 'write failed' } });
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect(response.headers.get('location')).toBeNull();
    expect(response.headers.get('retry-after')).toBe('30');
  });
  it('returns a retryable outcome when reading the transaction fails', async () => {
    m.transaction.mockResolvedValue({ data: null, error: { message: 'database unavailable' } });
    expect((await POST(request())).status).toBe(503);
    expect(m.rpc).not.toHaveBeenCalled();
  });
  it('redirects to success only after confirmed settlement', async () => {
    const response = await POST(request());
    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toContain('/payment/success');
    expect(m.rpc).toHaveBeenCalledWith('settle_gateway_payment', expect.objectContaining({ p_order_id: 'order', p_transaction_id: 'transaction', p_amount: 100 }));
  });
  it('does not write an invalidly signed callback', async () => {
    m.signature.mockReturnValue(false);
    expect((await POST(request())).headers.get('location')).toContain('/payment/failed');
    expect(m.rpc).not.toHaveBeenCalled();
  });
});
