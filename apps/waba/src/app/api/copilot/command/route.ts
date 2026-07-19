import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiRole } from '@tecbunny/core/server-role-guard';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export async function POST(req: Request) {
  try {
    const { error } = await requireApiRole();
    if (error) return error;

    const { conversationId, command } = await req.json();

    if (!conversationId || !command) {
      return NextResponse.json({ error: 'Missing conversationId or command' }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { sender_number: conversationId },
      include: {
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 50 // Get last 50 messages for context
        }
      }
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Format messages chronologically
    const chatHistory = conversation.messages
      .reverse()
      .map(m => `${m.direction === 'INBOUND' ? 'Customer' : 'Agent'}: ${m.message_content}`)
      .join('\n');

    let aiResponse = '';
    let responseType = 'SYSTEM_MESSAGE'; // 'SYSTEM_MESSAGE' or 'INPUT_REPLACEMENT'

    if (command === '/summary') {
      const prompt = `
You are an expert CRM assistant. Summarize the following WhatsApp conversation between a customer and a business agent.
Focus on:
1. Customer's primary intent/issue
2. Actions taken so far
3. Any pending items or unresolved issues

Output a concise bulleted list. Do not include pleasantries.

Conversation History:
${chatHistory}
`;
      const result = await model.generateContent(prompt);
      aiResponse = result.response.text();
      responseType = 'SYSTEM_MESSAGE';

    } else if (command === '/reply') {
      const prompt = `
You are an expert customer service and sales agent. Draft a professional, empathetic, and concise reply to the customer based on the conversation history below.
Do not include subject lines or placeholder text. Keep it conversational for WhatsApp.

Conversation History:
${chatHistory}

Draft Reply:
`;
      const result = await model.generateContent(prompt);
      aiResponse = result.response.text();
      responseType = 'INPUT_REPLACEMENT';

    } else if (command === '/recommend') {
      const prompt = `
You are a strategic CRM Copilot. Based on the conversation below, recommend the "Next Best Action" for the agent.
This could be:
- Send a payment link
- Create a support ticket
- Escalate to manager
- Ask a qualifying question (specify what to ask)

Conversation History:
${chatHistory}
`;
      const result = await model.generateContent(prompt);
      aiResponse = `💡 **AI Recommendation:**\n${result.response.text()}`;
      responseType = 'SYSTEM_MESSAGE';

    } else {
      return NextResponse.json({ error: 'Unknown command' }, { status: 400 });
    }

    // If it's a SYSTEM_MESSAGE, we can optionally save it to the DB as an internal note,
    // but for now we'll just return it to the frontend to render dynamically.

    return NextResponse.json({
      status: 'success',
      data: {
        response: aiResponse,
        type: responseType
      }
    });

  } catch (err: unknown) {
    console.error('[API] Copilot command failed:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
