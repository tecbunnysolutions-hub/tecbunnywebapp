import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { logStaffActivity, withAuditEvent } from '@tecbunny/core/enterprise-analytics';
import { getSessionWithRole } from '@tecbunny/core/auth/server-role';
import { logger } from '@tecbunny/core/logger';
import { createServiceClient, isSupabaseServiceConfigured } from '@tecbunny/database/admin';

export const dynamic = 'force-dynamic';

const preferenceSchema = z.object({
  email: z.boolean().default(true),
  whatsapp: z.boolean().default(true),
  sms: z.boolean().default(false),
  orderUpdates: z.boolean().default(true),
  securityAlerts: z.boolean().default(true),
  marketing: z.boolean().default(false),
});

const defaultNotificationPreferences = { email: true, whatsapp: true, sms: false, orderUpdates: true, securityAlerts: true, marketing: false };
const defaultSecurityPreferences = { requireTwoFactor: false, loginAlerts: true, sessionTimeoutMinutes: 480 };
const defaultPrivacyPreferences = { showOnlineStatus: true, allowActivityAnalytics: true };

const profileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  mobile: z.string().trim().min(7).max(20).optional().nullable(),
  avatar_url: z.string().trim().url().optional().or(z.literal('')).nullable(),
  company_name: z.string().trim().max(160).optional().nullable(),
  branch_name: z.string().trim().max(160).optional().nullable(),
  department: z.string().trim().max(120).optional().nullable(),
  timezone: z.string().trim().min(2).max(80).default('Asia/Kolkata'),
  language: z.string().trim().min(2).max(12).default('en'),
  theme: z.enum(['system', 'light', 'dark']).default('system'),
  signature: z.string().trim().max(2000).optional().nullable(),
  notification_preferences: preferenceSchema.default(defaultNotificationPreferences),
  security_preferences: z.object({
    requireTwoFactor: z.boolean().default(false),
    loginAlerts: z.boolean().default(true),
    sessionTimeoutMinutes: z.number().int().min(15).max(1440).default(480),
  }).default(defaultSecurityPreferences),
  privacy_preferences: z.object({
    showOnlineStatus: z.boolean().default(true),
    allowActivityAnalytics: z.boolean().default(true),
  }).default(defaultPrivacyPreferences),
});

const passwordSchema = z.object({
  newPassword: z.string().min(12).max(128),
}).refine((value) => /[A-Z]/.test(value.newPassword), { message: 'Password must include an uppercase letter' })
  .refine((value) => /[a-z]/.test(value.newPassword), { message: 'Password must include a lowercase letter' })
  .refine((value) => /\d/.test(value.newPassword), { message: 'Password must include a number' })
  .refine((value) => /[^A-Za-z0-9]/.test(value.newPassword), { message: 'Password must include a symbol' });

const profileColumns = [
  'id',
  'name',
  'email',
  'mobile',
  'role',
  'avatar_url',
  'company_name',
  'branch_name',
  'department',
  'timezone',
  'language',
  'theme',
  'signature',
  'notification_preferences',
  'security_preferences',
  'privacy_preferences',
  'created_at',
  'updated_at',
].join(', ');

async function requireStaffProfile(request: NextRequest) {
  const { supabase, session, role } = await getSessionWithRole(request);
  if (!session) return { error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) } as const;
  if (!role || role === 'customer') return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) } as const;
  const db = isSupabaseServiceConfigured ? createServiceClient() : supabase;
  return { supabase, db, session, role } as const;
}

export async function GET(request: NextRequest) {
  const context = await requireStaffProfile(request);
  if ('error' in context) return context.error;

  try {
    const { data: profile, error } = await context.db
      .from('profiles')
      .select(profileColumns)
      .eq('id', context.session.user.id)
      .maybeSingle();

    if (error) throw error;

    void logStaffActivity({
      application: 'mgmt',
      module: 'profile',
      screen: '/api/admin/profile',
      action: 'profile_viewed',
      description: 'Viewed profile settings',
      context: { userId: context.session.user.id, userEmail: context.session.user.email, role: context.role },
      apiEndpoint: '/api/admin/profile',
      httpMethod: 'GET',
      success: true,
    });

    return NextResponse.json({
      success: true,
      profile: profile ?? {
        id: context.session.user.id,
        name: context.session.user.user_metadata?.name ?? context.session.user.email?.split('@')[0] ?? 'Staff User',
        email: context.session.user.email ?? '',
        mobile: null,
        role: context.role,
        notification_preferences: {},
        security_preferences: {},
        privacy_preferences: {},
      },
      sessions: [{ id: 'current', device: 'Current browser session', active: true, lastSeenAt: new Date().toISOString() }],
      apiKeys: [],
      twoFactor: { enabled: Boolean(((profile as Record<string, unknown> | null)?.security_preferences as Record<string, unknown> | undefined)?.requireTwoFactor), method: 'totp' },
    });
  } catch (error) {
    logger.error('mgmt_profile.load_failed', { error });
    return NextResponse.json({ error: 'Failed to load profile settings' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const context = await requireStaffProfile(request);
  if ('error' in context) return context.error;

  try {
    const parsed = profileSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid profile payload', details: parsed.error.flatten() }, { status: 400 });
    }

    const { data: existing, error: existingError } = await context.db
      .from('profiles')
      .select(profileColumns)
      .eq('id', context.session.user.id)
      .maybeSingle();

    if (existingError) throw existingError;

    const payload = {
      ...parsed.data,
      id: context.session.user.id,
      role: context.role,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await withAuditEvent({
      application: 'mgmt',
      module: 'profile',
      screen: '/api/admin/profile',
      action: 'profile_updated',
      description: 'Updated profile settings',
      entityType: 'profile',
      entityId: context.session.user.id,
      oldValue: existing,
      newValue: payload,
      reason: 'staff_profile_update',
      context: { userId: context.session.user.id, userEmail: context.session.user.email, role: context.role },
      apiEndpoint: '/api/admin/profile',
      httpMethod: 'PATCH',
      databaseTable: 'profiles',
      priority: 'high',
    }, async () => context.db
        .from('profiles')
        .upsert(payload, { onConflict: 'id' })
        .select(profileColumns)
        .single());

    if (error) throw error;
    return NextResponse.json({ success: true, profile: data });
  } catch (error) {
    logger.error('mgmt_profile.update_failed', { error });
    return NextResponse.json({ error: 'Failed to update profile settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const context = await requireStaffProfile(request);
  if ('error' in context) return context.error;

  try {
    const body = await request.json().catch(() => ({}));
    if (body?.action !== 'change_password') {
      return NextResponse.json({ error: 'Unsupported profile action' }, { status: 400 });
    }

    const parsed = passwordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Password policy failed' }, { status: 400 });
    }

    await withAuditEvent({
      application: 'mgmt',
      module: 'profile',
      screen: '/api/admin/profile',
      action: 'password_changed',
      description: 'Changed account password',
      entityType: 'auth_user',
      entityId: context.session.user.id,
      oldValue: { password: 'masked' },
      newValue: { password: 'masked', policy: 'enterprise' },
      reason: 'staff_password_change',
      context: { userId: context.session.user.id, userEmail: context.session.user.email, role: context.role },
      apiEndpoint: '/api/admin/profile',
      httpMethod: 'POST',
      priority: 'critical',
    }, async () => {
      const { error } = await context.supabase.auth.updateUser({ password: parsed.data.newPassword });
      if (error) throw error;
      return null;
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('mgmt_profile.password_change_failed', { error });
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}