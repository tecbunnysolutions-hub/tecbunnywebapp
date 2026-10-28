import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({ from: vi.fn(), requireAdminContext: vi.fn() }));
vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({ from: mocks.from }) }));
vi.mock('@tecbunny/core/logger', () => ({ logger: { info: vi.fn(), error: vi.fn() } }));
vi.mock('@tecbunny/core/auth/admin-guard', () => ({
  requireAdminContext: mocks.requireAdminContext,
  AdminAuthError: class extends Error {},
}));

import { POST } from './route';

beforeEach(() => { vi.clearAllMocks(); mocks.requireAdminContext.mockResolvedValue({ user: { id: 'test-admin' } }); });
afterEach(() => vi.restoreAllMocks());
const request = (body: object) => new NextRequest('https://api.test/api/customer-promotions', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

describe('customer promotion body handling', () => {
  it('updates settings from one parsed body', async () => {
    const settings = { enabled: true };
    const upsert = vi.fn().mockResolvedValue({ error: null });
    mocks.from.mockReturnValue({ upsert });
    const req = request({ action: 'update-settings', settings });
    const read = vi.spyOn(req, 'json');
    const response = await POST(req);
    expect(response.status).toBe(200);
    expect(read).toHaveBeenCalledTimes(1);
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({ key: 'auto_promotion_settings', value: settings }));
  });
  it('applies a promotion and records its details without consuming the body again', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn().mockReturnValue({ eq });
    const insert = vi.fn().mockResolvedValue({ error: null });
    mocks.from.mockImplementation(table => table === 'profiles' ? { update } : { insert });
    const req = request({ action: 'apply-promotion', customerId: 'test-customer', fromCategory: 'Normal', toCategory: 'Business', reason: 'Test promotion' });
    const read = vi.spyOn(req, 'json');
    const response = await POST(req);
    expect(response.status).toBe(200);
    expect(read).toHaveBeenCalledTimes(1);
    expect(eq).toHaveBeenCalledWith('id', 'test-customer');
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ customer_id: 'test-customer', from_category: 'Normal', to_category: 'Business', promotion_reason: 'Test promotion' }));
  });
});
