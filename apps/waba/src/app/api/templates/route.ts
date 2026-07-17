import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireApiRole } from '@tecbunny/core/server-role-guard';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await requireApiRole();
    if (auth.error) return auth.error;
    if (auth.role === 'customer') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { data: templates, error } = await supabase.from('Template').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    
    // Seed templates if empty for demo purposes
    if (!templates || templates.length === 0) {
      const demoTemplates = [
        { id: crypto.randomUUID(), name: 'welcome_message', content: 'Hello {{1}}, welcome to our service! How can we help you today?' },
        { id: crypto.randomUUID(), name: 'appointment_reminder', content: 'Hi {{1}}, this is a reminder for your appointment tomorrow at {{2}}.' },
        { id: crypto.randomUUID(), name: 'out_of_office', content: 'Thank you for your message. We are currently out of the office. We will reply when we return.' }
      ];
      await supabase.from('Template').insert(demoTemplates);
      return NextResponse.json({ templates: demoTemplates });
    }

    return NextResponse.json({ templates });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireApiRole();
    if (auth.error) return auth.error;
    if (auth.role === 'customer') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { name, content, language } = await req.json();
    const id = crypto.randomUUID();
    const { data, error } = await supabase.from('Template').insert({ id, name, content, language: language || 'en' }).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, template: data });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
