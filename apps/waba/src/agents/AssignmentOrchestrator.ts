import { BaseAgent } from './BaseAgent';
import { TriagedPayload } from './InboundTriageAgent';
import { supabase } from '@/lib/supabase';
import nodemailer from 'nodemailer';
import { sendWhatsAppMessage } from '../services/infobipService';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export class AssignmentOrchestrator extends BaseAgent<TriagedPayload, void> {
  constructor() {
    super('triaged-intents');
  }

  protected async process(data: TriagedPayload): Promise<void> {
    if (!data.is_actionable) {
      console.warn(`[AssignmentOrchestrator] Received non-actionable payload for ${data.senderNumber}. Skipping assignment.`);
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
          const pincodes = Array.isArray(user.managed_pincodes) ? user.managed_pincodes : JSON.parse(user.managed_pincodes as any);
          return Array.isArray(pincodes) && data.pincode && pincodes.includes(data.pincode as string);
        } catch {
          return false;
        }
      });

      if (matchedManager) {
        assignedUserId = matchedManager.id;
        managerDetails = matchedManager;
        console.log(`[AssignmentOrchestrator] Auto-assigned lead to manager ${assignedUserId}`);
      } else {
        console.log(`[AssignmentOrchestrator] No matching territory manager found for pincode ${data.pincode}. Leave unassigned.`);
      }
    }

    // Insert the new Lead record via Supabase
    const { error } = await supabase
      .from('Lead')
      .insert({
        domain: data.domain === 'UNKNOWN' ? 'TECHNICAL_SERVICE' : data.domain, // Fallback for enum
        sub_category: data.sub_category,
        pincode: data.pincode || 'UNKNOWN',
        address: data.address,
        status: data.escalate_to_human ? 'NEW' : 'LEAD',
        assigned_to: assignedUserId,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error(`[AssignmentOrchestrator] Failed to save lead:`, error);
    } else {
      console.log(`[AssignmentOrchestrator] Successfully saved lead to DB for ${data.senderNumber}`);
      
      // Handle Escalation
      if (data.escalate_to_human && managerDetails) {
        console.log(`[AssignmentOrchestrator] Triggering human escalation protocol for Manager ${managerDetails.name}`);
        
        // 1. WhatsApp Alert
        if (managerDetails.phone_number) {
          const alertMsg = `🚨 *AI Escalation Alert*\n\nManager ${managerDetails.name}, an AI chat with customer (${data.customer_name || data.senderNumber}) requires human intervention.\n\n*Domain:* ${data.domain}\n*Category:* ${data.sub_category}\n*Address:* ${data.address}\n\nPlease take over the chat in your TecBunny Dashboard immediately.`;
          await sendWhatsAppMessage(managerDetails.phone_number, alertMsg).catch(e => console.error('WA Alert fail:', e));
        }

        // 2. Email Alert
        if (managerDetails.email) {
          try {
            await transporter.sendMail({
              from: process.env.SMTP_FROM || 'noreply@tecbunny.com',
              to: managerDetails.email,
              subject: `Action Required: AI Chat Escalation (${data.senderNumber})`,
              text: `Hello ${managerDetails.name},\n\nThe AI Assistant could not resolve a customer request and has escalated it to you.\n\nCustomer: ${data.customer_name || data.senderNumber}\nNumber: ${data.senderNumber}\nDomain: ${data.domain}\nSub-Category: ${data.sub_category}\nAddress: ${data.address}\n\nPlease log in to the dashboard to reply to the customer.\n\nTecBunny AI`
            });
            console.log(`[AssignmentOrchestrator] Sent email alert to ${managerDetails.email}`);
          } catch (e) {
            console.error('[AssignmentOrchestrator] Email Alert fail:', e);
          }
        }
      }
    }
  }
}
