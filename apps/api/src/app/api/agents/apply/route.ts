import { createClient } from '@tecbunny/database';
import { NextResponse } from 'next/server'
import { logger } from "@tecbunny/core"
import { AgentService } from "@tecbunny/core/server"

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const agentService = new AgentService(supabase);
  const result = await agentService.applyForAgent(user.id, user.email);

  if (!result.success) {
    logger.warn('agents_apply.failed', { error: result.error.message })
    return NextResponse.json({ error: result.error.message }, { status: result.error.statusCode || 400 })
  }

  return NextResponse.json({
    success: true,
    message: result.data.message,
    agent: result.data.agent
  })
}
