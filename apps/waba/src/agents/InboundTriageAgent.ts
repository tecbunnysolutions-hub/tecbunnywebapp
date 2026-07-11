import { BaseAgent } from './BaseAgent';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { sendWhatsAppMessage } from '../services/infobipService';
import { buildPricingCatalog } from '@tecbunny/core/custom-setup-pricing-server';
import { CustomerService } from '@tecbunny/core/services/customer.service';
import { getAdminDb } from '@tecbunny/core/db/client';

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
        const customerContext = await CustomerService.getCustomerContext({ phone: senderNumber, dbClient: getAdminDb() });
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
        cameras: {
          analog_2_4mp: pricingCatalog.analog.camera['2.4mp']?.standard?.sale || 1699,
          analog_5mp: pricingCatalog.analog.camera['5mp']?.standard?.sale || 2200,
          ip_2mp: pricingCatalog.ip.camera['2mp']?.standard?.sale || 2500,
          ip_4mp: pricingCatalog.ip.camera['5mp']?.standard?.sale || 3500,
        },
        dvrs: pricingCatalog.analog.dvr.map(d => ({ channels: d.capacity, price: d.sale })),
        nvrs: pricingCatalog.ip.nvr.map(n => ({ channels: n.capacity, price: n.sale })),
        storage: pricingCatalog.hddOptions.map(h => ({ capacity: h.label, price: h.sale })),
        networking: {
          smps_power_supply_analog: pricingCatalog.analog.smps[0]?.sale || 1499,
          poe_switch_ip: pricingCatalog.ip.poe[0]?.sale || 2500,
          cable_bundle_100m: pricingCatalog.analog.cable[0]?.salePerUnit || 1000,
        },
        installation_and_setup_total: 2999, // Flat fee
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
        memoryContext = `[CUSTOMER FILE MEMORY]\nWe currently lack this customer's location. If you need it for pricing or site visits, politely ask for their location or pincode. If they already provided a partial location in the chat, accept it and do NOT repeatedly ask for a 'full' address.`;
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

      // Check if user is returning after ghosting (e.g. > 24 hours since last interaction)
      let timeSinceLastInteractionHours = 0;
      if (existingConv?.last_interaction_timestamp) {
         const lastInteraction = new Date(existingConv.last_interaction_timestamp);
         const now = new Date();
         timeSinceLastInteractionHours = (now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60);
      }
      const isGhostingReturn = timeSinceLastInteractionHours > 12;

      memoryContext += `\n\n[BEHAVIORAL CONTEXT]\nTime since last interaction: ${timeSinceLastInteractionHours.toFixed(1)} hours. `;
      if (isGhostingReturn) {
         memoryContext += `The user left the chat and is returning. This is a prime opportunity to use your 10% discount tactic to win them back!`;
      }

      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              customer_name: { type: SchemaType.STRING, nullable: true },
              address: { type: SchemaType.STRING, nullable: true, description: "The customer's address or general location (even if partial)" },
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
      
      const prompt = `You are "Bunny", the elite Sales Development Representative (SDR) and Customer Success Agent for TecBunny Solutions. Your primary mission is to qualify the customer as a lead and close sales via WhatsApp.

## Core Guidelines

1. Data Extraction & Immediate Persistence: In every message, identify if the user provides their Name, Address, or Pincode. (This data is instantly synced to our DB in the background).
2. Smart Qualification: Check the 'CUSTOMER FILE MEMORY' below. If the user is missing data, use the \`follow_up_question\` field to ask ONLY for the missing fields. Do NOT repeat requests for data you have already confirmed as saved.
3. Transition & Lead Tagging: Once all required fields (Name, Address, Pincode) are captured, explicitly state in \`follow_up_question\`: 'Thank you! I have updated your profile. I am now passing your requirements to our technical team to generate a quote.' 
4. RAG Integration & Sales Pitch: When quoting prices from the Knowledge Base, calculate the total accurately (cameras + DVR/NVR + storage + networking + flat ₹2999 installation fee) and highlight the value in \`follow_up_question\`.
5. Cart Abandonment & Discount Strategy: If the user is returning after a delay OR hesitating heavily on price, offer a limited-time 10% discount in \`follow_up_question\` to close the deal.
6. Handoff Triggers: If confidence is below 80% or the customer is frustrated, trigger human handoff (escalate_to_human: true).
7. Style & Formatting: Use professional, persuasive WhatsApp markdown in \`follow_up_question\`. Format monetary amounts in Indian Rupees (e.g., ₹22,042). Use emojis (🚀, 🔒). DO NOT output HTML. You MUST output ONLY valid JSON matching the schema.

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
