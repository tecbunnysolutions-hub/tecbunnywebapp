import { afterEach, describe, expect, it } from 'vitest';
import { getTrustedClientIp } from './request-ip';

const req = (headers: Record<string, string>) => new Request('http://localhost/', { headers });

describe('getTrustedClientIp', () => {
  afterEach(() => {
    delete process.env.TRUST_CLOUDFLARE_IP;
    delete process.env.TRUST_PROXY_HEADERS;
  });

  it('ignores cf-connecting-ip unless TRUST_CLOUDFLARE_IP=true', () => {
    expect(getTrustedClientIp(req({ 'cf-connecting-ip': '1.1.1.1' }))).toBe('unknown');
    process.env.TRUST_PROXY_HEADERS = 'true';
    expect(getTrustedClientIp(req({ 'cf-connecting-ip': '1.1.1.1', 'x-forwarded-for': '2.2.2.2, 3.3.3.3' }))).toBe('2.2.2.2');
  });

  it('uses cf-connecting-ip when trusted', () => {
    process.env.TRUST_CLOUDFLARE_IP = 'true';
    expect(getTrustedClientIp(req({ 'cf-connecting-ip': '1.1.1.1' }))).toBe('1.1.1.1');
  });

  it('falls back to x-real-ip when proxy headers trusted', () => {
    process.env.TRUST_PROXY_HEADERS = 'true';
    expect(getTrustedClientIp(req({ 'x-real-ip': '4.4.4.4' }))).toBe('4.4.4.4');
  });
});
