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
        .select('id, contact_name')
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
        const triageResult = await this.extractStructuredIntent(textContent, history, existingConv?.contact_name || null);
        
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

        // If it's still missing data (not actionable), stop here so it doesn't get assigned
        if (!fullPayload.is_actionable) {
          return null;
        }

        // If actionable, return payload for the Assignment Orchestrator (Phase 3)
        return fullPayload;
      }
    }
    
    return null;
  }

  private async extractStructuredIntent(
    userMessage: string,
    history: { direction: string; message_content: string }[],
    contactName: string | null
  ): Promise<Omit<TriagedPayload, 'messageId' | 'senderNumber' | 'history'>> {
    const defaultFallback: Omit<TriagedPayload, 'messageId' | 'senderNumber' | 'history'> = {
      customer_name: null,
      pincode: null,
      address: null,
      domain: 'UNKNOWN',
      sub_category: 'OTHER',
      is_actionable: false,
      escalate_to_human: true,
      follow_up_question: "Oops, I didn't quite catch that! I'm transferring you to a human manager to assist you further."
    };

    if (!genAI) return defaultFallback;

    try {
      // Fetch live pricing context from the database
      const pricingCatalog = await buildPricingCatalog(null);
      const simplifiedPricing = {
        analog_camera_2_4mp: pricingCatalog.analog.camera['2.4mp']?.standard?.sale || 1500,
        analog_camera_5mp: pricingCatalog.analog.camera['5mp']?.standard?.sale || 2200,
        ip_camera_2mp: pricingCatalog.ip.camera['2mp']?.standard?.sale || 2500,
        ip_camera_5mp: pricingCatalog.ip.camera['5mp']?.standard?.sale || 3500,
        analog_dvr_4ch: pricingCatalog.analog.dvr.find(d => d.capacity === 4)?.sale || 2800,
        ip_nvr_4ch: pricingCatalog.ip.nvr.find(d => d.capacity === 4)?.sale || 3500,
        hard_drive_1tb: pricingCatalog.hddOptions.find(h => h.label.includes('1TB'))?.sale || 3500,
        installation_fee_per_camera: pricingCatalog.installationOption?.sale || 500,
        cable_fee_per_meter: pricingCatalog.analog.cable[0]?.salePerUnit || 25,
      };

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
1. Ask them how many cameras they need (e.g., 4, 8, 16).
2. Ask if they prefer Analog (cheaper) or IP cameras (better quality).
3. Once you have the camera count and type, calculate the quotation using this live data:
${JSON.stringify(simplifiedPricing, null, 2)}
(Remember to include the DVR/NVR, a 1TB Hard Drive, Installation fee per camera, and roughly 90 meters of cable).
4. Present the quotation to the customer in a beautifully formatted message.

## General Operations
- To register a service request or order, we ALWAYS need their full address.
- Ask for their FULL address (do not ask for pincode upfront).
- If they gave an address without a 6-digit Indian pincode, ask for the pincode.

## Escalation Protocol (escalate_to_human)
You must handle the customer by yourself AS MUCH AS POSSIBLE. However, set \`escalate_to_human: true\` ONLY if:
1. You completely do not understand the situation or what they want.
2. The customer is angry or demands to speak to a manager.
3. They ask for a product/service that is not in the pricing list and you cannot help them.
4. They want to heavily negotiate the price beyond standard discounts.
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
        pincode: parsed.pincode || null,
        address: parsed.address || null,
        domain: parsed.domain || 'UNKNOWN',
        sub_category: parsed.sub_category || 'OTHER',
        is_actionable: typeof parsed.is_actionable === 'boolean' ? parsed.is_actionable : false,
        escalate_to_human: typeof parsed.escalate_to_human === 'boolean' ? parsed.escalate_to_human : false,
        follow_up_question: parsed.follow_up_question || null
      };

    } catch (err) {
      console.error("[InboundTriageAgent] Intent extraction failed:", err);
      return defaultFallback;
    }
  }
}
