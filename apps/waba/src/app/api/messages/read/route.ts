import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireApiRole } from '@tecbunny/core/server-role-guard';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/messages/read
 * Mark all messages in a conversation as read and reset unread_count.
 * Body: { sender_number: string }
 */
export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireApiRole();
    if (auth.error) return auth.error;
    if (auth.role === 'customer') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { sender_number } = await req.json().catch(() => ({}));

    if (!sender_number || typeof sender_number !== 'string') {
      return NextResponse.json({ error: 'sender_number is required' }, { status: 400 });
    }

    // Mark all INBOUND messages for this conversation as READ
    const { error: msgErr } = await supabase
      .from('Message')
      .update({ status: 'READ', read_at: new Date().toISOString() })
      .eq('sender_number', sender_number)
      .eq('direction', 'INBOUND')
      .neq('status', 'READ');

    if (msgErr) {
      console.error('[read-receipts] Failed to update messages:', msgErr.message);
    }

    // Reset unread_count on the Conversation
    const { error: convErr } = await supabase
      .from('Conversation')
      .update({ unread_count: 0 })
      .eq('sender_number', sender_number);

    if (convErr) {
      console.error('[read-receipts] Failed to reset unread_count:', convErr.message);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[read-receipts] Uncaught error:', err.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
