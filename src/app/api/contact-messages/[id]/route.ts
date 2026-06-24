export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { AdminAuthError, requireAdminContext } from '@/lib/auth/admin-guard';
import { logger } from '@/lib/logger';
import type { ContactMessage } from '@/lib/types';

const updateMessageSchema = z.object({
  status: z.enum(['New', 'Assigned', 'Contacted', 'In Progress', 'Resolved', 'Closed', 'Rejected']).optional(),
  admin_notes: z
    .string()
    .max(2000)
    .transform(value => value.trim())
    .optional(),
});

function isMissingRelationError(error: unknown) {
  const candidate = error as { code?: string; message?: string } | null | undefined;
  return candidate?.code === '42P01' ||
    candidate?.code === 'PGRST205' ||
    candidate?.message?.toLowerCase().includes('contact_messages') === true;
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Missing message id' }, { status: 400 });
    }

    const { serviceSupabase, user } = await requireAdminContext();

    const payload = await request.json();
    const parsed = updateMessageSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    if (!parsed.data.status && typeof parsed.data.admin_notes === 'undefined') {
      return NextResponse.json({ error: 'No changes supplied' }, { status: 400 });
    }

    const adminDisplayName =
      (user.user_metadata?.full_name as string | undefined)?.trim() || user.email || user.id || 'System Super Administrator';

    const updateData: Record<string, unknown> = {
      handled_by: user.id,
      handled_by_name: adminDisplayName,
    };

    if (typeof parsed.data.admin_notes !== 'undefined') {
      updateData.admin_notes = parsed.data.admin_notes.length > 0 ? parsed.data.admin_notes : null;
    }

    if (parsed.data.status) {
      updateData.status = parsed.data.status;
      updateData.resolved_at = parsed.data.status === 'Resolved' ? new Date().toISOString() : null;
    }

    const { data, error } = await serviceSupabase
      .from('contact_messages')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      if (isMissingRelationError(error)) {
        return NextResponse.json({ error: 'Contact messages storage is not migrated yet' }, { status: 503 });
      }
      logger.error('contact_message_update_failed', { error: error.message, id });
      return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
    }

    return NextResponse.json({ data: data as ContactMessage });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    logger.error('contact_message_patch_unexpected', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}



export async function GET() { return Response.json({}) }



