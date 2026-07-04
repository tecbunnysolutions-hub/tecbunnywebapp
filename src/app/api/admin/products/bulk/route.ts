import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { createServiceClient, isSupabaseServiceConfigured, createClient } from '@/lib/supabase/server';
import { getSessionWithRole } from '@/lib/auth/server-role';

const ADMIN_ROLES = new Set(['superadmin', 'admin', 'manager']);

async function adminSupabase(request: NextRequest) {
  const { supabase: authClient, session, role } = await getSessionWithRole(request);

  if (!session) return { error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) };
  if (!role || !ADMIN_ROLES.has(role))
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };

  const supabase = isSupabaseServiceConfigured ? createServiceClient() : authClient ?? await createClient();
  return { supabase, session };
}

export async function POST(request: NextRequest) {
  const correlationId = request.headers.get('x-correlation-id') || crypto.randomUUID();

  try {
    const auth = await adminSupabase(request);
    if ('error' in auth) return auth.error;
    const { supabase } = auth;

    const body = await request.json().catch(() => ({}));
    const { ids, action } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Provide an array of product IDs' }, { status: 400 });
    }

    if (!['delete', 'activate', 'deactivate'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be delete, activate, or deactivate.' }, { status: 400 });
    }

    if (action === 'delete') {
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', ids);
      
      if (error) {
        logger.error('admin.products.bulk_delete_failed', { correlationId, error: error.message });
        return NextResponse.json({ error: error.message, correlationId }, { status: 500 });
      }
    } else {
      const status = action === 'activate' ? 'active' : 'draft';
      const { error } = await supabase
        .from('products')
        .update({ status, updated_at: new Date().toISOString() })
        .in('id', ids);
        
      if (error) {
        logger.error('admin.products.bulk_status_update_failed', { correlationId, error: error.message });
        return NextResponse.json({ error: error.message, correlationId }, { status: 500 });
      }
    }

    logger.info(`admin.products.bulk_${action}_success`, { correlationId, count: ids.length });
    return NextResponse.json({ success: true, count: ids.length, correlationId });

  } catch (err: any) {
    logger.error('admin.products.bulk_unhandled', { correlationId: 'unknown', error: err.message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
