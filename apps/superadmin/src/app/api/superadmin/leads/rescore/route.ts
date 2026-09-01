import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@tecbunny/database/admin';
import { logger } from '@tecbunny/core';
import { verifySuperadminSessionToken } from '@tecbunny/core/server';
import { recalculateLeadScore } from '@/lib/lead-command-center-data';

/**
 * POST /api/superadmin/leads/rescore
 * Recalculate lead score based on engagement signals
 * Requires: lead_id
 */
export async function POST(request: Request) {
  try {
    const token = request.headers.get('cookie')?.split('superadmin-session=')[1]?.split(';')[0];
    const session = await verifySuperadminSessionToken(token, request);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leadId } = await request.json();

    if (!leadId) {
      return NextResponse.json({ error: 'Missing lead_id' }, { status: 400 });
    }

    // Recalculate using database function
    const newScore = await recalculateLeadScore(leadId);

    if (newScore === null) {
      logger.error('lead_scoring_failed', { leadId });
      return NextResponse.json({ error: 'Failed to recalculate score' }, { status: 500 });
    }

    logger.info('lead_score_recalculated', { leadId, newScore });

    return NextResponse.json({
      success: true,
      message: 'Lead score recalculated',
      newScore,
    });
  } catch (error) {
    logger.error('lead_scoring_error', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
