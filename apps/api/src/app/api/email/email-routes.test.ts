import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  auth: { session: null as any, role: 'customer', mfaLevel: null as string | null },
  tables: {} as Record<string, any>,
  rateAllowed: true,
  rateCalls: [] as string[],
  email: {
    sendOrderConfirmation: vi.fn(async () => true),
    sendOrderCompletion: vi.fn(async () => true),
    sendOrderDelivered: vi.fn(async () => true),
    sendPaymentConfirmation: vi.fn(async () => true),
    sendPaymentFailed: vi.fn(async () => true),
    sendPaymentPending: vi.fn(async () => true),
    sendShippingNotification: vi.fn(async () => true),
    sendWelcomeEmail: vi.fn(async () => true),
    sendEmailChangeOTP: vi.fn(async () => true),
    sendPasswordResetOTP: vi.fn(async () => true),
    notifyManagerNewOrder: vi.fn(async () => true),
    sendMarketingCampaign: vi.fn(async () => true),
    sendEmailVerification: vi.fn(async () => true),
  },
  whatsapp: vi.fn(async () => undefined),
}));

vi.mock('@tecbunny/core/server-role-guard', () => ({
  getServerAuthState: async () => state.auth,
}));
vi.mock('@tecbunny/core/rate-limit', () => ({
  rateLimit: (key: string, bucket: string) => {
    state.rateCalls.push(`${key}|${bucket}`);
    return state.rateAllowed;
  },
}));
vi.mock('@tecbunny/core/server', () => {
  const chain = (table: string) => {
    const node: any = {
      select: () => node,
      eq: () => node,
      order: () => node,
      limit: () => node,
      in: () => node,
      then: (resolve: (v: unknown) => unknown) => resolve({ data: state.tables[`${table}_list`] ?? [], error: null }),
      maybeSingle: async () => ({ data: state.tables[table] ?? null, error: null }),
    };
    return node;
  };
  return {
    getAdminDb: () => ({ from: chain }),
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  };
});
vi.mock('@tecbunny/core', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock('@tecbunny/core/email', () => ({ emailHelpers: state.email }));
vi.mock('@tecbunny/core/whatsapp-service', () => ({ sendWhatsAppNotification: state.whatsapp }));

import { POST as orderConfirmation } from './order-confirmation/route';
import { POST as orderDelivered } from './order-delivered/route';
import { POST as paymentConfirmation } from './payment-confirmation/route';
import { POST as pickup } from './pickup/route';
import { POST as notifySalesPickup } from './notify-sales-pickup/route';
import { POST as orderApproved } from './order-approved/route';
import { POST as shipping } from './shipping/route';
import { POST as welcome } from './welcome/route';
import { POST as passwordReset } from './password-reset/route';
import { POST as emailChange } from './email-change/route';
import { POST as abandonedCart } from './abandoned-cart/route';
import { POST as notifyManager } from './notify-manager/route';
import { POST as marketing } from './marketing/route';
import { POST as verification } from './verification/route';
import { getNotificationSkipCounts } from '../../../lib/notification-guard';

const OWNER = '11111111-1111-4111-8111-111111111111';
const OTHER = '22222222-2222-4222-8222-222222222222';
const INTERNAL = 'test-internal-token-value';

const post = (body: unknown, headers: Record<string, string> = {}) =>
  new NextRequest('http://localhost/api/email/test', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });

