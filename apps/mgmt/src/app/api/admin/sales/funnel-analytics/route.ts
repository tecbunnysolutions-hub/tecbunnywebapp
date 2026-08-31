import { NextRequest, NextResponse } from 'next/server';
import { getSessionWithRole } from '@tecbunny/core/auth/server-role';
import { logger } from '@tecbunny/core/logger';
import { isAtLeast, type UserRole } from '@tecbunny/core/roles';
import { createClient } from '@tecbunny/database';
import { createServiceClient, isSupabaseServiceConfigured } from '@tecbunny/database/admin';

export const revalidate = 300; // Cache for 5 minutes

function canReadSalesAnalytics(role: UserRole | null | undefined) {
  if (!role) return false;
  return isAtLeast(role, 'admin')
    || isAtLeast(role, 'sales_manager')
    || role === 'sales_executive'
    || role === 'sales'
    || role === 'marketing_manager'
    || role === 'marketing_executive';
}

export async function GET(request: NextRequest) {
  const correlationId = request.headers.get('x-correlation-id') || crypto.randomUUID();

  try {
    const { supabase: authClient, session, role } = await getSessionWithRole(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required', correlationId }, { status: 401 });
    }
    if (!canReadSalesAnalytics(role)) {
      return NextResponse.json({ error: 'Forbidden', correlationId }, { status: 403 });
    }

    const supabase = isSupabaseServiceConfigured ? createServiceClient() : authClient ?? await createClient();
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch all assessment data
    const { data: allMessages, error: messagesError } = await supabase
      .from('contact_messages')
      .select('id, created_at, lead_score, lead_priority, form_identifier, service_interest, inquiry_category')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (messagesError) {
      logger.error('funnel_analytics.fetch_failed', { correlationId, error: messagesError.message });
      throw messagesError;
    }

    const messages = allMessages || [];

    // Build aggregations
    const priorityBreakdown = {
      HOT: messages.filter(m => m.lead_priority === 'HOT').length,
      WARM: messages.filter(m => m.lead_priority === 'WARM').length,
      COLD: messages.filter(m => m.lead_priority === 'COLD').length,
    };

    const scoreDistribution = messages.reduce(
      (acc, m) => {
        const score = m.lead_score ?? 0;
        if (score >= 85) acc['HOT (85-100)']++;
        else if (score >= 50) acc['WARM (50-84)']++;
        else acc['COLD (0-49)']++;
        return acc;
      },
      { 'HOT (85-100)': 0, 'WARM (50-84)': 0, 'COLD (0-49)': 0 }
    );

    const serviceBreakdown = messages.reduce(
      (acc, m) => {
        const svc = m.service_interest || 'Unknown';
        acc[svc] = (acc[svc] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const sourceBreakdown = messages.reduce(
      (acc, m) => {
        const src = m.form_identifier || m.inquiry_category || 'Unknown';
        acc[src] = (acc[src] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Daily trend (last 30 days)
    const dailyTrend: Record<string, { date: string; total: number; hot: number; warm: number; cold: number }> = {};
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyTrend[dateStr] = { date: dateStr, total: 0, hot: 0, warm: 0, cold: 0 };
    }

    messages.forEach(m => {
      const dateStr = m.created_at.split('T')[0];
      if (dailyTrend[dateStr]) {
        dailyTrend[dateStr].total++;
        if (m.lead_priority === 'HOT') dailyTrend[dateStr].hot++;
        else if (m.lead_priority === 'WARM') dailyTrend[dateStr].warm++;
        else dailyTrend[dateStr].cold++;
      }
    });

    // Weekly trend
    const weeklyTrend: Record<string, { week: string; count: number; hot: number }> = {};
    for (let i = 4; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i * 7);
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekStr = weekStart.toISOString().split('T')[0];
      weeklyTrend[weekStr] = { week: weekStr, count: 0, hot: 0 };
    }

    // Top-performing services (by HOT conversion)
    const serviceMetrics = Object.entries(serviceBreakdown).map(([service, count]) => {
      const serviceMessages = messages.filter(m => m.service_interest === service);
      const hotCount = serviceMessages.filter(m => m.lead_priority === 'HOT').length;
      const warmCount = serviceMessages.filter(m => m.lead_priority === 'WARM').length;
      return {
        service,
        total: count,
        hot: hotCount,
        warm: warmCount,
        hotConversionRate: count > 0 ? Math.round((hotCount / count) * 100) : 0,
      };
    }).sort((a, b) => b.hot - a.hot);

    // Funnel metrics
    const totalAssessments = messages.length;
    const assessmentsLast7Days = messages.filter(m => new Date(m.created_at) >= sevenDaysAgo).length;
    const avgLeadScore = messages.length > 0 ? Math.round(messages.reduce((sum, m) => sum + (m.lead_score ?? 0), 0) / messages.length) : 0;
    const hotPercentage = totalAssessments > 0 ? Math.round((priorityBreakdown.HOT / totalAssessments) * 100) : 0;

    logger.info('funnel_analytics.success', {
      correlationId,
      totalMessages: messages.length,
      hotCount: priorityBreakdown.HOT,
      warmCount: priorityBreakdown.WARM,
    });

    return NextResponse.json(
      {
        success: true,
        correlationId,
        summary: {
          totalAssessments,
          assessmentsLast7Days,
          avgLeadScore,
          hotPercentage,
          hotCount: priorityBreakdown.HOT,
          warmCount: priorityBreakdown.WARM,
          coldCount: priorityBreakdown.COLD,
        },
        priorityBreakdown,
        scoreDistribution,
        serviceBreakdown,
        sourceBreakdown,
        serviceMetrics,
        dailyTrend: Object.values(dailyTrend),
        dateRange: {
          from: thirtyDaysAgo.toISOString().split('T')[0],
          to: now.toISOString().split('T')[0],
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch funnel analytics';
    logger.error('funnel_analytics.error', { correlationId, error: message });
    return NextResponse.json({ error: message, correlationId }, { status: 500 });
  }
}
