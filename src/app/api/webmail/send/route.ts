import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { sendDirectEmail } from '../../../../mail-server/direct-transport';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-webmail-key-for-dev'
);

async function verifyAuth(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('webmail_session')?.value;
  
  if (!token) return null;
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { accountId: string; email: string };
  } catch (err) {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { to, subject, text, html } = await req.json();

    if (!to) {
      return NextResponse.json({ error: 'Recipient is required' }, { status: 400 });
    }

    // 1. Send the email directly to the destination MX
    const result = await sendDirectEmail({
      from: auth.email,
      to,
      subject: subject || 'No Subject',
      text,
      html
    });

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    // 2. Save the sent email in the 'sent' folder
    const { error: dbError } = await supabase
      .from('webmail_messages')
      .insert({
        account_id: auth.accountId,
        folder: 'sent',
        from_name: auth.email, // Or fetch actual name if we had it
        from_address: auth.email,
        to_address: to,
        subject: subject || 'No Subject',
        body_text: text || '',
        body_html: html || '',
        is_read: true,
        message_id: result.messageId
      });

    if (dbError) {
      console.error('Failed to save sent email to DB:', dbError);
    }

    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (err: any) {
    console.error('Send email error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
