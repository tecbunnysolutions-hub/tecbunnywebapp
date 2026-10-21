import { describe, expect, it } from 'vitest';
import { sanitizeUploadFolder } from './safe-upload-path';

describe('sanitizeUploadFolder', () => {
  it('accepts valid folders', () => {
    expect(sanitizeUploadFolder('hero-banners')).toBe('hero-banners');
    expect(sanitizeUploadFolder('a_b/c-d/')).toBe('a_b/c-d');
    expect(sanitizeUploadFolder(null)).toBe('');
  });

  it('rejects traversal, absolute, bad chars and long paths', () => {
    for (const bad of ['../x', 'a/../b', '/abs', 'a//b', 'a\\b', 'A B', 'a%2e%2e/b', 'x'.repeat(101)]) {
      expect(sanitizeUploadFolder(bad)).toBeNull();
    }
  });
});
