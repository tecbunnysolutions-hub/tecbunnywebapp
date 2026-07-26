import { NextResponse } from 'next/server'

import { AdminAuthError, requireAdminContext } from "@tecbunny/core/auth/admin-guard"
import { withAuditEvent } from '@tecbunny/core/enterprise-analytics'
import { logger } from '@tecbunny/core/logger'

// export const dynamic = 'force-dynamic'

// GET /api/admin/agents/list?status=pending|approved
export async function GET(request: Request) {
  let context
  try {
    context = await requireAdminContext()
  } catch (error) {
    const statusCode = error instanceof AdminAuthError ? error.status : 401
    logger.warn('mgmt_agents.list.unauthorized', { statusCode })
    return NextResponse.json({ error: 'Unauthorized' }, { status: statusCode })
  }

  const url = new URL(request.url)
  const status = url.searchParams.get('status') || undefined
  const supabase = context.serviceSupabase
  let query = supabase.from('sales_agents').select('*')
  if (status) query = query.eq('status', status)

  const actor = { userId: context.user.id, userEmail: context.user.email, role: context.role }
  const { data, error } = await withAuditEvent({
    application: 'mgmt',
    module: 'agents',
    screen: '/api/admin/agents/list',
    action: 'agents_list_viewed',
    description: `Viewed agents list${status ? ` filtered by ${status}` : ''}`,
    entityType: 'sales_agent',
    entityId: status ?? 'all',
    oldValue: null,
    newValue: { statusFilter: status ?? null },
    reason: 'mgmt_agents_list_view',
    context: actor,
    apiEndpoint: '/api/admin/agents/list',
    httpMethod: 'GET',
    databaseTable: 'sales_agents',
    priority: 'medium',
  }, async () => query.order('created_at', { ascending: false }))

  if (error) {
    logger.error('mgmt_agents.list.query_failed', { statusFilter: status ?? null, error: error.message })
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  logger.info('mgmt_agents.list.success', { count: data?.length ?? 0, statusFilter: status ?? null, actor })
  return NextResponse.json({ agents: data || [] })
}
