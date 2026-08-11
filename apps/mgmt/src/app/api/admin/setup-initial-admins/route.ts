import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from "@tecbunny/core/rate-limit";
import { logger } from '@tecbunny/core/logger';
import {  getAdminClient  } from '@tecbunny/database/admin';

const getSupabaseAdmin = (): any => {
  return getAdminClient();
};

function getClientIp(request: NextRequest) {
  return request.headers.get('cf-connecting-ip')?.trim()
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')?.trim()
    || 'unknown';
}

export async function POST(request: NextRequest) {
  // Endpoint is disabled by default. Enable only during initial deployment by
  // setting ADMIN_SETUP_ENDPOINT_ENABLED=true, then remove that variable once
  // at least one admin exists (the endpoint self-locks after first use anyway).
  if (process.env.ADMIN_SETUP_ENDPOINT_ENABLED !== 'true') {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  logger.info('setup_initial_admins.audit.requested');
  const clientIp = getClientIp(request);
  const ipRl = await rateLimit(`setup_admins_ip:${clientIp}`, 3, 15 * 60 * 1000);
  if (!ipRl.allowed) {
    logger.warn('setup_initial_admins.audit.rate_limited', { clientIp });
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const token = request.headers.get('x-admin-token');
  const isTokenConfigured = process.env.ADMIN_MAINT_TOKEN && process.env.ADMIN_MAINT_TOKEN.length >= 32;

  if (!isTokenConfigured || !token || token !== process.env.ADMIN_MAINT_TOKEN) {
    logger.warn('setup_initial_admins.audit.unauthorized', { isTokenConfigured });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    // Edge Environment Protection: Block setup if any admin already exists
    const { data: existingAdmins, error: adminCheckError } = await supabase
      .from('profiles')
      .select('id')
      .in('role', ['admin'])
      .limit(1);

    if (adminCheckError) {
      logger.error('setup_initial_admins.audit.db_check_failed', { error: adminCheckError.message });
      return NextResponse.json({ error: 'Database check failed' }, { status: 500 });
    }

    if (existingAdmins && existingAdmins.length > 0) {
      logger.warn('setup_initial_admins.audit.locked');
      return NextResponse.json({ error: 'Initialization is already complete and locked' }, { status: 403 });
    }

    const users = [];

    // Admin seed
    const adminEmail = process.env.ADMIN_SEED_EMAIL || process.env.SEED_ADMIN_EMAIL || process.env.INITIAL_ADMIN_1_EMAIL;
    const adminPassword = process.env.ADMIN_SEED_PASSWORD || process.env.SEED_ADMIN_PASSWORD || process.env.INITIAL_ADMIN_1_PASSWORD;
    if (adminEmail && adminPassword) {
      users.push({
        email: adminEmail,
        password: adminPassword,
        name: process.env.SEED_ADMIN_NAME || process.env.INITIAL_ADMIN_1_NAME || 'Admin',
        mobile: process.env.SEED_ADMIN_MOBILE || process.env.INITIAL_ADMIN_1_MOBILE || '',
        role: 'admin'
      });
    }

    if (users.length === 0) {
      logger.error('setup_initial_admins.audit.missing_env_credentials');
      return NextResponse.json({ error: 'Initial admin credentials environment variables are not configured.' }, { status: 500 });
    }

    const results = [];

    for (const userData of users) {
      const { email, password, name, mobile, role } = userData;

      // Check if user already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('email', email)
        .maybeSingle();

      let userId: string;

      if (existingProfile?.id) {
        // Update existing user
        userId = existingProfile.id;
        await supabase.auth.admin.updateUserById(userId, {
          password,
          email_confirm: true,
          app_metadata: { role },
          user_metadata: { name }
        });

        // Update profile
        await supabase
          .from('profiles')
          .update({
            name,
            mobile,
            role,
            is_active: true,
            email_verified: true
          })
          .eq('id', userId);
      } else {
        // Create new user
        const { data: created, error: createErr } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          app_metadata: { role },
          user_metadata: { name }
        });

        if (createErr || !created.user) {
          logger.error('setup_initial_admins.audit.user_create_failed', { email, error: createErr?.message || 'Failed to create user' });
          results.push({ email, status: 'error', error: createErr?.message || 'Failed to create user' });
          continue;
        }

        userId = created.user.id;

        // Create profile
        await supabase
          .from('profiles')
          .upsert({
            id: userId,
            email,
            name,
            mobile,
            role,
            is_active: true,
            email_verified: true
          });
      }

      results.push({ email, status: 'success', userId, role });
    }

    logger.info('setup_initial_admins.audit.success', { resultCount: results.length });
    return NextResponse.json({
      success: true,
      message: 'Admin users setup completed',
      results
    });

  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    logger.error('setup_initial_admins.audit.failed', { error: msg });
    if (msg.startsWith('[supabase]')) {
      return NextResponse.json({ error: 'Service configuration error. Please contact support.' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Setup operation failed. Check server logs.' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const maxDuration = 30;
