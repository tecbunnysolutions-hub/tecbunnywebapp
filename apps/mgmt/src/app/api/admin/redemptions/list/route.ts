import { createClient } from '@tecbunny/database';
import { createServiceClient, isSupabaseServiceConfigured } from "@tecbunny/database/admin";
import { NextResponse } from 'next/server'
import { logger } from '@tecbunny/core/logger';



// export const dynamic = 'force-dynamic'

// GET /api/admin/redemptions/list?status=pending|approved|processed
export async function GET(request: Request) {
  try {
    logger.info('mgmt_redemptions.audit.list_requested');
    const token = process.env.INTERNAL_API_TOKEN
    const provided = new Headers(request.headers).get('x-internal-token') || ''
    if (!token || provided !== token) {
      logger.warn('mgmt_redemptions.audit.unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const status = url.searchParams.get('status') || undefined
    const supabase = isSupabaseServiceConfigured ? createServiceClient() : await createClient()
    let query = supabase.from('agent_redemption_requests').select('*')
    if (status) query = query.eq('status', status)
    const { data, error } = await query.order('requested_at', { ascending: false })
    if (error) {
      logger.error('mgmt_redemptions.audit.list_failed', { error: error.message })
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    logger.info('mgmt_redemptions.audit.list_success', { count: data?.length ?? 0, status: status ?? null })
    return NextResponse.json({ redemptions: data || [] })
  } catch (error) {
    logger.error('mgmt_redemptions.audit.exception', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ error: 'Failed to list redemptions' }, { status: 500 })
  }
}
