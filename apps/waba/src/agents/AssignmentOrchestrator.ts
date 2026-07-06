import { BaseAgent } from './BaseAgent';
import { PrismaClient, Role, DomainType } from '../generated/client';
import { TriagedPayload } from './InboundTriageAgent';

const prisma = new PrismaClient();

export class AssignmentOrchestrator extends BaseAgent<TriagedPayload, void> {
  constructor() {
    // Consumes from triaged-intents, no output queue (end of the line for lead routing)
    super('triaged-intents');
  }

  protected async process(data: TriagedPayload): Promise<void> {
    if (!data.is_actionable || !data.pincode || data.domain === 'UNKNOWN') {
      console.warn(`[AssignmentOrchestrator] Received non-actionable payload for ${data.senderNumber}. Skipping assignment.`);
      return;
    }

    console.log(`[AssignmentOrchestrator] Processing lead for pincode ${data.pincode}, domain ${data.domain}`);

    // Map domain to role
    let requiredRole: Role | null = null;
    if (data.domain === 'TECHNICAL_SERVICE') requiredRole = Role.SERVICE_MANAGER;
    if (data.domain === 'REAL_ESTATE_BROKERAGE') requiredRole = Role.SALES_MANAGER;

    let assignedUserId: string | null = null;

    if (requiredRole) {
      // Find an active manager matching the domain role and having the pincode in managed_pincodes
      // Since managed_pincodes is JSONB array of strings, we use Prisma's JSON filtering if possible
      // or we can just fetch all users of that role and filter in memory if the dataset is small.
      // Using raw query for JSONB array containment is often safer in Postgres:
      
      const managers = await prisma.user.findMany({
        where: {
          role: requiredRole
        }
      });
      
      // Filter in memory for simplicity to check JSON array containment
      const matchedManager = managers.find(user => {
        if (!user.managed_pincodes) return false;
        try {
          // If it's a JSON array
          const pincodes = user.managed_pincodes as string[];
          return Array.isArray(pincodes) && pincodes.includes(data.pincode as string);
        } catch {
          return false;
        }
      });

      if (matchedManager) {
        assignedUserId = matchedManager.id;
        console.log(`[AssignmentOrchestrator] Auto-assigned lead to manager ${assignedUserId}`);
      } else {
        console.log(`[AssignmentOrchestrator] No matching territory manager found for pincode ${data.pincode}. Leave unassigned.`);
      }
    }

    // Insert the new Lead record
    await prisma.lead.create({
      data: {
        domain: data.domain as DomainType,
        sub_category: data.sub_category,
        pincode: data.pincode,
        status: 'NEW',
        assigned_to: assignedUserId
      }
    });

    console.log(`[AssignmentOrchestrator] Successfully saved lead to DB for ${data.senderNumber}`);
  }
}
