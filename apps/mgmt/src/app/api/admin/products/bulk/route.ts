import { createClient } from '@tecbunny/database';
import { createServiceClient, isSupabaseServiceConfigured } from "@tecbunny/database/admin";
import { NextRequest, NextResponse } from 'next/server';
import { logger } from "@tecbunny/core/logger";
import { getSessionWithRole } from "@tecbunny/core/auth/server-role";

const ADMIN_ROLES = new Set(['superadmin', 'admin', 'manager']);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getUuidAuditUserId(userId: string | undefined): string | null {
  if (!userId || userId === 'superadmin-root-id') return null;
  return UUID_PATTERN.test(userId) ? userId : null;
}

async function softDeleteProduct(supabase: any, productId: string, auditUserId: string | null, reason: string) {
  const { error: rpcError } = await supabase.rpc('soft_delete_product', {
    p_product_id: productId,
    p_deleted_by: auditUserId,
    p_reason: reason,
  });

  if (!rpcError) return null;

  logger.warn('admin.products.bulk_soft_delete_rpc_failed', {
    productId,
    error: rpcError.message,
    code: rpcError.code,
  });

  const archivedAt = new Date().toISOString();
  const { error: fallbackError } = await supabase
    .from('products')
    .update({
      is_deleted: true,
      status: 'archived',
      deleted_at: archivedAt,
      deleted_by: auditUserId,
      archived_at: archivedAt,
      archived_by: auditUserId,
      archive_reason: reason,
      updated_at: archivedAt,
    })
    .eq('id', productId);

  return fallbackError;
}

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
    const { supabase, session } = auth;

    const body = await request.json().catch(() => ({}));
    const { ids, action } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Provide an array of product IDs' }, { status: 400 });
    }

    const uniqueIds = [...new Set(ids.filter((id): id is string => typeof id === 'string'))];
    const invalidIds = uniqueIds.filter((id) => !UUID_PATTERN.test(id));
    if (invalidIds.length > 0 || uniqueIds.length !== ids.length) {
      return NextResponse.json({ error: 'All product IDs must be valid UUID strings', correlationId }, { status: 400 });
    }

    if (!['delete', 'activate', 'deactivate'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be delete, activate, or deactivate.' }, { status: 400 });
    }

    if (action === 'delete') {
      const auditUserId = getUuidAuditUserId(session.user.id);
      const reason = typeof body.reason === 'string' && body.reason.trim()
        ? body.reason.trim().slice(0, 500)
        : 'Bulk administrative archive';

      const failures: Array<{ id: string; error: string }> = [];
      for (const id of uniqueIds) {
        const error = await softDeleteProduct(supabase, id, auditUserId, reason);
        if (error) failures.push({ id, error: error.message });
      }

      if (failures.length > 0) {
        logger.error('admin.products.bulk_archive_failed', { correlationId, failures });
        return NextResponse.json({ error: 'Some products could not be archived', failures, correlationId }, { status: 207 });
      }
    } else {
      const status = action === 'activate' ? 'active' : 'draft';
      const { error } = await supabase
        .from('products')
        .update({ status, updated_at: new Date().toISOString() })
        .in('id', uniqueIds);
        
      if (error) {
        logger.error('admin.products.bulk_status_update_failed', { correlationId, error: error.message });
        return NextResponse.json({ error: error.message, correlationId }, { status: 500 });
      }
    }

    logger.info(`admin.products.bulk_${action}_success`, { correlationId, count: uniqueIds.length });
    return NextResponse.json({ success: true, count: uniqueIds.length, correlationId });

  } catch (err: any) {
    logger.error('admin.products.bulk_unhandled', { correlationId: 'unknown', error: err.message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
