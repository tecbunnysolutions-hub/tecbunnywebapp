import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({ from: vi.fn(), session: vi.fn() }));
vi.mock('@tecbunny/database/server', () => ({ createSupabaseClient: async () => ({ from: mocks.from }) }));
vi.mock('@tecbunny/core/auth/server-role', () => ({ getSessionWithRole: mocks.session }));
vi.mock('@tecbunny/core/roles', () => ({ isAtLeast: (role: string) => role === 'admin' }));
vi.mock('@tecbunny/core', () => ({ logger: { info: vi.fn(), error: vi.fn() } }));
vi.mock('../../../../lib/revalidate-public', () => ({ withPublicRevalidation: (_tags: string[], handler: unknown) => handler }));
import { GET, PATCH } from './route';

function builder(result: object) {
  const query: Record<string, ReturnType<typeof vi.fn>> = {};
  for (const method of ['select', 'eq', 'not', 'lte', 'is', 'update']) query[method] = vi.fn(() => query);
  query.maybeSingle = vi.fn().mockResolvedValue(result);
  return query;
}
const context = () => ({ params: Promise.resolve({ slug: 'post' }) });
const request = (body?: object) => new NextRequest('https://api.test/api/blog/post', body ? {
  method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
} : undefined);
beforeEach(() => { vi.clearAllMocks(); mocks.session.mockResolvedValue({ session: { user: { id: 'editor' } }, role: 'admin' }); });

describe('legacy blog schema compatibility and editing', () => {
  it('keeps anonymous detail reads published, nondeleted and free of private metadata', async () => {
    mocks.session.mockResolvedValue({ session: null, role: null });
    const query = builder({ data: { id: 'post', metadata: { internal: 'private' } }, error: null });
    mocks.from.mockReturnValue(query);
    const response = await GET(request(), context());
    expect(query.eq).toHaveBeenCalledWith('status', 'active');
    expect(query.not).toHaveBeenCalledWith('published_at', 'is', null);
    expect(query.lte).toHaveBeenCalledWith('published_at', expect.any(String));
    expect(query.is).toHaveBeenCalledWith('deleted_at', null);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(await response.text()).not.toContain('private');
  });
  it('denies unauthenticated edits before reading or updating', async () => {
    mocks.session.mockResolvedValue({ session: null, role: null });
    const response = await PATCH(request({ seo_title: 'New title' }), context());
    if (!(response instanceof Response)) throw new Error('Expected a response');
    expect(response.status).toBe(401);
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it('preserves metadata and refuses to overwrite a concurrent edit', async () => {
    const read = builder({ data: { metadata: { internal: true, seo_title: 'Old' }, updated_at: '2026-10-01', published_at: '2026-09-01' }, error: null });
    const update = builder({ data: null, error: null });
    mocks.from.mockReturnValueOnce(read).mockReturnValueOnce(update);
    const response = await PATCH(request({ seo_description: 'New description', status: 'published' }), context());
    if (!(response instanceof Response)) throw new Error('Expected a response');
    expect(response.status).toBe(409);
    expect(update.eq).toHaveBeenCalledWith('updated_at', '2026-10-01');
    expect(update.update).toHaveBeenCalledWith(expect.objectContaining({
      status: 'active', published_at: '2026-09-01', metadata: { internal: true, seo_title: 'Old', seo_description: 'New description' },
    }));
  });
});
