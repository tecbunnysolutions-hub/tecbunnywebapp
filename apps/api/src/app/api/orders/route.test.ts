import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => {
  // The route reads its service configuration at import time.
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://db.test';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';
  return { getUser: vi.fn(), getCustomerOrders: vi.fn() };
});

vi.mock('@tecbunny/database/server', () => ({ createSupabaseClient: async () => ({ auth: { getUser: mocks.getUser } }) }));
vi.mock('@tecbunny/infra', () => ({
  BaseSupabaseClient: class {},
  SupabaseOrderRepository: class {},
  NotificationServiceImpl: class {},
}));
vi.mock('@tecbunny/core/server', () => ({
  verifySuperadminSessionToken: async () => null,
  OrderService: class { getCustomerOrders = mocks.getCustomerOrders; },
}));
vi.mock('@tecbunny/core/rate-limit', () => ({ rateLimit: async () => ({ allowed: true }) }));
vi.mock('@tecbunny/core', () => ({
  apiError: vi.fn(), apiSuccess: vi.fn(),
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
  withApiHandler: () => vi.fn(),
  APIResponseBuilder: {},
  createOrderSchema: {},
}));

import { GET } from './route';

describe('customer order history', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCustomerOrders.mockResolvedValue([]);
  });

  it('never uses user-editable metadata to select orders', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: {
      id: 'user-1', email: 'user@example.com', email_confirmed_at: '2026-01-01', phone: '', app_metadata: {},
      user_metadata: { mobile: 'x,id.not.is.null' },
    } } });
    await GET(new NextRequest('https://api.test/api/orders'));
    expect(mocks.getCustomerOrders).toHaveBeenCalledWith('user-1', 'user@example.com', undefined);
  });

  it('matches only channels proven during OTP signup', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: {
      id: 'user-2', email: 'claimed@example.com', email_confirmed_at: '2026-01-01',
      phone: '919000000001', phone_confirmed_at: '2026-01-01',
      app_metadata: { verified_channels: ['whatsapp'] }, user_metadata: {},
    } } });
    await GET(new NextRequest('https://api.test/api/orders'));
    expect(mocks.getCustomerOrders).toHaveBeenCalledWith('user-2', undefined, '919000000001');
  });
});