const signIn = (userId: string, role = 'customer', email = 'user@example.com') => {
  state.auth = {
    session: { user: { id: userId, email, email_confirmed_at: '2024-01-01' } },
    role,
    mfaLevel: null,
  };
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('INTERNAL_API_TOKEN', INTERNAL);
  vi.stubEnv('INTERNAL_API_KEY', '');
  vi.stubEnv('TEAM_WHATSAPP_1', '+910000000001');
  vi.stubEnv('TEAM_WHATSAPP_2', '');
  state.auth = { session: null, role: 'customer', mfaLevel: null };
  state.rateAllowed = true;
  state.rateCalls = [];
  state.tables = {
    orders: {
      id: 'order-abcdef123456',
      user_id: OWNER,
      customer_email: 'owner@example.com',
      customer_phone: '+919999999999',
      customer_name: 'Olivia Owner',
      total: 1000,
      type: 'Pickup',
      status: 'Confirmed',
      payment_status: 'Payment Confirmed',
      payment_method: 'payu',
      payment_reference: 'txn-1',
    },
    profiles: { email: 'profile@example.com', mobile: '+918888888888', first_name: 'Pat' },
    carts: { items: [{ name: 'Camera' }], updated_at: new Date(Date.now() - 3 * 3600_000).toISOString() },
  };
});

describe('order-scoped notification routes', () => {
  it('rejects unauthenticated callers with 401 and sends nothing', async () => {
    const res = await orderConfirmation(post({ orderId: 'order-abcdef123456' }));
    expect(res.status).toBe(401);
    expect(state.email.sendOrderConfirmation).not.toHaveBeenCalled();
  });

  it('rejects a wrong internal token (401, no session fallback)', async () => {
    const res = await orderConfirmation(post({ orderId: 'x' }, { 'x-internal-api-token': 'wrong-token' }));
    expect(res.status).toBe(401);
  });

  it('forbids a customer who does not own the order (403)', async () => {
    signIn(OTHER, 'customer', 'other@example.com');
    const res = await orderConfirmation(post({ orderId: 'order-abcdef123456' }));
    expect(res.status).toBe(403);
    expect(state.email.sendOrderConfirmation).not.toHaveBeenCalled();
  });

  it('gives the same 403 for a non-existent order (no enumeration)', async () => {
    signIn(OTHER);
    state.tables.orders = null;
    const res = await orderConfirmation(post({ orderId: 'missing' }));
    expect(res.status).toBe(403);
  });

  it('lets the owner send to the address stored on the order, ignoring body recipients', async () => {
    signIn(OWNER, 'customer', 'owner@example.com');
    const res = await orderConfirmation(
      post({ orderId: 'order-abcdef123456', to: 'attacker@evil.test', orderData: { total: 1 } }),
    );
    expect(res.status).toBe(200);
    expect(state.email.sendOrderConfirmation).toHaveBeenCalledTimes(1);
    const [to, orderData] = state.email.sendOrderConfirmation.mock.calls[0] as unknown as [string, any];
    expect(to).toBe('owner@example.com');
    expect(orderData.total).toBe(1000);
  });

  it('allows the internal token for any order', async () => {
    const res = await orderConfirmation(post({ orderId: 'order-abcdef123456' }, { 'x-internal-api-token': INTERNAL }));
    expect(res.status).toBe(200);
    expect(state.rateCalls).toHaveLength(0);
  });

  it('returns 404 for a missing order when the caller is internal', async () => {
    state.tables.orders = null;
    const res = await orderConfirmation(post({ orderId: 'missing' }, { 'x-internal-api-token': INTERNAL }));
    expect(res.status).toBe(404);
  });

  it('forbids customers from staff-only lifecycle emails even for their own order', async () => {
    signIn(OWNER, 'customer', 'owner@example.com');
    const res = await orderDelivered(post({ orderId: 'order-abcdef123456' }));
    expect(res.status).toBe(403);
    expect(state.email.sendOrderDelivered).not.toHaveBeenCalled();
  });

  it('lets staff trigger lifecycle emails', async () => {
    signIn(OTHER, 'sales_executive');
    const res = await orderDelivered(post({ orderId: 'order-abcdef123456' }));
    expect(res.status).toBe(200);
    expect((state.email.sendOrderDelivered.mock.calls[0] as unknown as any[])?.[0]).toBe('owner@example.com');
  });

  it('rate limits per IP and per user and returns 429 when exceeded', async () => {
    signIn(OWNER, 'customer', 'owner@example.com');
    await orderConfirmation(post({ orderId: 'order-abcdef123456' }));
    expect(state.rateCalls.some((c) => c.startsWith('ip:'))).toBe(true);
    expect(state.rateCalls.some((c) => c.startsWith(`user:${OWNER}`))).toBe(true);

    state.rateAllowed = false;
    const res = await orderConfirmation(post({ orderId: 'order-abcdef123456' }));
    expect(res.status).toBe(429);
  });

  it('only sends the payment confirmation when the order record says payment is confirmed', async () => {
    signIn(OWNER, 'customer', 'owner@example.com');
    state.tables.orders.payment_status = 'Payment Failed';
    const blocked = await paymentConfirmation(post({ orderId: 'order-abcdef123456', paymentData: { method: 'fake' } }));
    expect(blocked.status).toBe(409);

    state.tables.orders.payment_status = 'Payment Confirmed';
    const ok = await paymentConfirmation(post({ orderId: 'order-abcdef123456', paymentData: { method: 'fake' } }));
    expect(ok.status).toBe(200);
    expect((state.email.sendPaymentConfirmation.mock.calls[0] as unknown as any[])?.[2]).toEqual({ method: 'payu', transactionId: 'txn-1' });
  });

  it('shipping takes only validated tracking fields from the body', async () => {
    signIn(OTHER, 'sales_manager');
    const res = await shipping(
      post({ orderId: 'order-abcdef123456', shippingData: { trackingNumber: 'AWB1', evil: '<script>' } }),
    );
    expect(res.status).toBe(200);
    expect((state.email.sendShippingNotification.mock.calls[0] as unknown as any[])?.[2]).toEqual({
      trackingNumber: 'AWB1',
      estimatedDelivery: undefined,
    });
  });

  it('requires MFA for admins', async () => {
    state.auth = { session: { user: { id: OTHER, email: 'a@example.com' } }, role: 'admin', mfaLevel: 'aal1' };
    const res = await orderDelivered(post({ orderId: 'order-abcdef123456' }));
    expect(res.status).toBe(403);
  });
});

