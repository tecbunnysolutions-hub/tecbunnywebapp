import { NextRequest, NextResponse } from 'next/server';

import { getSessionWithRole } from '@tecbunny/core/auth/server-role';
import { logger } from '@tecbunny/core/logger';
import { formatOrderNumber } from '@tecbunny/core/order-utils';
import { isAtLeast, type UserRole } from '@tecbunny/core/roles';
import { createClient } from '@tecbunny/database';
import { createServiceClient, isSupabaseServiceConfigured } from '@tecbunny/database/admin';

export const revalidate = 0;

type Metric = {
  title: string;
  value: string;
  detail: string;
  tone: 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'slate';
  icon: 'trending' | 'users' | 'orders' | 'package' | 'clock' | 'shield' | 'alert';
};

type Activity = {
  id: string;
  title: string;
  detail: string;
  date: string;
  type: 'order' | 'lead' | 'ticket';
};

type Task = {
  label: string;
  href: string;
  priority: 'high' | 'medium' | 'normal';
};

const ACTIVE_LEAD_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL'] as const;
const OPEN_ORDER_STATUSES = ['Pending', 'Processing', 'Ready to Ship', 'Shipped', 'Ready for Pickup'] as const;
const CLOSED_SERVICE_STATUSES = ['COMPLETED', 'CANCELLED', 'CLOSED', 'RESOLVED'] as const;
const COMPLETED_ORDER_STATUSES = ['Completed', 'Delivered', 'Payment Confirmed'] as const;

function canReadManagement(role: UserRole | null | undefined) {
  if (!role || role === 'customer') return false;
  return isAtLeast(role, 'admin')
    || isAtLeast(role, 'sales_manager')
    || isAtLeast(role, 'service_manager')
    || isAtLeast(role, 'marketing_manager')
    || role === 'sales_executive'
    || role === 'sales'
    || role === 'store_executive'
    || role === 'sales-staff'
    || role === 'sales_agent'
    || role === 'sales-external'
    || role === 'service_engineer'
    || role === 'support'
    || role === 'delivery'
    || role === 'warehouse'
    || role === 'hr'
    || role === 'marketing_executive'
    || role === 'accounts';
}

function currency(value: number) {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function count(value: number) {
  return value.toLocaleString('en-IN');
}

function coerceNumber(value: unknown) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const parsed = Number.parseFloat(String(value ?? '0'));
  return Number.isFinite(parsed) ? parsed : 0;
}

async function safeCount(query: PromiseLike<{ count: number | null; error: { message?: string; code?: string } | null }>, label: string) {
  const { count: total, error } = await query;
  if (error) {
    logger.warn('mgmt.overview.count_failed', { label, error: error.message, code: error.code });
    return 0;
  }
  return total ?? 0;
}

async function safeRows<T>(query: PromiseLike<{ data: T[] | null; error: { message?: string; code?: string } | null }>, label: string) {
  const { data, error } = await query;
  if (error) {
    logger.warn('mgmt.overview.rows_failed', { label, error: error.message, code: error.code });
    return [];
  }
  return data ?? [];
}

function roleTrack(role: UserRole | null): 'sales' | 'service' | 'general' {
  if (!role) return 'general';
  if (role === 'service_engineer' || role === 'support' || isAtLeast(role, 'service_manager')) return 'service';
  if (role === 'sales' || role === 'sales-staff' || role === 'sales-external' || role === 'sales_executive' || role === 'store_executive' || role === 'sales_agent' || isAtLeast(role, 'sales_manager')) return 'sales';
  return 'general';
}

