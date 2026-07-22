import os from 'node:os';

import { redisPing } from '@tecbunny/core/redis';
import { createSupabaseServiceClient } from '@tecbunny/database/admin';

type SupabaseClientLike = ReturnType<typeof createSupabaseServiceClient>;

export type DashboardSeverity = 'critical' | 'high' | 'medium' | 'low' | 'ok';

export type DashboardMetric = {
  key: string;
  label: string;
  value: number | string;
  displayValue: string;
  category: 'executive' | 'business' | 'realtime' | 'system' | 'analytics';
  severity: DashboardSeverity;
  source: string;
  trend?: string;
  href?: string;
};

export type DashboardActivity = {
  id: string;
  label: string;
  detail: string;
  timestamp: string;
  source: string;
  href?: string;
};

export type DashboardIssue = {
  module: string;
  severity: DashboardSeverity;
  businessImpact: string;
  rootCause: string;
  filesAffected: string[];
  recommendedSolution: string;
  implementationSteps: string[];
  alertKey?: string;
  acknowledged?: boolean;
  acknowledgedBy?: string;
};

export type DashboardInsight = {
  title: string;
  detail: string;
  severity: DashboardSeverity;
  action: string;
};

export type DashboardSeriesPoint = {
  label: string;
  value: number;
};

export type SuperadminCommandCenterData = {
  generatedAt: string;
  healthScore: number;
  readinessPercent: number;
  executiveMetrics: DashboardMetric[];
  businessMetrics: DashboardMetric[];
  realtimeMetrics: DashboardMetric[];
  systemMetrics: DashboardMetric[];
  analyticsMetrics: DashboardMetric[];
  recentActivity: DashboardActivity[];
  staffActivity: DashboardActivity[];
  auditLogs: DashboardActivity[];
  notifications: DashboardIssue[];
  aiInsights: DashboardInsight[];
  revenueTrend: DashboardSeriesPoint[];
  orderTrend: DashboardSeriesPoint[];
  topProducts: DashboardSeriesPoint[];
  lowStockProducts: DashboardSeriesPoint[];
  topCompanies: DashboardSeriesPoint[];
  topBranches: DashboardSeriesPoint[];
  productionReport: DashboardIssue[];
};

type QueryIssue = {
  table: string;
  operation: string;
  message: string;
};

export type PlatformRuntimeSnapshot = {
  status: 'operational' | 'degraded';
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  diskUsage: string;
  networkUsage: string;
  uptimeSeconds: number;
  loadAverage: number[];
  storageBuckets: number;
  storageStatus: 'operational' | 'degraded' | 'unavailable';
  redisStatus: 'connected' | 'configured' | 'unreachable' | 'not_configured';
  cacheStatus: 'configured' | 'in_process';
};

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const integer = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 });

function bytes(value: number) {
  if (value >= 1024 ** 3) return `${decimal.format(value / 1024 ** 3)} GB`;
  if (value >= 1024 ** 2) return `${decimal.format(value / 1024 ** 2)} MB`;
  if (value >= 1024) return `${decimal.format(value / 1024)} KB`;
  return `${integer.format(value)} B`;
}

export async function getPlatformRuntimeSnapshot(supabase = createSupabaseServiceClient()): Promise<PlatformRuntimeSnapshot> {
  const memory = process.memoryUsage();
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const memoryUsagePercent = totalMemory > 0 ? ((totalMemory - freeMemory) / totalMemory) * 100 : 0;
  const loadAverage = os.loadavg();
  const cpuCount = Math.max(1, os.cpus().length);
  const cpuUsagePercent = Math.min(100, Math.max(0, (loadAverage[0] / cpuCount) * 100));

  let storageBuckets = 0;
  let storageStatus: PlatformRuntimeSnapshot['storageStatus'] = 'unavailable';
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      storageStatus = 'degraded';
    } else {
      storageBuckets = data?.length ?? 0;
      storageStatus = 'operational';
    }
  } catch {
    storageStatus = 'unavailable';
  }

  let redisStatus: PlatformRuntimeSnapshot['redisStatus'] = 'not_configured';
  if (process.env.REDIS_URL) {
    try {
      const alive = await Promise.race([
        redisPing(),
        new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 2000)),
      ]);
      redisStatus = alive ? 'connected' : 'unreachable';
    } catch {
      redisStatus = 'unreachable';
    }
  } else if (process.env.UPSTASH_REDIS_REST_URL) {
    redisStatus = 'configured';
  }
  const cacheStatus = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL ? 'configured' : 'in_process';

  return {
    status: memoryUsagePercent > 90 || cpuUsagePercent > 90 || storageStatus === 'degraded' ? 'degraded' : 'operational',
    cpuUsagePercent,
    memoryUsagePercent,
    diskUsage: 'Host disk metrics unavailable in serverless runtime',
    networkUsage: `RSS ${bytes(memory.rss)} / heap ${bytes(memory.heapUsed)}`,
    uptimeSeconds: process.uptime(),
    loadAverage,
    storageBuckets,
    storageStatus,
    redisStatus,
    cacheStatus,
  };
}

function iso(date: Date) {
  return date.toISOString();
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date) {
  const day = date.getDay() || 7;
  const result = startOfDay(date);
  result.setDate(result.getDate() - day + 1);
  return result;
}

