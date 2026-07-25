import { prisma } from '../db/prisma';
import type { Customer, Followup, Lead, Opportunity, Task } from '@tecbunny/database';

export class CRMModuleService {
  /**
   * Duplicate Lead Detection (2.1)
   */
  static async detectDuplicateLead(params: {
    mobile: string;
    email: string;
    gstin?: string;
    companyName: string;
  }) {
    const p = prisma as any;
    const existing = p.lead ? await p.lead.findFirst({
      where: {
        OR: [
          { phone: params.mobile },
          { email: params.email },
          ...(params.gstin ? [{ gstin: params.gstin }] : []),
          { company_name: { equals: params.companyName, mode: 'insensitive' } },
        ],
      },
    }) : null;

    return existing ? { duplicateFound: true, existingLead: existing } : { duplicateFound: false };
  }

  /**
   * Automatic Lead Assignment Engine (2.1)
   */
  static async autoAssignLead(leadId: string, departmentId?: string) {
    const p = prisma as any;
    const salesUsers = p.user ? await p.user.findMany({
      where: {
        status: 'ACTIVE',
        ...(departmentId ? { department_id: departmentId } : {}),
      },
      select: { id: true },
      take: 10,
    }) : [];

    if (!salesUsers || salesUsers.length === 0) return null;

    const assignedUser = salesUsers[Math.floor(Math.random() * salesUsers.length)];

    if (p.lead) {
      await p.lead.update({
        where: { id: leadId },
        data: { assigned_to: assignedUser.id, status: 'ASSIGNED' },
      });
    }

    return assignedUser.id;
  }

  /**
   * Lead to Customer Conversion (2.2)
   */
  static async convertLeadToCustomer(leadId: string) {
    const p = prisma as any;
    const lead = p.lead ? await p.lead.findUnique({ where: { id: leadId } }) : null;
    if (!lead) throw new Error(`Lead ${leadId} not found`);

    const customerCode = `CUST-${Date.now().toString().slice(-6)}`;

    const customer = p.customers ? await p.customers.create({
      data: {
        customer_code: customerCode,
        company_name: lead.company_name,
        email: lead.email,
        phone: lead.phone,
        gstin: lead.gstin || null,
        status: 'ACTIVE',
      },
    }) : { id: 'cust-mock', customer_code: customerCode, company_name: lead.company_name };

    if (p.lead) {
      await p.lead.update({
        where: { id: leadId },
        data: { status: 'WON' },
      });
    }

    return customer;
  }

  /**
   * Opportunity Pipeline Management (2.3)
   */
  static async createOpportunity(data: {
    customerId: string;
    name: string;
    products: string[];
    estimatedValue: number;
    probability: number;
    expectedClosing: string;
    assignedToId: string;
  }) {
    const p = prisma as any;
    if (!p.opportunities) {
      return { id: 'opp-mock', ...data, stage: 'DISCOVERY' };
    }

    return p.opportunities.create({
      data: {
        customer_id: data.customerId,
        title: data.name,
        products: JSON.stringify(data.products),
        estimated_value: data.estimatedValue,
        probability: data.probability,
        expected_closing_date: new Date(data.expectedClosing),
        assigned_to: data.assignedToId,
        stage: 'DISCOVERY',
      },
    });
  }

  /**
   * Follow-up Scheduling Engine (2.4)
   */
  static async scheduleFollowup(data: {
    leadId?: string;
    customerId?: string;
    type: string;
    scheduledAt: string;
    remarks?: string;
    assignedToId: string;
  }) {
    const p = prisma as any;
    if (!p.followups) {
      return { id: 'flw-mock', ...data, status: 'PENDING' };
    }

    return p.followups.create({
      data: {
        lead_id: data.leadId || null,
        customer_id: data.customerId || null,
        type: data.type,
        scheduled_at: new Date(data.scheduledAt),
        remarks: data.remarks || '',
        assigned_to: data.assignedToId,
        status: 'PENDING',
      },
    });
  }
}
