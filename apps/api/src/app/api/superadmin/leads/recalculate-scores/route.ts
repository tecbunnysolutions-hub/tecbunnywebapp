import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@tecbunny/database/admin';
import { logger } from '@tecbunny/core';
import { verifySuperadminSessionToken } from '@tecbunny/core/server';

/**
 * POST /api/superadmin/leads/recalculate-scores
 * Recalculate lead scores for all leads using advanced algorithm
 * Can be called periodically or manually
 */
export async function POST(request: Request) {
  try {
    const token = request.headers.get('cookie')?.split('superadmin-session=')[1]?.split(';')[0];
    const session = await verifySuperadminSessionToken(token, request);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createSupabaseServiceClient();

    // Call database function to recalculate all scores
    const { data, error } = await supabase.rpc('recalculate_all_lead_scores');

    if (error) {
      logger.error('lead_score_recalculation_failed', { error: error.message });
      return NextResponse.json({ error: 'Failed to recalculate scores' }, { status: 500 });
    }

    const updatedCount = (data || []).length;

    logger.info('lead_scores_recalculated', { updatedCount });

    return NextResponse.json({
      success: true,
      message: `Recalculated scores for ${updatedCount} leads`,
      updatedCount,
      results: data || [],
    });
  } catch (error) {
    logger.error('lead_score_recalculation_error', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
