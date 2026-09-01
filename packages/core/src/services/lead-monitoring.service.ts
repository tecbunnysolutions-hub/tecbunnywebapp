import { createClient } from '@tecbunny/database';

type SupabaseClient = ReturnType<typeof createClient>;

export interface LeadHealthMetrics {
  totalLeads: number;
  leadsBy24h: number;
  leadsBy7d: number;
  avgLeadScore: number;
  heatLevelDistribution: {
    COLD: number;
    WARM: number;
    HOT: number;
  };
  statusDistribution: Record<string, number>;
  unassignedLeads: number;
  leadWithoutFollowup: number;
  dedupStats: {
    duplicatesByEmail: number;
    duplicatesByPhone: number;
    totalUniqueSources: number;
  };
  sourceDistribution: Record<string, number>;
}

export interface AssignmentMetrics {
  totalActiveAssignments: number;
  assignmentsByExec: Record<string, number>;
  avgAssignmentsPerExec: number;
  maxAssignmentLoad: number;
  minAssignmentLoad: number;
  workloadImbalance: number; // percentage deviation
}

export interface FollowupMetrics {
  totalFollowupTasks: number;
  pendingFollowupTasks: number;
  overdueFollowupTasks: number;
  completedFollowupTasks: number;
  avgFollowupCompletionTime: number | null; // in hours
}

export interface ContactMessageMetrics {
  totalMessages: number;
  messagesBy24h: number;
  avgMessagesPerLead: number;
  messageSources: Record<string, number>;
}

export interface LeadSystemHealth {
  timestamp: string;
  overallHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  status?: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  issues: string[];
  warnings: string[];
  metrics: {
    leads: LeadHealthMetrics;
    assignments: AssignmentMetrics;
    followup: FollowupMetrics;
    messages: ContactMessageMetrics;
  };
}

export class LeadMonitoringService {
  /**
   * Get comprehensive health metrics for the lead system.
   * Use this for production monitoring, dashboards, and alerts.
   */
  static async getSystemHealth(supabase: SupabaseClient): Promise<LeadSystemHealth> {
    const timestamp = new Date().toISOString();
    const issues: string[] = [];
    const warnings: string[] = [];

    try {
      // Fetch all metrics in parallel
      const [leadMetrics, assignmentMetrics, followupMetrics, messageMetrics] = await Promise.all([
        this.getLeadMetrics(supabase),
        this.getAssignmentMetrics(supabase),
        this.getFollowupMetrics(supabase),
        this.getMessageMetrics(supabase),
      ]);

      // Determine health status based on thresholds
      let overallHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' = 'HEALTHY';

      // Check for critical issues
      if (leadMetrics.unassignedLeads > 50) {
        issues.push(`${leadMetrics.unassignedLeads} leads without assignment (>50 threshold)`);
        overallHealth = 'CRITICAL';
      }

      if (followupMetrics.overdueFollowupTasks > 20) {
        issues.push(`${followupMetrics.overdueFollowupTasks} overdue follow-up tasks (>20 threshold)`);
        overallHealth = 'CRITICAL';
      }

      // Check for degraded conditions
      if (assignmentMetrics.workloadImbalance > 50) {
        warnings.push(
          `Assignment workload imbalance at ${Math.round(assignmentMetrics.workloadImbalance)}% ` +
            `(max: ${assignmentMetrics.maxAssignmentLoad}, min: ${assignmentMetrics.minAssignmentLoad})`
        );
        if (overallHealth === 'HEALTHY') overallHealth = 'DEGRADED';
      }

      if (leadMetrics.leadWithoutFollowup > 100) {
        warnings.push(`${leadMetrics.leadWithoutFollowup} leads without follow-up scheduled (>100 threshold)`);
        if (overallHealth === 'HEALTHY') overallHealth = 'DEGRADED';
      }

      if (leadMetrics.avgLeadScore < 30) {
        warnings.push(`Average lead score is low: ${Math.round(leadMetrics.avgLeadScore)} (expected >30)`);
        if (overallHealth === 'HEALTHY') overallHealth = 'DEGRADED';
      }

      const coldLeadPct = leadMetrics.totalLeads > 0 ? (leadMetrics.heatLevelDistribution.COLD / leadMetrics.totalLeads) * 100 : 0;
      if (coldLeadPct > 70) {
        warnings.push(
          `${Math.round(coldLeadPct)}% of leads are COLD (>70% threshold) - possible scoring issue`
        );
        if (overallHealth === 'HEALTHY') overallHealth = 'DEGRADED';
      }

      return {
        timestamp,
        overallHealth,
        status: overallHealth,
        issues,
        warnings,
        metrics: {
          leads: leadMetrics,
          assignments: assignmentMetrics,
          followup: followupMetrics,
          messages: messageMetrics,
        },
      };
    } catch (error) {
      return {
        timestamp,
        overallHealth: 'CRITICAL',
        issues: [
          error instanceof Error ? error.message : 'Unknown error retrieving system health metrics',
        ],
        warnings: [],
        metrics: {
          leads: {} as LeadHealthMetrics,
          assignments: {} as AssignmentMetrics,
          followup: {} as FollowupMetrics,
          messages: {} as ContactMessageMetrics,
        },
      };
    }
  }

