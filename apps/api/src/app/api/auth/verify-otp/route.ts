import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { logger } from "@tecbunny/core";
import { apiError, apiSuccess } from "@tecbunny/core";
import { rateLimit } from "@tecbunny/core/rate-limit";
import { requireSupabaseServiceEnv } from "@tecbunny/database";
import { AuthService } from "@tecbunny/core/server";

const VERIFY_OTP_IP_LIMIT = { limit: 15, windowMs: 15 * 60 * 1000 };
const VERIFY_OTP_IDENTIFIER_LIMIT = { limit: 10, windowMs: 15 * 60 * 1000 };

function getClientIp(request: NextRequest) {
  return request.headers.get('cf-connecting-ip')?.trim()
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')?.trim()
    || 'unknown';
}

function getSupabaseAdmin(): any {
  const { url, serviceKey } = requireSupabaseServiceEnv();
  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function POST(request: NextRequest) {
  const correlationId = request.headers.get('x-correlation-id');
  try {
    const clientIp = getClientIp(request);
    const ipRl = await rateLimit(`verify_ip:${clientIp}`, VERIFY_OTP_IP_LIMIT.limit, VERIFY_OTP_IP_LIMIT.windowMs);
    if (!ipRl.allowed) {
      return apiError('RATE_LIMITED', { overrideMessage: 'Too many OTP verification attempts. Please try again later.', correlationId });
    }

    let supabaseAdmin: ReturnType<typeof getSupabaseAdmin>;
    try {
      supabaseAdmin = getSupabaseAdmin();
    } catch (configError) {
      logger.error('verify_otp.supabase_config_missing', { correlationId, error: configError instanceof Error ? configError.message : configError });
      return apiError('SERVER_ERROR', { overrideMessage: 'Supabase configuration missing. Please contact support.', correlationId });
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return apiError('VALIDATION_ERROR', { overrideMessage: 'Invalid JSON body', correlationId });
    }

    
    const { email, mobile } = body || {};
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : undefined;
    const normalizedMobile = mobile ? String(mobile).replace(/\D/g, '') : undefined;

    const identifierRateKey = normalizedEmail ? `email:${normalizedEmail}` : normalizedMobile ? `mobile:${normalizedMobile}` : undefined;
    if (identifierRateKey) {
      const idRl = await rateLimit(`verify_id:${identifierRateKey}`, VERIFY_OTP_IDENTIFIER_LIMIT.limit, VERIFY_OTP_IDENTIFIER_LIMIT.windowMs);
      if (!idRl.allowed) {
        return apiError('RATE_LIMITED', { overrideMessage: 'Too many OTP verification attempts for this account. Please try again later.', correlationId });
      }
    }

    const authService = new AuthService(supabaseAdmin);
    const result = await authService.verifyOtp(body);

    if (!result.success) {
      return apiError(result.error.code === 'FORBIDDEN' ? 'FORBIDDEN' : 'VALIDATION_ERROR', { 
        overrideMessage: result.error.message, 
        correlationId,
        details: result.error.details as Record<string, unknown> | undefined
      });
    }

    return apiSuccess(result.data, correlationId);

  } catch (error) {
    logger.error('verify_otp_exception', { correlationId, error: (error as Error).message });
    return apiError('SERVER_ERROR', { overrideMessage: 'Internal server error during verification', correlationId });
  }
}

export const runtime = 'nodejs';
export const maxDuration = 30;
