import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  rateLimit: vi.fn(),
  sendWhatsAppNotification: vi.fn(),
  getTrustedClientIp: vi.fn(() => '203.0.113.7'),
  loggerError: vi.fn(),
}));

vi.mock('@tecbunny/core/rate-limit', () => ({ rateLimit: mocks.rateLimit }));
vi.mock('@tecbunny/core/server', () => ({ getTrustedClientIp: mocks.getTrustedClientIp }));
vi.mock('@tecbunny/core/whatsapp-service', () => ({ sendWhatsAppNotification: mocks.sendWhatsAppNotification }));
vi.mock('@tecbunny/core', () => ({ logger: { error: mocks.loggerError } }));

import { POST } from './route';

const request = (body: unknown) =>
  new NextRequest('https://api.test/api/cart/abandoned', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

const validRequest = {
  consent: true,
  name: 'Taylor',
  phone: '9876543210',
  website: '',
};

describe('POST /api/cart/abandoned', () => {
  beforeEach(() => {
    mocks.rateLimit.mockReset().mockResolvedValue({ allowed: true });
    mocks.sendWhatsAppNotification.mockReset().mockResolvedValue(undefined);
    mocks.getTrustedClientIp.mockReset().mockReturnValue('203.0.113.7');
    mocks.loggerError.mockReset();
  });

  it('sends a consented cart link without client prices or payment instructions', async () => {
    const response = await POST(request(validRequest));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ success: true });
    expect(mocks.getTrustedClientIp).toHaveBeenCalled();
    expect(mocks.rateLimit).toHaveBeenNthCalledWith(1, 'cart-recovery:ip:203.0.113.7', 5, 60 * 60 * 1000);
    expect(mocks.rateLimit).toHaveBeenNthCalledWith(2, 'cart-recovery:phone:9876543210', 1, 60 * 60 * 1000);
    expect(mocks.sendWhatsAppNotification).toHaveBeenCalledOnce();

    const sentMessage = mocks.sendWhatsAppNotification.mock.calls[0][1];
    expect(sentMessage).toContain('https://tecbunny.com/cart');
    expect(sentMessage).toContain('Items are not reserved');
    expect(sentMessage).not.toMatch(/₹|upi|vpa|reserved for you/i);
  });

  it('rejects requests without explicit opt-in', async () => {
    const response = await POST(request({ ...validRequest, consent: false }));

    expect(response.status).toBe(400);
    expect(mocks.sendWhatsAppNotification).not.toHaveBeenCalled();
    expect(mocks.rateLimit).toHaveBeenCalledOnce();
  });

  it('rejects malformed phone numbers and unexpected client-supplied fields', async () => {
    expect((await POST(request({ ...validRequest, phone: '123' }))).status).toBe(400);
    expect((await POST(request({ ...validRequest, price: 1 }))).status).toBe(400);
    expect(mocks.sendWhatsAppNotification).not.toHaveBeenCalled();
  });

  it('silently ignores honeypot submissions', async () => {
    const response = await POST(request({ ...validRequest, website: 'spam.example' }));
    const whitespaceResponse = await POST(request({ ...validRequest, website: '   ' }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(whitespaceResponse.status).toBe(200);
    expect(await whitespaceResponse.json()).toEqual({ success: true });
    expect(mocks.rateLimit).toHaveBeenCalledTimes(2);
    expect(mocks.sendWhatsAppNotification).not.toHaveBeenCalled();
  });

  it('blocks requests when the IP or phone rate limit is exceeded', async () => {
    mocks.rateLimit.mockResolvedValueOnce({ allowed: false });
    expect((await POST(request(validRequest))).status).toBe(429);
    expect(mocks.sendWhatsAppNotification).not.toHaveBeenCalled();

    mocks.rateLimit.mockReset()
      .mockResolvedValueOnce({ allowed: true })
      .mockResolvedValueOnce({ allowed: false });
    expect((await POST(request(validRequest))).status).toBe(429);
    expect(mocks.sendWhatsAppNotification).not.toHaveBeenCalled();
  });
});
