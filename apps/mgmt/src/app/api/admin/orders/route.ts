import { createServiceClient, isSupabaseServiceConfigured } from "@tecbunny/database/admin";
import { NextRequest, NextResponse } from 'next/server';

import { logStaffActivity } from "@tecbunny/core/enterprise-analytics";
import { getSessionWithRole } from "@tecbunny/core/auth/server-role";

import { logger } from "@tecbunny/core/logger";
import { deserializeOrder } from "@tecbunny/core/orders/normalizers";

const ADMIN_ROLES = new Set(['admin', 'manager', 'superadmin']);
const MIN_LIMIT = 10;
const MAX_LIMIT = 100;
const SORT_COLUMNS = new Set(['created_at', 'updated_at', 'total', 'status', 'payment_status']);

// export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { supabase: authClient, session, role } = await getSessionWithRole(request);

    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!role || !ADMIN_ROLES.has(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = role && ADMIN_ROLES.has(role) && isSupabaseServiceConfigured
      ? createServiceClient()
      : authClient;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10));
    const limitParam = Number.parseInt(searchParams.get('limit') ?? '20', 10);
    const limit = Number.isFinite(limitParam)
      ? Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, limitParam))
      : 20;
    const offset = (page - 1) * limit;
    const typeFilter = searchParams.get('type');
    const statusFilter = searchParams.get('status');
    const paymentStatusFilter = searchParams.get('paymentStatus');
    const searchTerm = searchParams.get('search');
    const dateFrom = searchParams.get('from');
    const dateTo = searchParams.get('to');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortDirection = searchParams.get('sortDirection') === 'asc' ? 'asc' : 'desc';
    const exportFormat = searchParams.get('export');

    let query = supabase
      .from('orders')
      .select(
        [
          'id',
          'customer_id',
          'customer_name',
          'customer_email',
          'customer_phone',
          'status',
          'type',
          'subtotal',
          'gst_amount',
          'discount_amount',
          'shipping_amount',
          'total',
          'delivery_address',
          'notes',
          'payment_method',
          'payment_status',
          'payment_reference',
          'items',
          'created_at',
          'updated_at'
        ].join(', '),
        { count: 'exact' }
      )
      .order(SORT_COLUMNS.has(sortBy) ? sortBy : 'created_at', { ascending: sortDirection === 'asc' })
      .range(offset, offset + limit - 1);

    if (typeFilter && typeFilter !== 'all') {
      query = query.eq('type', typeFilter);
    }

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    if (paymentStatusFilter && paymentStatusFilter !== 'all') {
      query = query.eq('payment_status', paymentStatusFilter);
    }

    if (dateFrom) {
      query = query.gte('created_at', new Date(dateFrom).toISOString());
    }

    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      query = query.lte('created_at', endDate.toISOString());
    }

    if (searchTerm) {
      const normalized = `%${searchTerm}%`;
      query = query.or(
        `customer_name.ilike.${normalized},customer_email.ilike.${normalized},customer_phone.ilike.${normalized}`
      );
    }

    const { data, error, count } = await query;

    if (error) {
      logger.error('admin_orders.fetch_failed', { code: error.code, message: error.message });
      return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 });
    }

    const orders = (data ?? []).map(deserializeOrder);
    const total = count ?? orders.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const analytics = orders.reduce((summary, order) => {
      summary.loadedRevenue += Number(order.total ?? 0);
      summary.byStatus[order.status] = (summary.byStatus[order.status] ?? 0) + 1;
      summary.byPaymentStatus[order.payment_status || 'Unknown'] = (summary.byPaymentStatus[order.payment_status || 'Unknown'] ?? 0) + 1;
      return summary;
    }, { loadedRevenue: 0, byStatus: {} as Record<string, number>, byPaymentStatus: {} as Record<string, number> });

    if (exportFormat) {
      void logStaffActivity({
        application: 'mgmt',
        module: 'orders',
        screen: '/api/admin/orders',
        action: 'order_exported',
        description: `Exported ${orders.length} loaded orders as ${exportFormat}`,
        context: { userId: session.user.id, userEmail: session.user.email, role },
        apiEndpoint: '/api/admin/orders',
        httpMethod: 'GET',
        success: true,
        metadata: { exportFormat, filters: Object.fromEntries(searchParams.entries()), total },
      });
    }

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
      analytics,
      filters: {
        type: typeFilter ?? 'all',
        status: statusFilter ?? 'all',
        paymentStatus: paymentStatusFilter ?? 'all',
        search: searchTerm ?? '',
        from: dateFrom,
        to: dateTo,
        sortBy: SORT_COLUMNS.has(sortBy) ? sortBy : 'created_at',
        sortDirection,
      },
    });
  } catch (error) {
    logger.error('admin_orders.unexpected_error', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
