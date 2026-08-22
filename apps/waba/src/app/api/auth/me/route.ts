import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@tecbunny/database/server';
import { supabase } from '@/lib/supabase';
import { verifySuperadminSessionToken } from '@tecbunny/core/auth/superadmin-session';
import { logger } from '@tecbunny/core/logger';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    logger.info('waba_auth_me.audit.requested');
    const cookieHeader = req.headers.get('cookie') || '';

    // Verify signed superadmin session token — no literal string comparisons
    const superadminTokenMatch = cookieHeader.match(/superadmin-session=([^;]+)/);
    const superadminToken = superadminTokenMatch ? decodeURIComponent(superadminTokenMatch[1]) : null;
    if (superadminToken) {
      const payload = await verifySuperadminSessionToken(superadminToken);
      if (payload) {
        logger.info('waba_auth_me.audit.superadmin_session');
        return NextResponse.json({ user: { id: 'superadmin-root-id', name: 'Super Admin', email: payload.email, role: 'SUPERADMIN' } });
      }
    }

    // Legacy non-superadmin agent cookie: resolve against DB, never trust a fixed value
    const agentMatch = cookieHeader.match(/waba_agent_id=([^;]+)/);
    const agentId = agentMatch ? agentMatch[1] : null;
    if (agentId) {
      const { data: user } = await supabase.from('User').select('*').eq('id', agentId).maybeSingle();
      if (user) {
        logger.info('waba_auth_me.audit.legacy_agent_session');
        return NextResponse.json({ user });
      }
    }

    // Check actual Supabase session
    try {
      const supabaseClient = await createSupabaseClient();
      const { data: { user } } = await supabaseClient.auth.getUser();

      if (user) {
        logger.info('waba_auth_me.audit.supabase_session', { userId: user.id });
        return NextResponse.json({ 
          user: { 
            id: user.id, 
            name: user.user_metadata?.first_name || user.email?.split('@')[0] || 'Agent', 
            email: user.email, 
            role: user.user_metadata?.role || 'AGENT' 
          } 
        });
      }
    } catch (supabaseErr: unknown) {
      logger.warn('waba_auth_me.audit.supabase_unavailable', { error: supabaseErr instanceof Error ? supabaseErr.message : String(supabaseErr) });
    }

    logger.info('waba_auth_me.audit.no_session');
    return NextResponse.json({ user: null }, { status: 200 });
  } catch (error: unknown) {
    logger.error('waba_auth_me.audit.failed', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
