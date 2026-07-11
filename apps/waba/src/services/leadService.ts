// Bug #17 fix: Removed the unused `supabase` import. The service was importing
// both Supabase and Prisma clients, creating two separate connection pools to
// the same database. All operations now go through a single Prisma client.
import { PrismaClient, Role, Lead } from '@tecbunny/types';

// Bug #16 fix: PrismaClient was instantiated at module level (`new PrismaClient()`).
// In serverless/edge environments each cold start creates a new connection pool,
// quickly exhausting the Postgres connection limit. We use a global singleton so
// the same client is reused across hot reloads and concurrent invocations.
declare global {
  // eslint-disable-next-line no-var
  var __prismaLeadService: PrismaClient | undefined;
}

function getPrisma(): PrismaClient {
  if (!global.__prismaLeadService) {
    global.__prismaLeadService = new PrismaClient();
  }
  return global.__prismaLeadService;
}

export class LeadService {
  /**
   * Fetch leads based on RBAC rules.
   * SUPERADMIN can see all leads.
   * SERVICE_MANAGER and SALES_MANAGER can only see leads assigned to them.
   */
  static async getLeadsForUser(userId: string): Promise<Lead[]> {
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.role === Role.SUPERADMIN) {
      return prisma.lead.findMany({ orderBy: { created_at: 'desc' } });
    }

    return prisma.lead.findMany({
      where: { assigned_to: userId },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Bug #11 fix: Find an existing lead by sender phone number so the
   * AssignmentOrchestrator can upsert instead of always inserting.
   */
  static async findLeadBySenderNumber(senderNumber: string): Promise<Lead | null> {
    const prisma = getPrisma();
    return prisma.lead.findFirst({
      where: { sender_number: senderNumber },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Bug #11 fix: Update an existing lead's status and assignment without
   * creating a duplicate record.
   */
  static async updateLeadStatus(
    leadId: string,
    status: string,
    assignedTo: string | null,
  ): Promise<Lead> {
    const prisma = getPrisma();
    return prisma.lead.update({
      where: { id: leadId },
      data: {
        status,
        ...(assignedTo !== undefined ? { assigned_to: assignedTo } : {}),
      },
    });
  }

  /**
   * Create a new lead (internal system function, bypasses RBAC for creation).
   */
  static async createLead(data: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<Lead> {
    const prisma = getPrisma();
    return prisma.lead.create({ data });
  }

  /**
   * Update a lead based on RBAC rules.
   * SUPERADMIN can update any lead.
   * Managers can only update leads assigned to them.
   */
  static async updateLead(userId: string, leadId: string, data: Partial<Lead>): Promise<Lead> {
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) throw new Error('User not found');

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new Error('Lead not found');

    if (user.role !== Role.SUPERADMIN && lead.assigned_to !== userId) {
      throw new Error('Forbidden: You do not have permission to update this lead');
    }

    return prisma.lead.update({ where: { id: leadId }, data });
  }
}