export async function GET(request: NextRequest) {
  const correlationId = request.headers.get('x-correlation-id') || crypto.randomUUID();

  try {
    const { supabase: authClient, session, role } = await getSessionWithRole(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required', correlationId }, { status: 401 });
    }
    if (!canReadManagement(role)) {
      return NextResponse.json({ error: 'Forbidden', correlationId }, { status: 403 });
    }

    const supabase = isSupabaseServiceConfigured ? createServiceClient() : authClient ?? await createClient();
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const track = roleTrack(role);

    const [todayOrders, monthOrders, openOrders, activeLeads, newLeadsToday, productCount, openServiceTickets, recentOrders, recentLeads, recentTickets] = await Promise.all([
      safeRows<Record<string, unknown>>(
        supabase.from('orders').select('total').gte('created_at', startOfDay.toISOString()).in('status', COMPLETED_ORDER_STATUSES),
        'today_orders',
      ),
      safeRows<Record<string, unknown>>(
        supabase.from('orders').select('total').gte('created_at', startOfMonth.toISOString()).neq('status', 'cancelled'),
        'month_orders',
      ),
      safeCount(
        supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', OPEN_ORDER_STATUSES),
        'open_orders',
      ),
      safeCount(
        supabase.from('sls_leads').select('*', { count: 'exact', head: true }).in('status', ACTIVE_LEAD_STATUSES).is('deleted_at', null),
        'active_leads',
      ),
      safeCount(
        supabase.from('sls_leads').select('*', { count: 'exact', head: true }).gte('created_at', startOfDay.toISOString()).is('deleted_at', null),
        'new_leads_today',
      ),
      safeCount(
        supabase.from('products').select('*', { count: 'exact', head: true }).is('deleted_at', null),
        'products',
      ),
      safeCount(
        supabase.from('service_tickets').select('*', { count: 'exact', head: true }).not('status', 'in', `(${CLOSED_SERVICE_STATUSES.join(',')})`),
        'open_service_tickets',
      ),
      safeRows<Record<string, unknown>>(
        supabase.from('orders').select('id, customer_name, status, total, created_at').order('created_at', { ascending: false }).limit(5),
        'recent_orders',
      ),
      safeRows<Record<string, unknown>>(
        supabase.from('sls_leads').select('id, first_name, last_name, status, created_at').is('deleted_at', null).order('created_at', { ascending: false }).limit(5),
        'recent_leads',
      ),
      safeRows<Record<string, unknown>>(
        supabase.from('service_tickets').select('id, ticket_number, subject, status, created_at').order('created_at', { ascending: false }).limit(5),
        'recent_service_tickets',
      ),
    ]);

    const todayRevenue = todayOrders.reduce((sum, order) => sum + coerceNumber(order.total), 0);
    const monthRevenue = monthOrders.reduce((sum, order) => sum + coerceNumber(order.total), 0);
    const activities: Activity[] = [
      ...recentOrders.map((order) => ({
        id: `order-${String(order.id ?? crypto.randomUUID())}`,
        title: `Order ${formatOrderNumber(String(order.id ?? ''))}`,
        detail: `${String(order.status ?? 'Pending')} · ${currency(coerceNumber(order.total))}`,
        date: String(order.created_at ?? ''),
        type: 'order' as const,
      })),
      ...recentLeads.map((lead) => ({
        id: `lead-${String(lead.id ?? crypto.randomUUID())}`,
        title: [lead.first_name, lead.last_name].filter(Boolean).join(' ') || 'CRM lead',
        detail: `Lead status: ${String(lead.status ?? 'NEW').replaceAll('_', ' ')}`,
        date: String(lead.created_at ?? ''),
        type: 'lead' as const,
      })),
      ...recentTickets.map((ticket) => ({
        id: `ticket-${String(ticket.id ?? crypto.randomUUID())}`,
        title: String(ticket.subject ?? ticket.ticket_number ?? 'Service ticket'),
        detail: `Ticket status: ${String(ticket.status ?? 'OPEN').replaceAll('_', ' ')}`,
        date: String(ticket.created_at ?? ''),
        type: 'ticket' as const,
      })),
    ].sort((left, right) => Date.parse(right.date || '0') - Date.parse(left.date || '0')).slice(0, 6);

    const salesMetrics: Metric[] = [
      { title: 'Today Revenue', value: currency(todayRevenue), detail: 'Completed orders since midnight', tone: 'blue', icon: 'trending' },
      { title: 'Active Leads', value: count(activeLeads), detail: 'Open CRM opportunities', tone: 'indigo', icon: 'users' },
      { title: 'New Leads Today', value: count(newLeadsToday), detail: 'Fresh CRM intake', tone: 'emerald', icon: 'users' },
      { title: 'Open Orders', value: count(openOrders), detail: 'Awaiting fulfillment or pickup', tone: 'amber', icon: 'orders' },
    ];
    const serviceMetrics: Metric[] = [
      { title: 'Open Tickets', value: count(openServiceTickets), detail: 'Active service workload', tone: openServiceTickets > 0 ? 'rose' : 'emerald', icon: 'alert' },
      { title: 'Open Orders', value: count(openOrders), detail: 'Orders needing operational follow-up', tone: 'amber', icon: 'orders' },
      { title: 'Active Leads', value: count(activeLeads), detail: 'Customer issues and requests in CRM', tone: 'indigo', icon: 'users' },
      { title: 'Product Catalog', value: count(productCount), detail: 'Sellable/serviceable items', tone: 'blue', icon: 'package' },
    ];
    const generalMetrics: Metric[] = [
      { title: 'Month Revenue', value: currency(monthRevenue), detail: 'Non-cancelled order value this month', tone: 'blue', icon: 'trending' },
      { title: 'Open Orders', value: count(openOrders), detail: 'Awaiting fulfillment or pickup', tone: 'amber', icon: 'orders' },
      { title: 'Active Leads', value: count(activeLeads), detail: 'Open CRM opportunities', tone: 'indigo', icon: 'users' },
      { title: 'Product Catalog', value: count(productCount), detail: 'Active catalog records', tone: 'emerald', icon: 'package' },
    ];

    const tasks: Task[] = [
      ...(openOrders > 0 ? [{ label: `Review ${count(openOrders)} open orders`, href: '/mgmt/orders', priority: 'high' as const }] : []),
      ...(activeLeads > 0 ? [{ label: `Follow up ${count(activeLeads)} active CRM leads`, href: '/mgmt/crm', priority: 'medium' as const }] : []),
      ...(openServiceTickets > 0 ? [{ label: `Triage ${count(openServiceTickets)} service tickets`, href: '/mgmt/service-manager/tickets', priority: 'high' as const }] : []),
      ...(productCount === 0 ? [{ label: 'Add products to the catalog', href: '/mgmt/admin/products', priority: 'medium' as const }] : []),
    ].slice(0, 4);

    return NextResponse.json({
      success: true,
      track,
      metrics: track === 'sales' ? salesMetrics : track === 'service' ? serviceMetrics : generalMetrics,
      activities,
      tasks,
      generatedAt: now.toISOString(),
      correlationId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load management overview';
    logger.error('mgmt.overview.failed', { correlationId, error: message });
    return NextResponse.json({ error: message, correlationId }, { status: 500 });
  }
}