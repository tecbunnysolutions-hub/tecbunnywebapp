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

import { GET, POST } from './route';

describe('WhatsApp webhook route', () => {
  beforeEach(() => {
    queueAdd.mockReset();
    queueAdd.mockResolvedValue({ id: 'job-1' });
    process.env.META_APP_SECRET = 'test-app-secret';
    process.env.META_WHATSAPP_VERIFY_TOKEN = 'test-verify-token';
  });

  it('verifies the Meta webhook challenge', async () => {
    const response = await GET(new Request(
      'https://waba.test/api/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=test-verify-token&hub.challenge=challenge-123',
    ));

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('challenge-123');
  });

  it('authenticates a Meta signature and enqueues an idempotent provider event', async () => {
    const payload = JSON.stringify({ entry: [{ changes: [{ value: { messages: [{ id: 'provider-message-1', from: '919876543210' }] } }] }] });
    const signature = crypto.createHmac('sha256', 'test-app-secret').update(payload).digest('hex');
    const response = await POST(new Request(
      'https://waba.test/api/webhook/whatsapp',
      { method: 'POST', body: payload, headers: { 'x-hub-signature-256': `sha256=${signature}` } },
    ));

    expect(response.status).toBe(200);
    expect(queueAdd).toHaveBeenCalledWith(
      'process-webhook',
      expect.objectContaining({
        results: [{
          from: '919876543210',
          messageId: 'provider-message-1',
          message: { text: undefined },
        }],
        statuses: [],
      }),
      expect.objectContaining({ jobId: 'waba-webhook-provider-message-1' }),
    );
  });

  it('rejects an invalid Meta signature before touching the queue', async () => {
    const response = await POST(new Request(
      'https://waba.test/api/webhook/whatsapp',
      { method: 'POST', body: JSON.stringify({ entry: [] }), headers: { 'x-hub-signature-256': 'sha256=wrong' } },
    ));

    expect(response.status).toBe(401);
    expect(queueAdd).not.toHaveBeenCalled();
  });
});