function pct(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function formatPct(value: number) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${decimal.format(value)}%`;
}

function toNumber(value: unknown) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

function isPaid(status: unknown) {
  return ['PAID', 'SUCCESS', 'CAPTURED', 'COMPLETED'].includes(String(status ?? '').toUpperCase());
}

function isPending(status: unknown) {
  return ['PENDING', 'UNPAID', 'PROCESSING'].includes(String(status ?? '').toUpperCase());
}

function inRange(value: unknown, start: Date, end?: Date) {
  if (!value) return false;
  const timestamp = new Date(String(value)).getTime();
  if (!Number.isFinite(timestamp)) return false;
  return timestamp >= start.getTime() && (!end || timestamp < end.getTime());
}

function metric(input: Omit<DashboardMetric, 'displayValue'> & { displayValue?: string; money?: boolean; percent?: boolean }) {
  const displayValue = input.displayValue
    ?? (typeof input.value === 'number'
      ? input.percent
        ? `${decimal.format(input.value)}%`
        : input.money
          ? money.format(input.value)
          : integer.format(input.value)
      : input.value);

  return { ...input, displayValue };
}

async function countRows(
  supabase: SupabaseClientLike,
  table: string,
  issues: QueryIssue[],
  apply?: (query: any) => any,
) {
  let query = supabase.from(table).select('*', { count: 'exact', head: true });
  if (apply) query = apply(query);
  const { count, error } = await query;
  if (error) {
    issues.push({ table, operation: 'count', message: error.message });
    return 0;
  }
  return count ?? 0;
}

async function fetchRows<T extends Record<string, unknown>>(
  supabase: SupabaseClientLike,
  table: string,
  columns: string,
  issues: QueryIssue[],
  apply?: (query: any) => any,
) {
  let query = supabase.from(table).select(columns).limit(5000);
  if (apply) query = apply(query);
  const { data, error } = await query;
  if (error) {
    issues.push({ table, operation: 'select', message: error.message });
    return [] as T[];
  }
  return (data ?? []) as unknown as T[];
}

function sumByDate(rows: Record<string, unknown>[], amountColumn: string, start: Date, end?: Date) {
  return rows.reduce((total, row) => {
    if (!inRange(row.created_at, start, end)) return total;
    return total + toNumber(row[amountColumn]);
  }, 0);
}

function countByDate(rows: Record<string, unknown>[], start: Date, end?: Date) {
  return rows.filter((row) => inRange(row.created_at, start, end)).length;
}

function recentFromRows(rows: Record<string, unknown>[], labelKey: string, detail: string, source: string, href?: string) {
  return rows.slice(0, 4).map((row, index) => ({
    id: String(row.id ?? `${source}-${index}`),
    label: String(row[labelKey] ?? row.name ?? row.title ?? row.order_number ?? 'Record'),
    detail,
    timestamp: String(row.created_at ?? row.updated_at ?? new Date().toISOString()),
    source,
    href,
  }));
}

export function makeAlertKey(module: string, rootCause: string) {
  const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48);
  return `${slug(module)}:${slug(rootCause)}`;
}

function makeIssue(issue: QueryIssue): DashboardIssue {
  return {
    module: `Data source: ${issue.table}`,
    severity: 'high',
    businessImpact: `Dashboard widgets sourced from ${issue.table} may show zero or partial values.`,
    rootCause: issue.message,
    filesAffected: ['apps/superadmin/src/lib/superadmin-dashboard-data.ts'],
    recommendedSolution: `Create, migrate, or permission ${issue.table} for the Superadmin service role dashboard query.`,
    implementationSteps: [
      `Verify public.${issue.table} exists in Supabase.`,
      'Confirm required columns match the canonical schema.',
      'Rerun the Superadmin dashboard validation build after the schema fix.',
    ],
  };
}

function dayBuckets(rows: Record<string, unknown>[], amountColumn: string, days: number) {
  const now = new Date();
  return Array.from({ length: days }).map((_, index) => {
    const day = startOfDay(new Date(now));
    day.setDate(day.getDate() - (days - index - 1));
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    return {
      label: day.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      value: sumByDate(rows, amountColumn, day, next),
    };
  });
}

export async function getSuperadminCommandCenterData(): Promise<SuperadminCommandCenterData> {
  const supabase = createSupabaseServiceClient();
  const issues: QueryIssue[] = [];
  const now = new Date();
  const today = startOfDay(now);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const week = startOfWeek(now);
  const month = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const year = new Date(now.getFullYear(), 0, 1);
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [
    companies,
    branches,
    totalUsers,
    activeUsers,
    onlineUsers,
    newUsersToday,
    customers,
    leads,
    products,
    categories,
    campaigns,
    messages,
    serviceTickets,
  ] = await Promise.all([
    countRows(supabase, 'org_organizations', issues),
    countRows(supabase, 'org_branches', issues),
    countRows(supabase, 'sys_users', issues),
    countRows(supabase, 'sys_users', issues, (query) => query.eq('is_active', true)),
    countRows(supabase, 'sys_auth_sessions', issues, (query) => query.eq('status', 'ACTIVE').gte('expires_at', iso(now))),
    countRows(supabase, 'sys_users', issues, (query) => query.gte('created_at', iso(today))),
    countRows(supabase, 'crm_customers', issues),
    countRows(supabase, 'sls_leads', issues),
    countRows(supabase, 'prd_products', issues),
    countRows(supabase, 'prd_categories', issues),
    countRows(supabase, 'mkt_campaigns', issues),
    countRows(supabase, 'wab_messages', issues),
    countRows(supabase, 'sup_tickets', issues),
  ]);

  const [
    orders,
    payments,
    stock,
    orderItems,
    variants,
    productRows,
    companyRows,
    branchRows,
    userRows,
    customerRows,
    leadRows,
    campaignRows,
    ticketRows,
    analyticsRows,
    staffRows,
    auditRows,
    loginRows,
    messageRows,
    queueRows,
  ] = await Promise.all([
    fetchRows<Record<string, unknown>>(supabase, 'oms_orders', 'id,org_id,order_number,customer_id,order_status,payment_status,grand_total,created_at', issues, (query) => query.order('created_at', { ascending: false })),
    fetchRows<Record<string, unknown>>(supabase, 'oms_payments', 'id,amount,status,created_at', issues, (query) => query.order('created_at', { ascending: false })),
    fetchRows<Record<string, unknown>>(supabase, 'inv_stock', 'id,variant_id,quantity_on_hand,quantity_reserved,reorder_level,created_at', issues, (query) => query.order('quantity_on_hand', { ascending: true })),
    fetchRows<Record<string, unknown>>(supabase, 'oms_order_items', 'id,variant_id,quantity,line_total,created_at', issues),
    fetchRows<Record<string, unknown>>(supabase, 'prd_variants', 'id,product_id,name,sku', issues),
    fetchRows<Record<string, unknown>>(supabase, 'prd_products', 'id,title,created_at', issues, (query) => query.order('created_at', { ascending: false })),
    fetchRows<Record<string, unknown>>(supabase, 'org_organizations', 'id,name,created_at', issues, (query) => query.order('created_at', { ascending: false })),
    fetchRows<Record<string, unknown>>(supabase, 'org_branches', 'id,name,created_at', issues, (query) => query.order('created_at', { ascending: false })),
    fetchRows<Record<string, unknown>>(supabase, 'sys_users', 'id,first_name,last_name,employee_code,branch_id,created_at,updated_at', issues, (query) => query.order('created_at', { ascending: false })),
    fetchRows<Record<string, unknown>>(supabase, 'crm_customers', 'id,first_name,last_name,lifetime_value,created_at,last_purchase_date', issues, (query) => query.order('created_at', { ascending: false })),
    fetchRows<Record<string, unknown>>(supabase, 'sls_leads', 'id,first_name,last_name,company_name,converted_customer_id,created_at', issues, (query) => query.order('created_at', { ascending: false })),
    fetchRows<Record<string, unknown>>(supabase, 'mkt_campaigns', 'id,name,status,created_at', issues, (query) => query.order('created_at', { ascending: false })),
    fetchRows<Record<string, unknown>>(supabase, 'sup_tickets', 'id,ticket_number,subject,status,assigned_to,is_sla_breached,resolved_at,created_at', issues, (query) => query.order('created_at', { ascending: false })),
    fetchRows<Record<string, unknown>>(supabase, 'enterprise_analytics_events', 'id,event_name,event_category,application,module,api_endpoint,action,success,http_status,execution_time_ms,created_at:occurred_at,occurred_at', issues, (query) => query.order('occurred_at', { ascending: false })),
    fetchRows<Record<string, unknown>>(supabase, 'enterprise_staff_activity_logs', 'id,user_email,role,module,action,description,success,created_at', issues, (query) => query.order('created_at', { ascending: false })),
    fetchRows<Record<string, unknown>>(supabase, 'enterprise_audit_logs', 'id,user_email,module,action,entity_type,entity_id,success,created_at', issues, (query) => query.order('created_at', { ascending: false })),
    fetchRows<Record<string, unknown>>(supabase, 'sys_auth_login_history', 'id,user_id,is_success,failure_reason,login_attempt_at', issues, (query) => query.order('login_attempt_at', { ascending: false })),
    fetchRows<Record<string, unknown>>(supabase, 'wab_messages', 'id,direction,message_type,created_at', issues, (query) => query.order('created_at', { ascending: false })),
    fetchRows<Record<string, unknown>>(supabase, 'wab_message_queue', 'id,status,retry_count,scheduled_for,created_at', issues, (query) => query.order('created_at', { ascending: false })),
  ]);

  const runtime = await getPlatformRuntimeSnapshot(supabase);

  const acknowledgementRows = await fetchRows<Record<string, unknown>>(
    supabase,
    'enterprise_alert_acknowledgements',
    'alert_key,status,acknowledged_by,created_at',
    [],
    (query) => query.order('created_at', { ascending: false }).limit(500),
  );
  const latestAckByKey = new Map<string, Record<string, unknown>>();
  acknowledgementRows.forEach((row) => {
    const key = String(row.alert_key ?? '');
    if (key && !latestAckByKey.has(key)) latestAckByKey.set(key, row);
  });

  let connectionStats: { total: number; active: number; idle: number; maxConnections: number } | null = null;
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('superadmin_connection_stats');
    if (!rpcError && rpcData) {
      const stats = rpcData as Record<string, unknown>;
      connectionStats = {
        total: toNumber(stats.total),
        active: toNumber(stats.active),
        idle: toNumber(stats.idle),
        maxConnections: toNumber(stats.max_connections),
      };
    }
  } catch {
    connectionStats = null;
  }

  const paidPayments = payments.filter((row) => isPaid(row.status));
  const totalRevenue = paidPayments.reduce((total, row) => total + toNumber(row.amount), 0);
  const todayRevenue = sumByDate(paidPayments, 'amount', today);
  const yesterdayRevenue = sumByDate(paidPayments, 'amount', yesterday, today);
  const weeklyRevenue = sumByDate(paidPayments, 'amount', week);
  const monthlyRevenue = sumByDate(paidPayments, 'amount', month);
  const yearlyRevenue = sumByDate(paidPayments, 'amount', year);
  const previousMonthRevenue = sumByDate(paidPayments, 'amount', previousMonth, month);
  const pendingPayments = payments.filter((row) => isPending(row.status)).reduce((total, row) => total + toNumber(row.amount), 0);
  const paidPaymentCount = paidPayments.length;

  const totalOrderValue = orders.reduce((total, row) => total + toNumber(row.grand_total), 0);
  const todayOrders = countByDate(orders, today);
  const monthOrders = countByDate(orders, month);
  const previousMonthOrders = countByDate(orders, previousMonth, month);
  const previousMonthCustomers = countByDate(customerRows, previousMonth, month);
  const monthCustomers = countByDate(customerRows, month);
  const repeatCustomers = new Map<string, number>();
  orders.forEach((order) => {
    const customerId = String(order.customer_id ?? '');
    if (!customerId) return;
    repeatCustomers.set(customerId, (repeatCustomers.get(customerId) ?? 0) + 1);
  });

  const inventoryUnits = stock.reduce((total, row) => total + toNumber(row.quantity_on_hand), 0);
  const lowStock = stock.filter((row) => toNumber(row.quantity_on_hand) <= toNumber(row.reorder_level));
  const activeTickets = ticketRows.filter((row) => !['CLOSED', 'RESOLVED'].includes(String(row.status ?? '').toUpperCase())).length;
  const activeEngineers = new Set(ticketRows.map((row) => String(row.assigned_to ?? '')).filter(Boolean)).size;
  const resolvedTickets = ticketRows.filter((row) => row.resolved_at);
  const slaCompliantTickets = resolvedTickets.filter((row) => row.is_sla_breached !== true).length;
  const supportSlaRate = resolvedTickets.length === 0 ? 100 : (slaCompliantTickets / resolvedTickets.length) * 100;
  const avgResolutionHours = resolvedTickets.length === 0
    ? 0
    : resolvedTickets.reduce((total, row) => {
        const created = new Date(String(row.created_at)).getTime();
        const resolved = new Date(String(row.resolved_at)).getTime();
        return Number.isFinite(created) && Number.isFinite(resolved) && resolved > created ? total + (resolved - created) / 36e5 : total;
      }, 0) / resolvedTickets.length;
  const pendingPaymentRows = payments.filter((row) => isPending(row.status));
  const agingBucket = (maxDays: number, minDays = 0) => pendingPaymentRows
    .filter((row) => {
      const created = new Date(String(row.created_at)).getTime();
      if (!Number.isFinite(created)) return false;
      const ageDays = (now.getTime() - created) / 864e5;
      return ageDays >= minDays && (maxDays === Infinity || ageDays < maxDays);
    })
    .reduce((total, row) => total + toNumber(row.amount), 0);
  const aging0to30 = agingBucket(30);
  const aging31to60 = agingBucket(60, 30);
  const aging60plus = agingBucket(Infinity, 60);
  const apiCalls24h = analyticsRows.filter((row) => row.api_endpoint && inRange(row.created_at, dayAgo)).length;
  const aiRequests24h = analyticsRows.filter((row) => {
    const text = `${row.event_name ?? ''} ${row.module ?? ''} ${row.action ?? ''} ${row.api_endpoint ?? ''}`.toLowerCase();
    return text.includes('ai') || text.includes('gemini');
  }).length;
  const errorRows24h = analyticsRows.filter((row) => (row.success === false || toNumber(row.http_status) >= 500) && inRange(row.created_at, dayAgo));
  const errors24h = errorRows24h.length;
  const errorsByEndpoint = new Map<string, number>();
  errorRows24h.forEach((row) => {
    const endpoint = String(row.api_endpoint ?? row.module ?? row.event_name ?? 'unknown');
    errorsByEndpoint.set(endpoint, (errorsByEndpoint.get(endpoint) ?? 0) + 1);
  });
  const topErrorEndpoints = Array.from(errorsByEndpoint.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const avgExecution = analyticsRows.length > 0
    ? analyticsRows.reduce((total, row) => total + toNumber(row.execution_time_ms), 0) / analyticsRows.length
    : 0;
  const apiRows24h = analyticsRows.filter((row) => row.api_endpoint && inRange(row.created_at, dayAgo));
  const apiErrors24h = apiRows24h.filter((row) => row.success === false || toNumber(row.http_status) >= 500).length;
  const apiAvailability24h = apiRows24h.length === 0 ? 100 : ((apiRows24h.length - apiErrors24h) / apiRows24h.length) * 100;
  const sloTargetPercent = 99.5;
  const allowedErrors24h = apiRows24h.length * (1 - sloTargetPercent / 100);
  const errorBudgetRemaining = apiRows24h.length === 0 || allowedErrors24h === 0
    ? (apiErrors24h === 0 ? 100 : 0)
    : Math.max(0, Math.min(100, ((allowedErrors24h - apiErrors24h) / allowedErrors24h) * 100));
  const sortedLatencies = apiRows24h.map((row) => toNumber(row.execution_time_ms)).filter((value) => value > 0).sort((a, b) => a - b);
  const p95Latency = sortedLatencies.length === 0 ? 0 : sortedLatencies[Math.min(sortedLatencies.length - 1, Math.floor(sortedLatencies.length * 0.95))];
  const successfulLogins24h = loginRows.filter((row) => row.is_success === true && inRange(row.login_attempt_at, dayAgo)).length;
  const failedLogins24h = loginRows.filter((row) => row.is_success === false && inRange(row.login_attempt_at, dayAgo)).length;

  const leadConversionRate = leads === 0 ? 0 : (leadRows.filter((row) => row.converted_customer_id).length / leads) * 100;
  const averageOrderValue = orders.length === 0 ? 0 : totalOrderValue / orders.length;
  const customerLifetimeValue = customerRows.length === 0
    ? 0
    : customerRows.reduce((total, row) => total + toNumber(row.lifetime_value), 0) / customerRows.length;

  const variantById = new Map(variants.map((row) => [String(row.id), row]));
  const productById = new Map(productRows.map((row) => [String(row.id), row]));
  const branchUserCounts = new Map<string, number>();
  userRows.forEach((row) => {
    const branchId = String(row.branch_id ?? '');
    if (!branchId) return;
    branchUserCounts.set(branchId, (branchUserCounts.get(branchId) ?? 0) + 1);
  });

  const orderValueByOrg = new Map<string, number>();
  orders.forEach((row) => {
    const orgId = String(row.org_id ?? '');
    if (!orgId) return;
    orderValueByOrg.set(orgId, (orderValueByOrg.get(orgId) ?? 0) + toNumber(row.grand_total));
  });

  const productSales = new Map<string, number>();
  orderItems.forEach((item) => {
    const variant = variantById.get(String(item.variant_id ?? ''));
    const productId = String(variant?.product_id ?? '');
    if (!productId) return;
    productSales.set(productId, (productSales.get(productId) ?? 0) + toNumber(item.line_total));
  });

  const topProducts = Array.from(productSales.entries())
    .map(([productId, value]) => ({ label: String(productById.get(productId)?.title ?? 'Product'), value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const pendingQueueJobs = queueRows.filter((row) => ['PENDING', 'PROCESSING'].includes(String(row.status ?? '').toUpperCase())).length;
  const failedQueueJobs = queueRows.filter((row) => String(row.status ?? '').toUpperCase() === 'FAILED').length;
  const workerEvents24h = analyticsRows.filter((row) => {
    const text = `${row.event_name ?? ''} ${row.module ?? ''} ${row.action ?? ''}`.toLowerCase();
    return inRange(row.created_at, dayAgo) && (text.includes('worker') || text.includes('job'));
  }).length;
  const cronEvents24h = analyticsRows.filter((row) => {
    const text = `${row.event_name ?? ''} ${row.module ?? ''} ${row.action ?? ''}`.toLowerCase();
    return inRange(row.created_at, dayAgo) && (text.includes('cron') || text.includes('schedule'));
  }).length;

  const lowStockProducts = lowStock.slice(0, 5).map((row) => {
    const variant = variantById.get(String(row.variant_id));
    const product = productById.get(String(variant?.product_id ?? ''));
    return {
      label: String(product?.title ?? variant?.name ?? 'Stock item'),
      value: toNumber(row.quantity_on_hand),
    };
  });

  const topCompanies = companyRows
    .map((row) => ({ label: String(row.name ?? 'Company'), value: orderValueByOrg.get(String(row.id)) ?? 0 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const topBranches = branchRows
    .map((row) => ({ label: String(row.name ?? 'Branch'), value: branchUserCounts.get(String(row.id)) ?? 0 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const sourceIssues = issues.map(makeIssue);
  const domainIssues: DashboardIssue[] = [
    ...(lowStock.length > 0 ? [{
      module: 'Inventory',
      severity: 'high' as DashboardSeverity,
      businessImpact: `${lowStock.length} stock positions are at or below reorder level.`,
      rootCause: 'Inventory quantity on hand is less than or equal to reorder level.',
      filesAffected: ['apps/superadmin/src/lib/superadmin-dashboard-data.ts', 'database.sql'],
      recommendedSolution: 'Add a replenishment workflow and supplier purchase-order quick action.',
      implementationSteps: ['Expose low-stock drilldown.', 'Add reorder approval workflow.', 'Notify branch managers and procurement.'],
    }] : []),
    ...(failedLogins24h > 0 ? [{
      module: 'Security',
      severity: failedLogins24h > 10 ? 'critical' as DashboardSeverity : 'medium' as DashboardSeverity,
      businessImpact: `${failedLogins24h} failed login attempts were recorded in the last 24 hours.`,
      rootCause: 'Authentication failures are visible in sys_auth_login_history.',
      filesAffected: ['apps/superadmin/src/lib/superadmin-dashboard-data.ts', 'database.sql'],
      recommendedSolution: 'Add anomaly thresholds, IP reputation checks, and Superadmin alert routing.',
      implementationSteps: ['Create failed-login alert policy.', 'Add IP/device grouping.', 'Export security event report.'],
    }] : []),
    ...(errors24h > 0 ? [{
      module: 'Platform reliability',
      severity: errors24h > allowedErrors24h || errorBudgetRemaining < 25 ? 'critical' as DashboardSeverity : 'high' as DashboardSeverity,
      businessImpact: `${errors24h} failed API or telemetry events were recorded in the last 24 hours${topErrorEndpoints.length > 0 ? ` — top offender: ${topErrorEndpoints[0][0]} (${topErrorEndpoints[0][1]} failure${topErrorEndpoints[0][1] === 1 ? '' : 's'})` : ''}. Error budget remaining against the ${sloTargetPercent}% availability SLO: ${integer.format(errorBudgetRemaining)}%.`,
      rootCause: `enterprise_analytics_events includes unsuccessful events or 5xx statuses. By endpoint: ${topErrorEndpoints.length > 0 ? topErrorEndpoints.map(([endpoint, count]) => `${endpoint} (${count})`).join(', ') : 'no api_endpoint recorded on the failing events'}.`,
      filesAffected: ['supabase/migrations/202607190006_enterprise_analytics_logging.sql', 'apps/superadmin/src/lib/superadmin-dashboard-data.ts'],
      recommendedSolution: 'Create error-rate SLO thresholds and route failures into the notification center.',
      implementationSteps: ['Group errors by endpoint.', 'Add SLO budget widget.', 'Add incident acknowledgement workflow.'],
    }] : []),
  ];
  const notifications = [...domainIssues, ...sourceIssues].slice(0, 10).map((issue) => {
    const alertKey = makeAlertKey(issue.module, issue.rootCause);
    const ack = latestAckByKey.get(alertKey);
    const ackStatus = String(ack?.status ?? '');
    return {
      ...issue,
      alertKey,
      acknowledged: ackStatus === 'acknowledged' || ackStatus === 'resolved',
      acknowledgedBy: ack?.acknowledged_by ? String(ack.acknowledged_by) : undefined,
    };
  });
  const healthScore = Math.max(0, Math.min(100, 100 - notifications.reduce((total, issue) => {
    if (issue.severity === 'critical') return total + 20;
    if (issue.severity === 'high') return total + 12;
    if (issue.severity === 'medium') return total + 6;
    return total + 2;
  }, 0)));

  const executiveMetrics = [
    metric({ key: 'companies', label: 'Total Companies', value: companies, category: 'executive', severity: 'ok', source: 'org_organizations', href: '/superadmin/mgmt/organizations' }),
    metric({ key: 'branches', label: 'Total Branches', value: branches, category: 'executive', severity: 'ok', source: 'org_branches', href: '/superadmin/mgmt/branches' }),
    metric({ key: 'users', label: 'Total Users', value: totalUsers, category: 'executive', severity: 'ok', source: 'sys_users', href: '/superadmin/mgmt/users' }),
    metric({ key: 'active_users', label: 'Active Users', value: activeUsers, category: 'executive', severity: 'ok', source: 'sys_users.is_active' }),
    metric({ key: 'online_users', label: 'Online Users', value: onlineUsers, category: 'realtime', severity: onlineUsers > 0 ? 'ok' : 'low', source: 'sys_auth_sessions' }),
    metric({ key: 'new_users_today', label: 'New Users Today', value: newUsersToday, category: 'executive', severity: 'ok', source: 'sys_users.created_at' }),
    metric({ key: 'staff_count', label: 'Staff Count', value: totalUsers, category: 'executive', severity: 'ok', source: 'sys_users' }),
    metric({ key: 'customers', label: 'Customers', value: customers, category: 'executive', severity: 'ok', source: 'crm_customers' }),
    metric({ key: 'leads', label: 'Leads', value: leads, category: 'executive', severity: 'ok', source: 'sls_leads' }),
    metric({ key: 'products', label: 'Products', value: products, category: 'executive', severity: 'ok', source: 'prd_products', href: '/superadmin/mgmt/products' }),
    metric({ key: 'categories', label: 'Categories', value: categories, category: 'executive', severity: 'ok', source: 'prd_categories' }),
    metric({ key: 'orders', label: 'Orders', value: orders.length, category: 'executive', severity: 'ok', source: 'oms_orders' }),
    metric({ key: 'revenue', label: 'Revenue', value: totalRevenue, category: 'business', severity: 'ok', source: 'oms_payments', money: true }),
    metric({ key: 'payments', label: 'Payments', value: paidPaymentCount, category: 'business', severity: 'ok', source: 'oms_payments' }),
    metric({ key: 'pending_payments', label: 'Pending Payments', value: pendingPayments, category: 'business', severity: pendingPayments > 0 ? 'medium' : 'ok', source: 'oms_payments.status', money: true }),
    metric({ key: 'inventory_value', label: 'Inventory Units', value: inventoryUnits, category: 'business', severity: lowStock.length > 0 ? 'high' : 'ok', source: 'inv_stock.quantity_on_hand' }),
    metric({ key: 'service_tickets', label: 'Service Tickets', value: serviceTickets, category: 'executive', severity: activeTickets > 0 ? 'medium' : 'ok', source: 'sup_tickets' }),
    metric({ key: 'active_engineers', label: 'Active Engineers', value: activeEngineers, category: 'executive', severity: 'ok', source: 'sup_tickets.assigned_to' }),
    metric({ key: 'marketing_campaigns', label: 'Marketing Campaigns', value: campaigns, category: 'executive', severity: 'ok', source: 'mkt_campaigns', href: '/superadmin/mgmt/marketing' }),
    metric({ key: 'whatsapp_messages', label: 'WhatsApp Messages', value: messages, category: 'executive', severity: 'ok', source: 'wab_messages' }),
    metric({ key: 'emails_sent', label: 'Emails Sent', value: 0, category: 'executive', severity: 'low', source: 'mkt_email_broadcasts instrumentation pending' }),
    metric({ key: 'storage_usage', label: 'Storage Usage', value: runtime.storageBuckets, category: 'system', severity: runtime.storageStatus === 'operational' ? 'ok' : 'medium', source: 'Supabase storage buckets', displayValue: `${integer.format(runtime.storageBuckets)} buckets` }),
    metric({ key: 'api_requests', label: 'API Requests', value: apiCalls24h, category: 'system', severity: 'ok', source: 'enterprise_analytics_events.api_endpoint' }),
    metric({ key: 'ai_requests', label: 'AI Requests', value: aiRequests24h, category: 'analytics', severity: 'ok', source: 'enterprise_analytics_events' }),
    metric({ key: 'server_status', label: 'Server Status', value: 'Operational', category: 'system', severity: errors24h > 0 ? 'medium' : 'ok', source: 'Next.js API route' }),
    metric({ key: 'database_status', label: 'Database Status', value: issues.length === 0 ? 'Operational' : 'Degraded', category: 'system', severity: issues.length === 0 ? 'ok' : 'high', source: 'Supabase service queries' }),
    metric({ key: 'system_health', label: 'System Health', value: healthScore, category: 'system', severity: healthScore < 80 ? 'high' : 'ok', source: 'computed', percent: true }),
  ];

  const businessMetrics = [
    metric({ key: 'today_revenue', label: "Today's Revenue", value: todayRevenue, category: 'business', severity: 'ok', source: 'oms_payments', money: true }),
    metric({ key: 'yesterday_revenue', label: "Yesterday's Revenue", value: yesterdayRevenue, category: 'business', severity: 'ok', source: 'oms_payments', money: true }),
    metric({ key: 'weekly_revenue', label: 'Weekly Revenue', value: weeklyRevenue, category: 'business', severity: 'ok', source: 'oms_payments', money: true }),
    metric({ key: 'monthly_revenue', label: 'Monthly Revenue', value: monthlyRevenue, category: 'business', severity: 'ok', source: 'oms_payments', money: true }),
    metric({ key: 'yearly_revenue', label: 'Yearly Revenue', value: yearlyRevenue, category: 'business', severity: 'ok', source: 'oms_payments', money: true }),
    metric({ key: 'revenue_growth', label: 'Revenue Growth', value: pct(monthlyRevenue, previousMonthRevenue), category: 'business', severity: monthlyRevenue >= previousMonthRevenue ? 'ok' : 'medium', source: 'oms_payments', displayValue: formatPct(pct(monthlyRevenue, previousMonthRevenue)) }),
    metric({ key: 'sales_growth', label: 'Sales Growth', value: pct(monthlyRevenue, previousMonthRevenue), category: 'business', severity: monthlyRevenue >= previousMonthRevenue ? 'ok' : 'medium', source: 'oms_payments', displayValue: formatPct(pct(monthlyRevenue, previousMonthRevenue)) }),
    metric({ key: 'order_growth', label: 'Order Growth', value: pct(monthOrders, previousMonthOrders), category: 'business', severity: monthOrders >= previousMonthOrders ? 'ok' : 'medium', source: 'oms_orders', displayValue: formatPct(pct(monthOrders, previousMonthOrders)) }),
    metric({ key: 'customer_growth', label: 'Customer Growth', value: pct(monthCustomers, previousMonthCustomers), category: 'business', severity: monthCustomers >= previousMonthCustomers ? 'ok' : 'medium', source: 'crm_customers', displayValue: formatPct(pct(monthCustomers, previousMonthCustomers)) }),
    metric({ key: 'lead_conversion_rate', label: 'Lead Conversion Rate', value: leadConversionRate, category: 'business', severity: leadConversionRate > 20 ? 'ok' : 'medium', source: 'sls_leads.converted_customer_id', percent: true }),
    metric({ key: 'average_order_value', label: 'Average Order Value', value: averageOrderValue, category: 'business', severity: 'ok', source: 'oms_orders.grand_total', money: true }),
    metric({ key: 'repeat_customers', label: 'Repeat Customers', value: Array.from(repeatCustomers.values()).filter((count) => count > 1).length, category: 'business', severity: 'ok', source: 'oms_orders.customer_id' }),
    metric({ key: 'customer_lifetime_value', label: 'Customer Lifetime Value', value: customerLifetimeValue, category: 'business', severity: 'ok', source: 'crm_customers.lifetime_value', money: true }),
    metric({ key: 'outstanding_payments', label: 'Outstanding Payments', value: pendingPayments, category: 'business', severity: pendingPayments > 0 ? 'high' : 'ok', source: 'oms_payments.status', money: true }),
    metric({ key: 'support_sla_rate', label: 'Support SLA Compliance', value: supportSlaRate, category: 'business', severity: supportSlaRate < 90 ? 'high' : supportSlaRate < 97 ? 'medium' : 'ok', source: 'sup_tickets.is_sla_breached / resolved_at', percent: true }),
    metric({ key: 'avg_resolution_hours', label: 'Avg Ticket Resolution', value: avgResolutionHours, category: 'business', severity: avgResolutionHours > 72 ? 'high' : avgResolutionHours > 48 ? 'medium' : 'ok', source: 'sup_tickets.resolved_at - created_at', displayValue: `${decimal.format(avgResolutionHours)} h` }),
    metric({ key: 'payment_aging_0_30', label: 'Payment Aging 0-30d', value: aging0to30, category: 'business', severity: 'ok', source: 'oms_payments pending age', money: true }),
    metric({ key: 'payment_aging_31_60', label: 'Payment Aging 31-60d', value: aging31to60, category: 'business', severity: aging31to60 > 0 ? 'medium' : 'ok', source: 'oms_payments pending age', money: true }),
    metric({ key: 'payment_aging_60_plus', label: 'Payment Aging 60d+', value: aging60plus, category: 'business', severity: aging60plus > 0 ? 'high' : 'ok', source: 'oms_payments pending age', money: true }),
  ];

  const realtimeMetrics = [
    metric({ key: 'live_users', label: 'Live Users', value: onlineUsers, category: 'realtime', severity: 'ok', source: 'sys_auth_sessions' }),
    metric({ key: 'live_orders', label: 'Live Orders', value: orders.filter((row) => inRange(row.created_at, fiveMinutesAgo)).length, category: 'realtime', severity: 'ok', source: 'oms_orders.created_at' }),
    metric({ key: 'live_chats', label: 'Live Chats', value: messageRows.filter((row) => inRange(row.created_at, fiveMinutesAgo)).length, category: 'realtime', severity: 'ok', source: 'wab_messages.created_at' }),
    metric({ key: 'live_api_calls', label: 'Live API Calls', value: analyticsRows.filter((row) => row.api_endpoint && inRange(row.created_at, fiveMinutesAgo)).length, category: 'realtime', severity: 'ok', source: 'enterprise_analytics_events' }),
    metric({ key: 'live_notifications', label: 'Live Notifications', value: notifications.length, category: 'realtime', severity: notifications.length > 0 ? 'medium' : 'ok', source: 'computed notification center' }),
    metric({ key: 'live_errors', label: 'Live Errors', value: analyticsRows.filter((row) => (row.success === false || toNumber(row.http_status) >= 500) && inRange(row.created_at, fiveMinutesAgo)).length, category: 'realtime', severity: errors24h > 0 ? 'high' : 'ok', source: 'enterprise_analytics_events' }),
    metric({ key: 'live_server_load', label: 'Live Server Load', value: avgExecution, category: 'realtime', severity: avgExecution > 1000 ? 'high' : 'ok', source: 'enterprise_analytics_events.execution_time_ms', displayValue: `${integer.format(avgExecution)} ms avg` }),
    metric({
      key: 'live_database_connections',
      label: 'Live Database Connections',
      value: connectionStats ? connectionStats.total : onlineUsers,
      category: 'realtime',
      severity: connectionStats && connectionStats.maxConnections > 0 && connectionStats.total / connectionStats.maxConnections > 0.85 ? 'high' : 'ok',
      source: connectionStats ? 'pg_stat_activity via superadmin_connection_stats' : 'active auth sessions proxy',
      displayValue: connectionStats ? `${integer.format(connectionStats.total)} / ${integer.format(connectionStats.maxConnections)} (${integer.format(connectionStats.active)} active)` : undefined,
    }),
    metric({ key: 'live_queue_status', label: 'Live Queue Status', value: pendingQueueJobs, category: 'realtime', severity: failedQueueJobs > 0 ? 'high' : 'ok', source: 'wab_message_queue', displayValue: failedQueueJobs > 0 ? `${integer.format(pendingQueueJobs)} pending / ${integer.format(failedQueueJobs)} failed` : `${integer.format(pendingQueueJobs)} pending` }),
    metric({ key: 'live_background_jobs', label: 'Live Background Jobs', value: workerEvents24h, category: 'realtime', severity: 'ok', source: 'enterprise_analytics_events worker/job telemetry' }),
  ];

  const systemMetrics = [
    metric({ key: 'application_status', label: 'Application Status', value: runtime.status === 'operational' ? 'Operational' : 'Degraded', category: 'system', severity: runtime.status === 'operational' ? 'ok' : 'high', source: 'Node runtime health' }),
    metric({ key: 'api_status', label: 'API Status', value: errors24h > 0 ? 'Degraded' : 'Operational', category: 'system', severity: errors24h > 0 ? 'high' : 'ok', source: 'enterprise_analytics_events' }),
    metric({ key: 'database_status', label: 'Database Status', value: issues.length > 0 ? 'Degraded' : 'Operational', category: 'system', severity: issues.length > 0 ? 'high' : 'ok', source: 'Supabase service queries' }),
    metric({ key: 'storage_usage', label: 'Storage Usage', value: runtime.storageBuckets, category: 'system', severity: runtime.storageStatus === 'operational' ? 'ok' : 'medium', source: 'Supabase storage buckets', displayValue: `${integer.format(runtime.storageBuckets)} buckets / ${runtime.storageStatus}` }),
    metric({ key: 'cpu_usage', label: 'CPU Usage', value: runtime.cpuUsagePercent, category: 'system', severity: runtime.cpuUsagePercent > 90 ? 'high' : 'ok', source: 'Node os.loadavg', percent: true }),
    metric({ key: 'ram_usage', label: 'RAM Usage', value: runtime.memoryUsagePercent, category: 'system', severity: runtime.memoryUsagePercent > 90 ? 'high' : 'ok', source: 'Node os memory', percent: true }),
    metric({ key: 'disk_usage', label: 'Disk Usage', value: runtime.diskUsage, category: 'system', severity: 'low', source: 'serverless runtime boundary' }),
    metric({ key: 'network_usage', label: 'Network Usage', value: runtime.networkUsage, category: 'system', severity: 'ok', source: 'Node process memory proxy' }),
    metric({
      key: 'redis',
      label: 'Redis',
      value: runtime.redisStatus === 'connected' ? 'Connected' : runtime.redisStatus === 'configured' ? 'Configured (REST)' : runtime.redisStatus === 'unreachable' ? 'Unreachable' : 'Not configured',
      category: 'system',
      severity: runtime.redisStatus === 'connected' || runtime.redisStatus === 'configured' ? 'ok' : runtime.redisStatus === 'unreachable' ? 'high' : 'medium',
      source: 'live Redis PING / REDIS_URL / UPSTASH_REDIS_REST_URL',
    }),
    metric({ key: 'queue', label: 'Queue', value: pendingQueueJobs, category: 'system', severity: failedQueueJobs > 0 ? 'high' : 'ok', source: 'wab_message_queue', displayValue: failedQueueJobs > 0 ? `${integer.format(pendingQueueJobs)} pending / ${integer.format(failedQueueJobs)} failed` : `${integer.format(pendingQueueJobs)} pending` }),
    metric({ key: 'cron_jobs', label: 'Cron Jobs', value: cronEvents24h, category: 'system', severity: 'ok', source: 'enterprise_analytics_events cron telemetry' }),
    metric({ key: 'cache', label: 'Cache', value: runtime.cacheStatus === 'configured' ? 'External' : 'In-process', category: 'system', severity: runtime.cacheStatus === 'configured' ? 'ok' : 'low', source: 'cache configuration' }),
    metric({ key: 'background_workers', label: 'Background Workers', value: workerEvents24h, category: 'system', severity: 'ok', source: 'enterprise_analytics_events worker/job telemetry' }),
    metric({ key: 'error_rate', label: 'Error Rate', value: analyticsRows.length === 0 ? 0 : (errors24h / analyticsRows.length) * 100, category: 'system', severity: errors24h > 0 ? 'high' : 'ok', source: 'enterprise_analytics_events', percent: true }),
    metric({ key: 'api_availability_slo', label: `API Availability (SLO ${sloTargetPercent}%)`, value: apiAvailability24h, category: 'system', severity: apiAvailability24h < sloTargetPercent ? 'high' : 'ok', source: 'enterprise_analytics_events 24h', percent: true }),
    metric({ key: 'error_budget_remaining', label: 'Error Budget Remaining (24h)', value: errorBudgetRemaining, category: 'system', severity: errorBudgetRemaining < 25 ? 'high' : errorBudgetRemaining < 50 ? 'medium' : 'ok', source: `SLO ${sloTargetPercent}% over enterprise_analytics_events`, percent: true }),
    metric({ key: 'p95_latency', label: 'P95 API Latency (24h)', value: p95Latency, category: 'system', severity: p95Latency > 2000 ? 'high' : p95Latency > 1000 ? 'medium' : 'ok', source: 'enterprise_analytics_events.execution_time_ms', displayValue: `${integer.format(p95Latency)} ms` }),
    metric({ key: 'top_failing_endpoint', label: 'Top Failing Endpoint (24h)', value: topErrorEndpoints[0]?.[1] ?? 0, category: 'system', severity: topErrorEndpoints.length === 0 ? 'ok' : errors24h > allowedErrors24h ? 'critical' : 'high', source: 'enterprise_analytics_events grouped by api_endpoint', displayValue: topErrorEndpoints.length === 0 ? 'None' : `${topErrorEndpoints[0][0]} (${integer.format(topErrorEndpoints[0][1])})` }),
  ];

  const analyticsMetrics = [
    metric({ key: 'user_analytics', label: 'User Analytics', value: totalUsers, category: 'analytics', severity: 'ok', source: 'sys_users' }),
    metric({ key: 'revenue_analytics', label: 'Revenue Analytics', value: monthlyRevenue, category: 'analytics', severity: 'ok', source: 'oms_payments', money: true }),
    metric({ key: 'sales_analytics', label: 'Sales Analytics', value: leadConversionRate, category: 'analytics', severity: 'ok', source: 'sls_leads', percent: true }),
    metric({ key: 'order_analytics', label: 'Order Analytics', value: orders.length, category: 'analytics', severity: 'ok', source: 'oms_orders' }),
    metric({ key: 'customer_analytics', label: 'Customer Analytics', value: customers, category: 'analytics', severity: 'ok', source: 'crm_customers' }),
    metric({ key: 'inventory_analytics', label: 'Inventory Analytics', value: lowStock.length, category: 'analytics', severity: lowStock.length > 0 ? 'high' : 'ok', source: 'inv_stock' }),
    metric({ key: 'staff_analytics', label: 'Staff Analytics', value: staffRows.length, category: 'analytics', severity: 'ok', source: 'enterprise_staff_activity_logs' }),
    metric({ key: 'company_analytics', label: 'Company Analytics', value: companies, category: 'analytics', severity: 'ok', source: 'org_organizations' }),
    metric({ key: 'api_analytics', label: 'API Analytics', value: apiCalls24h, category: 'analytics', severity: 'ok', source: 'enterprise_analytics_events' }),
    metric({ key: 'performance_analytics', label: 'Performance Analytics', value: avgExecution, category: 'analytics', severity: avgExecution > 1000 ? 'high' : 'ok', source: 'enterprise_analytics_events.execution_time_ms', displayValue: `${integer.format(avgExecution)} ms avg` }),
    metric({ key: 'security_analytics', label: 'Security Analytics', value: failedLogins24h, category: 'analytics', severity: failedLogins24h > 0 ? 'medium' : 'ok', source: 'sys_auth_login_history' }),
    metric({ key: 'ai_analytics', label: 'AI Analytics', value: aiRequests24h, category: 'analytics', severity: 'ok', source: 'enterprise_analytics_events' }),
    metric({ key: 'marketing_analytics', label: 'Marketing Analytics', value: campaigns, category: 'analytics', severity: 'ok', source: 'mkt_campaigns' }),
    metric({ key: 'support_analytics', label: 'Support Analytics', value: activeTickets, category: 'analytics', severity: activeTickets > 0 ? 'medium' : 'ok', source: 'sup_tickets' }),
  ];

  const recentActivity = [
    ...recentFromRows(companyRows, 'name', 'Company created', 'org_organizations', '/superadmin/mgmt/organizations'),
    ...recentFromRows(branchRows, 'name', 'Branch created', 'org_branches', '/superadmin/mgmt/branches'),
    ...recentFromRows(userRows.map((row) => ({ ...row, name: `${row.first_name ?? ''} ${row.last_name ?? ''}`.trim() || row.employee_code || row.id })), 'name', 'User created', 'sys_users', '/superadmin/mgmt/users'),
    ...recentFromRows(orders, 'order_number', 'Order captured', 'oms_orders'),
    ...recentFromRows(payments, 'id', 'Payment event', 'oms_payments'),
    ...recentFromRows(customerRows.map((row) => ({ ...row, name: `${row.first_name ?? ''} ${row.last_name ?? ''}`.trim() || row.id })), 'name', 'Customer created', 'crm_customers'),
    ...recentFromRows(productRows, 'title', 'Product created', 'prd_products', '/superadmin/mgmt/products'),
    ...recentFromRows(ticketRows, 'ticket_number', 'Service ticket', 'sup_tickets'),
    ...recentFromRows(campaignRows, 'name', 'Campaign created', 'mkt_campaigns', '/superadmin/mgmt/marketing'),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 14);

  const staffActivity = [
    ...staffRows.slice(0, 10).map((row, index) => ({
      id: String(row.id ?? `staff-${index}`),
      label: String(row.action ?? 'Staff activity'),
      detail: String(row.description ?? `${row.module ?? 'Module'} activity by ${row.user_email ?? 'staff user'}`),
      timestamp: String(row.created_at ?? new Date().toISOString()),
      source: 'enterprise_staff_activity_logs',
    })),
    ...loginRows.slice(0, 5).map((row, index) => ({
      id: String(row.id ?? `login-${index}`),
      label: row.is_success ? 'Recent login' : 'Failed login',
      detail: String(row.failure_reason ?? row.user_id ?? 'Authentication event'),
      timestamp: String(row.login_attempt_at ?? new Date().toISOString()),
      source: 'sys_auth_login_history',
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 12);

  const auditLogActivity = auditRows.slice(0, 12).map((row, index) => ({
    id: String(row.id ?? `audit-${index}`),
    label: String(row.action ?? 'Audit event'),
    detail: `${row.module ?? 'Platform'} ${row.entity_type ?? 'entity'} ${row.entity_id ?? ''}`.trim(),
    timestamp: String(row.created_at ?? new Date().toISOString()),
    source: 'enterprise_audit_logs',
    href: '/superadmin/mgmt/audit-logs',
  }));

  const aiInsights: DashboardInsight[] = [
    {
      title: 'Executive Summary',
      detail: `System health is ${integer.format(healthScore)}%. Monthly revenue is ${money.format(monthlyRevenue)} with ${integer.format(orders.length)} tracked orders.`,
      severity: healthScore >= 85 ? 'ok' : 'high',
      action: healthScore >= 85 ? 'Maintain current operating cadence.' : 'Review notification center before approving new rollouts.',
    },
    {
      title: 'Revenue Trend',
      detail: `Revenue growth versus previous month is ${formatPct(pct(monthlyRevenue, previousMonthRevenue))}.`,
      severity: monthlyRevenue >= previousMonthRevenue ? 'ok' : 'medium',
      action: 'Drill into orders, campaigns, and top companies for the variance drivers.',
    },
    {
      title: 'Risk Detection',
      detail: `${errors24h} platform errors, ${failedLogins24h} failed logins, and ${lowStock.length} low-stock items are currently visible.`,
      severity: notifications.length > 0 ? 'high' : 'ok',
      action: 'Prioritize high-severity notifications and assign owners.',
    },
    {
      title: 'Operational Recommendation',
      detail: 'Runtime, storage, queue, cron, and worker signals are now visible; Gemini natural-language queries and deeper infrastructure probes remain the next executive layer.',
      severity: 'medium',
      action: 'Add governed Gemini query flow and optional provider-native infrastructure probes for Redis, database, and hosting metrics.',
    },
  ];

  const missingCapabilities: DashboardIssue[] = [
    {
      module: 'Infrastructure telemetry',
      severity: 'low',
      businessImpact: 'Runtime, storage, queue, cron, worker, live Redis ping, SLO/error-budget, and database connection saturation signals are available; provider-native disk and network metrics still need host-level integrations.',
      rootCause: 'Serverless runtime does not expose host disk/network internals without provider collectors.',
      filesAffected: ['apps/superadmin/src/lib/superadmin-dashboard-data.ts', 'apps/superadmin/src/app/api/superadmin/dashboard/command-center/route.ts'],
      recommendedSolution: 'Add provider-native disk and network collectors when hosting exposes them.',
      implementationSteps: ['Persist provider disk/network snapshots when hosting exposes them.'],
    },
    {
      module: 'Top selling products',
      severity: orderItems.length > 0 ? 'ok' : 'low',
      businessImpact: orderItems.length > 0 ? 'Top products are aggregated from order-item line totals.' : 'Top product ranking is empty until order items are available.',
      rootCause: orderItems.length > 0 ? 'Resolved through oms_order_items to variants and products.' : 'No oms_order_items rows were available to rank products.',
      filesAffected: ['apps/superadmin/src/lib/superadmin-dashboard-data.ts'],
      recommendedSolution: orderItems.length > 0 ? 'Promote this aggregation into a database view when order volume grows.' : 'Seed or migrate order-item data, then promote aggregation into a database view.',
      implementationSteps: ['Keep dashboard aggregation as the functional baseline.', 'Create v_superadmin_product_sales for scale.', 'Add product drilldown by SKU and category.'],
    },
  ];

  return {
    generatedAt: now.toISOString(),
    healthScore,
    readinessPercent: Math.max(0, Math.min(100, Math.round(90 - sourceIssues.length * 3 - missingCapabilities.length * 2 + (healthScore - 80) / 4))),
    executiveMetrics,
    businessMetrics,
    realtimeMetrics,
    systemMetrics,
    analyticsMetrics,
    recentActivity,
    staffActivity,
    auditLogs: auditLogActivity,
    notifications,
    aiInsights,
    revenueTrend: dayBuckets(paidPayments, 'amount', 7),
    orderTrend: Array.from({ length: 7 }).map((_, index) => {
      const day = startOfDay(new Date(now));
      day.setDate(day.getDate() - (6 - index));
      const next = new Date(day);
      next.setDate(next.getDate() + 1);
      return { label: day.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), value: countByDate(orders, day, next) };
    }),
    topProducts,
    lowStockProducts,
    topCompanies,
    topBranches,
    productionReport: [...notifications, ...missingCapabilities],
  };
}