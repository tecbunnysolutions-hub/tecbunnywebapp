import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireSupabaseServiceEnv } from '@/lib/supabase/env';

let supabaseAdmin: any = null;

function getSupabaseAdmin(): any {
  if (!supabaseAdmin) {
    const { url, serviceKey } = requireSupabaseServiceEnv();
    supabaseAdmin = createClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  return supabaseAdmin;
}

export async function POST(request: NextRequest) {
  try {
    const { mobile } = await request.json();
    if (!mobile) {
      return NextResponse.json({ error: 'Mobile number is required' }, { status: 400 });
    }

    const normalizedMobile = String(mobile).replace(/\D/g, '');
    const phone = normalizedMobile.length === 10 ? `91${normalizedMobile}` : normalizedMobile;

    const { data: profile, error } = await getSupabaseAdmin()
      .from('profiles')
      .select('email')
      .eq('mobile', phone)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ email: `${phone}@tecbunny.phone` });
    }

    if (profile?.email) {
      return NextResponse.json({ email: profile.email });
    }

    return NextResponse.json({ email: `${phone}@tecbunny.phone` });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
