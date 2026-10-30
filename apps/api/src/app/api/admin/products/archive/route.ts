import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient, isSupabaseServiceConfigured } from '@tecbunny/database/admin';
import { getSessionWithRole } from '@tecbunny/core/auth/server-role';
import { logger } from '@tecbunny/core/logger';
import { withPublicRevalidation } from '../../../../../lib/revalidate-public';

// Service-only RPCs atomically preserve the product, original status and audit
// snapshot. A failed/missing RPC must never become an unaudited update.
const archiveSchema = z.object({
  id: z.string().uuid('Product ID must be a valid UUID').toLowerCase(),
  reason: z.string().max(500).optional().default('Administrative removal'),
});
const restoreSchema = archiveSchema.pick({ id: true });
const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).max(1_000_000).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

function respond(body: object, status: number, correlationId: string) {
  return NextResponse.json({ ...body, correlationId }, {
    status,
    headers: { 'Cache-Control': 'private, no-store', 'x-correlation-id': correlationId },
  });
}

type AdminContext = { error: NextResponse } | { supabase: ReturnType<typeof createServiceClient>; actorId: string };

async function getAdminClient(request: NextRequest, correlationId: string): Promise<AdminContext> {
  const { session, role } = await getSessionWithRole(request);
  if (!session) return { error: respond({ error: 'Authentication required' }, 401, correlationId) };
  if (role !== 'admin' && role !== 'superadmin') return { error: respond({ error: 'Administrator role required' }, 403, correlationId) };
  if (!isSupabaseServiceConfigured) return { error: respond({ error: 'Archive operation unavailable' }, 503, correlationId) };
  return { supabase: createServiceClient(), actorId: session.user.id };
}

async function mutate(request: NextRequest, operation: 'archive' | 'restore') {
  const correlationId = crypto.randomUUID();
  try {
    const auth = await getAdminClient(request, correlationId);
    if ('error' in auth) return auth.error;
    const parameters = new URL(request.url).searchParams;
    const body = request.method === 'DELETE'
      ? { id: parameters.get('id'), reason: parameters.get('reason') ?? undefined }
      : await request.json().catch(() => null);
    const validation = (operation === 'archive' ? archiveSchema : restoreSchema).safeParse(body);
    if (!validation.success) return respond({ error: 'Invalid request', details: validation.error.flatten() }, 400, correlationId);
    const input = validation.data;
    const args = { p_product_id: input.id, p_actor_id: auth.actorId,
      ...(operation === 'archive' ? { p_reason: 'reason' in input ? input.reason : 'Administrative removal' } : {}) };
    const { data, error } = await auth.supabase.rpc(`${operation}_product_atomic`, args);
    if (error) {
      logger.error('product_archive.rpc_failed', { correlationId, productId: input.id, operation, code: error.code });
      if (error.code === 'P0002') return respond({ error: 'Product not found' }, 404, correlationId);
      if (error.code === '23514') return respond({ error: 'Archive history requires reconciliation before restoring this product' }, 409, correlationId);
      return respond({ error: 'Archive operation unavailable' }, 503, correlationId);
    }
    if (!data || data.id !== input.id || typeof data.changed !== 'boolean'
      || data.is_deleted !== (operation === 'archive')) {
      logger.error('product_archive.invalid_rpc_result', { correlationId, productId: input.id, operation });
      return respond({ error: 'Archive operation unavailable' }, 503, correlationId);
    }
    logger.info('product_archive.success', { correlationId, productId: input.id, operation, changed: data.changed });
    return respond({ success: true, method: 'rpc', data,
      message: operation === 'archive' ? 'Product archived successfully' : 'Product restored to its previous catalog status' }, 200, correlationId);
  } catch {
    logger.error('product_archive.unhandled', { correlationId, operation });
    return respond({ error: 'Internal server error' }, 500, correlationId);
  }
}

export async function GET(request: NextRequest) {
  const correlationId = crypto.randomUUID();
  try {
    const auth = await getAdminClient(request, correlationId);
    if ('error' in auth) return auth.error;
    const parameters = new URL(request.url).searchParams;
    const parsed = paginationSchema.safeParse({ page: parameters.get('page') ?? undefined, limit: parameters.get('limit') ?? undefined });
    if (!parsed.success) return respond({ error: 'Invalid pagination' }, 400, correlationId);
    const { page, limit } = parsed.data;
    const offset = (page - 1) * limit;
    const { data, error, count } = await auth.supabase.from('products')
      .select('id, title, name, category, status, archived_at, archived_by, archive_reason, updated_at', { count: 'exact' })
      .eq('is_deleted', true).order('archived_at', { ascending: false }).range(offset, offset + limit - 1);
    if (error) {
      logger.error('product_archive.list_failed', { correlationId, code: error.code });
      return respond({ error: 'Unable to list archived products' }, 503, correlationId);
    }
    return respond({ success: true, data: data ?? [], pagination: {
      page, limit, total: count ?? 0, pages: Math.ceil((count ?? 0) / limit),
    } }, 200, correlationId);
  } catch {
    return respond({ error: 'Internal server error' }, 500, correlationId);
  }
}

export const POST = withPublicRevalidation(['products'], request => mutate(request, 'archive'));
export const DELETE = withPublicRevalidation(['products'], request => mutate(request, 'archive'));
export const PUT = withPublicRevalidation(['products'], request => mutate(request, 'restore'));
