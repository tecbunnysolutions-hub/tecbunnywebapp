import { NextResponse } from 'next/server'

import { AdminAuthError, requireAdminContext } from "@tecbunny/core/auth/admin-guard"
import { withAuditEvent } from '@tecbunny/core/enterprise-analytics'
import { logger } from '@tecbunny/core/logger'

// export const dynamic = 'force-dynamic'

// POST /api/admin/agents/reject { agent_id }
export async function POST(request: Request) {
  let context
  try {
    context = await requireAdminContext()
  } catch (error) {
    const status = error instanceof AdminAuthError ? error.status : 401
    logger.warn('mgmt_agents.reject.unauthorized', { status })
    return NextResponse.json({ error: 'Unauthorized' }, { status })
  }

  const { agent_id } = await request.json().catch(() => ({}))
  if (!agent_id) {
    logger.warn('mgmt_agents.reject.bad_request', { reason: 'missing_agent_id' })
    return NextResponse.json({ error: 'agent_id required' }, { status: 400 })
  }

  const supabase = context.serviceSupabase
  const actor = { userId: context.user.id, userEmail: context.user.email, role: context.role }
  const { error } = await withAuditEvent({
    application: 'mgmt',
    module: 'agents',
    screen: '/api/admin/agents/reject',
    action: 'agent_rejected',
    description: `Rejected agent ${agent_id}`,
    entityType: 'sales_agent',
    entityId: String(agent_id),
    oldValue: null,
    newValue: { status: 'rejected' },
    reason: 'mgmt_agent_rejection',
    context: actor,
    apiEndpoint: '/api/admin/agents/reject',
    httpMethod: 'POST',
    databaseTable: 'sales_agents',
    priority: 'high',
  }, async () => supabase
      .from('sales_agents')
      .update({ status: 'rejected' })
      .eq('id', agent_id)
  )

  if (error) {
    logger.error('mgmt_agents.reject.update_failed', { agentId: agent_id, error: error.message })
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  logger.info('mgmt_agents.reject.success', { agentId: agent_id, actor })
  return NextResponse.json({ success: true })
}
