import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@tecbunny/database';
import { createSupabaseServiceClient } from '@tecbunny/core/server';
import { logger } from '@tecbunny/core';
import { rateLimit } from '@tecbunny/core/rate-limit';
import { z } from 'zod';

const DeleteSchema = z.object({
  confirmation: z.literal('DELETE MY ACCOUNT'),
  reason: z.string().max(500).optional(),
});

/**
 * POST /api/user/gdpr/delete
 * GDPR Article 17 — Right to erasure ("right to be forgotten").
 * Schedules account deletion: anonymises PII, marks account deleted_at,
 * and queues auth user deletion after a 30-day grace period.
 * Immediate effects: profile PII wiped, session revoked.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rlResult = await rateLimit(`gdpr_delete:${user.id}`, 2, 86_400_000);
    if (!rlResult.allowed) {
      return NextResponse.json(
        { error: 'Too many deletion requests. Please try again tomorrow.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });

    const parsed = DeleteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'You must send { "confirmation": "DELETE MY ACCOUNT" } to confirm deletion.' },
        { status: 400 }
      );
    }

    const serviceClient = createSupabaseServiceClient();
    const now = new Date().toISOString();
    const anonymisedEmail = `deleted_${user.id.slice(0, 8)}@anonymised.invalid`;

    // 1. Anonymise profile PII immediately
    await serviceClient.from('profiles').update({
      first_name: '[Deleted]',
      last_name: '[Deleted]',
      phone: null,
      avatar_url: null,
      address: null,
      deleted_at: now,
      email: anonymisedEmail,
    }).eq('id', user.id);

    // 2. Anonymise address book
    await serviceClient.from('addresses').update({
      name: '[Deleted]',
      phone: null,
      address_line1: '[Deleted]',
      address_line2: null,
      deleted_at: now,
    }).eq('user_id', user.id);

    // 3. Queue deletion marker (gdpr_deletion_requests table for compliance audit)
    await serviceClient.from('gdpr_deletion_requests').insert({
      user_id: user.id,
      original_email: user.email,
      reason: parsed.data.reason ?? null,
      requested_at: now,
      scheduled_deletion_at: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(), // 30 days
      status: 'pending',
    }).select().maybeSingle();

    // 4. Revoke all active sessions
    await supabase.auth.signOut({ scope: 'global' });

    logger.info('gdpr.deletion_scheduled', {
      userId: user.id,
      reason: parsed.data.reason,
      scheduledAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Your account has been scheduled for deletion in 30 days. Your PII has been anonymised immediately. You have been signed out.',
      scheduled_deletion_at: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    });
  } catch (err: any) {
    logger.error('gdpr.delete_failed', { error: err.message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
