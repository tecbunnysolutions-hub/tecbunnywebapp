import { createClient } from '@tecbunny/database';
import { NextResponse } from 'next/server'
import { logger } from '@tecbunny/core/logger';



// export const dynamic = 'force-dynamic'

// GET /api/agents/me - current user's agent profile
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  logger.info('agents_me.audit.requested', { userId: user.id })

  const { data, error } = await supabase
    .from('sales_agents')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    logger.error('agents_me.audit.query_failed', { userId: user.id, error: error.message })
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  logger.info('agents_me.audit.success', { userId: user.id, hasAgent: Boolean(data) })
  return NextResponse.json({ agent: data })
}
