import { BaseAgent } from './BaseAgent';
import { triagedIntentsQueue } from '../lib/queue';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

interface TriagedPayload {
  messageId: string;
  senderNumber: string;
  textContent: string;
  intent: 'OPT_OUT' | 'PROPERTY_INQUIRY' | 'TECH_SERVICES' | 'UNKNOWN';
  hoursSinceLastMessage: number;
  contactName?: string;
  dealValue?: string;
  activeFlow?: string;
  history: { direction: string; message_content: string }[];
}

export class InboundTriageAgent extends BaseAgent<any, TriagedPayload | null> {
  constructor() {
    // Consume from inbound, emit to triagedIntentsQueue
    super('inbound-whatsapp-events', triagedIntentsQueue);
  }

  protected async process(data: any): Promise<TriagedPayload | null> {
    const results = data.results || [];
    
    for (const msg of results) {
      const senderNumber = msg.from || msg.sender;
      const messageId = msg.messageId;
      
      if (!senderNumber || !messageId) continue;

      let textContent = '';
      let mediaUrl = null;
      let mediaType = null;
      
      // Basic extraction
      if (msg.message?.text) {
        textContent = msg.message.text;
      } else if (msg.content?.text) {
        textContent = msg.content.text;
      } else if (Array.isArray(msg.content) && msg.content.length > 0) {
        const content = msg.content[0];
        if (content.type === 'TEXT') {
          textContent = content.text || '';
        } else {
           textContent = `[${content.type || 'Media'}]`;
        }
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

      // Fetch or Create Conversation
      const { data: existingConv } = await supabase
        .from('Conversation')
        .select('id, ad_source, last_interaction_timestamp, ai_active, contact_name, deal_value, active_flow, status')
        .eq('sender_number', senderNumber)
        .single();
        
      const oldLastInteraction = existingConv?.last_interaction_timestamp ? new Date(existingConv.last_interaction_timestamp) : new Date(0);
      const hoursSinceLastMessage = (new Date().getTime() - oldLastInteraction.getTime()) / (1000 * 60 * 60);

      if (existingConv) {
        await supabase
          .from('Conversation')
          .update({ 
            last_interaction_timestamp: new Date().toISOString(),
            status: 'PROCESSING' // As requested in Phase 2
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
        // Fetch last 5 messages for context
        const { data: historyData } = await supabase
          .from('Message')
          .select('direction, message_content')
          .eq('sender_number', senderNumber)
          .order('timestamp', { ascending: false })
          .limit(5);
          
        const lastBotMsg = historyData?.find(m => m.direction === 'OUTBOUND')?.message_content || null;
        const history = (historyData || []).reverse();
        
        // Analyze Intent
        const intent = await this.analyzeIntent(textContent, lastBotMsg);
        
        // We return the structured payload to be placed onto the triaged-intents queue
        return {
          messageId,
          senderNumber,
          textContent,
          intent,
          hoursSinceLastMessage,
          contactName: existingConv?.contact_name,
          dealValue: existingConv?.deal_value,
          activeFlow: existingConv?.active_flow,
          history
        };
      }
    }
    
    return null;
  }

  private async analyzeIntent(
    userMessage: string,
    botLastMessage: string | null
  ): Promise<'OPT_OUT' | 'PROPERTY_INQUIRY' | 'TECH_SERVICES' | 'UNKNOWN'> {
    if (!genAI) {
      if (userMessage.toLowerCase().trim() === 'no' || userMessage.toLowerCase().includes('stop')) return 'OPT_OUT';
      return 'UNKNOWN';
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `You are an intent classifier for a real estate and technical solutions brokerage.
The bot last said: "${botLastMessage || 'Nothing'}"
The user replied: "${userMessage}"

Classify the user's intent into exactly ONE of these categories:
- OPT_OUT: User says "No", declines to continue, or asks to stop/pause messages.
- PROPERTY_INQUIRY: User asks about property, 3BHK, rent, buying, listings, etc.
- TECH_SERVICES: User asks about tech, CCTV installation, wiring, etc.
- UNKNOWN: Anything else, like general greetings or unrelated topics.

Output ONLY a raw JSON object, no markdown formatting or backticks. Example:
{"intent": "OPT_OUT"}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      
      try {
        const parsed = JSON.parse(text);
        if (parsed.intent) return parsed.intent;
      } catch (e) {
        if (text.includes("OPT_OUT")) return 'OPT_OUT';
        if (text.includes("PROPERTY_INQUIRY")) return 'PROPERTY_INQUIRY';
        if (text.includes("TECH_SERVICES")) return 'TECH_SERVICES';
      }
      return 'UNKNOWN';
    } catch (err) {
      console.error("[InboundTriageAgent] Intent analysis failed:", err);
      if (userMessage.toLowerCase().trim() === 'no') return 'OPT_OUT';
      return 'UNKNOWN';
    }
  }
}
