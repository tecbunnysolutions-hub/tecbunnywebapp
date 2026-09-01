import { createClient } from '@tecbunny/database';

import { scoreLeadPriority } from '../lead-scoring';

type SupabaseClient = ReturnType<typeof createClient>;

export interface LeadCapturePayload {
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company_name?: string;
  source_name?: string;
  tracking_session_id?: string;
  metadata?: Record<string, any>;
  requirement?: string;
  message?: string;
  subject?: string;
  form_identifier?: string;
  origin_path?: string;
  service_interest?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  industry?: string;
  scale?: string;
  project_size?: string;
  timeline?: string;
  city?: string;
  business_type?: string;
  project_stage?: string;
  document_url?: string | null;
}

export class LeadEngineService {
  static normalizeEmail(value?: string | null) {
    if (!value) return null;
    return value.trim().toLowerCase();
  }

  static normalizePhone(value?: string | null) {
    if (!value) return null;
    const digits = value.replace(/\D+/g, '');
    if (!digits) return null;
    return digits.length > 10 ? `+${digits}` : `+91${digits}`;
  }

  static normalizeCompany(value?: string | null) {
    if (!value) return null;
    return value.trim().replace(/\s+/g, ' ');
  }

  static normalizeLeadSource(value?: string | null) {
    const canonical = value?.trim().toLowerCase() || 'website';
    const map: Record<string, string> = {
      website: 'website',
      'website form': 'website',
      'contact form': 'contact_form',
      'contact-form': 'contact_form',
      'contact_form': 'contact_form',
      'technology assessment': 'technology_assessment',
      'technology_assessment': 'technology_assessment',
      'assessment': 'technology_assessment',
      'service booking': 'service_booking',
      'book service': 'service_booking',
      'configurator': 'configurator',
      'enterprise cta': 'enterprise_cta',
      'enterprise_cta': 'enterprise_cta',
      'product inquiry': 'product_inquiry',
      'whatsapp': 'whatsapp',
      'callback': 'phone',
      'phone': 'phone',
      'manual': 'manual',
      'campaign': 'campaign',
      'referral': 'referral',
      'lead_capture_webhook': 'contact_form',
    };
    return map[canonical] || canonical.replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'website';
  }

  static async ensureLeadSource(supabase: SupabaseClient, sourceName?: string | null) {
    const normalized = this.normalizeLeadSource(sourceName || 'website');
    if (!normalized) return null;

    const { data: existingSource } = await supabase
      .from('sls_lead_sources')
      .select('id')
      .ilike('name', normalized)
      .limit(1)
      .maybeSingle();

    if (existingSource?.id) return existingSource.id;

    const { data: insertedSource, error } = await supabase
      .from('sls_lead_sources')
      .insert({ name: normalized })
      .select('id')
      .single();

    if (error || !insertedSource?.id) {
      return null;
    }

    return insertedSource.id;
  }

