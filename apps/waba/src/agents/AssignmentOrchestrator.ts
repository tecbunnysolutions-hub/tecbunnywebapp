import { BaseAgent } from './BaseAgent';
import { TriagedPayload } from './InboundTriageAgent';
import { supabase } from '@/lib/supabase';
import nodemailer from 'nodemailer';
import { sendWhatsAppMessage } from '../services/infobipService';
import { LeadService } from '../services/leadService';

// Bug #18 fix: Nodemailer transporter is created lazily (on first use) rather
// than at module load time. In serverless environments, module-level transporter
// creation opens an SMTP connection pool that is never closed, leaking connections
// on every cold start. Lazy creation avoids this entirely.
let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return _transporter;
}

export class AssignmentOrchestrator extends BaseAgent<TriagedPayload, void> {
  constructor() {
    super('triaged-intents');
  }

  protected async process(data: TriagedPayload): Promise<void> {
    // Bug #12 fix: The previous status logic overwrote PENDING_HUMAN_AGENT (set
    // by InboundTriageAgent) back to 'NEW' when escalate_to_human was true.
    // Now we only set the status here when the conversation is NOT already in
    // PENDING_HUMAN_AGENT state, preserving the escalation status set upstream.
    const conversationStatus = data.escalate_to_human
      ? 'PENDING_HUMAN_AGENT'
      : data.is_actionable
        ? 'LEAD'
        : 'PROCESSING';

    // 1. ALWAYS update Conversation CRM fields, regardless of actionable status.
    await supabase
      .from('Conversation')
      .update({
        contact_name: data.customer_name || undefined,
        address: data.address || undefined,
        pincode: data.pincode || undefined,
        department:
          data.domain === 'PRODUCT_SALES'
            ? 'SALES'
            : data.domain === 'TECHNICAL_SERVICE'
              ? 'SUPPORT'
              : undefined,
        notes: data.notes || undefined,
        status: conversationStatus,
      })
      .eq('sender_number', data.senderNumber);

    if (!data.is_actionable) {
      console.warn(`[AssignmentOrchestrator] Received non-actionable payload for ${data.senderNumber}. CRM updated, but skipping assignment.`);
      return;
    }

    // We only strictly require a pincode if we are NOT escalating. If we ARE escalating, we try to assign but fallback to a general queue.
    if (!data.pincode && !data.escalate_to_human) {
      console.warn(`[AssignmentOrchestrator] Actionable but missing pincode for ${data.senderNumber}. Skipping assignment.`);
      return;
    }

    console.log(`[AssignmentOrchestrator] Processing lead for pincode ${data.pincode}, domain ${data.domain}, escalate: ${data.escalate_to_human}`);

    // Map domain to role
    let requiredRole: string | null = null;
    if (data.domain === 'TECHNICAL_SERVICE') requiredRole = 'SERVICE_MANAGER';
    if (data.domain === 'PRODUCT_SALES') requiredRole = 'SALES_MANAGER';

    let assignedUserId: string | null = null;
    let managerDetails: { email?: string; phone_number?: string; name?: string } | null = null;

    if (requiredRole) {
      const { data: managers } = await supabase
        .from('User')
        .select('id, email, phone_number, name, managed_pincodes')
        .eq('role', requiredRole);
      
      const matchedManager = (managers || []).find(user => {
        if (!user.managed_pincodes) return false;
        try {
          const pincodes = Array.isArray(user.managed_pincodes) ? user.managed_pincodes : JSON.parse(user.managed_pincodes as string);
          return Array.isArray(pincodes) && data.pincode && pincodes.includes(data.pincode as string);
        } catch {
          return false;
        }
      });

      if (matchedManager) {
        assignedUserId = matchedManager.id;
        managerDetails = matchedManager;
        console.log(`[AssignmentOrchestrator] Auto-assigned lead to manager ${assignedUserId}`);
        
        // Update assigned_to on the Conversation as well
        await supabase.from('Conversation').update({ assigned_to: assignedUserId }).eq('sender_number', data.senderNumber);
      } else {
        console.log(`[AssignmentOrchestrator] No matching territory manager found for pincode ${data.pincode}. Leave unassigned.`);
      }
    }

    // Determine Lead Status
    let leadStatus = data.escalate_to_human ? 'PENDING_HUMAN_AGENT' : 'LEAD';
    if (data.intent_level === 'HIGH_INTENT' && !data.escalate_to_human) {
      leadStatus = 'HIGH_INTENT';
    }

    try {
      // Bug #11 fix: Check for an existing Lead for this sender before creating
      // a new one. A returning customer who triggers is_actionable multiple times
      // previously generated duplicate Lead records on every message.
      const existingLead = await LeadService.findLeadBySenderNumber(data.senderNumber);

      if (existingLead) {
        // Update the existing lead instead of creating a duplicate
        await LeadService.updateLeadStatus(existingLead.id, leadStatus, assignedUserId);
        console.log(`[AssignmentOrchestrator] Updated existing lead ${existingLead.id} for ${data.senderNumber} to status ${leadStatus}`);
      } else {
        await LeadService.createLead({
          domain: data.domain === 'UNKNOWN' ? 'TECHNICAL_SERVICE' : (data.domain as 'TECHNICAL_SERVICE' | 'PRODUCT_SALES'),
          sub_category: data.sub_category,
          sender_number: data.senderNumber,
          pincode: data.pincode || 'UNKNOWN',
          address: data.address || '',
          status: leadStatus,
          assigned_to: assignedUserId,
        } as Parameters<typeof LeadService.createLead>[0]);
        console.log(`[AssignmentOrchestrator] Created new lead for ${data.senderNumber} with status ${leadStatus}`);
      }

      // Bug #31 fix: If escalation is triggered but no territory manager matched
      // the pincode, fall back to alerting a default admin so no escalation is
      // silently dropped.
      if (data.escalate_to_human) {
        const alertTarget = managerDetails ?? await this.getDefaultAdminContact();

        if (alertTarget) {
          console.log(`[AssignmentOrchestrator] Triggering human escalation protocol for ${alertTarget.name ?? 'default admin'}`);

          // WhatsApp Alert — pass null timestamp so it always uses a template
          // (manager-to-manager messages are always outside the customer 24h window)
          if (alertTarget.phone_number) {
            const alertMsg = `🚨 *AI Escalation Alert*\n\nManager ${alertTarget.name ?? 'Team'}, an AI chat with customer (${data.customer_name || data.senderNumber}) requires human intervention.\n\n*Domain:* ${data.domain}\n*Category:* ${data.sub_category}\n*Address:* ${data.address}\n\nPlease take over the chat in your TecBunny Dashboard immediately.`;
            await sendWhatsAppMessage(alertTarget.phone_number, alertMsg, null).catch(e =>
              console.error('WA Alert fail:', e),
            );
          }

          // Email Alert
          if (alertTarget.email) {
            try {
              await getTransporter().sendMail({
                from: process.env.SMTP_FROM || 'noreply@tecbunny.com',
                to: alertTarget.email,
                subject: `Action Required: AI Chat Escalation (${data.senderNumber})`,
                text: `Hello ${alertTarget.name ?? 'Team'},\n\nThe AI Assistant could not resolve a customer request and has escalated it to you.\n\nCustomer: ${data.customer_name || data.senderNumber}\nNumber: ${data.senderNumber}\nDomain: ${data.domain}\nSub-Category: ${data.sub_category}\nAddress: ${data.address}\n\nPlease log in to the dashboard to reply to the customer.\n\nTecBunny AI`,
              });
              console.log(`[AssignmentOrchestrator] Sent email alert to ${alertTarget.email}`);
            } catch (e) {
              console.error('[AssignmentOrchestrator] Email Alert fail:', e);
            }
          }
        } else {
          console.error(`[AssignmentOrchestrator] ESCALATION DROPPED: No manager or default admin found for ${data.senderNumber}. Configure ESCALATION_FALLBACK_EMAIL.`);
        }
      }
    } catch (error) {
      console.error(`[AssignmentOrchestrator] Failed to save lead:`, error);
    }
  }

  /**
   * Bug #31 fix: Returns a fallback admin contact when no territory manager
   * matches the customer's pincode, so escalations are never silently dropped.
   */
  private async getDefaultAdminContact(): Promise<{ email?: string; phone_number?: string; name?: string } | null> {
    const fallbackEmail = process.env.ESCALATION_FALLBACK_EMAIL;
    const fallbackPhone = process.env.ESCALATION_FALLBACK_PHONE;

    if (fallbackEmail || fallbackPhone) {
      return { email: fallbackEmail, phone_number: fallbackPhone, name: 'Admin' };
    }

    // Try to find any admin user in the DB as a last resort
    const { data: admins } = await supabase
      .from('User')
      .select('id, email, phone_number, name')
      .eq('role', 'ADMIN')
      .limit(1);

    return admins?.[0] ?? null;
  }
}
