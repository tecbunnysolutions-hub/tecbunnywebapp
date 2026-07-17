import { NextRequest } from 'next/server';
import { createSupabaseServiceClient } from '@tecbunny/core/server';
import { getSessionWithRole } from '@tecbunny/core/auth/server-role';
import { isAtLeast } from '@tecbunny/core/roles';
import { logger } from '@tecbunny/core';
import { apiError, apiSuccess } from '@tecbunny/core';
import { z } from 'zod';

const QuerySchema = z.object({
  from: z.string().datetime({ offset: true }).optional(),
  to:   z.string().datetime({ offset: true }).optional(),
  type: z.enum(['gst', 'payment_reconciliation', 'sales_summary']).default('sales_summary'),
});

/**
 * GET /api/analytics/reports
 * Generates business reports for Accounts / Admin roles.
 *
 * ?type=gst             → GST summary (CGST/SGST/IGST breakdown)
 * ?type=payment_reconciliation → Paid vs pending vs failed
 * ?type=sales_summary   → Revenue by period
 */
export async function GET(request: NextRequest) {
  const correlationId = request.headers.get('x-correlation-id') || undefined;

  try {
    const { session, role } = await getSessionWithRole(request as any);
    if (!session) return apiError('UNAUTHORIZED', { correlationId });
    if (!isAtLeast(role!, 'accounts') && !isAtLeast(role!, 'admin')) {
      return apiError('FORBIDDEN', { correlationId });
    }

    const { searchParams } = new URL(request.url);
    const parsed = QuerySchema.safeParse({
      from: searchParams.get('from') || undefined,
      to:   searchParams.get('to')   || undefined,
      type: searchParams.get('type') || 'sales_summary',
    });

    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', {
        correlationId,
        overrideMessage: parsed.error.issues.map(i => i.message).join(', '),
      });
    }

    const { from, to, type } = parsed.data;
    const supabase = createSupabaseServiceClient();

    // Default to current calendar month if no range provided
    const now = new Date();
    const startDate = from ?? new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endDate   = to   ?? new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

    let query = supabase
      .from('orders')
      .select(
        'id, total, gst_amount, subtotal, discount_amount, payment_status, payment_method, status, created_at, customer_state, items'
      )
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .not('status', 'eq', 'Cancelled');

    const { data: orders, error } = await query;
    if (error) {
      logger.error('reports.query_failed', { error: error.message, correlationId });
      return apiError('INTERNAL_ERROR', { correlationId });
    }

    const rows = orders || [];

    if (type === 'sales_summary') {
      const totalRevenue = rows.reduce((s: number, o: any) => s + (o.total || 0), 0);
      const totalOrders  = rows.length;
      const paidOrders   = rows.filter((o: any) => o.payment_status === 'Paid').length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Group by day
      const byDay: Record<string, { revenue: number; orders: number }> = {};
      for (const o of rows) {
        const day = (o.created_at as string).substring(0, 10);
        if (!byDay[day]) byDay[day] = { revenue: 0, orders: 0 };
        byDay[day].revenue += o.total || 0;
        byDay[day].orders  += 1;
      }

      const dailyBreakdown = Object.entries(byDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, d]) => ({ date, ...d }));

      return apiSuccess({
        type,
        period: { from: startDate, to: endDate },
        summary: { totalRevenue, totalOrders, paidOrders, avgOrderValue },
        dailyBreakdown,
      }, correlationId);
    }

    if (type === 'gst') {
      // Derive CGST/SGST/IGST from items JSON stored in each order
      let totalGst = 0;
      let totalCgst = 0;
      let totalSgst = 0;
      let totalIgst = 0;
      const byHsn: Record<string, { gst_rate: number; taxable: number; gst: number; count: number }> = {};

      for (const o of rows) {
        let cartItems: any[] = [];
        try { cartItems = typeof o.items === 'string' ? JSON.parse(o.items) : (o.items?.cart_items || []); } catch {}

        for (const item of cartItems) {
          const gstAmt    = item.gstAmount || 0;
          const cgst      = item.cgst || gstAmt / 2;
          const sgst      = item.sgst || gstAmt / 2;
          const igst      = item.igst || 0;
          const hsn       = item.hsnCode || item.sacCode || 'UNKNOWN';
          const taxable   = item.taxableBase || item.total_price || 0;

          totalGst  += gstAmt;
          totalCgst += cgst;
          totalSgst += sgst;
          totalIgst += igst;

          if (!byHsn[hsn]) byHsn[hsn] = { gst_rate: item.gstRate || 18, taxable: 0, gst: 0, count: 0 };
          byHsn[hsn].taxable += taxable;
          byHsn[hsn].gst     += gstAmt;
          byHsn[hsn].count   += item.quantity || 1;
        }
      }

      const hsnBreakdown = Object.entries(byHsn)
        .sort(([, a], [, b]) => b.gst - a.gst)
        .map(([hsn, d]) => ({ hsn, ...d }));

      return apiSuccess({
        type,
        period: { from: startDate, to: endDate },
        summary: { totalGst, totalCgst, totalSgst, totalIgst, totalOrders: rows.length },
        hsnBreakdown,
      }, correlationId);
    }

    if (type === 'payment_reconciliation') {
      const paid      = rows.filter((o: any) => o.payment_status === 'Paid');
      const pending   = rows.filter((o: any) => o.payment_status === 'Pending');
      const failed    = rows.filter((o: any) => o.payment_status === 'Failed');

      const sum = (arr: any[]) => arr.reduce((s, o) => s + (o.total || 0), 0);

      const byMethod: Record<string, { count: number; total: number }> = {};
      for (const o of rows) {
        const m = (o.payment_method as string) || 'Unknown';
        if (!byMethod[m]) byMethod[m] = { count: 0, total: 0 };
        byMethod[m].count += 1;
        byMethod[m].total += o.total || 0;
      }

      return apiSuccess({
        type,
        period: { from: startDate, to: endDate },
        summary: {
          totalOrders: rows.length,
          paidAmount: sum(paid),
          paidCount: paid.length,
          pendingAmount: sum(pending),
          pendingCount: pending.length,
          failedAmount: sum(failed),
          failedCount: failed.length,
        },
        byPaymentMethod: Object.entries(byMethod).map(([method, d]) => ({ method, ...d })),
      }, correlationId);
    }

    return apiError('VALIDATION_ERROR', { correlationId, overrideMessage: 'Unknown report type' });

  } catch (err: any) {
    logger.error('reports.uncaught', { error: err.message });
    return apiError('INTERNAL_ERROR', { correlationId });
  }
}
