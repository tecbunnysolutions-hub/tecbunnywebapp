import { describe, expect, it } from 'vitest';

import { isAllowedApiOrigin } from './unified-middleware';

const allowed = (origin: string, env = 'production') => isAllowedApiOrigin(new URL(origin), env);

describe('isAllowedApiOrigin', () => {
  it.each(['https://tecbunny.com', 'https://www.tecbunny.com', 'https://staff.tecbunny.com', 'https://admin.tecbunny.com'])(
    'allows %s',
    (origin) => expect(allowed(origin)).toBe(true),
  );

  it('rejects other subdomains, plain http and lookalikes', () => {
    expect(allowed('https://evil.tecbunny.com')).toBe(false);
    expect(allowed('http://www.tecbunny.com')).toBe(false);
    expect(allowed('https://tecbunny.com.evil.io')).toBe(false);
    expect(allowed('https://api.tecbunny.store')).toBe(false);
  });

  it('allows localhost only outside production', () => {
    expect(allowed('http://localhost:3000', 'development')).toBe(true);
    expect(allowed('http://localhost:3000', 'production')).toBe(false);
  });

  it('allows well-formed chrome extension origins only', () => {
    expect(allowed(`chrome-extension://${'a'.repeat(32)}`)).toBe(true);
    expect(allowed('chrome-extension://short')).toBe(false);
  });
});
