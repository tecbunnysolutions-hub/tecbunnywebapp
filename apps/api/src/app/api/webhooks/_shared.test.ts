import { describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({ getRedis: vi.fn() }));
vi.mock('@tecbunny/core/redis', () => ({ getRedis: m.getRedis }));
import { claimWebhookEventId } from './_shared';

describe('claimWebhookEventId', () => {
  it('dedupes in memory when Redis is unavailable', async () => {
    m.getRedis.mockReturnValue(null);
    expect(await claimWebhookEventId('t', 'a')).toBe(true);
    expect(await claimWebhookEventId('t', 'a')).toBe(false);
  });

  it('falls back to memory when Redis throws', async () => {
    m.getRedis.mockReturnValue({ set: vi.fn().mockRejectedValue(new Error('down')) });
    expect(await claimWebhookEventId('t', 'b')).toBe(true);
    expect(await claimWebhookEventId('t', 'b')).toBe(false);
  });

  it('uses Redis NX result when available', async () => {
    m.getRedis.mockReturnValue({ set: vi.fn().mockResolvedValueOnce('OK').mockResolvedValueOnce(null) });
    expect(await claimWebhookEventId('t', 'c')).toBe(true);
    expect(await claimWebhookEventId('t', 'c')).toBe(false);
  });
});
