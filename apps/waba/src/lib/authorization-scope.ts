import { supabase } from './supabase';

export interface ActorScope { isGlobal: boolean; organizationId: string | null; branchId: string | null }
export interface ScopedUserRecord { organization_id: string | null; branch_id: string | null }

export function canManageUserInScope(scope: ActorScope, record: ScopedUserRecord): boolean {
  if (scope.isGlobal) return true;
  return Boolean(scope.organizationId && record.organization_id === scope.organizationId && (!scope.branchId || record.branch_id === scope.branchId));
}

export async function resolveActorScope(userId: string, role: string): Promise<ActorScope | null> {
  if (['superadmin', 'admin'].includes(role.trim().toLowerCase())) return { isGlobal: true, organizationId: null, branchId: null };
  const { data, error } = await supabase.from('waba_staff_directory').select('organization_id, branch_id').eq('id', userId).maybeSingle();
  if (error || !data || !data.organization_id) return null;
  return { isGlobal: false, organizationId: data.organization_id, branchId: data.branch_id ?? null };
}

// Ownership does not change when a conversation is assigned or unassigned.
// Unowned legacy traffic is deliberately quarantined to global administrators.
export async function canAccessConversationSender(scope: ActorScope, sender: string): Promise<boolean> {
  if (scope.isGlobal) return true;
  if (!scope.organizationId) return false;
  const { data, error } = await supabase.from('Conversation').select('organization_id, branch_id').eq('sender_number', sender).maybeSingle();
  return !error && !!data && canManageUserInScope(scope, data as ScopedUserRecord);
}

export async function getAccessibleConversationSenders(scope: ActorScope): Promise<string[] | null> {
  if (scope.isGlobal) return null;
  if (!scope.organizationId) return [];
  const senders: string[] = [];
  for (let offset = 0; ; offset += 1000) {
    let query = supabase.from('Conversation').select('sender_number').eq('organization_id', scope.organizationId).order('sender_number').range(offset, offset + 999);
    if (scope.branchId) query = query.eq('branch_id', scope.branchId);
    const { data, error } = await query;
    if (error) throw new Error('Could not resolve conversation scope');
    senders.push(...(data || []).map(row => String(row.sender_number)));
    if (!data || data.length < 1000) return senders;
  }
}