  static async createLeadFromIntake(supabase: SupabaseClient, payload: LeadCapturePayload) {
    const email = this.normalizeEmail(payload.email);
    const phone = this.normalizePhone(payload.phone);
    const companyName = this.normalizeCompany(payload.company_name);
    const safeFirstName = payload.first_name?.trim() || 'Visitor';
    const safeLastName = payload.last_name?.trim() || '';
    const leadSource = this.normalizeLeadSource(payload.source_name || payload.form_identifier || payload.origin_path || 'website');

    const orConditions: string[] = [];
    if (email) orConditions.push(`email.ilike.${email}`);
    if (phone) orConditions.push(`phone.ilike.${phone}`);
    if (email && companyName) orConditions.push(`and(email.ilike.${email},company_name.ilike.${companyName})`);
    if (phone && companyName) orConditions.push(`and(phone.ilike.${phone},company_name.ilike.${companyName})`);

    let existingLead: any | null = null;
    if (orConditions.length > 0) {
      const { data } = await supabase
        .from('sls_leads')
        .select('id, first_name, last_name, email, phone, company_name, status, lead_score, heat_level, lead_owner_id, metadata')
        .or(orConditions.join(','))
        .limit(1);

      existingLead = data?.[0] ?? null;
    }

    const sourceId = await this.ensureLeadSource(supabase, leadSource || payload.source_name || 'website');
    const scoreData = scoreLeadPriority({
      service: payload.service_interest || payload.requirement || 'General inquiry',
      industry: payload.industry || 'Not specified',
      scale: payload.scale || 'Not specified',
      project_size: payload.project_size || null,
      timeline: payload.timeline || (payload.requirement ? 'Immediate' : 'exploring'),
      city: payload.city || 'Not specified',
      business_type: payload.business_type || (companyName ? 'Business' : null),
      project_stage: payload.project_stage || null,
      phone,
      company_name: companyName,
      email,
      current_problem: payload.requirement || payload.message || null,
      additional_notes: payload.message || null,
      document_url: payload.document_url || null,
    });

    const leadPayload = {
      first_name: safeFirstName,
      last_name: safeLastName || null,
      email,
      phone,
      company_name: companyName,
      source_id: sourceId,
      status: 'NEW',
      metadata: {
        ...(payload.metadata || {}),
        form_identifier: payload.form_identifier || null,
        origin_path: payload.origin_path || null,
        source_name: leadSource,
        utm_source: payload.utm_source || null,
        utm_medium: payload.utm_medium || null,
        utm_campaign: payload.utm_campaign || null,
        requirement: payload.requirement || payload.message || null,
      },
      tracking_session_id: payload.tracking_session_id || null,
      requirement: payload.requirement || payload.message || null,
      lead_score: Math.max(10, scoreData.totalScore),
      heat_level: scoreData.priority,
      updated_at: new Date().toISOString(),
    };

    let lead: any;
    let isNew = false;

    if (existingLead?.id) {
      const { data, error } = await supabase
        .from('sls_leads')
        .update({
          ...leadPayload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingLead.id)
        .select('id, first_name, last_name, email, phone, company_name, status, lead_score, heat_level, lead_owner_id, metadata')
        .single();

      if (error) throw error;
      lead = data;
    } else {
      const { data, error } = await supabase
        .from('sls_leads')
        .insert({
          ...leadPayload,
          created_at: new Date().toISOString(),
        })
        .select('id, first_name, last_name, email, phone, company_name, status, lead_score, heat_level, lead_owner_id, metadata')
        .single();

      if (error) throw error;
      lead = data;
      isNew = true;
    }

    if (lead?.id) {
      const assigned = await this.autoAssignLead(supabase, lead.id);
      if (assigned) {
        await supabase.from('sls_leads').update({ lead_owner_id: assigned, updated_at: new Date().toISOString() }).eq('id', lead.id);
      }

      const followupTask = await this.ensureFollowupTask(supabase, lead.id, assigned);
      if (followupTask) {
        await supabase.from('sls_leads').update({ next_followup_at: followupTask.due_at, updated_at: new Date().toISOString() }).eq('id', lead.id);
      }

      const contactMessage = {
        lead_id: lead.id,
        name: safeFirstName + (safeLastName ? ` ${safeLastName}` : ''),
        email,
        phone,
        subject: payload.subject || `Lead Capture - ${payload.service_interest || 'General Inquiry'}`,
        message: payload.message || payload.requirement || 'Lead created via canonical intake',
        company_name: companyName,
        inquiry_category: 'Services',
        origin_key: leadSource,
        origin_path: payload.origin_path || '/contact',
        form_identifier: payload.form_identifier || null,
        utm_source: payload.utm_source || null,
        utm_medium: payload.utm_medium || null,
        utm_campaign: payload.utm_campaign || null,
        status: 'New',
        last_activity_at: new Date().toISOString(),
        lead_score: Math.max(10, scoreData.totalScore),
        lead_priority: scoreData.priority,
        lead_source: leadSource,
      };

      const { data: messageRow, error: messageError } = await supabase
        .from('contact_messages')
        .insert(contactMessage)
        .select('id')
        .single();

      if (messageError) {
        // We keep the lead canonical even if contact message creation fails; the failure is surfaced through the calling route.
        throw messageError;
      }

      return { lead, isNew, messageId: messageRow?.id ?? null };
    }

    throw new Error('Could not create or update canonical lead');
  }

  static async ensureFollowupTask(supabase: SupabaseClient, leadId: string, assignedTo?: string | null) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id')
      .in('role', ['sales_executive', 'sales_agent', 'sales_manager', 'manager'])
      .limit(1)
      .maybeSingle();

    const assignedUser = assignedTo || profileData?.id;
    if (!assignedUser) return null;

    const dueAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('lead_followup_tasks')
      .insert({
        lead_id: leadId,
        assigned_to: assignedUser,
        task_type: 'urgent_contact',
        title: 'Contact newly assigned lead',
        description: 'Follow up with the new lead and confirm next steps.',
        status: 'pending',
        priority: 1,
        due_at: dueAt,
        scheduled_for: dueAt,
        attempt_method: 'whatsapp',
        created_by: assignedUser,
        created_at: new Date().toISOString(),
      })
      .select('id, due_at')
      .single();

    return data;
  }

  static async captureLead(supabase: SupabaseClient, payload: LeadCapturePayload) {
    return this.createLeadFromIntake(supabase, payload);
  }

  static async autoAssignLead(supabase: SupabaseClient, leadId: string) {
    const { data: execs, error: execError } = await supabase
      .from('profiles')
      .select('id, role')
      .in('role', ['sales_executive', 'store_executive', 'sales_agent', 'sales_manager', 'sales', 'manager']);

    if (execError || !execs || execs.length === 0) return null;

    const { data: existingAssignments } = await supabase
      .from('sls_lead_assignments')
      .select('sales_executive_id')
      .eq('is_active', true);

    const workload = new Map<string, number>();
    execs.forEach((e: { id: string; role: string }) => workload.set(e.id, 0));

    if (existingAssignments) {
      existingAssignments.forEach((assignment: { sales_executive_id?: string | null }) => {
        if (assignment.sales_executive_id && workload.has(assignment.sales_executive_id)) {
          workload.set(assignment.sales_executive_id, (workload.get(assignment.sales_executive_id) ?? 0) + 1);
        }
      });
    }

    let minExec = execs[0].id;
    let minLoad = workload.get(minExec) ?? 0;

    for (const [execId, load] of workload.entries()) {
      if (load < minLoad) {
        minExec = execId;
        minLoad = load;
      }
    }

    const { error: assignError } = await supabase
      .from('sls_lead_assignments')
      .insert({
        lead_id: leadId,
        sales_executive_id: minExec,
        is_active: true,
        assigned_at: new Date().toISOString(),
      });

    if (assignError) {
      console.error('Failed to auto assign lead:', assignError);
      return null;
    }

    return minExec;
  }
}
