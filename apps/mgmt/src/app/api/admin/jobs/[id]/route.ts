import { createClient } from '@tecbunny/database';
import { NextRequest, NextResponse } from 'next/server';

import { requireAdmin } from "@tecbunny/core/admin-auth";
import { logger } from '@tecbunny/core/logger';
import { imageJobsQueue } from "@tecbunny/core/queue/image-jobs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    logger.info('mgmt_jobs.audit.requested');
    const supabaseAuth = await createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    const { isAdmin, error: authError, status } = await requireAdmin(user, supabaseAuth);
    
    if (!isAdmin) {
      logger.warn('mgmt_jobs.audit.unauthorized', { status: status || 403 });
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: status || 403 });
    }

    const { id } = await params;
    const job = await imageJobsQueue.getJob(id);

    if (!job) {
      logger.warn('mgmt_jobs.audit.not_found', { jobId: id });
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const state = await job.getState();
    const progress = job.progress;
    const result = job.returnvalue;
    const failedReason = job.failedReason;

    logger.info('mgmt_jobs.audit.success', { jobId: id, state });
    return NextResponse.json({
      id: job.id,
      name: job.name,
      state,
      progress,
      result,
      failedReason,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn
    });

  } catch (error: any) {
    logger.error('mgmt_jobs.audit.failed', { error: error?.message ?? String(error) });
    return NextResponse.json(
      { error: 'Failed to fetch job status', details: error?.message },
      { status: 500 }
    );
  }
}
