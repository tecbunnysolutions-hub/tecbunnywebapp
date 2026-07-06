import { BaseAgent } from './BaseAgent';
import { triagedIntentsQueue } from '../lib/queue';
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
    super('inbound-whatsapp-events', triagedIntentsQueue);
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
      await supabase
        .from('Message')
        .insert({
          id: crypto.randomUUID(),
          message_id: messageId,
          sender_number: senderNumber,
          direction: 'INBOUND',
          message_content: textContent,
          timestamp: new Date().toISOString()
        });

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

        // Fallback Logic: If missing data (not actionable), ask the follow up question
        if (!fullPayload.is_actionable && fullPayload.follow_up_question) {
          console.log(`[InboundTriageAgent] Payload not actionable for ${senderNumber}. Asking: ${fullPayload.follow_up_question}`);
          
          await sendWhatsAppMessage(senderNumber, fullPayload.follow_up_question);
          
          // Return null so it does NOT get emitted to triagedIntentsQueue
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
      domain: 'UNKNOWN',
      sub_category: 'OTHER',
      is_actionable: false,
      follow_up_question: "I'm having trouble understanding. Could you provide your pincode and what you need help with?"
    };

    if (!genAI) return defaultFallback;

    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              customer_name: { type: SchemaType.STRING, nullable: true },
              pincode: { type: SchemaType.STRING, nullable: true },
              domain: { 
                type: SchemaType.STRING, 
                enum: ['TECHNICAL_SERVICE', 'PRODUCT_SALES', 'UNKNOWN'],
                format: 'enum'
              },
              sub_category: { 
                type: SchemaType.STRING, 
                enum: ['CCTV', 'COMPUTERS', 'NETWORKING', 'WEB_DEV', 'HARDWARE_SALES', 'OTHER'],
                format: 'enum'
              },
              is_actionable: { type: SchemaType.BOOLEAN },
              follow_up_question: { type: SchemaType.STRING, nullable: true },
            },
            required: ['domain', 'sub_category', 'is_actionable']
          }
        }
      });

      const historyContext = history.map(h => `${h.direction}: ${h.message_content}`).join('\n');
      
      const prompt = `You are an intelligent triage agent for TecBunny (tecbunny.com), a premier Enterprise IT Services & Hardware Provider. 
Your job is to read the customer's message, classify their intent, and extract their name and 6-digit Indian pincode.

## Company Knowledge Base
**1. Technical Services (Installation & Maintenance)**
- **CCTV & Security**: End-to-end installation of IP Cameras, DVR/NVR setups, biometric access control (Hikvision, CP Plus, Dahua).
- **Computers & IT Support**: Desktop/laptop repairs, AMC contracts, virus removal, OS installation, data recovery.
- **Networking**: LAN/WAN setup, Wi-Fi optimization, structured cabling, router/switch configuration (Cisco, TP-Link, Ubiquiti).
- **Web Development**: Custom websites, e-commerce stores, ERP/CRM development, SEO, and cloud hosting.

**2. Product & Hardware Sales**
- **IT Hardware**: Laptops, desktops, servers, printers, UPS systems, and networking gear.
- **Accessories**: Keyboards, mice, monitors, cables, and storage devices (SSD/HDD).
- **Security Gear**: CCTV cameras, biometric scanners, and smart locks.

## Auto-Reply Instructions (follow_up_question)
If the user asks a question about our services/products, use the knowledge base above to answer them beautifully, give them suggestions, and sound extremely helpful and professional!
HOWEVER, to assign a manager to them, we ALWAYS need their 6-digit Indian Pincode. 
- If you don't have their pincode, set \`is_actionable\` to false, and end your \`follow_up_question\` by politely asking for their 6-digit pincode so we can check service availability.
- If they provided a pincode but you need more info (e.g. they just said "hi"), set \`is_actionable\` to false and ask how you can help them with IT services or hardware.
- Only set \`is_actionable\` to true if you understand their core request AND you have their 6-digit pincode.

Previous Context:
${historyContext}

Latest Message:
"${userMessage}"
`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      const parsed = JSON.parse(text);
      return {
        customer_name: parsed.customer_name || contactName || null,
        pincode: parsed.pincode || null,
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
