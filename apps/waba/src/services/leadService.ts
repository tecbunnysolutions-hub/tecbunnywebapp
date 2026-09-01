// Bug #17 fix: Removed the unused `supabase` import. The service was importing
// both Supabase and Prisma clients, creating two separate connection pools to
// the same database. All operations now go through a single Prisma client.
import { prisma } from '@/lib/prisma';
import { createSupabaseServiceClient } from '@tecbunny/core/server';
import { LeadEngineService } from '@tecbunny/core';
import { logger } from '@tecbunny/core/logger';
import type { Lead } from '@tecbunny/types';

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

    if (user.role?.name === 'superadmin') {
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
   *
   * **CRITICAL FIX**: Now queries canonical sls_leads via Supabase instead of
   * Prisma, ensuring all WABA leads are deduplicated against the complete
   * canonical system (including form submissions, quote-generated leads, etc).
   * Previously this would only find WABA-created leads, missing duplicates
   * from other sources.
   */
  static async findLeadBySenderNumber(senderNumber: string): Promise<Lead | null> {
    try {
      const serviceClient = createSupabaseServiceClient();
      const { data, error } = await serviceClient
        .from('sls_leads')
        .select('*')
        .eq('phone', senderNumber)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        logger.error('waba_find_lead_by_phone_failed', { error: error.message, senderNumber });
        return null;
      }

      // Map sls_leads row back to Prisma Lead type for compatibility
      if (data) {
        return {
          id: data.id,
          sender_number: data.phone,
          domain: this.inferDomainFromMetadata(data.metadata) || 'TECHNICAL_SERVICE',
          sub_category: data.metadata?.sub_category || 'OTHER',
          pincode: data.metadata?.pincode || 'UNKNOWN',
          address: data.metadata?.address || null,
          status: data.status || 'NEW',
          assigned_to: data.lead_owner_id,
          created_at: new Date(data.created_at),
          updated_at: new Date(data.updated_at),
        } as unknown as Lead;
      }

      return null;
    } catch (e) {
      logger.error('waba_find_lead_by_phone_error', {
        error: e instanceof Error ? e.message : String(e),
        senderNumber,
      });
      return null;
    }
  }

  /**
   * Bug #11 fix: Update an existing lead's status and assignment without
   * creating a duplicate record.
   *
   * Now routes through Supabase to update the canonical lead, ensuring
   * all status changes are synchronized across the system.
   */
  static async updateLeadStatus(
    leadId: string,
    status: string,
    assignedTo: string | null,
  ): Promise<Lead> {
    try {
      const serviceClient = createSupabaseServiceClient();
      const { data, error } = await serviceClient
        .from('sls_leads')
        .update({
          status,
          ...(assignedTo ? { lead_owner_id: assignedTo } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', leadId)
        .select('*')
        .single();

      if (error) {
        throw new Error(`Supabase update failed: ${error.message}`);
      }

      // Map back to Prisma Lead type for compatibility
      return {
        id: data.id,
        sender_number: data.phone,
        domain: this.inferDomainFromMetadata(data.metadata) || 'TECHNICAL_SERVICE',
        sub_category: data.metadata?.sub_category || 'OTHER',
        pincode: data.metadata?.pincode || 'UNKNOWN',
        address: data.metadata?.address || null,
        status: data.status,
        assigned_to: data.lead_owner_id,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
      } as unknown as Lead;
    } catch (e) {
      logger.error('waba_update_lead_status_failed', {
        error: e instanceof Error ? e.message : String(e),
        leadId,
        status,
      });
      throw e;
    }
  }

  /**
   * Create a new lead via canonical LeadEngineService.
   *
   * **CRITICAL FIX**: Routes WABA lead creation through canonical service,
   * ensuring:
   * - Deduplication against ALL sources (forms, quotes, other bots)
   * - Consistent scoring and heat level calculation
   * - Automatic load-balanced assignment
   * - Follow-up task creation
   * - Notification delivery
   *
   * Previously this bypassed all canonical logic.
   */
  static async createLead(data: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<Lead> {
    try {
      const serviceClient = createSupabaseServiceClient();

      // Map WABA-specific fields to canonical lead format
      const result = await LeadEngineService.createLeadFromIntake(serviceClient, {
        first_name: data.address?.split(' ')[0] || 'WhatsApp Lead',
        last_name: data.address?.split(' ').slice(1).join(' ') || undefined,
        email: undefined, // WABA doesn't provide email
        phone: data.sender_number || undefined,
        company_name: undefined,
        source_name: 'whatsapp',
        form_identifier: 'waba_bot',
        origin_path: '/waba',
        message: `WABA inquiry - Domain: ${data.domain}, Category: ${data.sub_category}`,
        requirement: `${data.domain} - ${data.sub_category}`,
        metadata: {
          domain: data.domain,
          sub_category: data.sub_category,
          pincode: data.pincode,
          address: data.address,
          sender_number: data.sender_number,
        },
      });

      // Map canonical lead back to Prisma Lead type for compatibility
      return {
        id: result.lead.id,
        sender_number: result.lead.phone,
        domain: data.domain,
        sub_category: data.sub_category,
        pincode: data.pincode,
        address: data.address,
        status: result.lead.status,
        assigned_to: result.lead.lead_owner_id,
        created_at: new Date(result.lead.created_at),
        updated_at: new Date(result.lead.updated_at),
      } as unknown as Lead;
    } catch (e) {
      logger.error('waba_create_lead_failed', {
        error: e instanceof Error ? e.message : String(e),
        senderNumber: data.sender_number,
      });
      throw e;
    }
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

    if (!user) throw new Error('User not found');

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new Error('Lead not found');

    if (user.role?.name !== 'superadmin' && lead.assigned_to !== userId) {
      throw new Error('Forbidden: You do not have permission to update this lead');
    }

    return prisma.lead.update({ where: { id: leadId }, data });
  }

  /**
   * Helper to infer WABA domain from metadata stored in canonical lead.
   */
  private static inferDomainFromMetadata(
    metadata: Record<string, any> | null,
  ): 'TECHNICAL_SERVICE' | 'PRODUCT_SALES' | null {
    if (!metadata || !metadata.domain) return null;
    if (metadata.domain === 'TECHNICAL_SERVICE' || metadata.domain === 'PRODUCT_SALES') {
      return metadata.domain as 'TECHNICAL_SERVICE' | 'PRODUCT_SALES';
    }
    return null;
  }
}
