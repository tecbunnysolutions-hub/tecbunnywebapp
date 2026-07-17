import { createClient } from '@tecbunny/database';

type SupabaseClient = ReturnType<typeof createClient>;

export interface LeadCapturePayload {
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company_name?: string;
  source_name?: string; // 'Website Form', 'WABA', 'Facebook Lead Ads'
  tracking_session_id?: string;
  metadata?: Record<string, any>;
  requirement?: string;
}

export class LeadEngineService {
  /**
   * Captures a lead from any source. Automatically deduplicates by Phone or Email.
   */
  static async captureLead(supabase: SupabaseClient, payload: LeadCapturePayload) {
    const { email, phone, source_name, tracking_session_id, metadata, requirement, ...rest } = payload;
    
    // 1. Deduplication Check
    let existingLeadId: string | null = null;
    
    if (email || phone) {
      const orConditions = [];
      if (email) orConditions.push(`email.eq.${email}`);
      if (phone) orConditions.push(`phone.eq.${phone}`);
      
      const { data: existingLeads } = await supabase
        .from('sls_leads')
        .select('id, lead_score')
        .or(orConditions.join(','))
        .limit(1);

      if (existingLeads && existingLeads.length > 0) {
        existingLeadId = existingLeads[0].id;
      }
    }

    let sourceId: string | undefined = undefined;
    if (source_name) {
      // Find or create source
      const { data: source } = await supabase
        .from('sls_lead_sources')
        .select('id')
        .eq('name', source_name)
        .limit(1)
        .single();
        
      if (source) {
        sourceId = source.id;
      }
    }

    if (existingLeadId) {
      // Merge & Update
      const { data, error } = await supabase
        .from('sls_leads')
        .update({
          ...rest,
          ...(email && { email }),
          ...(phone && { phone }),
          ...(tracking_session_id && { tracking_session_id }),
          ...(requirement && { requirement }),
          ...(sourceId && { source_id: sourceId }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingLeadId)
        .select()
        .single();
        
      if (error) throw error;
      return { lead: data, isNew: false };
    } else {
      // Create New
      const { data, error } = await supabase
        .from('sls_leads')
        .insert({
          ...rest,
          email,
          phone,
          tracking_session_id,
          requirement,
          source_id: sourceId,
          metadata: metadata || {},
          heat_level: 'COLD',
          lead_score: 10,
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Attempt Automatic Assignment
      if (data) {
        await this.autoAssignLead(supabase, data.id);
      }
      
      return { lead: data, isNew: true };
    }
  }

  /**
   * Automatically routes a lead to a sales executive based on simple workload round-robin.
   */
  static async autoAssignLead(supabase: SupabaseClient, leadId: string) {
    // Basic round-robin based on who has the fewest active assignments
    const { data: execs, error: execError } = await supabase
      .from('profiles')
      .select('id, role')
      .in('role', ['sales_executive', 'store_executive', 'sales_agent', 'sales_manager', 'sales', 'manager']);
      
    if (execError || !execs || execs.length === 0) return null;

    const { data: assignments } = await supabase
      .from('sls_lead_assignments')
      .select('sales_executive_id')
      .eq('is_active', true);

    const workload = new Map<string, number>();
    execs.forEach((e: { id: string; role: string }) => workload.set(e.id, 0));
    
    if (assignments) {
      assignments.forEach((a: { sales_executive_id: string | null }) => {
        if (a.sales_executive_id && workload.has(a.sales_executive_id)) {
          workload.set(a.sales_executive_id, workload.get(a.sales_executive_id)! + 1);
        }
      });
    }

    // Find exec with minimum workload
    let minExec = execs[0].id;
    let minLoad = workload.get(minExec)!;
    
    workload.forEach((load, execId) => {
      if (load < minLoad) {
        minExec = execId;
        minLoad = load;
      }
    });

    // Assign
    const { error: assignError } = await supabase
      .from('sls_lead_assignments')
      .insert({
        lead_id: leadId,
        sales_executive_id: minExec,
        is_active: true
      });
      
    if (assignError) {
      console.error('Failed to auto assign lead:', assignError);
      return null;
    }

    // Also update lead_owner_id directly for easier querying
    await supabase.from('sls_leads').update({ lead_owner_id: minExec }).eq('id', leadId);

    return minExec;
  }
}
