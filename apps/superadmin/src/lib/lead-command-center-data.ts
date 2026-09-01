'use server';

import { createSupabaseServiceClient } from '@tecbunny/database/admin';

export interface LeadMetrics {
  totalLeads: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  avgLeadScore: number;
  convertedLeads: number;
  pendingFollowup: number;
  todayLeads: number;
}

export interface RevenueMetrics {
  paidRevenue: number;
  pendingRevenue: number;
  todayRevenue: number;
  yesterdayRevenue: number;
  weekRevenue: number;
  paymentCount: number;
  paidCount: number;
  pendingCount: number;
}

export interface OrderTrend {
  orderDate: string;
  orderCount: number;
  orderValue: number;
}

export interface LeadSourcePerformance {
  source: string;
  totalLeads: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  avgScore: number;
  conversionRate: number;
}

export interface LeadAssignmentStatus {
  assignedTo: string;
  assignedToName: string;
  totalAssigned: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  converted: number;
  pendingFollowup: number;
}

export interface HotLead {
  id: string;
  name: string;
  company: string;
  estimatedValue: number;
  leadScore: number;
  source: string;
  assignedToName: string;
  lastContactAt: string | null;
  nextFollowupAt: string | null;
  status: string;
  contactMethod: string;
}

/**
 * Fetch dashboard revenue metrics using database aggregation
 * Replaces client-side 5K row aggregation
 */
export async function getRevenueMetrics(orgId?: string): Promise<RevenueMetrics> {
  const supabase = createSupabaseServiceClient();
  
  try {
    const { data, error } = await supabase.rpc('get_dashboard_revenue_metrics', {
      days_back: 30,
      org_id_filter: orgId || null,
    });

    if (error) {
      console.error('Error fetching revenue metrics:', error);
      return {
        paidRevenue: 0,
        pendingRevenue: 0,
        todayRevenue: 0,
        yesterdayRevenue: 0,
        weekRevenue: 0,
        paymentCount: 0,
        paidCount: 0,
        pendingCount: 0,
      };
    }

    if (!data || data.length === 0) {
      return {
        paidRevenue: 0,
        pendingRevenue: 0,
        todayRevenue: 0,
        yesterdayRevenue: 0,
        weekRevenue: 0,
        paymentCount: 0,
        paidCount: 0,
        pendingCount: 0,
      };
    }

    const row = data[0];
    return {
      paidRevenue: row.paid_revenue || 0,
      pendingRevenue: row.pending_revenue || 0,
      todayRevenue: row.today_revenue || 0,
      yesterdayRevenue: row.yesterday_revenue || 0,
      weekRevenue: row.week_revenue || 0,
      paymentCount: row.payment_count || 0,
      paidCount: row.paid_count || 0,
      pendingCount: row.pending_count || 0,
    };
  } catch (error) {
    console.error('Error in getRevenueMetrics:', error);
    return {
      paidRevenue: 0,
      pendingRevenue: 0,
      todayRevenue: 0,
      yesterdayRevenue: 0,
      weekRevenue: 0,
      paymentCount: 0,
      paidCount: 0,
      pendingCount: 0,
    };
  }
}

/**
 * Fetch lead metrics using database aggregation
 * Replaces client-side filtering of 5K sls_leads rows
 */
export async function getLeadMetrics(orgId?: string): Promise<LeadMetrics> {
  const supabase = createSupabaseServiceClient();
  
  try {
    const { data, error } = await supabase.rpc('get_dashboard_lead_metrics', {
      days_back: 7,
      org_id_filter: orgId || null,
    });

    if (error) {
      console.error('Error fetching lead metrics:', error);
      return {
        totalLeads: 0,
        hotLeads: 0,
        warmLeads: 0,
        coldLeads: 0,
        avgLeadScore: 0,
        convertedLeads: 0,
        pendingFollowup: 0,
        todayLeads: 0,
      };
    }

    if (!data || data.length === 0) {
      return {
        totalLeads: 0,
        hotLeads: 0,
        warmLeads: 0,
        coldLeads: 0,
        avgLeadScore: 0,
        convertedLeads: 0,
        pendingFollowup: 0,
        todayLeads: 0,
      };
    }

    const row = data[0];
    return {
      totalLeads: row.total_leads || 0,
      hotLeads: row.hot_leads || 0,
      warmLeads: row.warm_leads || 0,
      coldLeads: row.cold_leads || 0,
      avgLeadScore: Number(row.avg_lead_score || 0),
      convertedLeads: row.converted_leads || 0,
      pendingFollowup: row.pending_followup || 0,
      todayLeads: row.today_leads || 0,
    };
  } catch (error) {
    console.error('Error in getLeadMetrics:', error);
    return {
      totalLeads: 0,
      hotLeads: 0,
      warmLeads: 0,
      coldLeads: 0,
      avgLeadScore: 0,
      convertedLeads: 0,
      pendingFollowup: 0,
      todayLeads: 0,
    };
  }
}

