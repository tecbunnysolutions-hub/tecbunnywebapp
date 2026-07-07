import { createClient } from "@tecbunny/core/supabase/client";
import { NextRequest, NextResponse } from 'next/server';
import { logger } from "@tecbunny/core";
import { apiError, apiSuccess } from "@tecbunny/core";
import { rateLimit } from "@tecbunny/core/rate-limit";
import { PaymentService } from "@tecbunny/core";

interface PaymentUpdateData {
  order_id: string;
  payment_id?: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  amount: number;
  gateway?: string;
  transaction_id?: string;
  failure_reason?: string;
}

// Payment status update with WhatsApp notifications
export async function POST(request: NextRequest) {
  try {
    const correlationId = request.headers.get('x-correlation-id') || null;
    const supabase = await createClient();

    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!rateLimit(clientIP, 'payment_updates', { limit: 10, windowMs: 60000 })) {
      return apiError('RATE_LIMITED', { correlationId });
    }

    const body: PaymentUpdateData = await request.json();
    const { 
      order_id, 
      payment_id, 
      status, 
      amount, 
      gateway = 'unknown',
      transaction_id,
      failure_reason 
    } = body;

    // Validate required fields
    if (!order_id || !status || !amount) {
      return apiError('VALIDATION_ERROR', { 
        correlationId, 
        overrideMessage: 'order_id, status, and amount are required' 
      });
    }

    logger.info('payment_update_attempt', {
      order_id,
      payment_id,
      status,
      amount,
      correlationId
    });

    const paymentService = new PaymentService(supabase);

    try {
      const result = await paymentService.updatePaymentStatus({
        orderId: order_id,
        paymentId: payment_id,
        status,
        amount,
        gateway,
        transactionId: transaction_id,
        failureReason: failure_reason,
        correlationId: correlationId || 'missing-correlation-id'
      });

      return apiSuccess({
        order_id: result.orderId,
        payment_status: result.paymentStatus,
        order_status: result.orderStatus,
        amount: result.amount,
        updated_at: result.updatedAt
      }, correlationId);
    } catch (e: any) {
      if (e.message === 'Order not found') {
        return apiError('NOT_FOUND', { correlationId, overrideMessage: 'Order not found' });
      }
      return apiError('DATABASE_ERROR', { correlationId });
    }

  } catch (error) {
    const correlationId = request.headers.get('x-correlation-id') || null;
    logger.error('payment_update_error', { error, correlationId });
    return apiError('INTERNAL_ERROR', { correlationId });
  }
}

// Get payment status for an order
export async function GET(request: NextRequest) {
  try {
    const correlationId = request.headers.get('x-correlation-id') || null;
    const { searchParams } = new URL(request.url);
    const order_id = searchParams.get('order_id');

    if (!order_id) {
      return apiError('VALIDATION_ERROR', { 
        correlationId, 
        overrideMessage: 'order_id parameter is required' 
      });
    }

    const supabase = await createClient();
    const paymentService = new PaymentService(supabase);
    
    try {
      const order = await paymentService.getPaymentStatus(order_id);
      return apiSuccess({
        order_id: order.id,
        status: order.status,
        total: order.total,
        created_at: order.created_at,
        updated_at: order.updated_at
      }, correlationId);
    } catch (e: any) {
      if (e.message === 'Order not found') {
        return NextResponse.json({
          success: false,
          error: 'Order not found',
          order: null
        }, { status: 404 });
      }
      return apiError('DATABASE_ERROR', { correlationId });
    }

  } catch (error) {
    const correlationId = request.headers.get('x-correlation-id') || null;
    logger.error('payment_status_lookup_error', { error, correlationId });
    return apiError('INTERNAL_ERROR', { correlationId });
  }
}