describe('WhatsApp routes', () => {
  it('pickup: 401 anonymous, 403 customer, 200 staff, phone and code from the order', async () => {
    expect((await pickup(post({ orderId: 'order-abcdef123456' }))).status).toBe(401);

    signIn(OWNER, 'customer', 'owner@example.com');
    expect((await pickup(post({ orderId: 'order-abcdef123456', phone: '+911111111111' }))).status).toBe(403);
    expect(state.whatsapp).not.toHaveBeenCalled();

    signIn(OTHER, 'store_executive');
    const res = await pickup(post({ orderId: 'order-abcdef123456', phone: '+911111111111', pickupCode: 'FAKE' }));
    expect(res.status).toBe(200);
    const [phone, message] = state.whatsapp.mock.calls[0] as unknown as [string, string];
    expect(phone).toBe('+919999999999');
    expect(message).toContain('*123456*');
    expect(message).not.toContain('FAKE');
  });

  it('team WhatsApp routes are internal or staff only', async () => {
    for (const handler of [notifySalesPickup, orderApproved]) {
      state.whatsapp.mockClear();
      state.auth = { session: null, role: 'customer', mfaLevel: null };
      expect((await handler(post({ orderId: 'order-abcdef123456' }))).status).toBe(401);

      signIn(OWNER, 'customer', 'owner@example.com');
      expect((await handler(post({ orderId: 'order-abcdef123456' }))).status).toBe(403);
      expect(state.whatsapp).not.toHaveBeenCalled();

      signIn(OTHER, 'sales_executive');
      expect((await handler(post({ orderId: 'order-abcdef123456' }))).status).toBe(200);
      expect(state.whatsapp).toHaveBeenCalledWith('+910000000001', expect.stringContaining('order-abcdef123456'));
    }
  });

  it('order-approved takes order facts from the database, not the body', async () => {
    signIn(OTHER, 'sales_executive');
    await orderApproved(post({ orderId: 'order-abcdef123456', orderTotal: 1, customerName: 'Spoofed' }));
    const message = (state.whatsapp.mock.calls[0] as unknown as [string, string])[1];
    expect(message).toContain('Olivia Owner');
    expect(message).toContain('1000');
    expect(message).not.toContain('Spoofed');
  });

  it('team routes accept the internal token', async () => {
    const res = await orderApproved(post({ orderId: 'order-abcdef123456' }, { 'x-internal-api-token': INTERNAL }));
    expect(res.status).toBe(200);
  });
});

