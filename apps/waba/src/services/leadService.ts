import { supabase } from '@/lib/supabase';
import { PrismaClient, Role, Lead } from '@tecbunny/types';

const prisma = new PrismaClient();

export class LeadService {
  /**
   * Fetch leads based on RBAC rules.
   * SUPERADMIN can see all leads.
   * SERVICE_MANAGER and SALES_MANAGER can only see leads assigned to them.
   */
  static async getLeadsForUser(userId: string): Promise<Lead[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.role === Role.SUPERADMIN) {
      // Global read access
      return prisma.lead.findMany({
        orderBy: { created_at: 'desc' },
      });
    }

    // Manager access restricted to their assigned leads
    return prisma.lead.findMany({
      where: { assigned_to: userId },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Create a new lead (internal system function, bypasses RBAC for creation)
   */
  static async createLead(data: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<Lead> {
    return prisma.lead.create({
      data,
    });
  }

  /**
   * Update a lead based on RBAC rules.
   * SUPERADMIN can update any lead.
   * Managers can only update leads assigned to them.
   */
  static async updateLead(userId: string, leadId: string, data: Partial<Lead>): Promise<Lead> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    if (user.role !== Role.SUPERADMIN && lead.assigned_to !== userId) {
      throw new Error('Forbidden: You do not have permission to update this lead');
    }

    return prisma.lead.update({
      where: { id: leadId },
      data,
    });
  }
}
