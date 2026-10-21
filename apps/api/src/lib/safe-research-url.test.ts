import { describe, expect, it, vi } from 'vitest';

vi.mock('@tecbunny/core/security/network-validation', async (importOriginal) => ({
  ...(await importOriginal<any>()),
  validatePublicRemoteUrl: vi.fn(async (u: URL) => u.hostname !== 'private.example.com'),
}));

import { isSafeResearchUrl, parseSafeResearchUrl } from './safe-research-url';

describe('research url validation', () => {
  it('accepts public https urls', async () => {
    expect(await isSafeResearchUrl('https://example.com/a?b=1')).toBe(true);
  });

  it('rejects unsafe urls', async () => {
    const bad = [
      'http://example.com',
      'https://localhost/x',
      'https://127.0.0.1/',
      'https://169.254.169.254/latest/meta-data',
      'https://10.0.0.1/',
      'https://192.168.1.1/',
      'https://[::1]/',
      'https://[::ffff:127.0.0.1]/',
      'https://user:pw@example.com/',
      'https://example.com@127.0.0.1/',
      'https://0x7f.0.0.1/',
      'https://2130706433/',
      'https://intranet/',
      'https://metadata.google.internal/',
      'https://private.example.com/',
      'ftp://example.com/',
    ];
    for (const u of bad) {
      expect(await isSafeResearchUrl(u), u).toBe(false);
    }
    expect(parseSafeResearchUrl('https://exa%6Dple.com')).not.toBeNull();
  });
});
