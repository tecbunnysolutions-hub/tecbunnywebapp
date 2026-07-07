import { BaseAgent } from './BaseAgent';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { sendWhatsAppMessage } from '../services/infobipService';
import { buildPricingCatalog } from '@tecbunny/core/custom-setup-pricing-server';

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
        // Fetch history for context
        const { data: historyData } = await supabase
          .from('Message')
          .select('direction, message_content')
          .eq('sender_number', senderNumber)
          .order('timestamp', { ascending: false })
          .limit(5);
          
        const history = (historyData || []).reverse();
        
        // Extract structured JSON payload using Gemini
        const triageResult = await this.extractStructuredIntent(textContent, history, existingConv || null, senderNumber);
        
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
    senderNumber: string
  ): Promise<Omit<TriagedPayload, 'messageId' | 'senderNumber' | 'history'> & { notes: string | null }> {
    const defaultFallback: Omit<TriagedPayload, 'messageId' | 'senderNumber' | 'history'> & { notes: string | null } = {
      customer_name: null,
      pincode: null,
      address: null,
      domain: 'UNKNOWN',
      sub_category: 'OTHER',
      is_actionable: false,
      escalate_to_human: true,
      notes: null,
      follow_up_question: "Oops, I didn't quite catch that! I'm transferring you to a human manager to assist you further."
    };

    if (!genAI) return defaultFallback;

    try {
      // 1. Fetch live pricing context from the database
      const pricingCatalog = await buildPricingCatalog(null);
      const simplifiedPricing = {
        analog_camera_2_4mp: pricingCatalog.analog.camera['2.4mp']?.standard?.sale || 1500,
        analog_camera_5mp: pricingCatalog.analog.camera['5mp']?.standard?.sale || 2200,
        ip_camera_2mp: pricingCatalog.ip.camera['2mp']?.standard?.sale || 2500,
        ip_camera_5mp: pricingCatalog.ip.camera['5mp']?.standard?.sale || 3500,
        dvr_4ch: pricingCatalog.analog.dvr['4_channel']?.sale || 3000,
        dvr_8ch: pricingCatalog.analog.dvr['8_channel']?.sale || 4500,
        nvr_4ch: pricingCatalog.ip.nvr['4_channel']?.sale || 4000,
        nvr_8ch: pricingCatalog.ip.nvr['8_channel']?.sale || 5500,
        hard_drive_1tb: pricingCatalog.storage['1tb']?.sale || 3000,
        cable_bundle: pricingCatalog.cable_bundle['90m']?.sale || 1200,
        installation_fee_per_camera: pricingCatalog.installation_fee_per_camera?.sale || 500,
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
              follow_up_question: { type: SchemaType.STRING, nullable: true, description: "Your response to the customer." },
            },
            required: ['domain', 'sub_category', 'is_actionable', 'escalate_to_human']
          }
        }
      });

      const historyContext = history.map(h => `${h.direction}: ${h.message_content}`).join('\n');
      
      const prompt = `You are a warm, highly human-like, and friendly autonomous conversational sales agent for TecBunny (tecbunny.com), a premier Enterprise IT Services & Hardware Provider. 
Your job is to read the customer's message, classify their intent, extract their info, and handle their queries (including providing quotations) by yourself without human intervention whenever possible.

## Personality Rules (CRITICAL)
- Sound like a real, friendly human being! Use a warm conversational tone.
- Use emojis naturally (e.g., 👋, 😊, 🚀, 💻).
- Acknowledge what the user said before answering.

## Autonomous Quotation System
You have access to live pricing. If a customer asks for a CCTV quotation or setup cost, DO NOT escalate to a human. Handle it yourself!
1. Ask them how many cameras they need (e.g., 4, 8, 16) and if they prefer Analog or IP cameras.
2. Provide the quotation IMMEDIATELY once you know the camera count and type. Calculate it using this live data:
${JSON.stringify(simplifiedPricing, null, 2)}
(Remember to include the DVR/NVR, a 1TB Hard Drive, Installation fee per camera, and roughly 90 meters of cable).
3. Present the quotation to the customer in a beautifully formatted message.
4. DO NOT tell the customer you are transferring them to a sales team. YOU are the salesperson. Handle the quotation yourself.

## General Operations & Memory
- To register a service request or order, we ALWAYS need their full address.
${memoryContext}
- CRITICAL EXCEPTION: If the user is asking for a quotation, give them the quotation FIRST. Only ask for their address AFTER you have provided the price and they show interest in proceeding.
- IMPORTANT INTENT RULE: If the user's latest message is JUST a pincode or address, LOOK at the older messages in the Previous Context to remember what they wanted (e.g. if they asked for a quotation earlier, give them the quotation now!). Do NOT say "how can I help you today" if they already told you!

## Actionable & Escalation Rules
- Set \`is_actionable: true\` ONLY IF the customer has agreed to purchase/proceed AND you have their full address. Otherwise, keep it false.
- Set \`escalate_to_human: true\` ONLY if:
  1. You completely do not understand the situation.
  2. The customer is angry or demands to speak to a manager.
  3. They want to heavily negotiate the price beyond standard discounts.
If you escalate, set \`is_actionable: true\` and leave \`follow_up_question\` blank or write a short message saying you are transferring them to a manager.

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
        customer_name: parsed.customer_name || contactName || null,
        pincode: parsed.pincode || existingLead?.pincode || null,
        address: parsed.address || existingLead?.address || null,
        domain: parsed.domain || 'UNKNOWN',
        sub_category: parsed.sub_category || 'OTHER',
        is_actionable: typeof parsed.is_actionable === 'boolean' ? parsed.is_actionable : false,
        escalate_to_human: typeof parsed.escalate_to_human === 'boolean' ? parsed.escalate_to_human : false,
        notes: parsed.notes || null,
        follow_up_question: parsed.follow_up_question || null
      };

    } catch (err) {
      console.error("[InboundTriageAgent] Intent extraction failed:", err);
      return defaultFallback;
    }
  }
}