  private static async getLeadMetrics(supabase: SupabaseClient): Promise<LeadHealthMetrics> {
    const now = new Date();
    const day24hAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const day7dAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Get total leads
    const { data: allLeads, error: allError } = await supabase
      .from('sls_leads')
      .select('id, source_id, lead_score, heat_level, status, lead_owner_id, created_at', { count: 'exact' })
      .is('deleted_at', null);

    if (allError) throw allError;
    const totalLeads = allLeads?.length ?? 0;

    // Get leads created in last 24h
    const { data: leads24h } = await supabase
      .from('sls_leads')
      .select('id', { count: 'exact' })
      .is('deleted_at', null)
      .gte('created_at', day24hAgo);

    // Get leads created in last 7d
    const { data: leads7d } = await supabase
      .from('sls_leads')
      .select('id', { count: 'exact' })
      .is('deleted_at', null)
      .gte('created_at', day7dAgo);

    // Calculate avg score
    const scores = (allLeads as any[])?.map((l) => l.lead_score).filter((s) => typeof s === 'number') ?? [];
    const avgLeadScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    // Distribution by heat level
    const heatLevelDistribution = {
      COLD: allLeads?.filter((l: any) => l.heat_level === 'COLD').length ?? 0,
      WARM: allLeads?.filter((l: any) => l.heat_level === 'WARM').length ?? 0,
      HOT: allLeads?.filter((l: any) => l.heat_level === 'HOT').length ?? 0,
    };

    // Distribution by status
    const statusDistribution: Record<string, number> = {};
    allLeads?.forEach((lead: any) => {
      statusDistribution[lead.status] = (statusDistribution[lead.status] ?? 0) + 1;
    });

    // Unassigned leads
    const unassignedLeads = allLeads?.filter((l: any) => !l.lead_owner_id).length ?? 0;

    // Leads without follow-up
    const { data: leadsWithFollowup } = await supabase
      .from('sls_leads')
      .select('id')
      .is('deleted_at', null)
      .not('next_followup_at', 'is', null);

    const leadWithoutFollowup = totalLeads - (leadsWithFollowup?.length ?? 0);

    // Deduplication stats
    const { data: emailDupes } = await supabase
      .from('sls_leads')
      .select('email')
      .is('deleted_at', null)
      .not('email', 'is', null);

    const emailCounts = new Map<string, number>();
    emailDupes?.forEach((lead: any) => {
      emailCounts.set(lead.email, (emailCounts.get(lead.email) ?? 0) + 1);
    });
    const duplicatesByEmail = Array.from(emailCounts.values()).filter((c) => c > 1).length;

    const { data: phoneDupes } = await supabase
      .from('sls_leads')
      .select('phone')
      .is('deleted_at', null)
      .not('phone', 'is', null);

    const phoneCounts = new Map<string, number>();
    phoneDupes?.forEach((lead: any) => {
      phoneCounts.set(lead.phone, (phoneCounts.get(lead.phone) ?? 0) + 1);
    });
    const duplicatesByPhone = Array.from(phoneCounts.values()).filter((c) => c > 1).length;

    // Source distribution
    const { data: sources } = await supabase.from('sls_lead_sources').select('id, name');
    const totalUniqueSources = sources?.length ?? 0;

    const sourceDistribution: Record<string, number> = Object.create(null);
    const sourceLookup = new Map((sources ?? []).map((source: any) => [source.id, source.name]));

    allLeads?.forEach((lead: any) => {
      const sourceId = lead.source_id;
      const sourceName = String(sourceLookup.get(sourceId) ?? 'unknown');
      sourceDistribution[sourceName] = (sourceDistribution[sourceName] ?? 0) + 1;
    });

    return {
      totalLeads,
      leadsBy24h: leads24h?.length ?? 0,
      leadsBy7d: leads7d?.length ?? 0,
      avgLeadScore,
      heatLevelDistribution,
      statusDistribution,
      unassignedLeads,
      leadWithoutFollowup,
      dedupStats: {
        duplicatesByEmail,
        duplicatesByPhone,
        totalUniqueSources,
      },
      sourceDistribution,
    };
  }

