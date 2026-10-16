import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@tecbunny/database/admin';
import { logger } from '@tecbunny/core';

/**
 * POST /api/superadmin/leads/[leadId]/engagement
 * Log lead engagement interaction (site visit, form submission, etc.)
 * This endpoint can be called from public sites or authenticated API
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await params;
    const { interactionType, durationSeconds, sourceUrl, metadata } = await request.json();

    if (!interactionType) {
      return NextResponse.json({ error: 'Missing interaction_type' }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();

    // Log engagement
    const { data, error } = await supabase.rpc('log_lead_engagement', {
      lead_id: leadId,
      interaction_type: interactionType,
      duration_seconds: durationSeconds || null,
      source_url: sourceUrl || null,
      metadata: metadata || null,
    });

    if (error) {
      logger.error('lead_engagement_log_failed', {
        leadId,
        interactionType,
        error: error.message,
      });
      return NextResponse.json({ error: 'Failed to log engagement' }, { status: 500 });
    }

    logger.info('lead_engagement_logged', {
      leadId,
      interactionType,
    });

    return NextResponse.json({
      success: true,
      message: 'Engagement logged successfully',
    });
  } catch (error) {
    logger.error('lead_engagement_error', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
