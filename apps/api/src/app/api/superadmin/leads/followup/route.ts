import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@tecbunny/database/admin';
import { logger } from '@tecbunny/core';
import { verifySuperadminSessionToken } from '@tecbunny/core/server';

/**
 * POST /api/superadmin/leads/followup
 * Update lead follow-up status
 * Requires: lead_id, action (contacted|scheduled|converted|lost)
 */
export async function POST(request: Request) {
  try {
    const token = request.headers.get('cookie')?.split('superadmin-session=')[1]?.split(';')[0];
    const session = await verifySuperadminSessionToken(token, request);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leadId, action, notes, nextFollowupAt } = await request.json();

    if (!leadId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();

    // Update lead status and follow-up info
    const updateData: any = {
      last_contact_at: new Date().toISOString(),
    };

    switch (action) {
      case 'contacted':
        updateData.status = 'contacted';
        if (nextFollowupAt) updateData.next_followup_at = nextFollowupAt;
        break;
      case 'scheduled':
        updateData.status = 'scheduled';
        if (nextFollowupAt) updateData.next_followup_at = nextFollowupAt;
        break;
      case 'converted':
        updateData.status = 'converted';
        updateData.converted_at = new Date().toISOString();
        break;
      case 'lost':
        updateData.status = 'lost';
        updateData.lost_reason = notes || 'No reason provided';
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('sls_leads')
      .update(updateData)
      .eq('id', leadId)
      .select()
      .single();

    if (error) {
      logger.error('lead_followup_failed', { leadId, action, error: error.message });
      return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
    }

    logger.info('lead_followup_updated', { leadId, action });

    return NextResponse.json({
      success: true,
      message: `Lead marked as ${action}`,
      lead: data,
    });
  } catch (error) {
    logger.error('lead_followup_error', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
