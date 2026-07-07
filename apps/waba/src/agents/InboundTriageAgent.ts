import { BaseAgent } from './BaseAgent';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { sendWhatsAppMessage } from '../services/infobipService';

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
      follow_up_question: "Oops, I didn't quite catch that! Could you please share your full address and let me know how I can help you today? 😊"
    };

    if (!genAI) return defaultFallback;

    try {
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
              is_actionable: { type: SchemaType.BOOLEAN },
              follow_up_question: { type: SchemaType.STRING, nullable: true },
            },
            required: ['domain', 'sub_category', 'is_actionable']
          }
        }
      });

      const historyContext = history.map(h => `${h.direction}: ${h.message_content}`).join('\n');
      
      const prompt = `You are a warm, highly human-like, and friendly conversational assistant for TecBunny (tecbunny.com), a premier Enterprise IT Services & Hardware Provider. 
Your job is to read the customer's message, classify their intent, and extract their name, full address, and 6-digit Indian pincode.

## Personality Rules (CRITICAL)
- Sound like a real, friendly human being! Use a warm conversational tone.
- Use emojis naturally (e.g., 👋, 😊, 🚀, 💻), but don't overdo it.
- Keep your responses concise and conversational. Do NOT sound like a robotic script.
- Acknowledge what the user said before asking for more information.

## Company Knowledge Base
**1. Technical Services (Installation & Maintenance)**
- **CCTV & Security**: End-to-end installation of IP Cameras, DVR/NVR setups, biometric access control.
- **Computers & IT Support**: Desktop/laptop repairs, AMC contracts, virus removal, OS installation.
- **Networking**: LAN/WAN setup, Wi-Fi optimization, structured cabling.
- **Web Development**: Custom websites, e-commerce stores, ERP/CRM development.

**2. Product & Hardware Sales**
- **IT Hardware**: Laptops, desktops, servers, printers, UPS systems.
- **Accessories**: Keyboards, mice, monitors, cables, storage devices.
- **Security Gear**: CCTV cameras, biometric scanners, smart locks.

## Auto-Reply Instructions (follow_up_question)
If the user asks a question about our services/products, use the knowledge base above to answer them warmly, give them suggestions, and sound extremely helpful!
HOWEVER, to assign a manager to them, we ALWAYS need their full address to store in our database for future reference.
- Do NOT directly ask for a pincode upfront. Ask for their FULL address.
- If they have not provided an address yet, set \`is_actionable\` to false, and casually ask for their full address so we can register their service request.
- If they provided an address, but the address DOES NOT contain a 6-digit Indian pincode, set \`is_actionable\` to false, thank them for the address, and politely request their 6-digit pincode so we can check service availability.
- If they provided an address but you need more info about the service, set \`is_actionable\` to false and ask how you can help them today.
- Only set \`is_actionable\` to true if you understand their core request AND you have their full address AND their 6-digit pincode. (If true, you can leave follow_up_question blank or send a short confirmation like "Got it! Let me connect you with our team...").

Previous Context:
${historyContext}

Latest Message:
"${userMessage}"
`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      // Clean text to handle possible markdown wrappers from the LLM
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanText);
      
      return {
        customer_name: parsed.customer_name || contactName || null,
        pincode: parsed.pincode || null,
        address: parsed.address || null,
        domain: parsed.domain || 'UNKNOWN',
        sub_category: parsed.sub_category || 'OTHER',
        is_actionable: typeof parsed.is_actionable === 'boolean' ? parsed.is_actionable : false,
        follow_up_question: parsed.follow_up_question || null
      };

    } catch (err) {
      console.error("[InboundTriageAgent] Intent extraction failed:", err);
      return defaultFallback;
    }
  }
}
