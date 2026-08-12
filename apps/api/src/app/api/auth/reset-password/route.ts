import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { logger } from "@tecbunny/core";
import { rateLimit } from "@tecbunny/core/rate-limit";
import { AuthService } from "@tecbunny/core/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const otp = (body?.otp || body?.code || '').toString().trim();
    const email = (body?.email || body?.userEmail || '').toString().trim();
    const mobile = (body?.mobile || '').toString().trim();
    const otpId = (body?.otpId || body?.otp_id || '').toString().trim();
    const password: string = (body?.password || body?.newPassword || body?.new_password || '').toString();

    const identifier = email || mobile;
    if (identifier) {
      const rl = await rateLimit(`reset_password:${identifier}`, 5, 5 * 60 * 1000);
      if (!rl.allowed) {
        return NextResponse.json(
          { error: 'Too many reset attempts. Please wait 5 minutes before trying again.' },
          { status: 429 }
        );
      }
    }

    const { url, serviceKey } = requireSupabaseServiceEnv();
    const supabaseAdmin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const authService = new AuthService(supabaseAdmin);
    const result = await authService.resetPassword({
      otp, otpId, email, mobile, password
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.statusCode || 400 }
      );
    }

    const res = NextResponse.json({
      success: true,
      message: result.data.message
    });
    try {
      res.cookies.set('recovery_otp', '', { maxAge: 0, path: '/' });
    } catch {}
    return res;

  } catch (error) {
    logger.error('auth.reset_password.unhandled_error', { error });
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
