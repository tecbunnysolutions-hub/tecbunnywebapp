import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const m = vi.hoisted(() => ({ user: null as any, order: null as any, transaction: null as any, insert: vi.fn(), rpc: vi.fn(), fetch: vi.fn() }));
vi.mock('@tecbunny/core/logger', () => ({ logger: { error: vi.fn() } }));
vi.mock('@tecbunny/core/rate-limit', () => ({ rateLimit: () => true }));
vi.mock('@tecbunny/database/server', () => ({ createSupabaseClient: async () => ({ auth: { getUser: async () => ({ data: { user: m.user } }) } }) }));
vi.mock('@tecbunny/database/admin', () => ({ createSupabaseServiceClient: () => ({ rpc: m.rpc, from: (table: string) => {
  const query = { select: () => query, eq: () => query, insert: m.insert, maybeSingle: async () => ({ data: table === 'orders' ? m.order : m.transaction }) };
  return query;
} }) }));
import { GET } from './verify/route';
import { POST } from './create-order/route';
const request = () => new NextRequest('https://api.test/api/payments/cashfree/verify?cf_order_id=txn-1&order_id=order-1');
describe('Cashfree payment integrity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('CASHFREE_ENV', 'sandbox'); vi.stubEnv('CASHFREE_SANDBOX_APP_ID', 'test'); vi.stubEnv('CASHFREE_SANDBOX_SECRET_KEY', 'test');
    m.user = { id: 'user-1' };
    m.order = { id: 'order-1', user_id: 'user-1', total: 100, customer_phone: '9876543210' };
    m.transaction = { order_id: 'order-1', amount: 100, gateway_response: { environment: 'sandbox' } };
    m.insert.mockResolvedValue({ error: null });
    m.rpc.mockResolvedValue({ data: { status: 'success' }, error: null });
    m.fetch.mockResolvedValue(Response.json({ order_id: 'txn-1', order_status: 'PAID', order_currency: 'INR', order_amount: 100 }));
    vi.stubGlobal('fetch', m.fetch);
  });
  it('rejects anonymous verification before contacting the gateway', async () => { m.user = null; expect((await GET(request())).status).toBe(401); expect(m.fetch).not.toHaveBeenCalled(); });
  it('rejects another customer’s order', async () => { m.order.user_id = 'other'; expect((await GET(request())).status).toBe(403); expect(m.rpc).not.toHaveBeenCalled(); });
  it('rejects replay against an unrelated local order', async () => { m.transaction.order_id = 'cheap-order'; expect((await GET(request())).status).toBe(409); expect(m.fetch).not.toHaveBeenCalled(); });
  it('rejects unknown transactions', async () => { m.transaction = null; expect((await GET(request())).status).toBe(409); });
  it.each([{ order_amount: 1 }, { order_currency: 'USD' }, { order_id: 'other' }])('rejects mismatched gateway data %j', async overrides => {
    m.fetch.mockResolvedValue(Response.json({ order_id: 'txn-1', order_status: 'PAID', order_currency: 'INR', order_amount: 100, ...overrides }));
    expect((await GET(request())).status).toBe(409); expect(m.rpc).not.toHaveBeenCalled();
  });
  it('returns pending, never paid, when settlement fails', async () => {
    m.rpc.mockResolvedValue({ error: { message: 'database unavailable' } });
    const result = await GET(request()); expect(result.status).toBe(503); expect(await result.json()).toMatchObject({ is_paid: false });
  });
  it('confirms only after an atomic settlement succeeds', async () => {
    const result = await GET(request()); expect(result.status).toBe(200); expect(await result.json()).toMatchObject({ is_paid: true });
    expect(m.rpc).toHaveBeenCalledWith('settle_gateway_payment', expect.objectContaining({ p_order_id: 'order-1', p_transaction_id: 'txn-1', p_amount: 100 }));
  });
  it('does not open checkout if transaction recording fails', async () => {
    m.insert.mockResolvedValue({ error: { message: 'database unavailable' } });
    const result = await POST(new NextRequest('https://api.test/create', { method: 'POST', body: JSON.stringify({ order_id: 'order-1' }) }));
    expect(result.status).toBe(503); expect(m.fetch).not.toHaveBeenCalled();
  });
  it('persists the same merchant reference sent to Cashfree and returns its environment', async () => {
    m.fetch.mockImplementation(async (_url, options) => Response.json({ order_id: JSON.parse(options.body).order_id, payment_session_id: 'session-1' }));
    const result = await POST(new NextRequest('https://api.test/create', { method: 'POST', body: JSON.stringify({ order_id: 'order-1' }) }));
    const data = await result.json(); expect(result.status).toBe(200); expect(data.environment).toBe('sandbox');
    expect(m.insert).toHaveBeenCalledWith(expect.objectContaining({ transaction_id: data.cf_order_id, order_id: 'order-1', amount: 100 }));
    expect(m.insert.mock.invocationCallOrder[0]).toBeLessThan(m.fetch.mock.invocationCallOrder[0]);
  });
});
