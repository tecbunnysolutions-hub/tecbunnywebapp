import { NextRequest, NextResponse } from 'next/server';

import {  createSupabaseServiceClient  } from '@tecbunny/database/admin';
import { requireRole } from '@tecbunny/core/auth/guard';
import { logger } from "@tecbunny/core/logger";

export async function POST(_request: NextRequest) {
  logger.info('admin_payment_settings_dedupe.audit.requested');
  const ctx = await requireRole('admin');
  if ('error' in ctx) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  try {
    const supabase = createSupabaseServiceClient();
    const { data: rows, error } = await supabase
      .from('settings')
      .select('id, key, updated_at, created_at')
      .eq('key', 'payment_phonepe')
      .order('updated_at', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('payment_settings_dedupe.fetch_failed', { error: error.message });
      return NextResponse.json({ error: 'Failed to load payment settings' }, { status: 500 });
    }

    if (!rows || rows.length <= 1) {
      logger.info('admin_payment_settings_dedupe.audit.success', { removed: 0, keptId: rows?.[0]?.id ?? null });
      return NextResponse.json({ ok: true, removed: 0, keptId: rows?.[0]?.id ?? null });
    }

    // Keep the first (latest), delete the rest
    const keepId = rows[0].id as number;
    const deleteIds = rows.slice(1).map((r) => r.id as number);

    const { error: delErr } = await supabase
      .from('settings')
      .delete()
      .in('id', deleteIds);

    if (delErr) {
      logger.error('payment_settings_dedupe.delete_failed', { error: delErr.message });
      return NextResponse.json({ error: 'Failed to remove duplicate payment settings' }, { status: 500 });
    }

    logger.info('admin_payment_settings_dedupe.audit.success', { removed: deleteIds.length, keptId: keepId });
    return NextResponse.json({ ok: true, removed: deleteIds.length, keptId: keepId });
  } catch (e) {
    logger.error('admin_payment_settings_dedupe.audit.failed', { error: e instanceof Error ? e.message : String(e) });
    logger.error('payment_settings_dedupe.unhandled', { error: e instanceof Error ? e.message : e });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const maxDuration = 15;
