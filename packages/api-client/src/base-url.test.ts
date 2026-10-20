import { describe, expect, it } from 'vitest';
import { LOCAL_API_URL, PRODUCTION_API_URL, STAGING_API_URL, resolveApiBaseUrl } from './base-url.mjs';

describe('resolveApiBaseUrl', () => {
  it.each(['tecbunny.com', 'www.tecbunny.com', 'staff.tecbunny.com', 'admin.tecbunny.com'])('maps %s to production', (hostname) => {
    expect(resolveApiBaseUrl({ hostname })).toBe(PRODUCTION_API_URL);
  });

  it('maps localhost to the local API', () => {
    expect(resolveApiBaseUrl({ hostname: 'localhost' })).toBe(LOCAL_API_URL);
    expect(resolveApiBaseUrl({ hostname: '127.0.0.1' })).toBe(LOCAL_API_URL);
  });

  it('falls back to production for unknown hosts', () => {
    expect(resolveApiBaseUrl({ hostname: 'example.org' })).toBe(PRODUCTION_API_URL);
  });

  it('uses production on the server unless a CI flag selects staging', () => {
    expect(resolveApiBaseUrl({ target: '' })).toBe(PRODUCTION_API_URL);
    expect(resolveApiBaseUrl({ target: 'staging' })).toBe(STAGING_API_URL);
  });
});
