import { isSupabaseServiceConfigured } from "@tecbunny/database/admin";
import { NextRequest, NextResponse } from 'next/server';

import { logStaffActivity } from "@tecbunny/core/enterprise-analytics";
import { logger } from "@tecbunny/core/logger";
import { AdminAuthError, requireAdminContext } from "@tecbunny/core/auth/admin-guard";

import { formatOrderNumber } from "@tecbunny/core/order-utils";

// Disable caching for this route
// export const dynamic = 'force-dynamic';
export const revalidate = 0;

const TOTAL_FIELDS = ['total'] as const;

function coerceCurrency(order: Record<string, unknown>): number {
  for (const field of TOTAL_FIELDS) {
    const value = order[field];
    if (value === null || value === undefined) continue;
    const numeric = typeof value === 'number' ? value : parseFloat(String(value));
    if (!Number.isNaN(numeric)) {
      return numeric;
    }
  }
  return 0;
}

function percentageChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function statusBucket(status: unknown) {
  const normalized = String(status ?? 'Unknown').trim() || 'Unknown';
  return normalized;
}

export async function GET(request: NextRequest) {
  if (!isSupabaseServiceConfigured) {
    logger.warn('admin_dashboard.misconfigured_supabase');
  }

  try {
    const { serviceSupabase, user, role } = await requireAdminContext();

    logger.info('admin_dashboard.fetch_start', { userId: user.id, role });

    // Fetch users count from profiles (fast, avoids admin pagination)
    let totalUserCount = 0;
    const { count: usersCount, error: usersCountError } = await serviceSupabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (usersCountError) {
      logger.warn('admin_dashboard.users_count_error', { error: usersCountError.message, code: usersCountError.code });
    } else {
      totalUserCount = usersCount ?? 0;
    }

    // Fetch product count
    let productCount = 0;
    const { count: productCountRaw, error: productsError } = await serviceSupabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (productsError) {
      logger.warn('admin_dashboard.products_count_error', { error: productsError.message, code: productsError.code });
    } else {
      productCount = productCountRaw ?? 0;
    }

    const url = new URL(request.url);
    const rangeParam = url.searchParams.get('range') || 'month';
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const fallbackStart = rangeParam === 'week'
      ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      : rangeParam === 'quarter'
        ? new Date(currentYear, Math.floor(currentMonth / 3) * 3, 1)
        : rangeParam === 'year'
          ? new Date(currentYear, 0, 1)
          : new Date(currentYear, currentMonth, 1);
    const startOfRange = url.searchParams.get('from') ? new Date(String(url.searchParams.get('from'))) : fallbackStart;
    const endOfRange = url.searchParams.get('to') ? new Date(String(url.searchParams.get('to'))) : now;
    endOfRange.setHours(23, 59, 59, 999);
    const rangeMs = Math.max(1, endOfRange.getTime() - startOfRange.getTime());
    const previousStart = new Date(startOfRange.getTime() - rangeMs);

    // Fetch total orders count
    let totalOrders = 0;
    const { count: totalOrdersRaw, error: ordersCountError } = await serviceSupabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (ordersCountError) {
      logger.warn('admin_dashboard.orders_count_error', { error: ordersCountError.message, code: ordersCountError.code });
    } else {
      totalOrders = totalOrdersRaw ?? 0;
    }

    // Fetch selected-range orders (for count + revenue + chart data)
    let monthlyOrdersCount = 0;
    let monthlyOrdersData: Array<Record<string, unknown>> = [];
    const { data: monthlyOrdersDataRaw, count: monthlyOrdersCountRaw, error: monthlyOrdersError } = await serviceSupabase
      .from('orders')
      .select('id, total, created_at, status, payment_status, type, customer_id', { count: 'exact' })
      .gte('created_at', startOfRange.toISOString())
      .lte('created_at', endOfRange.toISOString())
      .neq('status', 'cancelled');

    if (monthlyOrdersError) {
      logger.warn('admin_dashboard.monthly_orders_error', { error: monthlyOrdersError.message, code: monthlyOrdersError.code });
    } else {
      monthlyOrdersCount = monthlyOrdersCountRaw ?? 0;
      monthlyOrdersData = (monthlyOrdersDataRaw as Array<Record<string, unknown>>) ?? [];
    }

    const monthlyRevenue = (monthlyOrdersData ?? []).reduce((total, order) => total + coerceCurrency(order), 0);

    // Fetch previous period order count (no need to fetch all rows)
    let lastMonthOrdersCount = 0;
    const { count: lastMonthOrdersCountRaw, error: lastMonthOrdersError } = await serviceSupabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', previousStart.toISOString())
      .lt('created_at', startOfRange.toISOString())
      .neq('status', 'cancelled');

    if (lastMonthOrdersError) {
      logger.warn('admin_dashboard.last_month_orders_error', { error: lastMonthOrdersError.message, code: lastMonthOrdersError.code });
    } else {
      lastMonthOrdersCount = lastMonthOrdersCountRaw ?? 0;
    }

    // Fetch recent activity (last 5 orders only)
    let recentOrders: Array<Record<string, unknown>> = [];
    const { data: recentOrdersRaw, error: recentOrdersError } = await serviceSupabase
      .from('orders')
      .select('id, total, created_at, status')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentOrdersError) {
      logger.warn('admin_dashboard.recent_orders_error', { error: recentOrdersError.message, code: recentOrdersError.code });
    } else {
      recentOrders = (recentOrdersRaw as Array<Record<string, unknown>>) ?? [];
    }

    const recentActivity = (recentOrders ?? []).map(order => ({
      id: String(order.id ?? ''),
      type: 'order',
      description: `Order #${formatOrderNumber(String(order.id ?? ''))} - ₹${coerceCurrency(order).toLocaleString('en-IN')}`,
      date: String(order.created_at ?? ''),
      status: String(order.status ?? '')
    }));

    const statusCounts = monthlyOrdersData.reduce((acc, order) => {
      const key = statusBucket(order.status);
      acc[key] = Number(acc[key] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const paymentCounts = monthlyOrdersData.reduce((acc, order) => {
      const key = statusBucket(order.payment_status);
      acc[key] = Number(acc[key] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeCounts = monthlyOrdersData.reduce((acc, order) => {
      const key = statusBucket(order.type);
      acc[key] = Number(acc[key] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const revenueByDay = monthlyOrdersData.reduce((acc, order) => {
      const day = String(order.created_at ?? '').slice(0, 10) || 'unknown';
      acc[day] = Number(acc[day] ?? 0) + coerceCurrency(order);
      return acc;
    }, {} as Record<string, number>);

    let recentCustomers: Array<Record<string, unknown>> = [];
    const { data: recentCustomersRaw, error: recentCustomersError } = await serviceSupabase
      .from('profiles')
      .select('id, name, email, mobile, role, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentCustomersError) {
      logger.warn('admin_dashboard.recent_customers_error', { error: recentCustomersError.message, code: recentCustomersError.code });
    } else {
      recentCustomers = (recentCustomersRaw as Array<Record<string, unknown>>) ?? [];
    }

    const pendingTasks = [
      { label: 'Awaiting payment', count: Number(paymentCounts.Pending ?? paymentCounts['Awaiting Payment'] ?? 0), href: '/mgmt/admin/orders?paymentStatus=Pending' },
      { label: 'Pending orders', count: Number(statusCounts.Pending ?? 0), href: '/mgmt/admin/orders?status=Pending' },
      { label: 'Ready to ship', count: Number(statusCounts['Ready to Ship'] ?? statusCounts.Processing ?? 0), href: '/mgmt/admin/orders?status=Ready%20to%20Ship' },
    ];

    const systemHealth = {
      api: 'operational',
      database: isSupabaseServiceConfigured ? 'service-configured' : 'client-fallback',
      analytics: 'enabled',
      lastRefreshedAt: now.toISOString(),
    };

    const aiInsights = [
      monthlyOrdersCount === 0
        ? 'No order activity in the selected range. Review acquisition channels and pending quote follow-ups.'
        : `Selected range generated ${monthlyOrdersCount} orders and ₹${monthlyRevenue.toLocaleString('en-IN')} revenue.`,
      percentageChange(monthlyOrdersCount, lastMonthOrdersCount) >= 0
        ? 'Order volume is trending upward versus the previous comparable period.'
        : 'Order volume is below the previous comparable period; inspect cancelled and pending payment queues.',
    ];

    const stats = {
      totalUsers: totalUserCount ?? 0,
      totalProducts: productCount ?? 0,
      totalOrders: totalOrders ?? 0,
      monthlyRevenue,
      monthlyOrders: monthlyOrdersCount ?? 0,
      lastMonthOrders: lastMonthOrdersCount ?? 0,
      orderGrowthPercent: percentageChange(monthlyOrdersCount, lastMonthOrdersCount),
      recentActivity,
      recentCustomers,
      orderStatistics: { byStatus: statusCounts, byType: typeCounts, byPaymentStatus: paymentCounts },
      customerStatistics: { totalCustomers: totalUserCount, recentCustomers: recentCustomers.length },
      inventoryStatistics: { totalProducts: productCount, lowStock: 0, allocationRisk: productCount === 0 ? 'unknown' : 'normal' },
      salesStatistics: { selectedRangeOrders: monthlyOrdersCount, averageOrderValue: monthlyOrdersCount > 0 ? monthlyRevenue / monthlyOrdersCount : 0 },
      financialSummary: { selectedRangeRevenue: monthlyRevenue, currency: 'INR', previousPeriodOrders: lastMonthOrdersCount },
      staffPerformance: { activeUsers: totalUserCount, pendingTasks: pendingTasks.reduce((sum, task) => sum + task.count, 0) },
      engineerPerformance: { openServiceOrders: statusCounts.Service ?? 0, pendingDispatch: statusCounts['Ready for Delivery'] ?? 0 },
      marketingPerformance: { recentCustomers: recentCustomers.length, conversionSignal: monthlyOrdersCount > 0 ? 'active' : 'needs-attention' },
      pendingTasks,
      upcomingActivities: pendingTasks.filter((task) => task.count > 0),
      notifications: pendingTasks.filter((task) => task.count > 0).map((task) => `${task.count} ${task.label.toLowerCase()}`),
      quickActions: [
        { label: 'Create order', href: '/mgmt/sales/orders?action=new' },
        { label: 'Review orders', href: '/mgmt/admin/orders' },
        { label: 'Open CRM', href: '/mgmt/crm' },
        { label: 'View reports', href: '/mgmt/reports' },
      ],
      charts: {
        revenueByDay: Object.entries(revenueByDay).map(([date, value]) => ({ date, value })),
        ordersByStatus: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
        ordersByType: Object.entries(typeCounts).map(([type, count]) => ({ type, count })),
      },
      systemHealth,
      aiInsights,
      liveActivityFeed: recentActivity,
      range: { key: rangeParam, from: startOfRange.toISOString(), to: endOfRange.toISOString() },
    };

    void logStaffActivity({
      application: 'mgmt',
      module: 'dashboard',
      screen: '/api/admin/dashboard',
      action: 'dashboard_viewed',
      description: 'Loaded enterprise management dashboard metrics',
      context: { userId: user.id, userEmail: user.email, role },
      apiEndpoint: '/api/admin/dashboard',
      httpMethod: 'GET',
      success: true,
      metadata: { range: stats.range, monthlyOrders: stats.monthlyOrders, monthlyRevenue: stats.monthlyRevenue },
    });

    logger.info('admin_dashboard.fetch_success', { stats });

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    let message = error instanceof Error ? error.message : String(error);
    if (message === '[object Object]' && error && typeof error === 'object') {
      const maybeMessage = (error as { message?: string }).message;
      if (typeof maybeMessage === 'string' && maybeMessage) {
        message = maybeMessage;
      } else {
        try {
          message = JSON.stringify(error);
        } catch {
          message = 'Failed to fetch dashboard statistics';
        }
      }
    }

    logger.error('admin_dashboard.unhandled_error', {
      error: message
    });

    return NextResponse.json(
      { error: message || 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
