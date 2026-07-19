import { NextResponse } from 'next/server'

import { AdminAuthError, requireAdminContext } from "@tecbunny/core/auth/admin-guard"
import { logger } from "@tecbunny/core/logger"

// export const dynamic = 'force-dynamic'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// POST /api/admin/redemptions/process { redemption_id }
export async function POST(request: Request) {
  let context
  try {
    context = await requireAdminContext()
  } catch (error) {
    const status = error instanceof AdminAuthError ? error.status : 401
    return NextResponse.json({ error: 'Unauthorized' }, { status })
  }

  const { redemption_id } = await request.json().catch(() => ({}))
  if (!redemption_id) return NextResponse.json({ error: 'redemption_id required' }, { status: 400 })
  if (typeof redemption_id !== 'string' || !UUID_PATTERN.test(redemption_id)) {
    return NextResponse.json({ error: 'Invalid redemption_id' }, { status: 400 })
  }

  const supabase = context.serviceSupabase
  const { data, error } = await supabase.rpc('process_agent_redemption', {
    p_redemption_id: redemption_id,
  })

  if (error) {
    logger.warn('admin_redemptions.process_failed', {
      redemptionId: redemption_id,
      error: error.message,
      code: error.code,
    })
    const status = error.code === 'P0002' ? 404 : error.code === 'PGRST202' ? 503 : 400
    const message = error.code === 'PGRST202'
      ? 'Redemption transaction function is not installed. Apply the latest Supabase migrations before processing redemptions.'
      : error.message
    return NextResponse.json({ error: message }, { status })
  }

  return NextResponse.json({ success: true, redemption: data })
}
