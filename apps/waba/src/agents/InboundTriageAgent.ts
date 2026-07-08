import { BaseAgent } from './BaseAgent';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { sendWhatsAppMessage } from '../services/infobipService';
import { buildPricingCatalog } from '@tecbunny/core/custom-setup-pricing-server';
import { CustomerService } from '@tecbunny/core';

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// New schema as requested by user
export interface TriagedPayload {
  customer_name: string | null;
  pincode: string | null;
  address: string | null;
  domain: 'TECHNICAL_SERVICE' | 'PRODUCT_SALES' | 'UNKNOWN';
  sub_category: 'CCTV' | 'COMPUTERS' | 'NETWORKING' | 'WEB_DEV' | 'HARDWARE_SALES' | 'OTHER';
  is_actionable: boolean;
  escalate_to_human: boolean;
  intent_level: 'HIGH_INTENT' | 'GENERAL';
  follow_up_question: string | null;
  notes: string | null;
  
  // Metadata for downstream processing
  messageId: string;
  senderNumber: string;
  history: { direction: string; message_content: string }[];
}

export class InboundTriageAgent extends BaseAgent<any, TriagedPayload | null> {
  constructor() {
    super('inbound-whatsapp-events');
  }

  protected async process(data: any): Promise<TriagedPayload | null> {
    const results = data.results || [];
    
    for (const msg of results) {
      const senderNumber = msg.from || msg.sender;
      const messageId = msg.messageId;
      
      if (!senderNumber || !messageId) continue;

      let textContent = '';
      if (msg.message?.text) {
        textContent = msg.message.text;
      } else if (msg.content?.text) {
        textContent = msg.content.text;
      } else if (Array.isArray(msg.content) && msg.content.length > 0) {
        const content = msg.content[0];
        textContent = content.type === 'TEXT' ? (content.text || '') : `[${content.type || 'Media'}]`;
      }

      // Idempotency check
      const { data: existingMessage } = await supabase
        .from('Message')
        .select('id')
        .eq('message_id', messageId)
        .maybeSingle();

      if (existingMessage) {
        console.log(`[InboundTriageAgent] Duplicate payload detected for message_id: ${messageId}. Skipping.`);
        continue;
      }

      // Upsert Conversation and set to PROCESSING
      const { data: existingConv } = await supabase
        .from('Conversation')
        .select('id, contact_name, address, pincode')
        .eq('sender_number', senderNumber)
        .single();
        
      if (existingConv) {
        await supabase
          .from('Conversation')
          .update({ 
            last_interaction_timestamp: new Date().toISOString(),
            status: 'PROCESSING'
          })
          .eq('sender_number', senderNumber);
      } else {
        await supabase
          .from('Conversation')
          .insert({ 
            sender_number: senderNumber, 
            last_interaction_timestamp: new Date().toISOString(),
            status: 'PROCESSING'
          });
      }

      // Insert incoming message
      const { error: msgError } = await supabase
        .from('Message')
        .insert({
          id: crypto.randomUUID(),
          message_id: messageId,
          sender_number: senderNumber,
          direction: 'INBOUND',
          message_content: textContent,
          timestamp: new Date().toISOString()
        });
        
      if (msgError) {
        console.error(`[InboundTriageAgent] FATAL Supabase Insert Error:`, msgError);
      }

      if (textContent) {
        // Use optimized CustomerContext service for memory and data
        const customerContext = await CustomerService.getCustomerContext({ phone: senderNumber });
        const history = customerContext.messages;
        const ordersData = customerContext.orders;
        const ticketsData = customerContext.service_tickets;
          
        // Extract structured JSON payload using Gemini
        const triageResult = await this.extractStructuredIntent(
          textContent, 
          history.map(m => ({ direction: m.direction, message_content: m.message_content })), 
          existingConv || null, 
          senderNumber,
          ordersData,
          ticketsData
        );
        
        // Inject metadata
        const fullPayload: TriagedPayload = {
          ...triageResult,
          messageId,
          senderNumber,
          history
        };

        // If the AI generated a response or question, send it!
        if (fullPayload.follow_up_question) {
          console.log(`[InboundTriageAgent] Sending AI reply to ${senderNumber}: ${fullPayload.follow_up_question}`);
          await sendWhatsAppMessage(senderNumber, fullPayload.follow_up_question);
          
          // Sync AI response back to CRM (Message table)
          await supabase.from('Message').insert({
            id: crypto.randomUUID(),
            message_id: crypto.randomUUID(),
            sender_number: senderNumber,
            direction: 'OUTBOUND',
            message_content: fullPayload.follow_up_question,
            timestamp: new Date().toISOString()
          });
        }

        // Handle Handoff Status
        if (fullPayload.is_actionable && fullPayload.escalate_to_human) {
          console.log(`[HANDOFF_TO_HUMAN] Triggered for user ${senderNumber}. Last message: "${textContent}"`);
          await supabase
            .from('Conversation')
            .update({ status: 'PENDING_HUMAN_AGENT' })
            .eq('sender_number', senderNumber);
        }

        // Always return the payload so AssignmentOrchestrator can update the CRM dashboard (Conversation table)
        // AssignmentOrchestrator will handle the logic of whether to escalate or create a Lead based on is_actionable.
        return fullPayload;
      }
    }
    
    return null;
  }

