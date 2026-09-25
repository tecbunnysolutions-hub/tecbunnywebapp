import { beforeEach, describe, expect, it, vi } from 'vitest';
const m = vi.hoisted(() => ({ record: null as any, from: vi.fn() }));
vi.mock('./supabase', () => ({ supabase: { from: m.from } }));
import { canAccessConversationSender, resolveActorScope } from './authorization-scope';
const scope = { isGlobal: false, organizationId: 'org-a', branchId: 'branch-a' };
describe('Conversation ownership', () => {
  beforeEach(() => { vi.clearAllMocks(); const query = { select: () => query, eq: () => query, maybeSingle: async () => ({ data: m.record }) }; m.from.mockReturnValue(query); });
  it('denies unowned traffic instead of exposing a global shared inbox', async () => { m.record = { organization_id: null, branch_id: null, assigned_to: null }; expect(await canAccessConversationSender(scope, 'phone')).toBe(false); });
  it('allows unassigned traffic only within its saved owner scope', async () => { m.record = { organization_id: 'org-a', branch_id: 'branch-a', assigned_to: null }; expect(await canAccessConversationSender(scope, 'phone')).toBe(true); });
  it.each([{ organization_id: 'org-b', branch_id: 'branch-a' }, { organization_id: 'org-a', branch_id: 'branch-b' }])('rejects foreign scope %j', async record => { m.record = record; expect(await canAccessConversationSender(scope, 'phone')).toBe(false); });
  it('resolves staff from the canonical directory', async () => { m.record = { organization_id: 'org-a', branch_id: 'branch-a' }; expect(await resolveActorScope('u', 'sales_manager')).toEqual(scope); expect(m.from).toHaveBeenCalledWith('waba_staff_directory'); });
});
