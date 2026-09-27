import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { verifyCaptcha } from "@tecbunny/core/captcha/captcha-service";
import { logger, normalizeRole } from "@tecbunny/core";
import { rateLimit } from "@tecbunny/core/rate-limit";
import { OTPManager, type OTPChannel } from "@tecbunny/core/otp-manager";

const otpService = new OTPManager();

export async function POST(request: NextRequest) {
  try {
    const { email, mobile, captchaToken, channel: requestedChannel } = await request.json();

    if (!email && !mobile) {
      return NextResponse.json(
        { error: 'Email or mobile number is required' },
        { status: 400 }
      );
    }

    const identifier = email || mobile;

    const ip = request.headers.get('cf-connecting-ip')?.trim()
      || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')?.trim()
      || 'unknown';

    // Per-identifier limit (Redis-backed so it holds across all serverless instances).
    const idRl = await rateLimit(`forgot_password:${identifier}`, 3, 15 * 60 * 1000);
    if (!idRl.allowed) {
      return NextResponse.json(
        { error: 'Too many reset attempts. Please wait 15 minutes before trying again.' },
        { status: 429 }
      );
    }

    // Secondary IP-level limit to catch distributed enumeration.
    const ipRl = await rateLimit(`forgot_password_ip:${ip}`, 10, 15 * 60 * 1000);
    if (!ipRl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests from this network. Please try again later.' },
        { status: 429 }
      );
    }

    // CAPTCHA verification (conditional if configured)
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (siteKey) {
      const captcha = await verifyCaptcha(captchaToken, ip);
      if (!captcha.success) {
        logger.warn('forgot_password.captcha_failed', { identifier, ip, error: captcha.error || captcha.errorCodes });
        return NextResponse.json({ error: 'Security verification failed. Please try again.' }, { status: 400 });
      }
    }

    // Create admin client for user lookup
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const genericResponse = () => NextResponse.json({
      success: true,
      message: 'If an account with this email or mobile exists, you will receive an OTP code.',
    });

    // Resolve exactly one account from the submitted identifier. The code is
    // only ever delivered to contact details stored on that account; contact
    // details supplied in the request are never used as a destination.
    const lookup = supabase.from('profiles').select('id, email, mobile, role');
    const { data: profile, error: profileError } = email
      ? await lookup.eq('email', String(email).trim().toLowerCase()).maybeSingle()
      : await lookup.eq('mobile', String(mobile).trim()).maybeSingle();

    if (profileError) {
      logger.error('forgot_password.profile_lookup_failed', { error: profileError, identifier });
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 500 });
    }

    if (!profile) {
      logger.warn('forgot_password.user_missing', { identifier });
      return genericResponse();
    }

    const { data: userData, error: getUserError } = await supabase.auth.admin.getUserById(profile.id);
    if (getUserError || !userData?.user) {
      logger.warn('forgot_password.user_auth_missing', { identifier, userId: profile.id, error: getUserError?.message });
      return genericResponse();
    }

    const accountEmail = typeof profile.email === 'string' && profile.email.trim() ? profile.email.trim().toLowerCase() : undefined;
    const accountMobile = typeof profile.mobile === 'string' && profile.mobile.trim() ? profile.mobile.trim() : undefined;
    const accountRole = normalizeRole(profile.role);
    const isPrivileged = Boolean(accountRole && accountRole !== 'customer');

    // Privileged accounts may only recover through their registered email.
    let normalizedChannel: OTPChannel = requestedChannel === 'whatsapp' || (!requestedChannel && !email)
      ? 'whatsapp'
      : 'email';
    if (isPrivileged || (normalizedChannel === 'whatsapp' && !accountMobile)) normalizedChannel = 'email';
    if (normalizedChannel === 'email' && !accountEmail) {
      if (isPrivileged || !accountMobile) {
        logger.warn('forgot_password.no_deliverable_contact', { userId: profile.id });
        return genericResponse();
      }
      normalizedChannel = 'whatsapp';
    }

    logger.info('forgot_password.sending_otp', { userId: profile.id, preferredChannel: normalizedChannel });

    const otpResult = await otpService.generateOTP({
      email: accountEmail,
      phone: accountMobile,
      userId: profile.id,
      preferredChannel: normalizedChannel,
      purpose: 'password_reset',
    });

    if (!otpResult.success || !otpResult.otpId) {
      logger.error('forgot_password.otp_generation_failed', { identifier, message: otpResult.message });
      return NextResponse.json({ error: otpResult.message || 'Failed to send OTP' }, { status: 500 });
    }

    logger.info('forgot_password.otp_sent', {
      identifier,
      otpId: otpResult.otpId,
      channel: otpResult.channel,
      fallbackAvailable: otpResult.fallbackAvailable,
    });

    const res = NextResponse.json({
      success: true,
      message: otpResult.message || `OTP sent via ${otpResult.channel}`,
      otpId: otpResult.otpId,
      channel: otpResult.channel,
      fallbackAvailable: otpResult.fallbackAvailable,
    });
    try {
      const payload = Buffer.from(JSON.stringify({ identifier, type: 'recovery', exp: Date.now() + 15 * 60 * 1000 }), 'utf8').toString('base64');
      res.cookies.set('recovery_otp', payload, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 15 * 60, // 15 minutes
        path: '/',
      });
    } catch {}
    return res;

  } catch (error) {
    logger.error('forgot_password.unhandled_error', { error });
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
