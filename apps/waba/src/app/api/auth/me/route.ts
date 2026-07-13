import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@tecbunny/core/supabase-server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/waba_agent_id=([^;]+)/);
    const agentId = match ? match[1] : null;

    if (agentId === 'superadmin-id') {
      return NextResponse.json({ user: { id: 'superadmin-id', name: 'Super Admin', email: 'superadmin', role: 'SUPERADMIN' } });
    }

    if (agentId) {
      // Legacy check in case some users still have this cookie
      const { data: user } = await supabase.from('User').select('*').eq('id', agentId).maybeSingle();
      if (user) {
        return NextResponse.json({ user });
      }
    }

    // Check actual Supabase session
    const supabaseClient = await createSupabaseClient();
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (user) {
      return NextResponse.json({ 
        user: { 
          id: user.id, 
          name: user.user_metadata?.first_name || user.email?.split('@')[0] || 'Agent', 
          email: user.email, 
          role: user.user_metadata?.role || 'AGENT' 
        } 
      });
    }

    return NextResponse.json({ user: null }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
