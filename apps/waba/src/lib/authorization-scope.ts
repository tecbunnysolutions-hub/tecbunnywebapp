import { prisma } from '@/lib/prisma';

type JsonLike = unknown;

const GLOBAL_ROLES = new Set(['superadmin', 'admin']);
const MANAGER_ROLES = new Set([
  'manager',
  'sales_manager',
  'marketing_manager',
  'service_manager',
]);

export type ActorScope = {
  userId: string;
  role: string;
  organizationId: string | null;
  branchId: string | null;
  managedPincodes: string[];
  isGlobal: boolean;
  isManager: boolean;
};

function parseManagedPincodes(value: JsonLike): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => String(entry).trim())
    .filter(Boolean);
}

export async function resolveActorScope(userId: string, role: string): Promise<ActorScope | null> {
  const normalizedRole = String(role || 'customer').toLowerCase();
  const isGlobal = GLOBAL_ROLES.has(normalizedRole);
  const isManager = MANAGER_ROLES.has(normalizedRole);

  if (isGlobal && userId === 'superadmin-system-session') {
    return {
      userId,
      role: normalizedRole,
      organizationId: null,
      branchId: null,
      managedPincodes: [],
      isGlobal,
      isManager,
    };
  }

  const actor = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      organization_id: true,
      branch_id: true,
      managed_pincodes: true,
    },
  });

  if (!actor) return null;

  return {
    userId: actor.id,
    role: normalizedRole,
    organizationId: actor.organization_id ?? null,
    branchId: actor.branch_id ?? null,
    managedPincodes: parseManagedPincodes(actor.managed_pincodes),
    isGlobal,
    isManager,
  };
}

function buildConversationScopeFilter(scope: ActorScope) {
  if (scope.isGlobal) return null;

  const orFilters: Array<Record<string, unknown>> = [{ assigned_to: scope.userId }];
  if (scope.managedPincodes.length > 0) {
    orFilters.push({ pincode: { in: scope.managedPincodes } });
  }

  return { OR: orFilters };
}

export async function canAccessConversationSender(scope: ActorScope, senderNumber: string): Promise<boolean> {
  if (scope.isGlobal) return true;

  const where = buildConversationScopeFilter(scope);
  if (!where) return true;

  const conversation = await prisma.conversation.findFirst({
    where: {
      sender_number: senderNumber,
      ...where,
    },
    select: { id: true },
  });

  return Boolean(conversation);
}

export async function getAccessibleConversationSenders(scope: ActorScope): Promise<string[] | null> {
  if (scope.isGlobal) return null;

  const where = buildConversationScopeFilter(scope);
  if (!where) return [];

  const rows = await prisma.conversation.findMany({
    where,
    select: { sender_number: true },
    take: 2000,
  });

  return rows.map((row) => row.sender_number);
}

export function canManageUserInScope(scope: ActorScope, user: { organization_id: string | null; branch_id: string | null }) {
  if (scope.isGlobal) return true;
  if (!scope.organizationId) return false;
  if (user.organization_id !== scope.organizationId) return false;
  if (scope.branchId && user.branch_id && user.branch_id !== scope.branchId) return false;
  return true;
}