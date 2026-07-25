import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

import { logger } from "@tecbunny/core";
import { rateLimit } from "@tecbunny/core/rate-limit";
import { requireSupabaseServiceEnv } from "@tecbunny/database";
import { AuthService } from "@tecbunny/core/server";
import { apiFailure, apiSuccess, apiValidationError } from '../../../../lib/api-contract';

const VERIFY_OTP_IP_LIMIT = { limit: 15, windowMs: 15 * 60 * 1000 };
const VERIFY_OTP_IDENTIFIER_LIMIT = { limit: 10, windowMs: 15 * 60 * 1000 };

const verifyOtpSchema = z.object({
  otp: z.string().trim().min(4).max(10),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email()
    .max(254)
    .optional(),
  mobile: z
    .string()
    .regex(/^[0-9+\-()\s]{8,20}$/)
    .transform((value) => value.replace(/\D/g, ''))
    .optional(),
  flow: z.enum(['signup', 'login', 'password_reset']).optional(),
  purpose: z.enum(['signup', 'login', 'password_reset']).optional(),
}).refine((payload) => Boolean(payload.email || payload.mobile), {
  message: 'Either email or mobile is required',
  path: ['email'],
});

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
  const meta = { requestId: correlationId, version: 'v1' };
  try {
    const clientIp = getClientIp(request);
    const ipRl = await rateLimit(`verify_ip:${clientIp}`, VERIFY_OTP_IP_LIMIT.limit, VERIFY_OTP_IP_LIMIT.windowMs);
    if (!ipRl.allowed) {
      return apiFailure(429, {
        code: 'RATE_LIMITED',
        message: 'Too many OTP verification attempts. Please try again later.',
      }, { meta });
    }

    let supabaseAdmin: ReturnType<typeof getSupabaseAdmin>;
    try {
      supabaseAdmin = getSupabaseAdmin();
    } catch (configError) {
      logger.error('verify_otp.supabase_config_missing', { correlationId, error: configError instanceof Error ? configError.message : configError });
      return apiFailure(503, {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Supabase configuration missing. Please contact support.',
      }, { meta });
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return apiFailure(400, {
        code: 'VALIDATION_ERROR',
        message: 'Invalid JSON body',
      }, { meta });
    }

    const parsedBody = verifyOtpSchema.safeParse(rawBody);
    if (!parsedBody.success) {
      return apiValidationError(parsedBody.error, meta);
    }
    const body = parsedBody.data;

    
    const { email, mobile } = body;
    const normalizedEmail = email;
    const normalizedMobile = mobile;

    const identifierRateKey = normalizedEmail ? `email:${normalizedEmail}` : normalizedMobile ? `mobile:${normalizedMobile}` : undefined;
    if (identifierRateKey) {
      const idRl = await rateLimit(`verify_id:${identifierRateKey}`, VERIFY_OTP_IDENTIFIER_LIMIT.limit, VERIFY_OTP_IDENTIFIER_LIMIT.windowMs);
      if (!idRl.allowed) {
        return apiFailure(429, {
          code: 'RATE_LIMITED',
          message: 'Too many OTP verification attempts for this account. Please try again later.',
        }, { meta });
      }
    }

    const authService = new AuthService(supabaseAdmin);
    const result = await authService.verifyOtp(body);

    if (!result.success) {
      const code = result.error.code === 'FORBIDDEN' ? 'FORBIDDEN' : 'VALIDATION_ERROR';
      const status = code === 'FORBIDDEN' ? 403 : 400;
      return apiFailure(status, {
        code,
        message: result.error.message,
        details: result.error.details as Record<string, unknown> | undefined,
      }, {
        meta,
      });
    }

    return apiSuccess(result.data, { meta });

  } catch (error) {
    logger.error('verify_otp_exception', { correlationId, error: (error as Error).message });
    return apiFailure(500, {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error during verification',
    }, { meta });
  }
}

export const runtime = 'nodejs';
export const maxDuration = 30;
