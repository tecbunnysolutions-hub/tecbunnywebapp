import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@tecbunny/database';
import { logger } from '@tecbunny/core';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const PreferencesSchema = z.object({
  email_order_updates:      z.boolean().optional(),
  email_promotions:         z.boolean().optional(),
  email_newsletters:        z.boolean().optional(),
  whatsapp_order_updates:   z.boolean().optional(),
  whatsapp_promotions:      z.boolean().optional(),
  sms_otp:                  z.boolean().optional(),
  push_all:                 z.boolean().optional(),
  push_order_updates:       z.boolean().optional(),
});

/**
 * GET /api/user/notifications
 * Returns the authenticated user's notification preferences.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    logger.error('notifications.prefs.get_failed', { error: error.message, userId: user.id });
    return NextResponse.json({ error: 'Failed to load preferences' }, { status: 500 });
  }

  // Return defaults if no row exists yet
  const defaults = {
    email_order_updates: true,
    email_promotions: false,
    email_newsletters: false,
    whatsapp_order_updates: true,
    whatsapp_promotions: false,
    sms_otp: true,
    push_all: false,
    push_order_updates: true,
  };

  return NextResponse.json({ preferences: data ?? { user_id: user.id, ...defaults } });
}

/**
 * PUT /api/user/notifications
 * Upserts notification preferences for the authenticated user.
 */
export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const parsed = PreferencesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(', ') }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('notification_preferences')
    .upsert({ user_id: user.id, ...parsed.data, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    logger.error('notifications.prefs.update_failed', { error: error.message, userId: user.id });
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }

  return NextResponse.json({ preferences: data });
}
