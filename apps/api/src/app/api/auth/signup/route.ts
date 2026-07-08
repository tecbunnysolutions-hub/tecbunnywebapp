import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { logger } from "@tecbunny/core";
import { rateLimit } from "@tecbunny/core/rate-limit";
import { AuthService } from "@tecbunny/core/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
const SIGNUP_IP_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 };
const SIGNUP_IDENTIFIER_LIMIT = { limit: 3, windowMs: 30 * 60 * 1000 };

function getClientIp(request: NextRequest) {
  return request.headers.get('cf-connecting-ip')?.trim()
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')?.trim()
    || 'unknown';
}

function getSupabaseAdmin() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase admin environment variables are not configured');
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      logger.error('signup.supabase_config_missing');
      return NextResponse.json(
        { error: 'Supabase configuration missing. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.' },
        { status: 503 }
      );
    }

    const payload = await request.json();
    const clientIp = getClientIp(request);
    const { email, mobile: _mobile } = payload;
    
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const normalizedMobile = typeof _mobile === 'string' ? _mobile.replace(/\D/g, '') : '';

    const ipRl = await rateLimit(`signup_ip:${clientIp}`, SIGNUP_IP_LIMIT.limit, SIGNUP_IP_LIMIT.windowMs);
    if (!ipRl.allowed) {
      return NextResponse.json({ error: 'Too many signup attempts. Please try again later.' }, { status: 429 });
    }
    if (normalizedEmail) {
      const emailRl = await rateLimit(`signup_email:${normalizedEmail}`, SIGNUP_IDENTIFIER_LIMIT.limit, SIGNUP_IDENTIFIER_LIMIT.windowMs);
      if (!emailRl.allowed) {
        return NextResponse.json({ error: 'Too many signup attempts for this email. Please try again later.' }, { status: 429 });
      }
    }
    if (normalizedMobile) {
      const mobileRl = await rateLimit(`signup_mobile:${normalizedMobile}`, SIGNUP_IDENTIFIER_LIMIT.limit, SIGNUP_IDENTIFIER_LIMIT.windowMs);
      if (!mobileRl.allowed) {
        return NextResponse.json({ error: 'Too many signup attempts for this mobile number. Please try again later.' }, { status: 429 });
      }
    }

    const supabaseAdmin = getSupabaseAdmin();
    // Test Supabase admin connection
    try {
      const { error: testError } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1 });
      if (testError) {
        logger.error('signup.supabase_admin_connection_test_failed', { error: testError });
        return NextResponse.json({ error: 'Database connection error. Please check your configuration.' }, { status: 503 });
      }
    } catch (connError) {
      logger.error('signup.supabase_admin_connection_error', { error: connError });
      return NextResponse.json({ error: 'Database connection error. Please try again.' }, { status: 503 });
    }

    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    const authService = new AuthService(supabaseAdmin);
    
    const result = await authService.signup(payload, clientIp, siteKey);

    if (!result.success) {
      return NextResponse.json({ error: result.error.message }, { status: result.error.statusCode || 400 });
    }

    return NextResponse.json(result.data);

  } catch (error) {
    logger.error('signup.internal_error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
