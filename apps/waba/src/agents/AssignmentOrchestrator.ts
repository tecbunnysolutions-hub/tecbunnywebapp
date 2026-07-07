import { BaseAgent } from './BaseAgent';
import { TriagedPayload } from './InboundTriageAgent';
import { supabase } from '@/lib/supabase';
export class AssignmentOrchestrator extends BaseAgent<TriagedPayload, void> {
  constructor() {
    super('triaged-intents');
  }

  protected async process(data: TriagedPayload): Promise<void> {
    if (!data.is_actionable || !data.pincode || data.domain === 'UNKNOWN') {
      console.warn(`[AssignmentOrchestrator] Received non-actionable payload for ${data.senderNumber}. Skipping assignment.`);
      return;
    }

    console.log(`[AssignmentOrchestrator] Processing lead for pincode ${data.pincode}, domain ${data.domain}`);

    // Map domain to role
    let requiredRole: string | null = null;
    if (data.domain === 'TECHNICAL_SERVICE') requiredRole = 'SERVICE_MANAGER';
    if (data.domain === 'PRODUCT_SALES') requiredRole = 'SALES_MANAGER';

    let assignedUserId: string | null = null;

    if (requiredRole) {
      // Fetch users from Supabase instead of Prisma
      const { data: managers } = await supabase
        .from('User')
        .select('id, managed_pincodes')
        .eq('role', requiredRole);
      
      const matchedManager = (managers || []).find(user => {
        if (!user.managed_pincodes) return false;
        try {
          const pincodes = Array.isArray(user.managed_pincodes) ? user.managed_pincodes : JSON.parse(user.managed_pincodes as any);
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

    // Insert the new Lead record via Supabase
    const { error } = await supabase
      .from('Lead')
      .insert({
        domain: data.domain,
        sub_category: data.sub_category,
        pincode: data.pincode,
        address: data.address,
        status: 'NEW',
        assigned_to: assignedUserId,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error(`[AssignmentOrchestrator] Failed to save lead:`, error);
    } else {
      console.log(`[AssignmentOrchestrator] Successfully saved lead to DB for ${data.senderNumber}`);
    }
  }
}

