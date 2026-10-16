import { createServiceClient } from '@tecbunny/database/admin';
import { getSessionWithRole } from '@tecbunny/core/auth/server-role';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface SourceAnalytics {
  source: string;
  totalLeads: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  hotPercentage: number;
  avgLeadScore: number;
  conversationRate: number; // hot + warm
  whatsappClicks: number;
  phoneClicks: number;
  assessmentSubmissions: number;
}

interface SourceDashboard {
  success: boolean;
  summary: {
    totalAssessments: number;
    assessmentsThisWeek: number;
    avgLeadScore: number;
    totalSources: number;
    hotPercentage: number;
  };
  sourcePerformance: SourceAnalytics[];
  topConvertingSource: SourceAnalytics | null;
  trafficTrend: Array<{
    date: string;
    source: string;
    assessments: number;
    hot: number;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const { session, role } = await getSessionWithRole(request);

    // Check permissions
    const canRead = session?.user?.email && (role === 'superadmin' || ['admin', 'marketing_manager', 'marketing_executive', 'sales_manager', 'sales_executive'].includes(role || ''));

    if (!canRead) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const supabase = createServiceClient();

    // 30-day window
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const isoDate = thirtyDaysAgo.toISOString();

    // Get overall summary
    const { data: allAssessments, error: summaryError } = await supabase
      .from('contact_messages')
      .select('id, lead_score, lead_priority, lead_source, created_at')
      .gte('created_at', isoDate)
      .eq('form_identifier', 'technology_assessment_funnel');

    if (summaryError) {
      console.error('Error fetching assessments:', summaryError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch data' },
        { status: 500 }
      );
    }

    // Get engagement metrics from funnel_events
    const { data: funnelEvents, error: eventsError } = await supabase
      .from('funnel_events')
      .select('event_type, source, occurred_at')
      .gte('occurred_at', isoDate);

    if (eventsError) {
      console.error('Error fetching funnel events:', eventsError);
    }

    // Calculate summary metrics
    const totalAssessments = allAssessments?.length || 0;
    const thisWeek = allAssessments?.filter(a => {
      const assessDate = new Date(a.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return assessDate >= weekAgo;
    }).length || 0;

    const avgLeadScore = allAssessments?.length
      ? Math.round(
          allAssessments.reduce((sum, a) => sum + (a.lead_score || 0), 0) / allAssessments.length
        )
      : 0;

    const hotCount = allAssessments?.filter(a => a.lead_priority === 'HOT').length || 0;
    const hotPercentage = totalAssessments ? Math.round((hotCount / totalAssessments) * 100) : 0;

    // Group by source
    const sourceMap = new Map<string, SourceAnalytics>();

    allAssessments?.forEach(assessment => {
      const source = assessment.lead_source || 'direct';
      if (!sourceMap.has(source)) {
        sourceMap.set(source, {
          source,
          totalLeads: 0,
          hotLeads: 0,
          warmLeads: 0,
          coldLeads: 0,
          hotPercentage: 0,
          avgLeadScore: 0,
          conversationRate: 0,
          whatsappClicks: 0,
          phoneClicks: 0,
          assessmentSubmissions: 0,
        });
      }

      const sourceData = sourceMap.get(source)!;
      sourceData.totalLeads++;

      if (assessment.lead_priority === 'HOT') sourceData.hotLeads++;
      else if (assessment.lead_priority === 'WARM') sourceData.warmLeads++;
      else sourceData.coldLeads++;

      sourceData.avgLeadScore += assessment.lead_score || 0;
    });

    // Add engagement metrics from funnel events
    funnelEvents?.forEach(event => {
      const source = event.source || 'direct';
      if (sourceMap.has(source)) {
        const sourceData = sourceMap.get(source)!;
        if (event.event_type === 'whatsapp_clicked') sourceData.whatsappClicks++;
        else if (event.event_type === 'phone_clicked') sourceData.phoneClicks++;
        else if (event.event_type === 'assessment_submitted') sourceData.assessmentSubmissions++;
      }
    });

    // Calculate percentages and convert to array
    const sourcePerformance: SourceAnalytics[] = Array.from(sourceMap.values())
      .map(source => ({
        ...source,
        hotPercentage: source.totalLeads ? Math.round((source.hotLeads / source.totalLeads) * 100) : 0,
        avgLeadScore: source.totalLeads ? Math.round(source.avgLeadScore / source.totalLeads) : 0,
        conversationRate: source.totalLeads ? Math.round(((source.hotLeads + source.warmLeads) / source.totalLeads) * 100) : 0,
      }))
      .sort((a, b) => b.hotLeads - a.hotLeads);

    // Find top converting source
    const topConvertingSource = sourcePerformance[0] || null;

    // Generate traffic trend (last 7 days by source)
    const trafficTrend: Array<{ date: string; source: string; assessments: number; hot: number }> = [];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      sourcePerformance.forEach(source => {
        const dailyAssessments = allAssessments?.filter(a => {
          const assessDate = new Date(a.created_at).toISOString().split('T')[0];
          return assessDate === dateStr && (a.lead_source || 'direct') === source.source;
        }).length || 0;

        const dailyHot = allAssessments?.filter(a => {
          const assessDate = new Date(a.created_at).toISOString().split('T')[0];
          return assessDate === dateStr && (a.lead_source || 'direct') === source.source && a.lead_priority === 'HOT';
        }).length || 0;

        if (dailyAssessments > 0) {
          trafficTrend.push({
            date: dateStr,
            source: source.source,
            assessments: dailyAssessments,
            hot: dailyHot,
          });
        }
      });
    }

    const dashboard: SourceDashboard = {
      success: true,
      summary: {
        totalAssessments,
        assessmentsThisWeek: thisWeek,
        avgLeadScore,
        totalSources: sourcePerformance.length,
        hotPercentage,
      },
      sourcePerformance,
      topConvertingSource,
      trafficTrend,
    };

    return NextResponse.json(dashboard, {
      headers: { 'Cache-Control': 'public, max-age=300' }, // 5 min cache
    });
  } catch (error) {
    console.error('Error in source-analytics route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
