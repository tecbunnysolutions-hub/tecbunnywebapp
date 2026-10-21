import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({
  from: vi.fn(),
  requireRole: vi.fn(),
  resolveScope: vi.fn(),
  eq: vi.fn(),
  insert: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({ supabase: { from: m.from } }));
vi.mock('@tecbunny/core/server-role-guard', () => ({ requireApiRole: m.requireRole }));
vi.mock('@tecbunny/core/logger', () => ({ logger: { info: vi.fn(), error: vi.fn() } }));
vi.mock('@tecbunny/core/enterprise-analytics', () => ({ withAuditEvent: (_e: unknown, fn: () => unknown) => fn() }));
vi.mock('@/lib/authorization-scope', async () => ({
  ...(await vi.importActual<object>('@/lib/authorization-scope')),
  resolveActorScope: m.resolveScope,
}));

import { GET, POST } from './route';

const tenant = { isGlobal: false, organizationId: 'org-a', branchId: 'branch-a' };

describe('Template tenant scope', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    m.requireRole.mockResolvedValue({ role: 'manager', session: { user: { id: 'u1' } } });
    m.resolveScope.mockResolvedValue(tenant);
    const query: Record<string, unknown> = {};
    query.select = vi.fn(() => query);
    query.eq = m.eq.mockImplementation(() => query);
    query.order = vi.fn(async () => ({ data: [{ id: 't1' }], error: null }));
    query.insert = m.insert.mockImplementation(() => query);
    query.single = vi.fn(async () => ({ data: { id: 'new' }, error: null }));
    m.from.mockReturnValue(query);
  });

  it('filters list queries by org and branch in the database', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(m.eq).toHaveBeenCalledWith('organization_id', 'org-a');
    expect(m.eq).toHaveBeenCalledWith('branch_id', 'branch-a');
  });

  it('denies actors without a scope', async () => {
    m.resolveScope.mockResolvedValue(null);
    expect((await GET()).status).toBe(403);
  });

  it('restricts creation to staff roles and stamps ownership', async () => {
    await POST(new Request('https://x.test', { method: 'POST', body: JSON.stringify({ name: 'hello_tpl', content: 'Hi' }) }));
    expect(m.requireRole).toHaveBeenCalledWith({ allowedRoles: expect.arrayContaining(['manager', 'admin']) });
    expect(m.insert).toHaveBeenCalledWith(expect.objectContaining({ organization_id: 'org-a', branch_id: 'branch-a' }));
  });
});
