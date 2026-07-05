import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore - Assuming database package is linked
import { supabaseAdmin } from '@tecbunny/database';

// Mocking BullMQ for Phase 4 Queueing
const webhookQueue = {
  add: async (jobName: string, data: any) => {
    console.log(`[WABA Queue] Enqueued job ${jobName}:`, data);
    // In a real environment, this goes to Redis.
    // For now, we process it asynchronously in the background.
    processWebhookPayload(data).catch(console.error);
  }
};

async function processWebhookPayload(body: any) {
  if (body.object === 'whatsapp_business_account') {
    for (const entry of body.entry) {
      for (const change of entry.changes) {
        if (change.value && change.value.messages) {
          
          const phoneNumberId = change.value.metadata.phone_number_id;
          const incomingMessage = change.value.messages[0];

          // 2. Identify the Tenant based on the Phone Number ID
          const { data: credential, error } = await supabaseAdmin
            .from('waba_credentials')
            .select('tenant_id')
            .eq('phone_number_id', phoneNumberId)
            .single();

          if (error || !credential) {
            console.error(`Unrecognized phone_number_id: ${phoneNumberId}`);
            continue; // Drop the message if tenant is unknown
          }

          const tenantId = credential.tenant_id;

          // 3. Securely store the incoming message tied to the tenant
          await supabaseAdmin.from('messages').insert({
            tenant_id: tenantId,
            waba_message_id: incomingMessage.id,
            sender_number: incomingMessage.from,
            receiver_number: change.value.metadata.display_phone_number,
            content: incomingMessage.text?.body || '[Non-text message]',
            status: 'received'
          });
        }
      }
    }
  }
}

// GET handler for Webhook Verification (Meta Challenge)
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WABA_WEBHOOK_VERIFY_TOKEN || 'my_secure_token';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK_VERIFIED');
    return new NextResponse(challenge, { status: 200 });
  } else {
    return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
  }
}

// POST handler for receiving incoming WhatsApp messages
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Immediately enqueue the payload and return 200 OK to Meta
    await webhookQueue.add('process-whatsapp-message', body);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook Error:', error);
    // Even on error reading JSON, we might want to return 200 to stop Meta retries if it's unparseable,
    // but 500 is standard for server errors.
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