describe('user-scoped routes', () => {
  it('welcome: 401 anonymous, uses the signed-in user record and ignores body recipient', async () => {
    expect((await welcome(post({ to: 'x@evil.test', userName: 'Evil' }))).status).toBe(401);

    signIn(OWNER, 'customer', 'owner@example.com');
    const res = await welcome(post({ to: 'x@evil.test', userName: 'Evil' }));
    expect(res.status).toBe(200);
    expect(state.email.sendWelcomeEmail).toHaveBeenCalledWith('owner@example.com', 'Pat');
  });

  it('welcome: internal caller must name a valid userId', async () => {
    const bad = await welcome(post({ userId: 'nope' }, { 'x-internal-api-token': INTERNAL }));
    expect(bad.status).toBe(400);
    const ok = await welcome(post({ userId: OTHER }, { 'x-internal-api-token': INTERNAL }));
    expect(ok.status).toBe(200);
    expect(state.email.sendWelcomeEmail).toHaveBeenCalledWith('profile@example.com', 'Pat');
  });

  it('password-reset and email-change are internal-only', async () => {
    for (const handler of [passwordReset, emailChange]) {
      state.auth = { session: null, role: 'customer', mfaLevel: null };
      expect((await handler(post({ to: 'a@b.co', otp: '123456' }))).status).toBe(401);
      signIn(OWNER, 'customer', 'owner@example.com');
      expect((await handler(post({ to: 'a@b.co', otp: '123456', userId: OWNER }))).status).toBe(403);
      signIn(OTHER, 'admin');
      state.auth.mfaLevel = 'aal2';
      expect((await handler(post({ to: 'a@b.co', otp: '123456', userId: OWNER }))).status).toBe(403);
    }
    expect(state.email.sendPasswordResetOTP).not.toHaveBeenCalled();
    expect(state.email.sendEmailChangeOTP).not.toHaveBeenCalled();
  });

  it('password-reset sends to the address on the user record for internal callers', async () => {
    const res = await passwordReset(post({ to: 'attacker@evil.test', otp: '123456', userId: OWNER }, { 'x-internal-api-token': INTERNAL }));
    expect(res.status).toBe(200);
    expect(state.email.sendPasswordResetOTP).toHaveBeenCalledWith('profile@example.com', 'Pat', '123456');
  });

  it('email-change validates the OTP format for internal callers', async () => {
    const res = await emailChange(post({ to: 'new@example.com', otp: 'abc', userId: OWNER }, { 'x-internal-api-token': INTERNAL }));
    expect(res.status).toBe(400);
  });

  it('email-change flow: an internal caller sends the OTP to the new address with the name from the user record', async () => {
    const res = await emailChange(post({ to: 'new@example.com', otp: '654321', userId: OWNER }, { 'x-internal-api-token': INTERNAL }));
    expect(res.status).toBe(200);
    expect(state.email.sendEmailChangeOTP).toHaveBeenCalledWith('new@example.com', 'Pat', '654321');
  });

  it('abandoned-cart: reads phone and cart from the database', async () => {
    expect((await abandonedCart(post({}))).status).toBe(401);

    signIn(OWNER, 'customer', 'owner@example.com');
    const res = await abandonedCart(post({ phone: '+911111111111', cartItems: [{ name: 'Spoof' }] }));
    expect(res.status).toBe(200);
    const [phone, message] = state.whatsapp.mock.calls[0] as unknown as [string, string];
    expect(phone).toBe('+918888888888');
    expect(message).toContain('Camera');
    expect(message).not.toContain('Spoof');
  });

  it('abandoned-cart: records a counted skip when the profile has no mobile or no cart is synced', async () => {
    signIn(OWNER, 'customer', 'owner@example.com');
    const before = getNotificationSkipCounts();

    state.tables.profiles = { email: 'profile@example.com', mobile: null, first_name: 'Pat' };
    const noMobile = await abandonedCart(post({}));
    expect((await noMobile.json()).skipped).toBe(true);

    state.tables.profiles = { email: 'profile@example.com', mobile: '+918888888888', first_name: 'Pat' };
    state.tables.carts = null;
    const noCart = await abandonedCart(post({}));
    expect((await noCart.json()).skipped).toBe(true);

    const after = getNotificationSkipCounts();
    expect(after['abandoned_cart.no_profile_mobile']).toBe((before['abandoned_cart.no_profile_mobile'] ?? 0) + 1);
    expect(after['abandoned_cart.cart_not_synced']).toBe((before['abandoned_cart.cart_not_synced'] ?? 0) + 1);
    expect(state.whatsapp).not.toHaveBeenCalled();
  });
});

