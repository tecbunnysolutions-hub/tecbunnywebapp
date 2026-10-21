import { createSupabaseClient as createServerClient } from '@tecbunny/database/server';

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@tecbunny/core/logger';
import { requireInternalAccess } from '../../../../lib/internal-auth';



export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const accessDenied = requireInternalAccess(request);
  if (accessDenied) return accessDenied;

  logger.info('health_summary.audit.requested');
  const started = Date.now();
  const supabase = await createServerClient();
  let dbOk = false; let dbLatency = 0;
  try {
    const t0 = Date.now();
    const { error } = await supabase.from('products').select('id', { count: 'exact', head: true }).limit(1);
    dbOk = !error; dbLatency = Date.now() - t0;
  } catch { dbOk = false; }

  // Minimal SMTP readiness indicator (env presence)
  const smtpConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASS);

  logger.info('health_summary.audit.success', { dbOk, dbLatency });
  return NextResponse.json({
    status: 'ok',
    uptimeSeconds: Math.round(process.uptime()),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0,7) || 'local',
    db: { ok: dbOk, latencyMs: dbLatency },
    email: { configured: smtpConfigured },
    elapsedMs: Date.now() - started
  });
}
