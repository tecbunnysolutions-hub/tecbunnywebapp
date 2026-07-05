import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase-server';

// GET handler for Webhook Verification (Meta Challenge)
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Typically store this in env vars, but hardcoding for example structure
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

    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.value && change.value.messages) {
            
            // 1. Identify the destination phone number ID from Meta
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

            // 4. (Optional) In a real scenario, you'd trigger a pusher/socket event here
          }
        }
      }
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