describe('notify-manager, marketing and verification', () => {
  it('notify-manager ignores a caller-supplied `to` and uses the configured allowlist', async () => {
    vi.stubEnv('MANAGER_EMAILS', 'boss@example.com, not-an-email');
    signIn(OTHER, 'manager');
    const res = await notifyManager(post({ orderId: 'o1', to: 'attacker@evil.test' }));
    expect(res.status).toBe(200);
    expect(state.email.notifyManagerNewOrder).toHaveBeenCalledWith(['boss@example.com'], expect.objectContaining({ orderId: 'o1' }));
  });

  it('notify-manager rejects anonymous and customer callers, and accepts the internal token', async () => {
    vi.stubEnv('MANAGER_EMAILS', 'boss@example.com');
    expect((await notifyManager(post({ orderId: 'o2' }))).status).toBe(401);
    signIn(OWNER, 'customer');
    expect((await notifyManager(post({ orderId: 'o2' }))).status).toBe(403);
    state.auth = { session: null, role: 'customer', mfaLevel: null };
    expect((await notifyManager(post({ orderId: 'o3' }, { 'x-internal-api-token': INTERNAL }))).status).toBe(200);
  });

  it('marketing needs an admin; sales staff and customers get 403', async () => {
    expect((await marketing(post({ to: 'a@b.co' }))).status).toBe(401);
    signIn(OWNER, 'customer');
    expect((await marketing(post({ to: 'a@b.co' }))).status).toBe(403);
    signIn(OWNER, 'sales_executive');
    expect((await marketing(post({ to: 'a@b.co' }))).status).toBe(403);
    signIn(OWNER, 'admin');
    state.auth.mfaLevel = 'aal2';
    expect((await marketing(post({ to: 'a@b.co', campaignTitle: 'x' }))).status).toBe(200);
  });

  it('verification only sends to the signed-in user\'s own address', async () => {
    expect((await verification(post({ to: 'a@b.co', userName: 'A', otp: '123456' }))).status).toBe(401);
    signIn(OWNER, 'customer', 'me@example.com');
    expect((await verification(post({ to: 'other@example.com', userName: 'A', otp: '123456' }))).status).toBe(403);
    expect((await verification(post({ to: 'ME@example.com', userName: 'A', otp: '123456' }))).status).toBe(200);
    expect(state.email.sendEmailVerification).toHaveBeenCalledTimes(1);
  });
});
