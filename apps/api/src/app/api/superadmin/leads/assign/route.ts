import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@tecbunny/database/admin';
import { logger } from '@tecbunny/core';
import { verifySuperadminSessionToken } from '@tecbunny/core/server';

/**
 * POST /api/superadmin/leads/assign
 * Assign a lead to a sales person
 * Requires: lead_id, assigned_to (user_id)
 */
export async function POST(request: Request) {
  try {
    const token = request.headers.get('cookie')?.split('superadmin-session=')[1]?.split(';')[0];
    const session = await verifySuperadminSessionToken(token, request);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leadId, assignedTo } = await request.json();

    if (!leadId || !assignedTo) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();

    // Check if assignment already exists
    const { data: existing } = await supabase
      .from('sls_lead_assignments')
      .select('id')
      .eq('lead_id', leadId)
      .eq('assigned_to', assignedTo)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Lead already assigned to this person',
        assignment: existing,
      });
    }

    // Create assignment
    const { data, error } = await supabase
      .from('sls_lead_assignments')
      .insert({
        lead_id: leadId,
        assigned_to: assignedTo,
        assigned_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      logger.error('lead_assignment_failed', { leadId, assignedTo, error: error.message });
      return NextResponse.json({ error: 'Failed to assign lead' }, { status: 500 });
    }

    logger.info('lead_assigned', { leadId, assignedTo });

    return NextResponse.json({
      success: true,
      message: 'Lead assigned successfully',
      assignment: data,
    });
  } catch (error) {
    logger.error('lead_assignment_error', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
