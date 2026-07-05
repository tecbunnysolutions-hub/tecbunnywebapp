import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { processWhatsAppMessageWithAI } from '@/lib/whatsapp/ai-router';
import { sendWhatsAppMessage, markWhatsAppMessageRead } from '@/lib/whatsapp/api';

// Webhook Verification (required by Meta)
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

// Handle incoming messages
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if this is a WhatsApp API event
    if (body.object !== 'whatsapp_business_account') {
      return new NextResponse('Not Found', { status: 404 });
    }

    const supabase = createServiceClient();

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value;
        
        // We only care about incoming messages (ignore status updates like 'delivered', 'read')
        if (!value.messages || value.messages.length === 0) continue;

        const message = value.messages[0];
        const contact = value.contacts?.[0];
        const phoneNumber = message.from;
        const messageText = message.text?.body;
        const messageId = message.id;

        if (!messageText) continue; // Ignore non-text messages for now

        // 1. Mark message as read
        await markWhatsAppMessageRead(messageId);

        // 2. Upsert Contact
        let { data: contactData } = await supabase
          .from('whatsapp_contacts')
          .select('id, name')
          .eq('phone_number', phoneNumber)
          .single();

        if (!contactData) {
          const { data: newContact } = await supabase
            .from('whatsapp_contacts')
            .insert({ phone_number: phoneNumber, name: contact?.profile?.name || 'Unknown' })
            .select()
            .single();
          contactData = newContact;
        }

        // 3. Find or Create Conversation
        let { data: conversation } = await supabase
          .from('whatsapp_conversations')
          .select('*')
          .eq('contact_id', contactData!.id)
          .neq('status', 'closed')
          .single();

        if (!conversation) {
          const { data: newConversation } = await supabase
            .from('whatsapp_conversations')
            .insert({ contact_id: contactData!.id, status: 'bot' })
            .select()
            .single();
          conversation = newConversation;
        }

        // 4. Save the incoming message
        // Handle duplicate webhook deliveries gracefully
        const { error: insertError } = await supabase
          .from('whatsapp_messages')
          .insert({
            conversation_id: conversation!.id,
            sender_type: 'customer',
            meta_message_id: messageId,
            content: messageText
          });
          
        if (insertError && insertError.code === '23505') {
          console.log(`Duplicate message received: ${messageId}`);
          continue;
        }

        // 5. Route logic
        if (conversation!.status === 'bot') {
          // Fetch last 5 messages for context
          const { data: history } = await supabase
            .from('whatsapp_messages')
            .select('sender_type, content')
            .eq('conversation_id', conversation!.id)
            .order('created_at', { ascending: true })
            .limit(10);

          const aiHistory = (history || []).map(msg => ({
            role: (msg.sender_type === 'customer' ? 'user' : 'model') as 'user' | 'model',
            parts: [{ text: msg.content }]
          }));

          const aiResponse = await processWhatsAppMessageWithAI(aiHistory);

          if (aiResponse) {
            if (aiResponse.action === 'reply' && aiResponse.message) {
              // Send reply via Meta API
              await sendWhatsAppMessage(phoneNumber, aiResponse.message);
              
              // Save bot message to DB
              await supabase.from('whatsapp_messages').insert({
                conversation_id: conversation!.id,
                sender_type: 'bot',
                content: aiResponse.message
              });
            } else if (aiResponse.action === 'route') {
              // Extract location and update conversation status to handoff to a human
              await supabase.from('whatsapp_conversations')
                .update({ 
                  status: 'human_assigned', 
                  location_data: { raw: aiResponse.location, requirement: aiResponse.requirement }
                })
                .eq('id', conversation!.id);

              // Notify customer they are being connected
              const handoffMsg = "Thank you! I am connecting you with a sales manager for your region. They will reply shortly.";
              await sendWhatsAppMessage(phoneNumber, handoffMsg);
              
              await supabase.from('whatsapp_messages').insert({
                conversation_id: conversation!.id,
                sender_type: 'bot',
                content: handoffMsg
              });
            }
          }
        } else if (conversation!.status === 'human_assigned') {
          // The message is saved, Supabase Realtime will push it to the frontend.
          // Optional: Send push notification/email to the assigned agent here.
        }
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
