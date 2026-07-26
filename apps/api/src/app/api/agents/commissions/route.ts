import { createClient } from '@tecbunny/database';
import { NextResponse } from 'next/server'
import { logger } from '@tecbunny/core/logger';



// export const dynamic = 'force-dynamic'

// GET /api/agents/commissions - list current agent's commissions
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  logger.info('agents_commissions.audit.requested', { userId: user.id })

  // Find agent id
  const { data: agent, error: aErr } = await supabase
    .from('sales_agents')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (aErr) {
    logger.error('agents_commissions.audit.agent_lookup_failed', { userId: user.id, error: aErr.message })
    return NextResponse.json({ error: aErr.message }, { status: 400 })
  }
  if (!agent) return NextResponse.json({ commissions: [] })

  const { data, error } = await supabase
    .from('sales_agent_commissions')
    .select('*')
    .eq('agent_id', agent.id)
    .order('created_at', { ascending: false })

  if (error) {
    logger.error('agents_commissions.audit.query_failed', { agentId: agent.id, error: error.message })
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  logger.info('agents_commissions.audit.success', { agentId: agent.id, count: data?.length ?? 0 })
  return NextResponse.json({ commissions: data || [] })
}
