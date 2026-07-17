import { createClient as createServerClient } from '@tecbunny/database';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from "@tecbunny/core/rate-limit";
import { getEffectiveUserRole } from "@tecbunny/core/auth/server-role";
import { apiError, apiSuccess } from "@tecbunny/core";
import { logger } from "@tecbunny/core";
import { requireSupabaseServiceEnv } from "@tecbunny/database";
import { PaymentService } from "@tecbunny/core/server";

let supabaseAdmin: any = null;

function getSupabaseAdmin(): any {
  if (!supabaseAdmin) {
    const { url, serviceKey } = requireSupabaseServiceEnv();
    supabaseAdmin = createClient(url, serviceKey);
  }
  return supabaseAdmin;
}

const LIMIT = 5;
const WINDOW_MS = 60 * 1000;
const STAFF_PAYMENT_ROLES = new Set(['admin', 'manager', 'accounts', 'superadmin']);

export async function POST(request: NextRequest) {
  const correlationId = request.headers.get('x-correlation-id') || crypto.randomUUID();

  try {
    const supabase = getSupabaseAdmin();

    const { orderId } = await request.json().catch(() => ({}));

    if (!orderId || typeof orderId !== 'string') {
      return apiError('VALIDATION_ERROR', {
        correlationId,
        overrideMessage: 'Missing or invalid orderId',
      });
    }

    let userId: string | null = null;
    let userRole: string | null = null;
    try {
      const serverClient = await createServerClient();
      const { data, error } = await serverClient.auth.getUser();
      if (error || !data.user) {
        return apiError('UNAUTHORIZED', {
          correlationId,
          overrideMessage: 'Authentication required to initiate payment',
        });
      }
      userId = data.user.id;
      userRole = await getEffectiveUserRole(data.user);
    } catch (error) {
      logger.debug('payu_init.user_lookup_failed', { error: error instanceof Error ? error.message : String(error), correlationId });
      return apiError('UNAUTHORIZED', {
        correlationId,
        overrideMessage: 'Authentication required to initiate payment',
      });
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateKey = userId ? `user:${userId}` : `ip:${ip}`;

    // Use async rate limiter so Redis is used when available (shared across all instances)
    const rateLimitResult = await rateLimit(rateKey, LIMIT, WINDOW_MS);
    if (!rateLimitResult.allowed) {
      logger.warn('payu_init.rate_limited', { rateKey, correlationId });
      return apiError('RATE_LIMITED', { correlationId });
    }

    const paymentService = new PaymentService(supabase);
    const host = request.headers.get('host') || undefined;

    try {
      const result = await paymentService.initiatePayuPayment({
        orderId,
        userId,
        userRole,
        clientIp: ip,
        host,
        correlationId,
        staffPaymentRoles: STAFF_PAYMENT_ROLES
      });

      const response = apiSuccess(result, correlationId);
      response.headers.set('Cache-Control', 'no-store');
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('Referrer-Policy', 'same-origin');
      response.headers.set('Permissions-Policy', 'payment=()');

      return response;
    } catch (e: any) {
      if (e.message === 'Order not found') {
        return apiError('NOT_FOUND', { correlationId, overrideMessage: 'Order not found' });
      }
      if (e.message === 'You are not allowed to initiate payment for this order') {
        return apiError('FORBIDDEN', { correlationId, overrideMessage: e.message });
      }
      return apiError('VALIDATION_ERROR', { correlationId, overrideMessage: e.message });
    }

  } catch (error) {
    logger.error('payu_init.unhandled', {
      correlationId,
      error: error instanceof Error ? error.message : 'unknown',
    });
    return apiError('INTERNAL_ERROR', {
      correlationId,
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
  }
}
