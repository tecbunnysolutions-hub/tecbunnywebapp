import { NextRequest, NextResponse } from 'next/server';
import { whatsappQueue } from "@tecbunny/core/queue";
import { supabaseAdmin } from "@tecbunny/core/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const { tenant_id, recipients, message } = await req.json();

    if (!tenant_id || !recipients || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Fetch Tenant's WABA credentials securely
    const { data: creds, error } = await supabaseAdmin
      .from('waba_credentials')
      .select('*')
      .eq('tenant_id', tenant_id)
      .single();

    if (error || !creds) {
      return NextResponse.json({ error: 'No WABA credentials found for this tenant' }, { status: 403 });
    }

    // 2. Bulk add jobs to Redis for massive performance
    const jobs = recipients.map((phone: string) => ({
      name: 'send-message',
      data: {
        tenant_id,
        waba_account_id: creds.waba_account_id,
        access_token: creds.access_token,
        to: phone,
        message
      }
    }));

    await whatsappQueue.addBulk(jobs);

    return NextResponse.json({ 
      success: true, 
      message: `Queued ${recipients.length} messages.` 
    }, { status: 202 });
    
  } catch (error: any) {
    console.error('Broadcast Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
