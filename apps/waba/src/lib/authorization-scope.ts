/**
 * Authorization scope helpers for the WABA app.
 *
 * Reconstructed module — consistent with the role model in
 * packages/core/src/server-role-guard.ts ("Admins and superadmins are global;
 * every sales/service role must be scoped") and packages/shared/src/roles.ts.
 *
 * Scope model:
 *   - `superadmin` / `admin`            -> global (unrestricted) access.
 *   - every other staff role            -> restricted to the actor's
 *     organization (and branch, when the actor is assigned to one), resolved
 *     from the actor's `User` row (`organization_id` / `branch_id`).
 *   - unknown user / lookup failure     -> `null` (fail closed => HTTP 403).
 *
 * Conversations carry no org/branch columns in the Prisma schema
 * (packages/types/prisma/schema.prisma), so conversation-level scoping is
 * derived from the conversation's `assigned_to` user: a conversation is in
 * scope when its assignee belongs to the actor's organization/branch.
 * Unassigned conversations are treated as a shared inbox visible to anyone
 * with an organization scope.
 */
import { supabase } from './supabase';

export interface ActorScope {
  isGlobal: boolean;
  organizationId: string | null;
  branchId: string | null;
}

/** Subset of `User` row fields used for scope comparisons. */
export interface ScopedUserRecord {
  organization_id: string | null;
  branch_id: string | null;
}

/** Roles with unrestricted, platform-wide visibility. */
const GLOBAL_SCOPE_ROLES = new Set(['superadmin', 'admin']);

/**
 * Resolve the actor's authorization scope from their user id and role.
 * Returns `null` when the actor cannot be resolved (fail closed).
 */
export async function resolveActorScope(
  userId: string,
  role: string,
): Promise<ActorScope | null> {
  const normalizedRole = (role || '').trim().toLowerCase();

  if (GLOBAL_SCOPE_ROLES.has(normalizedRole)) {
    return { isGlobal: true, organizationId: null, branchId: null };
  }

  const { data, error } = await supabase
    .from('User')
    .select('organization_id, branch_id')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.warn('[authorization-scope] Failed to resolve actor scope', {
      userId,
      error: error.message,
    });
    return null;
  }
  if (!data) return null;

  return {
    isGlobal: false,
    organizationId: (data.organization_id as string | null) ?? null,
    branchId: (data.branch_id as string | null) ?? null,
  };
}

/**
 * Sender numbers the actor is allowed to see.
 * Returns `null` for global scope (no restriction), an array of sender numbers
 * otherwise (empty array => no access).
 */
export async function getAccessibleConversationSenders(
  scope: ActorScope,
): Promise<string[] | null> {
  if (scope.isGlobal) return null;
  if (!scope.organizationId) return [];

  // Staff users inside the actor's organization (and branch, when set).
  let usersQuery = supabase
    .from('User')
    .select('id')
    .eq('organization_id', scope.organizationId);
  if (scope.branchId) {
    usersQuery = usersQuery.eq('branch_id', scope.branchId);
  }

  const { data: users, error: usersError } = await usersQuery;
  if (usersError) {
    console.warn('[authorization-scope] Failed to list scoped users', {
      error: usersError.message,
    });
    return [];
  }

  const userIds = (users || [])
    .map((user) => (user as { id: string }).id)
    .filter((id): id is string => Boolean(id));

  // Conversations assigned to in-scope staff, plus unassigned conversations
  // (shared inbox).
  let conversationsQuery = supabase.from('Conversation').select('sender_number');
  conversationsQuery =
    userIds.length > 0
      ? conversationsQuery.or(`assigned_to.is.null,assigned_to.in.(${userIds.join(',')})`)
      : conversationsQuery.is('assigned_to', null);

  const { data: conversations, error: conversationsError } = await conversationsQuery;
  if (conversationsError) {
    console.warn('[authorization-scope] Failed to list scoped conversations', {
      error: conversationsError.message,
    });
    return [];
  }

  return (conversations || [])
    .map((conversation) => (conversation as { sender_number: string }).sender_number)
    .filter((sender): sender is string => Boolean(sender));
}

/**
 * Whether the actor may access the conversation identified by sender number.
 */
export async function canAccessConversationSender(
  scope: ActorScope,
  senderNumber: string,
): Promise<boolean> {
  if (scope.isGlobal) return true;
  if (!scope.organizationId) return false;

  const { data: conversation, error } = await supabase
    .from('Conversation')
    .select('assigned_to')
    .eq('sender_number', senderNumber)
    .maybeSingle();

  if (error) {
    console.warn('[authorization-scope] Failed to load conversation for scope check', {
      senderNumber,
      error: error.message,
    });
    return false;
  }
  if (!conversation) return false;

  // Unassigned conversations are part of the shared inbox.
  const assignedTo = (conversation as { assigned_to: string | null }).assigned_to;
  if (!assignedTo) return true;

  const { data: assignee, error: assigneeError } = await supabase
    .from('User')
    .select('organization_id, branch_id')
    .eq('id', assignedTo)
    .maybeSingle();

  if (assigneeError || !assignee) return false;

  return canManageUserInScope(scope, assignee as ScopedUserRecord);
}

/**
 * Whether the actor may manage (e.g. assign work to) the given user.
 * `assignee` is the object returned by `prisma.user.findUnique` selecting
 * `organization_id` and `branch_id`.
 */
export function canManageUserInScope(
  scope: ActorScope,
  assignee: ScopedUserRecord,
): boolean {
  if (scope.isGlobal) return true;
  if (!scope.organizationId) return false;
  if (assignee.organization_id !== scope.organizationId) return false;
  if (scope.branchId && assignee.branch_id !== scope.branchId) return false;
  return true;
}
