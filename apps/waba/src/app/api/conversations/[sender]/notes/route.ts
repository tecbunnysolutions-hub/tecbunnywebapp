import { NextResponse } from 'next/server';

import { supabase } from '@/lib/supabase';
import { requireApiRole } from '@tecbunny/core/server-role-guard';

export const dynamic = 'force-dynamic';

type NoteRow = {
  id: string;
  note: string;
  author_name: string | null;
  created_at: string;
};

function toClientNote(note: NoteRow) {
  return {
    id: note.id,
    text: note.note,
    authorName: note.author_name,
    createdAt: note.created_at,
  };
}

export async function GET(_request: Request, { params }: { params: Promise<{ sender: string }> }) {
  try {
    const auth = await requireApiRole();
    if (auth.error) return auth.error;
    if (auth.role === 'customer') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { sender } = await params;
    const senderNumber = decodeURIComponent(sender);
    if (!senderNumber) return NextResponse.json({ error: 'sender is required' }, { status: 400 });

    const { data, error } = await supabase
      .from('waba_conversation_notes')
      .select('id, note, author_name, created_at')
      .eq('sender_number', senderNumber)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return NextResponse.json({ notes: ((data as NoteRow[]) || []).map(toClientNote) });
  } catch (error) {
    console.error('Failed to load conversation notes:', error);
    return NextResponse.json({ error: 'Failed to load conversation notes' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ sender: string }> }) {
  try {
    const auth = await requireApiRole();
    if (auth.error) return auth.error;
    if (auth.role === 'customer') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { sender } = await params;
    const senderNumber = decodeURIComponent(sender);
    if (!senderNumber) return NextResponse.json({ error: 'sender is required' }, { status: 400 });

    const body = await request.json().catch(() => ({}));
    const note = typeof body.note === 'string' ? body.note.trim() : '';
    if (!note) return NextResponse.json({ error: 'note is required' }, { status: 400 });
    if (note.length > 2000) return NextResponse.json({ error: 'note is too long' }, { status: 400 });

    const user = auth.session.user;
    const authorName = user.user_metadata?.name || user.user_metadata?.first_name || user.email || auth.role;
    const { data, error } = await supabase
      .from('waba_conversation_notes')
      .insert({
        sender_number: senderNumber,
        note,
        author_id: user.id,
        author_name: authorName,
      })
      .select('id, note, author_name, created_at')
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, note: toClientNote(data as NoteRow) });
  } catch (error) {
    console.error('Failed to save conversation note:', error);
    return NextResponse.json({ error: 'Failed to save conversation note' }, { status: 500 });
  }
}