  private static async getAssignmentMetrics(supabase: SupabaseClient): Promise<AssignmentMetrics> {
    const { data: assignments } = await supabase
      .from('sls_lead_assignments')
      .select('sales_executive_id')
      .eq('is_active', true);

    const assignmentsByExec: Record<string, number> = {};
    assignments?.forEach((a: any) => {
      if (a.sales_executive_id) {
        assignmentsByExec[a.sales_executive_id] = (assignmentsByExec[a.sales_executive_id] ?? 0) + 1;
      }
    });

    const totalActiveAssignments = assignments?.length ?? 0;
    const execIds = Object.keys(assignmentsByExec);
    const avgAssignmentsPerExec = execIds.length > 0 ? totalActiveAssignments / execIds.length : 0;

    const loads = Object.values(assignmentsByExec);
    const maxAssignmentLoad = loads.length > 0 ? Math.max(...loads) : 0;
    const minAssignmentLoad = loads.length > 0 ? Math.min(...loads) : 0;

    const workloadImbalance =
      maxAssignmentLoad > 0 && minAssignmentLoad > 0
        ? ((maxAssignmentLoad - minAssignmentLoad) / avgAssignmentsPerExec) * 100
        : 0;

    return {
      totalActiveAssignments,
      assignmentsByExec,
      avgAssignmentsPerExec,
      maxAssignmentLoad,
      minAssignmentLoad,
      workloadImbalance,
    };
  }

  private static async getFollowupMetrics(supabase: SupabaseClient): Promise<FollowupMetrics> {
    const now = new Date().toISOString();

    const { data: allTasks } = await supabase
      .from('lead_followup_tasks')
      .select('id, status, due_at, created_at, updated_at');

    const totalFollowupTasks = allTasks?.length ?? 0;
    const pendingFollowupTasks = allTasks?.filter((t: any) => t.status === 'pending').length ?? 0;
    const completedFollowupTasks = allTasks?.filter((t: any) => t.status === 'completed').length ?? 0;
    const overdueFollowupTasks = allTasks?.filter(
      (t: any) => t.status === 'pending' && t.due_at && new Date(t.due_at) < new Date(now)
    ).length ?? 0;

    // Calculate avg completion time
    const completedTasks = allTasks?.filter((t: any) => t.status === 'completed' && t.created_at && t.updated_at) ?? [];
    let avgFollowupCompletionTime: number | null = null;

    if (completedTasks.length > 0) {
      const completionTimes = completedTasks.map((t: any) => {
        const created = new Date(t.created_at).getTime();
        const updated = new Date(t.updated_at).getTime();
        return (updated - created) / (1000 * 60 * 60); // convert to hours
      });
      avgFollowupCompletionTime = completionTimes.reduce((a: number, b: number) => a + b, 0) / completionTimes.length;
    }

    return {
      totalFollowupTasks,
      pendingFollowupTasks,
      overdueFollowupTasks,
      completedFollowupTasks,
      avgFollowupCompletionTime,
    };
  }

