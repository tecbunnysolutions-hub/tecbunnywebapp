import { NextRequest, NextResponse } from 'next/server';
import { apiError, apiSuccess } from "@tecbunny/core";
import { logger } from "@tecbunny/core";
import { rateLimit } from "@tecbunny/core/rate-limit";
import { verifySuperadminSessionToken } from "@tecbunny/core/server";
import { BaseSupabaseClient, SupabaseOrderRepository, NotificationServiceImpl } from "@tecbunny/infra";
import { OrderService } from "@tecbunny/domain";
import { createClient as createServerClient } from "@tecbunny/core/supabase/server";

const RATE_LIMIT = 5; // 5 orders
const RATE_WINDOW_MS = 60 * 1000; // per minute

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

function getServiceBaseClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase is not configured for service usage');
  }
  return new BaseSupabaseClient({
    url: SUPABASE_URL,
    key: SUPABASE_SERVICE_ROLE_KEY,
  });
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ orders: [] });
    }

    const baseClient = getServiceBaseClient();
    const orderRepo = new SupabaseOrderRepository(baseClient);
    const notificationService = new NotificationServiceImpl();
    const orderService = new OrderService(orderRepo, notificationService);

    const orders = await orderService.getCustomerOrders(user.id, user.email, user.user_metadata?.mobile);
    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    logger.error('uncaught_error_in_customer_orders_api', { error: error.message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const correlationId = request.headers.get('x-correlation-id') || null;

  try {
    // Check superadmin session cookie first to block order placements
    const superadminCookie = request.cookies.get('superadmin-session')?.value;
    if (await verifySuperadminSessionToken(superadminCookie)) {
      return apiError('FORBIDDEN', {
        correlationId,
        overrideMessage: '403 Forbidden - System Configuration Accounts Cannot Place Orders.'
      });
    }

    let user = null;
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    const supabase = await createServerClient();
    if (bearerToken) {
      const { data: { user: tokenUser } } = await supabase.auth.getUser(bearerToken);
      user = tokenUser;
    } else {
      const { data: { user: cookieUser } } = await supabase.auth.getUser();
      user = cookieUser;
    }

    const effectiveUserId = user?.id ?? null;

    const rateLimitKey = effectiveUserId || `guest:${request.headers.get('x-forwarded-for') || 'unknown'}:${request.headers.get('x-real-ip') || 'unknown'}`;
    const limitCheck = await rateLimit(rateLimitKey, RATE_LIMIT, RATE_WINDOW_MS);
    if (!limitCheck.allowed) {
      logger.warn('orders_rate_limited', { userId: effectiveUserId, rateLimitKey });
      return apiError('RATE_LIMITED', { correlationId });
    }

    const orderData = await request.json();

    const baseClient = getServiceBaseClient();
    const orderRepo = new SupabaseOrderRepository(baseClient);
    const notificationService = new NotificationServiceImpl();
    const orderService = new OrderService(orderRepo, notificationService);

    const fullOrder = await orderService.createOrder({
      effectiveUserId,
      correlationId,
      orderData
    });

    return apiSuccess({ order: fullOrder }, correlationId);

  } catch (error) {
    const isValidationError = error instanceof Error && (
      error.message.includes('stock') || 
      error.message.includes('invalid') || 
      error.message.includes('available') ||
      error.message.includes('Product') ||
      error.message.includes('Missing required')
    );

    if (isValidationError) {
      logger.warn('order_api_validation_error', { error: (error as Error).message });
      return apiError('VALIDATION_ERROR', { correlationId, overrideMessage: (error as Error).message });
    }

    logger.error('order_api_uncaught', { error: error instanceof Error ? error.message : 'unknown' });
    return apiError('INTERNAL_ERROR', { correlationId, details: { error: error instanceof Error ? error.message : 'Unknown error' } });
  }
}
