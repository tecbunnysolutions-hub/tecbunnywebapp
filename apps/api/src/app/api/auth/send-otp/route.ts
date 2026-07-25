import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

import { logger } from "@tecbunny/core";
import { rateLimit } from "@tecbunny/core/rate-limit";
import { requireSupabaseServiceEnv } from "@tecbunny/database";
import { AuthService } from "@tecbunny/core/server";
import { apiFailure, apiSuccess, apiValidationError } from '../../../../lib/api-contract';

const SEND_OTP_IP_LIMIT = { limit: 3, windowMs: 5 * 60 * 1000 };
const SEND_OTP_IDENTIFIER_LIMIT = { limit: 3, windowMs: 5 * 60 * 1000 };

const sendOtpSchema = z.object({
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
  captchaToken: z.string().max(4096).optional(),
}).refine((payload) => Boolean(payload.email || payload.mobile), {
  message: 'Either email or mobile is required',
  path: ['email'],
});

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
  const meta = { requestId: correlationId, version: 'v1' };
  try {
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return apiFailure(400, {
        code: 'VALIDATION_ERROR',
        message: 'Invalid JSON body',
      }, { meta });
    }

    const parsedBody = sendOtpSchema.safeParse(rawBody);
    if (!parsedBody.success) {
      return apiValidationError(parsedBody.error, meta);
    }
    const body = parsedBody.data;
    
    const { email, mobile } = body;
    const normalizedEmail = email;
    const normalizedMobile = mobile;

    const ip = getClientIp(request);
    const ipRl = await rateLimit(`otp_ip:${ip}`, SEND_OTP_IP_LIMIT.limit, SEND_OTP_IP_LIMIT.windowMs);
    if (!ipRl.allowed) {
      return apiFailure(429, {
        code: 'RATE_LIMITED',
        message: 'Too many OTP requests. Please try again later.',
      }, { meta });
    }
    if (normalizedEmail) {
      const emailRl = await rateLimit(`otp_email:${normalizedEmail}`, SEND_OTP_IDENTIFIER_LIMIT.limit, SEND_OTP_IDENTIFIER_LIMIT.windowMs);
      if (!emailRl.allowed) {
        return apiFailure(429, {
          code: 'RATE_LIMITED',
          message: 'Too many OTP requests for this email. Please try again later.',
        }, { meta });
      }
    }
    if (normalizedMobile) {
      const mobileRl = await rateLimit(`otp_mobile:${normalizedMobile}`, SEND_OTP_IDENTIFIER_LIMIT.limit, SEND_OTP_IDENTIFIER_LIMIT.windowMs);
      if (!mobileRl.allowed) {
        return apiFailure(429, {
          code: 'RATE_LIMITED',
          message: 'Too many OTP requests for this mobile number. Please try again later.',
        }, { meta });
      }
    }

    let supabaseAdminClient: any;
    try {
      supabaseAdminClient = getSupabaseAdmin();
    } catch (configError) {
      return apiFailure(503, {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Service configuration error. Please contact support.',
      }, { meta });
    }

    const authService = new AuthService(supabaseAdminClient);
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    
    const result = await authService.requestOtp(body, ip, siteKey);

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
    logger.error('send_otp_unhandled', { correlationId, error: (error as Error).message });
    return apiFailure(500, {
      code: 'INTERNAL_ERROR',
      message: 'Failed to send OTP',
    }, { meta });
  }
}

export const runtime = 'nodejs';
export const maxDuration = 30;
