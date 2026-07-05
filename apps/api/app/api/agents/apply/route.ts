import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

// export const dynamic = 'force-dynamic'

// POST /api/agents/apply
// Creates a pending Sales Agent application for the current user
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  // Check if already an agent
  const { data: existing, error: fetchErr } = await supabase
    .from('sales_agents')
    .select('id,status,referral_code')
    .eq('user_id', user.id)
    .maybeSingle()

  if (fetchErr && !String(fetchErr.message || '').includes('No rows')) {
    logger.error('agents_apply.lookup_failed', { error: fetchErr.message })
    return NextResponse.json({ error: 'Failed to check existing application' }, { status: 500 })
  }

  if (existing) {
    return NextResponse.json({
      success: true,
      message: existing.status === 'approved' ? 'You are already an approved agent' : 'Application already submitted',
      agent: existing
    })
  }

  // Generate unique referral code
  const base = (user.email || user.id).split('@')[0]?.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) || 'AGENT'
  const candidate = `${base.toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

  const { data: created, error: insertErr } = await supabase
    .from('sales_agents')
    .insert({ user_id: user.id, referral_code: candidate, status: 'pending' })
    .select('*')
    .single()

  if (insertErr) {
    logger.warn('agents_apply.insert_failed', { error: insertErr.message })
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 400 })
  }

  return NextResponse.json({ success: true, agent: created })
}
