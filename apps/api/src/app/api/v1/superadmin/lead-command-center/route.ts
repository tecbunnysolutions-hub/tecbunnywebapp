import type { NextRequest } from 'next/server';

import { apiSuccess } from '../../../../../lib/api-contract';
import {
  getHotLeadsPriorityQueue,
  getLeadAssignmentStatus,
  getLeadMetrics,
  getLeadSourcePerformance,
  getRevenueMetrics,
} from '../../../../../lib/lead-command-center-data';
import { finishV1, getRequestId, v1ErrorResponse } from '../../../../../lib/v1';
import { PRIVATE_CACHE_CONTROL, requireCaller } from '../../../../../lib/v1-auth';

/** GET /api/v1/superadmin/lead-command-center - lead, revenue and assignment metrics. */
export async function GET(request: NextRequest) {
  const requestId = getRequestId(request);
  try {
    await requireCaller(request, 'superadmin');
    const [leadMetrics, revenueMetrics, hotLeads, sourcePerformance, assignmentStatus] = await Promise.all([
      getLeadMetrics(),
      getRevenueMetrics(),
      getHotLeadsPriorityQueue(),
      getLeadSourcePerformance(),
      getLeadAssignmentStatus(),
    ]);
    return finishV1(
      apiSuccess({ leadMetrics, revenueMetrics, hotLeads, sourcePerformance, assignmentStatus }, { meta: { requestId } }),
      { requestId, cacheControl: PRIVATE_CACHE_CONTROL },
    );
  } catch (error) {
    return v1ErrorResponse(error, requestId, 'v1.superadmin.lead_command_center_failed');
  }
}
