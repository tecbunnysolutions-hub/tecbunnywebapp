import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { logger } from "@tecbunny/core";
import { apiError, apiSuccess } from "@tecbunny/core";
import { rateLimit } from "@tecbunny/core/rate-limit";
import { requireSupabaseServiceEnv } from "@tecbunny/core/supabase/env";
import { AuthService } from "@tecbunny/core/server";

const SEND_OTP_IP_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 };
const SEND_OTP_IDENTIFIER_LIMIT = { limit: 3, windowMs: 15 * 60 * 1000 };

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

export async function POST(request: NextRequest) {
  const correlationId = request.headers.get('x-correlation-id');
  try {
    let body: any;
    try { body = await request.json(); } catch { return apiError('VALIDATION_ERROR', { overrideMessage: 'Invalid JSON body', correlationId }); }
    
    const { email, mobile } = body || {};
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : undefined;
    const normalizedMobile = mobile ? String(mobile).replace(/\D/g, '') : undefined;

    const ip = getClientIp(request);
    const ipRl = await rateLimit(`otp_ip:${ip}`, SEND_OTP_IP_LIMIT.limit, SEND_OTP_IP_LIMIT.windowMs);
    if (!ipRl.allowed) {
      return apiError('RATE_LIMITED', { overrideMessage: 'Too many OTP requests. Please try again later.', correlationId });
    }
    if (normalizedEmail) {
      const emailRl = await rateLimit(`otp_email:${normalizedEmail}`, SEND_OTP_IDENTIFIER_LIMIT.limit, SEND_OTP_IDENTIFIER_LIMIT.windowMs);
      if (!emailRl.allowed) {
        return apiError('RATE_LIMITED', { overrideMessage: 'Too many OTP requests for this email. Please try again later.', correlationId });
      }
    }
    if (normalizedMobile) {
      const mobileRl = await rateLimit(`otp_mobile:${normalizedMobile}`, SEND_OTP_IDENTIFIER_LIMIT.limit, SEND_OTP_IDENTIFIER_LIMIT.windowMs);
      if (!mobileRl.allowed) {
        return apiError('RATE_LIMITED', { overrideMessage: 'Too many OTP requests for this mobile number. Please try again later.', correlationId });
      }
    }

    let supabaseAdminClient: any;
    try {
      supabaseAdminClient = getSupabaseAdmin();
    } catch (configError) {
      return apiError('SERVER_ERROR', {
        overrideMessage: 'Service configuration error. Please contact support.',
        correlationId,
      });
    }

    const authService = new AuthService(supabaseAdminClient);
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    
    const result = await authService.requestOtp(body, ip, siteKey);

    if (!result.success) {
      return apiError(result.error.code === 'FORBIDDEN' ? 'FORBIDDEN' : 'VALIDATION_ERROR', { 
        overrideMessage: result.error.message, 
        correlationId,
        details: result.error.details as Record<string, unknown> | undefined
      });
    }

    return apiSuccess(result.data, correlationId);
  } catch (error) {
    logger.error('send_otp_unhandled', { correlationId, error: (error as Error).message });
    return apiError('INTERNAL_ERROR', { overrideMessage: 'Failed to send OTP', correlationId });
  }
}

export const runtime = 'nodejs';
export const maxDuration = 30;
