import { describe, expect, it, vi } from 'vitest';

import { getWebhookVerifyToken } from './whatsapp-webhook-token';

describe('getWebhookVerifyToken', () => {
  it('prefers the canonical name without warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(getWebhookVerifyToken({ WHATSAPP_WEBHOOK_VERIFY_TOKEN: 'a', META_WHATSAPP_VERIFY_TOKEN: 'b' })).toBe('a');
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('accepts deprecated names and logs only the NAME', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(getWebhookVerifyToken({ WHATSAPP_VERIFY_TOKEN: 'secret-value' })).toBe('secret-value');
    const logged = warn.mock.calls.flat().join(' ');
    expect(logged).toContain('WHATSAPP_VERIFY_TOKEN');
    expect(logged).not.toContain('secret-value');
    warn.mockRestore();
  });

  it('returns undefined when nothing is set', () => {
    expect(getWebhookVerifyToken({})).toBeUndefined();
  });
});
