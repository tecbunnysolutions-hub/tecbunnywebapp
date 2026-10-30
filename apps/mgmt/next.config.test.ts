import { describe, expect, it } from 'vitest';
import config from './next.config';

describe('management login security headers', () => {
  it('allows the real Turnstile script and iframe on routes excluded from the proxy', async () => {
    const rules = await config.headers!();
    const headers = rules.find(rule => rule.source === '/:path*')!.headers;
    const policy = headers.find(header => header.key === 'Content-Security-Policy')!.value;
    const directives = new Map(policy.split(';').map(part => {
      const [name, ...sources] = part.trim().split(/\s+/);
      return [name, sources];
    }));
    expect(directives.get('script-src')).toEqual([
      "'self'", "'unsafe-inline'", 'https://checkout.razorpay.com', 'https://challenges.cloudflare.com',
    ]);
    expect(directives.get('frame-src')).toEqual([
      "'self'", 'https://api.razorpay.com', 'https://checkout.razorpay.com', 'https://challenges.cloudflare.com',
    ]);
    expect(directives.get('object-src')).toEqual(["'none'"]);
    expect(directives.get('frame-ancestors')).toEqual(["'none'"]);
    expect(headers).toContainEqual({ key: 'X-Frame-Options', value: 'DENY' });
  });
});
