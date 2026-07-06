import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { email, name, id } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    // Check if user exists in DB
    let { data: user } = await supabase.from('User').select('*').eq('email', email).maybeSingle();

    if (!user) {
      // Create new user (or link to Supabase ID if provided)
      const newId = id || crypto.randomUUID();
      const { data: newUser, error } = await supabase.from('User').insert({ id: newId, email, name: name || 'Agent' }).select().single();
      if (error) throw error;
      user = newUser;
    }

    // Create a simple response and set an HTTP-only cookie for the MVP Auth
    const response = NextResponse.json({ success: true, user });
    
    response.cookies.set({
      name: 'waba_agent_id',
      value: user.id,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