  private async extractStructuredIntent(
    userMessage: string,
    history: { direction: string; message_content: string }[],
    existingConv: any | null,
    senderNumber: string,
    orders: any[] = [],
    tickets: any[] = []
  ): Promise<Omit<TriagedPayload, 'messageId' | 'senderNumber' | 'history'> & { notes: string | null }> {
    const defaultFallback: Omit<TriagedPayload, 'messageId' | 'senderNumber' | 'history'> & { notes: string | null } = {
      customer_name: null,
      pincode: null,
      address: null,
      domain: 'UNKNOWN',
      sub_category: 'OTHER',
      is_actionable: false,
      escalate_to_human: true,
      intent_level: 'GENERAL',
      notes: null,
      follow_up_question: "Oops, I didn't quite catch that! I'm transferring you to a human manager to assist you further."
    };

    if (!genAI) return defaultFallback;

    try {
      // 1. Fetch live pricing context from the database
      const pricingCatalog = await buildPricingCatalog(null);
      const simplifiedPricing = {
        analog_camera_2_4mp: pricingCatalog.analog.camera['2.4mp']?.standard?.sale || 1699,
        analog_camera_5mp: pricingCatalog.analog.camera['5mp']?.standard?.sale || 2200,
        ip_camera_2mp: pricingCatalog.ip.camera['2mp']?.standard?.sale || 2500,
        ip_camera_5mp: pricingCatalog.ip.camera['5mp']?.standard?.sale || 3500,
        analog_dvr_4ch: pricingCatalog.analog.dvr.find(d => d.capacity >= 4)?.sale || 3999,
        analog_dvr_8ch: pricingCatalog.analog.dvr.find(d => d.capacity >= 8)?.sale || 5500,
        ip_nvr_4ch: pricingCatalog.ip.nvr.find(d => d.capacity >= 4)?.sale || 3500,
        ip_nvr_8ch: pricingCatalog.ip.nvr.find(d => d.capacity >= 8)?.sale || 5000,
        smps_power_supply_analog: pricingCatalog.analog.smps[0]?.sale || 1499,
        poe_switch_ip: pricingCatalog.ip.poe[0]?.sale || 2500,
        hard_drive_500gb: pricingCatalog.hddOptions.find(h => h.label.includes('500'))?.sale || 5999,
        cable_bundle_100m: pricingCatalog.analog.cable[0]?.salePerUnit || 1000,
        installation_and_setup_total: 2999, // Flat fee used in the web app calculator
      };

      // 2. Format memory context from previous leads or conversations
      let memoryContext = '';
      let hasAddressData = false;
      
      if (existingConv?.contact_name) {
        memoryContext += `- You already know the customer's name is ${existingConv.contact_name}. DO NOT ASK FOR THEIR NAME.\n`;
      }
      if (existingConv?.address) {
        memoryContext += `- You already know the customer's address is ${existingConv.address}. DO NOT ASK FOR THEIR ADDRESS.\n`;
        hasAddressData = true;
      }
      if (existingConv?.pincode) {
        memoryContext += `- You already know the customer's pincode is ${existingConv.pincode}. DO NOT ASK FOR THEIR PINCODE.\n`;
        hasAddressData = true;
      }

      if (hasAddressData) {
        memoryContext = `[CUSTOMER FILE MEMORY]\nWe ALREADY HAVE the following details for this customer on file:\n${memoryContext}\nDO NOT ASK THE CUSTOMER FOR THESE DETAILS AGAIN. YOU ALREADY HAVE THEM.`;
      } else {
        memoryContext = `[CUSTOMER FILE MEMORY]\nWe DO NOT have this customer's address or pincode on file yet. You MUST ask for their full address before processing their request (UNLESS they ask for a quotation, in which case give quotation first).`;
      }

      if (orders.length > 0) {
        memoryContext += `\n\n[LAST ORDER STATUS]\n${orders.map(o => `- Order ${o.id.slice(0, 8)} (${new Date(o.created_at).toLocaleDateString()}): ${o.status}`).join('\n')}`;
      } else {
        memoryContext += `\n\n[LAST ORDER STATUS]\nNo previous orders.`;
      }

      if (tickets.length > 0) {
        memoryContext += `\n\n[PENDING SERVICE TICKETS]\n${tickets.map(t => `- Ticket ${t.id.slice(0, 8)} (${t.title}): ${t.status}`).join('\n')}`;
      } else {
        memoryContext += `\n\n[PENDING SERVICE TICKETS]\nNo pending service tickets.`;
      }

      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              customer_name: { type: SchemaType.STRING, nullable: true },
              address: { type: SchemaType.STRING, nullable: true, description: "The customer's full address" },
              pincode: { type: SchemaType.STRING, nullable: true, description: "6-digit Indian pincode" },
              domain: { 
                type: SchemaType.STRING, 
                description: "Must be exactly one of: 'TECHNICAL_SERVICE', 'PRODUCT_SALES', 'UNKNOWN'"
              },
              sub_category: { 
                type: SchemaType.STRING, 
                description: "Must be exactly one of: 'CCTV', 'COMPUTERS', 'NETWORKING', 'WEB_DEV', 'HARDWARE_SALES', 'OTHER'"
              },
              notes: { type: SchemaType.STRING, nullable: true, description: "A brief summary of the customer's request for our CRM dashboard." },
              is_actionable: { type: SchemaType.BOOLEAN, description: "Set to true ONLY if you are done processing the user or need to escalate to human." },
              escalate_to_human: { type: SchemaType.BOOLEAN, description: "Set to true if you are confused, the customer is angry, or they ask for something not in the knowledge base." },
              intent_level: { type: SchemaType.STRING, description: "Set to 'HIGH_INTENT' if the customer asks for a quotation, setup costs, or pricing. Otherwise, set to 'GENERAL'." },
              follow_up_question: { type: SchemaType.STRING, nullable: true, description: "Your response to the customer." },
            },
            required: ['domain', 'sub_category', 'is_actionable', 'escalate_to_human', 'intent_level']
          }
        }
      });

      const historyContext = history.map(h => `${h.direction}: ${h.message_content}`).join('\n');
      
      const prompt = `You are the advanced AI Customer Success Agent for TecBunny Solutions. Your goal is to provide instantaneous, accurate, and empathetic support via WhatsApp.

## Core Guidelines

1. Context-First: Before answering, check the provided 'CustomerContext' (Name, Last Order Status, Pending Service Tickets). Reference this data to make responses personal (e.g., 'I see you're still waiting on your CCTV installation').
2. RAG Integration: Always prioritize information from the internal 'Knowledge Base'. If a query involves pricing or technical specs, search the database first.
3. Structured Response:
   - If the user asks for info: Provide a concise, bulleted answer.
   - If the user has a problem: Use the 'Empathy-Action-Resolution' framework. Acknowledge the issue, explain the steps to fix it, and provide a clear timeline.
4. Handoff Triggers: If the confidence score of your answer is below 80%, or if the customer expresses frustration/anger, stop the AI flow and trigger a human-agent handoff via the mgmt CRM (by setting escalate_to_human: true).
5. Actionable CTAs: End every support interaction with a relevant CTA, such as 'Would you like to track your order?' or 'Should I connect you to a technician?'.
6. Style: Use professional yet conversational language suitable for WhatsApp. Use emojis sparingly to maintain readability.

## Knowledge Base (Pricing Catalog)
${JSON.stringify(simplifiedPricing, null, 2)}

## CustomerContext & Memory
${memoryContext}

## Escalation & Actionable Output
- Set \`is_actionable: true\` if you are resolving their query fully.
- Set \`escalate_to_human: true\` if the user is angry, frustrated, or you are below 80% confident.

Previous Context:
${historyContext}

Latest Message:
"${userMessage}"
`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanText);
      
      return {
        customer_name: parsed.customer_name || existingConv?.contact_name || null,
        pincode: parsed.pincode || existingConv?.pincode || null,
        address: parsed.address || existingConv?.address || null,
        domain: parsed.domain || 'UNKNOWN',
        sub_category: parsed.sub_category || 'OTHER',
        is_actionable: typeof parsed.is_actionable === 'boolean' ? parsed.is_actionable : false,
        escalate_to_human: typeof parsed.escalate_to_human === 'boolean' ? parsed.escalate_to_human : false,
        intent_level: parsed.intent_level || 'GENERAL',
        notes: parsed.notes || null,
        follow_up_question: parsed.follow_up_question || null
      };

    } catch (err) {
      console.error("[InboundTriageAgent] Intent extraction failed:", err);
      return defaultFallback;
    }
  }
}