  private static async getMessageMetrics(supabase: SupabaseClient): Promise<ContactMessageMetrics> {
    const now = new Date();
    const day24hAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    const { data: allMessages } = await supabase
      .from('contact_messages')
      .select('id, lead_id, lead_source');

    const totalMessages = allMessages?.length ?? 0;

    const { data: messagesRecent } = await supabase
      .from('contact_messages')
      .select('id')
      .gte('created_at', day24hAgo);

    const messagesBy24h = messagesRecent?.length ?? 0;

    // Get unique leads
    const { data: allLeads } = await supabase
      .from('sls_leads')
      .select('id', { count: 'exact' });

    const totalLeads = allLeads?.length ?? 1;
    const avgMessagesPerLead = totalMessages / totalLeads;

    // Message sources
    const messageSources: Record<string, number> = {};
    allMessages?.forEach((msg: any) => {
      const source = msg.lead_source ?? 'unknown';
      messageSources[source] = (messageSources[source] ?? 0) + 1;
    });

    return {
      totalMessages,
      messagesBy24h,
      avgMessagesPerLead,
      messageSources,
    };
  }

  /**
   * Audit and report data quality issues.
   */
  static async auditDataQuality(supabase: SupabaseClient): Promise<{
    issues: string[];
    stats: {
      leadsWithDuplicateEmails: number;
      leadsWithDuplicatePhones: number;
      leadsWithMissingName: number;
      leadsWithMissingContact: number;
      orphanedMessages: number;
      orphanedFollowupTasks: number;
    };
  }> {
    const issues: string[] = [];
    const stats = {
      leadsWithDuplicateEmails: 0,
      leadsWithDuplicatePhones: 0,
      leadsWithMissingName: 0,
      leadsWithMissingContact: 0,
      orphanedMessages: 0,
      orphanedFollowupTasks: 0,
    };

    try {
      // Check for leads with missing names
      const { data: noNameLeads } = await supabase
        .from('sls_leads')
        .select('id')
        .or('first_name.is.null,first_name.eq.""')
        .is('deleted_at', null);

      stats.leadsWithMissingName = noNameLeads?.length ?? 0;
      if (stats.leadsWithMissingName > 0) {
        issues.push(`${stats.leadsWithMissingName} leads with missing first_name`);
      }

      // Check for leads with missing contact
      const { data: noContactLeads } = await supabase
        .from('sls_leads')
        .select('id')
        .or('email.is.null,phone.is.null')
        .is('deleted_at', null);

      stats.leadsWithMissingContact = noContactLeads?.length ?? 0;
      if (stats.leadsWithMissingContact > 0) {
        issues.push(`${stats.leadsWithMissingContact} leads with missing email AND phone`);
      }

      // Check for orphaned messages (messages referencing non-existent leads)
      const { data: allMessages } = await supabase.from('contact_messages').select('id, lead_id');

      const { data: allLeadIds } = await supabase
        .from('sls_leads')
        .select('id')
        .is('deleted_at', null);

      const validLeadIds = new Set(allLeadIds?.map((l: any) => l.id) ?? []);
      const orphanedMsgs = allMessages?.filter((msg: any) => msg.lead_id && !validLeadIds.has(msg.lead_id)) ?? [];
      stats.orphanedMessages = orphanedMsgs.length;

      if (stats.orphanedMessages > 0) {
        issues.push(`${stats.orphanedMessages} orphaned contact messages (referencing deleted leads)`);
      }

      // Check for orphaned follow-up tasks
      const { data: allTasks } = await supabase.from('lead_followup_tasks').select('id, lead_id');

      const orphanedTasks = allTasks?.filter((t: any) => t.lead_id && !validLeadIds.has(t.lead_id)) ?? [];
      stats.orphanedFollowupTasks = orphanedTasks.length;

      if (stats.orphanedFollowupTasks > 0) {
        issues.push(`${stats.orphanedFollowupTasks} orphaned follow-up tasks (referencing deleted leads)`);
      }

      return { issues, stats };
    } catch (error) {
      return {
        issues: [error instanceof Error ? error.message : 'Unknown audit error'],
        stats,
      };
    }
  }
}
