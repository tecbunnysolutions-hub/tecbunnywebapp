import { NextResponse } from 'next/server';
import { logger } from '@tecbunny/core/logger';
import { requireApiRole } from '@tecbunny/core/server-role-guard';

export const dynamic = 'force-dynamic';

export async function GET() {
  logger.info('waba_debug_env.audit.requested');
  if (process.env.NODE_ENV === 'production') {
    logger.warn('waba_debug_env.audit.denied_in_production');
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const auth = await requireApiRole({ allowedRoles: ['superadmin'] });
  if (auth.error) return auth.error;

  logger.info('waba_debug_env.audit.success');
  return NextResponse.json({
    hasInfobipUrl: !!process.env.INFOBIP_BASE_URL,
    hasInfobipKey: !!process.env.INFOBIP_API_KEY,
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_SECRET_KEY,
    infobipUrlLength: process.env.INFOBIP_BASE_URL?.length || 0
  });
}
