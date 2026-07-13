import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendWhatsAppMessage, sendWhatsAppLocation } from '@/services/infobipService';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversation');

    if (conversationId) {
      const { data: messages, error } = await supabase
        .from('Message')
        .select('*')
        .eq('sender_number', conversationId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      return NextResponse.json({ messages: messages || [] });
    }

    // Note: Since Prisma's relation 'messages' was used, we fetch conversations, then fetch latest message for each.
    const { data: conversations, error: convError } = await supabase
      .from('Conversation')
      .select('*')
      .order('last_interaction_timestamp', { ascending: false });

    if (convError) throw convError;

    // Fetch the latest message for each conversation
    const conversationsWithMessages = await Promise.all(
      (conversations || []).map(async (conv) => {
        const { data: latestMessages } = await supabase
          .from('Message')
          .select('*')
          .eq('sender_number', conv.sender_number)
          .order('timestamp', { ascending: false })
          .limit(1);

        return {
          ...conv,
          messages: latestMessages || []
        };
      })
    );

    return NextResponse.json({ conversations: conversationsWithMessages });

  } catch (error: unknown) {
    console.error('Failed to fetch messages', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to fetch messages', details: error }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, text, location } = body;

    if (!to) {
      return NextResponse.json({ error: 'Missing "to"' }, { status: 400 });
    }

    let result;
    if (location) {
      result = await sendWhatsAppLocation(to, location.latitude, location.longitude, location.name, location.address);
    } else if (text) {
      let finalMessage = text;
      
      // Auto-Draft / Rewrite Feature using Gemini
      if (genAI) {
        try {
          const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
          });
          const prompt = `You are an expert AI editor for TecBunny's sales and support managers. 
The manager has written a draft message to a customer. Your job is to rewrite it to be extremely professional, warm, polite, and grammatically perfect.
- Do NOT change the factual meaning, prices, or details.
- Make it sound like a premium enterprise IT services company.
- Use a warm, human-like tone with occasional natural emojis.

CRITICAL RULE:
If the manager's draft is extremely vague, confusing, or lacks enough context to form a coherent professional sentence (e.g., "send it", "no", "idk"), you MUST ask the manager for clarification.
To do this, set "needs_clarification" to true, and provide your question in "question".

If the draft is understandable and you can rewrite it, set "needs_clarification" to false, and provide the rewritten message in "rewritten_message".

Manager's Draft:
"${text}"
`;
          const aiResult = await model.generateContent(prompt);
          const aiText = aiResult.response.text().trim();
          const parsed = JSON.parse(aiText);

          if (parsed.needs_clarification) {
            return NextResponse.json({ error: parsed.question, is_ai_clarification: true }, { status: 400 });
          }

          finalMessage = parsed.rewritten_message || text;
          console.log(`[AI Draft] Original: ${text} | Rewritten: ${finalMessage}`);
        } catch (err) {
          console.error("AI Draft Rewrite failed, falling back to original message:", err);
        }
      }

      result = await sendWhatsAppMessage(to, finalMessage);
    } else {
      return NextResponse.json({ error: 'Missing "text" or "location"' }, { status: 400 });
    }
    
    if (result?.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: result?.error || 'Failed to send' }, { status: 500 });
    }

  } catch (error: unknown) {
    console.error('Failed to send message', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to send message', stack: error instanceof Error ? error.stack : undefined }, { status: 500 });
  }
}