/**
 * Fetch order trends for chart visualization
 * Returns daily aggregated data, not individual rows
 */
export async function getOrderTrends(days: number = 30, orgId?: string): Promise<OrderTrend[]> {
  const supabase = createSupabaseServiceClient();
  
  try {
    const { data, error } = await supabase.rpc('get_dashboard_order_trend', {
      days,
      org_id_filter: orgId || null,
    });

    if (error || !data) {
      console.error('Error fetching order trends:', error);
      return [];
    }

    return data.map((row: any) => ({
      orderDate: row.order_date,
      orderCount: row.order_count || 0,
      orderValue: row.order_value || 0,
    }));
  } catch (error) {
    console.error('Error in getOrderTrends:', error);
    return [];
  }
}

/**
 * Fetch lead source performance for attribution analysis
 */
export async function getLeadSourcePerformance(orgId?: string): Promise<LeadSourcePerformance[]> {
  const supabase = createSupabaseServiceClient();
  
  try {
    const { data, error } = await supabase.rpc('get_dashboard_lead_source_performance', {
      org_id_filter: orgId || null,
    });

    if (error || !data) {
      console.error('Error fetching lead source performance:', error);
      return [];
    }

    return data.map((row: any) => ({
      source: row.source || 'Direct',
      totalLeads: row.total_leads || 0,
      hotLeads: row.hot_leads || 0,
      warmLeads: row.warm_leads || 0,
      coldLeads: row.cold_leads || 0,
      avgScore: Number(row.avg_score || 0),
      conversionRate: Number(row.conversion_rate || 0),
    }));
  } catch (error) {
    console.error('Error in getLeadSourcePerformance:', error);
    return [];
  }
}

/**
 * Fetch lead assignment status for workload distribution monitoring
 */
export async function getLeadAssignmentStatus(orgId?: string): Promise<LeadAssignmentStatus[]> {
  const supabase = createSupabaseServiceClient();
  
  try {
    const { data, error } = await supabase.rpc('get_dashboard_lead_assignment_status', {
      org_id_filter: orgId || null,
    });

    if (error || !data) {
      console.error('Error fetching lead assignment status:', error);
      return [];
    }

    return data.map((row: any) => ({
      assignedTo: row.assigned_to || 'unassigned',
      assignedToName: row.assigned_to_name || 'Unassigned',
      totalAssigned: row.total_assigned || 0,
      hotLeads: row.hot_leads || 0,
      warmLeads: row.warm_leads || 0,
      coldLeads: row.cold_leads || 0,
      converted: row.converted || 0,
      pendingFollowup: row.pending_followup || 0,
    }));
  } catch (error) {
    console.error('Error in getLeadAssignmentStatus:', error);
    return [];
  }
}

/**
 * Fetch hot leads priority queue for immediate action
 * Returns up to 20 leads that need follow-up NOW
 */
export async function getHotLeadsPriorityQueue(orgId?: string): Promise<HotLead[]> {
  const supabase = createSupabaseServiceClient();
  
  try {
    const { data, error } = await supabase.rpc('get_hot_leads_priority_queue', {
      limit_rows: 20,
      org_id_filter: orgId || null,
    });

    if (error || !data) {
      console.error('Error fetching hot leads:', error);
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      name: row.name || 'Unknown',
      company: row.company || 'N/A',
      estimatedValue: row.estimated_value || 0,
      leadScore: row.lead_score || 0,
      source: row.source || 'Direct',
      assignedToName: row.assigned_to_name || 'Unassigned',
      lastContactAt: row.last_contact_at,
      nextFollowupAt: row.next_followup_at,
      status: row.status || 'pending',
      contactMethod: row.contact_method || 'whatsapp',
    }));
  } catch (error) {
    console.error('Error in getHotLeadsPriorityQueue:', error);
    return [];
  }
}

/**
 * Recalculate lead score based on engagement signals
 * Triggered after lead interactions (assessment, contact, etc.)
 */
export async function recalculateLeadScore(leadId: string): Promise<number | null> {
  const supabase = createSupabaseServiceClient();
  
  try {
    const { data, error } = await supabase.rpc('recalculate_lead_score', {
      lead_id: leadId,
    });

    if (error) {
      console.error('Error recalculating lead score:', error);
      return null;
    }

    return data as number;
  } catch (error) {
    console.error('Error in recalculateLeadScore:', error);
    return null;
  }
}
