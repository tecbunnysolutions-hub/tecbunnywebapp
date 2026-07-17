import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, logger } from '@tecbunny/core/server';
import { z } from 'zod';

/**
 * POST /api/notifications/send
 * Internal endpoint — sends a notification to a user respecting their preferences.
 * Called by order status updates, cron jobs, etc.
 *
 * Protected by INTERNAL_API_KEY header.
 */

const PayloadSchema = z.object({
  user_id:  z.string().uuid(),
  type:     z.enum(['order_update', 'promotion', 'service_reminder', 'otp', 'general']),
  channels: z.array(z.enum(['email', 'whatsapp', 'sms', 'push'])).optional(),
  message:  z.string().min(1).max(1000),
  subject:  z.string().optional(),
  data:     z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  const internalKey = process.env.INTERNAL_API_KEY;
  const provided = request.headers.get('x-internal-api-key');
  if (!internalKey || provided !== internalKey) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = PayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.issues }, { status: 400 });
  }

  const { user_id, type, channels, message, subject, data } = parsed.data;
  const db = getAdminDb();

  try {
    // Fetch user preferences
    const { data: prefs } = await db
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();

    // Fetch user profile for contact info
    const { data: profile } = await db
      .from('profiles')
      .select('email, mobile, first_name')
      .eq('id', user_id)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const effectiveChannels = channels ?? ['email', 'whatsapp'];
    const results: Record<string, 'sent' | 'skipped' | 'failed'> = {};

    // ─── Email ──────────────────────────────────────────────────────────────
    if (effectiveChannels.includes('email')) {
      const emailPref = type === 'promotion' ? prefs?.promotions : prefs?.order_updates ?? true;
      const generalEmail = prefs?.email ?? true;

      if (generalEmail && emailPref !== false && profile.email) {
        try {
          const { improvedEmailService } = await import('@tecbunny/core/server');
          await improvedEmailService.sendEmail({
            to: profile.email,
            subject: subject ?? `Notification from TecBunny`,
            html: `<p>Hi ${profile.first_name ?? 'there'},</p><p>${message}</p>`,
            text: message,
          });
          results.email = 'sent';
        } catch (err) {
          logger.error('notification.email_failed', { user_id, error: (err as Error).message });
          results.email = 'failed';
        }
      } else {
        results.email = 'skipped';
      }
    }

    // ─── WhatsApp ────────────────────────────────────────────────────────────
    if (effectiveChannels.includes('whatsapp')) {
      const waPref = type === 'promotion' ? prefs?.promotions : prefs?.order_updates ?? true;
      const generalWa = prefs?.whatsapp ?? true;

      if (generalWa && waPref !== false && profile.mobile) {
        try {
          const { WhatsAppService } = await import('@tecbunny/core/server');
          const wa = new WhatsAppService();
          await wa.sendMessage(profile.mobile, message);
          results.whatsapp = 'sent';
        } catch (err) {
          logger.warn('notification.whatsapp_failed', { user_id, error: (err as Error).message });
          results.whatsapp = 'failed';
        }
      } else {
        results.whatsapp = 'skipped';
      }
    }

    // Persist to notification queue (best-effort)
    await (db.from('ntf_queue').insert({
      user_id,
      type,
      message,
      channels: JSON.stringify(effectiveChannels),
      status: Object.values(results).some(r => r === 'sent') ? 'sent' : 'failed',
      metadata: data ?? {},
    }) as unknown as Promise<unknown>).catch(() => {});

    logger.info('notification.sent', { user_id, type, results });
    return NextResponse.json({ success: true, results });

  } catch (err) {
    logger.error('notification.send_error', { user_id, error: (err as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
