import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

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

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const folder = searchParams.get('folder') || 'inbox';

    const { data: messages, error } = await supabase
      .from('webmail_messages')
      .select('id, folder, from_name, from_address, to_address, subject, is_read, is_flagged, received_at')
      .eq('account_id', auth.accountId)
      .eq('folder', folder)
      .order('received_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ messages });
  } catch (err: any) {
    console.error('Fetch messages error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
