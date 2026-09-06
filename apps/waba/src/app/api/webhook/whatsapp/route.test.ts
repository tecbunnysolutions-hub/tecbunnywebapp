import crypto from 'crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const queueAdd = vi.fn();

vi.mock('@tecbunny/core/queue', () => ({
  getWabaWebhookQueue: () => ({ add: queueAdd }),
}));

vi.mock('@tecbunny/core/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

import { POST } from './route';

describe('WhatsApp webhook route', () => {
  beforeEach(() => {
    queueAdd.mockReset();
    queueAdd.mockResolvedValue({ id: 'job-1' });
    process.env.INFOBIP_HMAC_SECRET = 'test-webhook-secret';
    delete process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  });

  it('authenticates a URL token and enqueues an idempotent provider event', async () => {
    const payload = JSON.stringify({ results: [{ messageId: 'provider-message-1', from: '+919876543210' }] });
    const response = await POST(new Request(
      'https://waba.test/api/webhook/whatsapp?token=test-webhook-secret',
      { method: 'POST', body: payload },
    ));

    expect(response.status).toBe(200);
    expect(queueAdd).toHaveBeenCalledWith(
      'process-webhook',
      { results: [{ messageId: 'provider-message-1', from: '+919876543210' }] },
      expect.objectContaining({ jobId: 'waba-webhook-provider-message-1' }),
    );
  });

  it('authenticates an HMAC signature when no URL token is supplied', async () => {
    const payload = JSON.stringify({ results: [{ messageId: 'provider-message-2' }] });
    const signature = crypto.createHmac('sha256', 'test-webhook-secret').update(payload).digest('hex');
    const response = await POST(new Request('https://waba.test/api/webhook/whatsapp', {
      method: 'POST',
      body: payload,
      headers: { 'x-hub-signature-256': `sha256=${signature}` },
    }));

    expect(response.status).toBe(200);
    expect(queueAdd).toHaveBeenCalledOnce();
  });

  it('rejects an invalid token before touching the queue', async () => {
    const response = await POST(new Request(
      'https://waba.test/api/webhook/whatsapp?token=wrong-token',
      { method: 'POST', body: JSON.stringify({ results: [] }) },
    ));

    expect(response.status).toBe(401);
    expect(queueAdd).not.toHaveBeenCalled();
  });
});