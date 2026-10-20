import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  requireApiRole: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({ supabase: { from: mocks.from } }));
vi.mock('@tecbunny/core/server-role-guard', () => ({ requireApiRole: mocks.requireApiRole }));

import { GET } from './route';

const request = () => new Request('https://waba.test/api/webhook/whatsapp/debug?limit=5');

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe('GET /api/webhook/whatsapp/debug', () => {
  it('returns 404 in production without touching auth or the database', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const res = await GET(request());
    expect(res.status).toBe(404);
    expect(mocks.requireApiRole).not.toHaveBeenCalled();
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('requires the superadmin role outside production', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    mocks.requireApiRole.mockResolvedValue({ error: Response.json({ error: 'Forbidden' }, { status: 403 }) });
    const res = await GET(request());
    expect(res.status).toBe(403);
    expect(mocks.requireApiRole).toHaveBeenCalledWith({ allowedRoles: ['superadmin'] });
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('uses a column allowlist and redacts phone numbers and message bodies', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    mocks.requireApiRole.mockResolvedValue({ role: 'superadmin' });
    const select = vi.fn().mockReturnValue({
      order: () => ({
        limit: async () => ({
          data: [{ id: 1, stage: 'received', created_at: 'now', detail: { from: '919876543210', text: { body: 'hello' }, status: 'ok' } }],
          error: null,
        }),
      }),
    });
    mocks.from.mockReturnValue({ select });

    const res = await GET(request());
    const json = await res.json();

    expect(select).toHaveBeenCalledWith('id, stage, detail, created_at');
    expect(json.entries[0].detail).toEqual({ from: '[redacted]', text: '[redacted]', status: 'ok' });
  });
});
