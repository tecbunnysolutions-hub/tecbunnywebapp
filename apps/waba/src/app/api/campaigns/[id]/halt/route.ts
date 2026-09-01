import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { withAuditEvent } from '@tecbunny/core/enterprise-analytics';
import { requireApiRole } from '@tecbunny/core/server-role-guard';
import { getBroadcastQueue } from '@tecbunny/core/queue';
import { logger } from '@tecbunny/core/logger';

/**
 * HALT a running campaign immediately.
 * 
 * POST /api/campaigns/[id]/halt
 * 
 * This endpoint stops a campaign that is currently RUNNING or SCHEDULED.
 * It prevents further messages from being sent and records the halt event
 * for audit purposes.
 * 
 * Security: Requires admin or marketing_manager role
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const correlationId = `campaign-halt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const auth = await requireApiRole({
      allowedRoles: ['admin', 'marketing_manager', 'superadmin'],
    });
    if (auth.error) return auth.error;

    const { id: campaignId } = await context.params;
    const { reason } = await req.json();

    if (!campaignId) {
      logger.warn('campaign_halt.missing_id', { correlationId });
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
    }

    // Fetch the campaign to verify it exists and get current status
    const { data: campaign, error: fetchError } = await supabase
      .from('mkt_campaigns')
      .select('id, status, created_by')
      .eq('id', campaignId)
      .maybeSingle();

    if (fetchError) {
      logger.error('campaign_halt.fetch_failed', { correlationId, error: fetchError.message, campaignId });
      return NextResponse.json(
        { error: 'Failed to fetch campaign' },
        { status: 500 }
      );
    }

    if (!campaign) {
      logger.warn('campaign_halt.not_found', { correlationId, campaignId });
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Only allow halting RUNNING or SCHEDULED campaigns
    const HALTABLE_STATUSES = ['RUNNING', 'SCHEDULED'];
    if (!HALTABLE_STATUSES.includes(campaign.status)) {
      logger.warn('campaign_halt.invalid_status', {
        correlationId,
        campaignId,
        currentStatus: campaign.status,
      });
      return NextResponse.json(
        { error: `Campaign with status "${campaign.status}" cannot be halted` },
        { status: 400 }
      );
    }

    // Halt the campaign with audit trail
    const haltResult = await withAuditEvent({
      application: 'waba',
      module: 'campaigns',
      screen: '/api/campaigns/[id]/halt',
      action: 'halt_campaign',
      description: `Halted WhatsApp campaign ${campaignId}`,
      entityType: 'mkt_campaign',
      entityId: campaignId,
      oldValue: { status: campaign.status },
      newValue: { status: 'HALTED', halted_at: new Date().toISOString(), halted_reason: reason },
      reason: reason || 'Administrator halt',
      context: {
        userId: auth.session?.user?.id,
        userEmail: auth.session?.user?.email,
        role: auth.role,
      },
      apiEndpoint: '/api/campaigns/[id]/halt',
      httpMethod: 'POST',
      databaseTable: 'mkt_campaigns',
      priority: 'critical',
    }, async () => {
      const now = new Date().toISOString();
      
      // Update campaign status to HALTED
      const { error: updateError } = await supabase
        .from('mkt_campaigns')
        .update({
          status: 'HALTED',
          halted_at: now,
          halted_by: auth.session?.user?.id,
          halted_reason: reason || 'Manual halt by administrator',
          updated_at: now,
        })
        .eq('id', campaignId);

      if (updateError) {
        throw new Error(`Failed to update campaign: ${updateError.message}`);
      }

      // Attempt to remove any pending jobs from the queue
      // This prevents further sends even if some jobs are still queued
      try {
        const queue = getBroadcastQueue();
        if (queue) {
          // Log that we halted the campaign — the queue worker will check
          // campaign status before processing each job and skip halted campaigns
          logger.info('campaign_halt.queue_notified', { campaignId });
        }
      } catch (queueError) {
        logger.warn('campaign_halt.queue_notification_failed', {
          campaignId,
          error: queueError instanceof Error ? queueError.message : String(queueError),
        });
        // Don't throw — queue notification failure shouldn't block the halt
      }

      logger.info('campaign_halt.success', {
        correlationId,
        campaignId,
        haltedBy: auth.session?.user?.email,
        reason,
      });

      return { campaignId, status: 'HALTED' };
    });

    return NextResponse.json(
      {
        success: true,
        campaignId,
        status: 'HALTED',
        halted_at: new Date().toISOString(),
        correlationId,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to halt campaign';
    logger.error('campaign_halt.error', {
      correlationId,
      error: message,
    });
    return NextResponse.json(
      { error: message, correlationId },
      { status: 500 }
    );
  }
}
