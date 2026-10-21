import { afterEach, describe, expect, it, vi } from 'vitest';
import { createGuestOrderAccessToken, verifyGuestOrderAccessToken } from './guest-order-access';

describe('guest order access tokens', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('only authorizes the matching order before token expiry', () => {
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-secret');
    const now = Date.UTC(2026, 0, 1);
    const token = createGuestOrderAccessToken('order-123', now);

    expect(verifyGuestOrderAccessToken(token, 'order-123', now)).toBe(true);
    expect(verifyGuestOrderAccessToken(token, 'order-456', now)).toBe(false);
    expect(verifyGuestOrderAccessToken(token, 'order-123', now + 8 * 24 * 60 * 60 * 1000)).toBe(false);
  });

  it('rejects malformed tokens', () => {
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-secret');
    expect(verifyGuestOrderAccessToken('invalid', 'order-123')).toBe(false);
  });
});
