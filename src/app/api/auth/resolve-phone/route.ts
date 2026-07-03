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

function getClientIp(request: NextRequest) {
  return request.headers.get('cf-connecting-ip')?.trim()
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')?.trim()
    || 'unknown';
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}${local[1]}***${local[local.length - 1]}@${domain}`;
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    
    // Use dynamic import for rateLimit since this is a serverless function and we want the async version
    const { rateLimit } = await import('@/lib/rate-limit');
    
    const rl = await rateLimit(`resolve-phone:${ip}`, 5, 15 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

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
      return NextResponse.json({ email: maskEmail(`${phone}@tecbunny.phone`) });
    }

    if (profile?.email) {
      return NextResponse.json({ email: maskEmail(profile.email) });
    }

    return NextResponse.json({ email: maskEmail(`${phone}@tecbunny.phone`) });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
