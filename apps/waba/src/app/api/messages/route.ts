import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendWhatsAppMessage, sendWhatsAppLocation } from '@/services/infobipService';
import { requireApiRole } from '@tecbunny/core/server-role-guard';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

type ConversationRow = {
  sender_number: string;
  [key: string]: unknown;
};

type LatestMessageRow = {
  id: string | number;
  sender_number: string;
  direction: string | null;
  message_content: string | null;
  timestamp: string | null;
  status: string | null;
  media_url: string | null;
  media_type: string | null;
};

function getPagination(searchParams: URLSearchParams, defaults: { limit: number; maxLimit: number }) {
  const requestedLimit = Number(searchParams.get('limit') || defaults.limit);
  const requestedOffset = Number(searchParams.get('offset') || 0);

  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(Math.trunc(requestedLimit), 1), defaults.maxLimit)
    : defaults.limit;
  const offset = Number.isFinite(requestedOffset)
    ? Math.max(Math.trunc(requestedOffset), 0)
    : 0;

  return { limit, offset };
}

export async function GET(req: Request) {
  try {
    const auth = await requireApiRole();
    if (auth.error) return auth.error;
    if (auth.role === 'customer') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversation');

    if (conversationId) {
      const { limit, offset } = getPagination(searchParams, { limit: 100, maxLimit: 200 });
      const { data: messages, error } = await supabase
        .from('Message')
        .select('*')
        .eq('sender_number', conversationId)
        .order('timestamp', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return NextResponse.json({
        messages: messages || [],
        pagination: {
          limit,
          offset,
          hasMore: (messages || []).length === limit,
        },
      });
    }

    const { limit, offset } = getPagination(searchParams, { limit: 50, maxLimit: 100 });

    // Note: Since Prisma's relation 'messages' was used, we fetch conversations, then fetch latest message for each.
    const { data: conversations, error: convError } = await supabase
      .from('Conversation')
      .select('*')
      .order('last_interaction_timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (convError) throw convError;

    // Fetch latest message per conversation in a SINGLE query (fix for N+1).
    // We pull all messages for the relevant sender numbers ordered by timestamp
    // descending, then keep only the first occurrence of each sender_number.
    const conversationRows = (conversations || []) as ConversationRow[];
    const senderNumbers = conversationRows.map((conversation) => conversation.sender_number);
    const latestMessagesBySender = new Map<string, LatestMessageRow>();

    if (senderNumbers.length > 0) {
      const { data: allLatest } = await supabase
        .from('Message')
        .select('id, sender_number, direction, message_content, timestamp, status, media_url, media_type')
        .in('sender_number', senderNumbers)
        .order('timestamp', { ascending: false });

      for (const msg of ((allLatest || []) as LatestMessageRow[])) {
        if (!latestMessagesBySender.has(msg.sender_number)) {
          latestMessagesBySender.set(msg.sender_number, msg);
        }
      }
    }

    const conversationsWithMessages = conversationRows.map((conv) => ({
      ...conv,
      messages: latestMessagesBySender.has(conv.sender_number)
        ? [latestMessagesBySender.get(conv.sender_number)]
        : []
    }));

    return NextResponse.json({
      conversations: conversationsWithMessages,
      pagination: {
        limit,
        offset,
        hasMore: (conversations || []).length === limit,
      },
    });

  } catch (error: unknown) {
    console.error('Failed to fetch messages', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireApiRole();
    if (auth.error) return auth.error;
    if (auth.role === 'customer') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

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
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
