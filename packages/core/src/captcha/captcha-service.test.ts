import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.resetModules(); });

describe('environment-only CAPTCHA verification credentials', () => {
  it.each(['', 'public-site-key'])('fails closed when the secret is missing or is a public site key', async secret => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'public-site-key');
    vi.stubEnv('TURNSTILE_SECRET_KEY', secret);
    const request = vi.fn(); vi.stubGlobal('fetch', request);
    const { verifyCaptcha } = await import('./captcha-service');
    expect((await verifyCaptcha('challenge-token')).success).toBe(false);
    expect(request).not.toHaveBeenCalled();
  });
  it('uses only the configured secret and excludes it from client configuration', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'public-site-key');
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'environment-verification-secret');
    const request=vi.fn().mockResolvedValue({ok:true,json:async()=>({success:true})});vi.stubGlobal('fetch',request);
    const {verifyCaptcha,captchaService}=await import('./captcha-service');
    expect((await verifyCaptcha('challenge-token')).success).toBe(true);
    expect(new URLSearchParams(request.mock.calls[0][1].body).get('secret')).toBe('environment-verification-secret');
    expect(captchaService.getClientConfig()).not.toHaveProperty('secretKey');
  });
});
