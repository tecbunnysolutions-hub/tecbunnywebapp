import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@tecbunny/database';
import { LeadMonitoringService, logger } from '@tecbunny/core';
import { getSessionWithRole } from '@tecbunny/core/auth/server-role';
import { isAtLeast, type UserRole } from '@tecbunny/core/roles';

/**
 * GET /api/admin/leads/health
 *
 * Returns comprehensive lead system health metrics.
 * Only accessible to admins and above.
 *
 * **Response**: {
 *   timestamp: ISO8601,
 *   overallHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL',
 *   issues: string[],
 *   warnings: string[],
 *   metrics: { leads, assignments, followup, messages }
 * }
 */
export async function GET(request: NextRequest) {
  const correlationId = request.headers.get('x-correlation-id') || crypto.randomUUID();

  try {
    // Auth check: require admin+ role
    const { session, role } = await getSessionWithRole(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required', correlationId }, { status: 401 });
    }

    if (!role || !isAtLeast(role, 'admin')) {
      return NextResponse.json({ error: 'Forbidden - Admin access required', correlationId }, { status: 403 });
    }

    logger.info('admin_leads_health.requested', { correlationId, userId: session.user.id });

    const supabase = await createClient();
    const health = await LeadMonitoringService.getSystemHealth(supabase);

    logger.info('admin_leads_health.success', {
      correlationId,
      overallHealth: health.overallHealth,
      issueCount: health.issues.length,
      warningCount: health.warnings.length,
    });

    return NextResponse.json({ success: true, health, correlationId });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve lead system health';
    logger.error('admin_leads_health.failed', { correlationId, error: message });
    return NextResponse.json({ error: message, correlationId }, { status: 500 });
  }
}

/**
 * POST /api/admin/leads/audit
 *
 * Runs data quality audit on the lead system.
 * Reports orphaned records, duplicates, and missing data.
 * Only accessible to admins and above.
 */
export async function POST(request: NextRequest) {
  const correlationId = request.headers.get('x-correlation-id') || crypto.randomUUID();

  try {
    // Auth check
    const { session, role } = await getSessionWithRole(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required', correlationId }, { status: 401 });
    }

    if (!role || !isAtLeast(role, 'admin')) {
      return NextResponse.json({ error: 'Forbidden - Admin access required', correlationId }, { status: 403 });
    }

    logger.info('admin_leads_audit.started', { correlationId, userId: session.user.id });

    const supabase = await createClient();
    const audit = await LeadMonitoringService.auditDataQuality(supabase);

    logger.info('admin_leads_audit.completed', {
      correlationId,
      issueCount: audit.issues.length,
      orphanedMessages: audit.stats.orphanedMessages,
      orphanedTasks: audit.stats.orphanedFollowupTasks,
    });

    return NextResponse.json({ success: true, audit, correlationId });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to run data quality audit';
    logger.error('admin_leads_audit.failed', { correlationId, error: message });
    return NextResponse.json({ error: message, correlationId }, { status: 500 });
  }
}
