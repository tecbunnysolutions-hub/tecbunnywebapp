import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { sendWelcomeNotification, sendWhatsAppNotification } from '@/lib/whatsapp-service';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';
const isSupabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY));

function getSupabaseAdmin() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Defensive timeout wrapper for external API calls to prevent hanging routes
const withTimeout = <T>(promise: Promise<T>, ms: number = 5000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    )
  ]);
};

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      logger.error('first_login_whatsapp.supabase_config_missing');
      return NextResponse.json(
        { success: false, error: 'Supabase configuration missing.' },
        { status: 503 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    let body: any;

    try {
      body = await request.json();
    } catch (error) {
      logger.warn('first_login_whatsapp.invalid_payload', { error: error instanceof Error ? error.message : error });
      return NextResponse.json({ success: false, error: 'Invalid request payload' }, { status: 400 });
    }

    const { userId, phone, name, loginUrl } = body || {};

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      logger.error('first_login_whatsapp.profile_lookup_failed', { userId, error: profileError });
      const httpStatus = profileError.code === 'PGRST116' ? 404 : 500;
      return NextResponse.json(
        { success: false, error: httpStatus === 404 ? 'Profile not found' : 'Failed to load profile' },
        { status: httpStatus }
      );
    }

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    if (profile.first_login_whatsapp_sent) {
      logger.info('first_login_whatsapp.already_sent', {
        userId,
        sentAt: profile.first_login_notified_at
      });

      return NextResponse.json({
        success: false,
        alreadySent: true,
        sentAt: profile.first_login_notified_at ?? null
      });
    }

    const notifiedAt = new Date().toISOString();

    // ATOMIC LOCK: We attempt to update the flag. If it's already true (from a concurrent request), this will match 0 rows.
    const { data: lockData, error: lockError } = await supabaseAdmin
      .from('profiles')
      .update({ first_login_whatsapp_sent: true, first_login_notified_at: notifiedAt })
      .match({ id: userId, first_login_whatsapp_sent: false })
      .select('id')
      .single();

    if (lockError || !lockData) {
      logger.info('first_login_whatsapp.concurrent_request_blocked', { userId });
      return NextResponse.json({ success: false, alreadySent: true, error: 'Concurrent request blocked' });
    }

    const targetPhone = (phone || profile.mobile || '').trim();

    if (!targetPhone) {
      logger.warn('first_login_whatsapp.missing_phone', { userId });
      // Rollback the lock if we cannot proceed
      await supabaseAdmin.from('profiles').update({ first_login_whatsapp_sent: false, first_login_notified_at: null }).eq('id', userId);
      return NextResponse.json({ success: false, error: 'No valid phone number available' }, { status: 400 });
    }

    const customerName = (name || profile.name || '').trim() || 'there';

    let sendResult: { success: boolean; error?: string; messageId?: string } = { success: false };
    try {
      // BLOCKING I/O DEFENSE: Max 5 seconds allowed for WhatsApp API
      const result = await withTimeout(sendWelcomeNotification(targetPhone, { customerName }), 5000);
      sendResult = { success: true, messageId: result?.messages?.[0]?.id || 'delivered' };
    } catch (err: any) {
      logger.warn('first_login_whatsapp.template_failed_attempting_fallback', { error: err.message });
      const textFallback = [
        `Hi ${customerName}, your TecBunny account is ready.`,
        typeof loginUrl === 'string' && loginUrl.trim() ? `Login here: ${loginUrl.trim()}` : null,
        'If you need help, reply to this message or contact TecBunny support.',
      ].filter(Boolean).join(' ');

      try {
        const textResult = await withTimeout(sendWhatsAppNotification(targetPhone, textFallback), 5000);
        sendResult = { success: true, messageId: textResult?.messages?.[0]?.id || 'delivered' };
      } catch (fallbackErr: any) {
        sendResult = { success: false, error: fallbackErr.message };
      }
    }

    if (!sendResult.success) {
      logger.error('first_login_whatsapp.delivery_failed', {
        userId,
        phone: targetPhone,
        error: sendResult.error
      });

      // Rollback the lock so we can retry later
      await supabaseAdmin.from('profiles').update({ first_login_whatsapp_sent: false, first_login_notified_at: null }).eq('id', userId);

      return NextResponse.json({
        success: false,
        error: sendResult.error || 'Failed to send WhatsApp message',
        messageId: sendResult.messageId ?? null
      }, { status: 502 });
    }

    logger.info('first_login_whatsapp.sent', {
      userId,
      phone: targetPhone,
      messageId: sendResult.messageId,
      sentAt: notifiedAt
    });

    return NextResponse.json({
      success: true,
      sentAt: notifiedAt,
      messageId: sendResult.messageId
    });
  } catch (error) {
    logger.error('first_login_whatsapp.unexpected_error', { error });
    return NextResponse.json({ success: false, error: 'Unexpected server error' }, { status: 500 });
  }
}
