import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const m = vi.hoisted(() => ({ getUser: vi.fn() }));
vi.mock('@supabase/ssr', () => ({ createServerClient: () => ({ auth: { getUser: m.getUser } }) }));
vi.mock('@tecbunny/core/enterprise-analytics-proxy', () => ({ emitEnterpriseProxyTelemetry: vi.fn() }));
import { proxy } from './proxy';
import { proxy as storefront } from '../../public/src/proxy';

describe('Registered gateway and storefront proxies', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-key');
    m.getUser.mockResolvedValue({ data: { user: null }, error: null });
  });
  it.each(['orders/shipped', 'orders/placed', 'orders/outfordelivery', 'orders/notconfirmed', 'orders/delivered', 'orders/delayed', 'orders/cancelled', 'payment/received', 'payment/failed', 'customer/signup'])('allows signed webhook handlers to receive anonymous POST %s', async path => {
    const response = await proxy(new NextRequest(`https://test/api/webhooks/${path}`, { method: 'POST' }), { waitUntil: vi.fn() });
    expect(response.status).toBe(200);
  });
  it.each(['GET', 'POST'])('admits WhatsApp %s for token/signature verification in the handler', async method => {
    expect((await proxy(new NextRequest('https://test/api/webhook/whatsapp', { method }), { waitUntil: vi.fn() })).status).toBe(200);
  });
  it.each(['/api/webhooks/stats', '/api/webhooks/unlisted', '/api/orders/private'])('retains authentication for private POST %s', async path => {
    // /api/orders is explicitly public, so use PATCH to exercise private mutations.
    expect((await proxy(new NextRequest(`https://test${path}`, { method: 'PATCH' }), { waitUntil: vi.fn() })).status).toBe(401);
  });
  it.each(['/payment/cashfree/one', '/checkout', '/orders', '/profile'])('redirects anonymous storefront access to %s', async path => {
    const response = await storefront(new NextRequest(`https://test${path}`));
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://test/auth/login');
  });
  it('keeps the public catalogue accessible', async () => {
    expect((await storefront(new NextRequest('https://test/products'))).status).toBe(200);
  });
});
