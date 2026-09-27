import { createSupabaseClient as createServerClient } from '@tecbunny/database/server';
import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';

import { rateLimit } from "@tecbunny/core/rate-limit";
import { requireApiRole } from "@tecbunny/core/server-role-guard";
import { getTrustedClientIp } from "@tecbunny/core/request-ip";
import { ALL_ROLES } from "@tecbunny/core/roles";


import { logger } from '@tecbunny/core';

const STAFF_ROLES = ALL_ROLES.filter((role) => role !== 'customer');

export function hasValidInternalApiKey(request: Request): boolean {
  const expected = process.env.INTERNAL_API_KEY;
  const provided = request.headers.get('x-internal-api-key');
  if (!expected || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Transactional email endpoints send branded mail, so callers must be server
 * code (internal key) or staff. 'self' additionally lets a signed-in user send
 * to their own verified address.
 */
export async function authorizeEmailRequest(
  request: Request,
  access: 'staff' | 'self',
  recipient?: unknown,
): Promise<NextResponse | null> {
  if (hasValidInternalApiKey(request)) return null;

  if (access === 'self') {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    const ownEmail = user.email_confirmed_at && user.email ? user.email.trim().toLowerCase() : null;
    if (!ownEmail || typeof recipient !== 'string' || recipient.trim().toLowerCase() !== ownEmail) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return null;
  }

  const auth = await requireApiRole({ allowedRoles: STAFF_ROLES });
  return auth.error ?? null;
}

export interface EmailHandlerConfig<T, R = { success: true }> {
  validate: (body: any) => { ok: true; data: T } | { ok: false; error: string };
  // action returns either boolean (legacy) or a richer payload R | false
  action: (data: T) => Promise<boolean | R>;
  rate: { bucket: string; limit: number; windowMs: number };
  /** Who may call the route (see authorizeEmailRequest). Defaults to staff. */
  access?: 'staff' | 'self';
}

export async function handleEmailPost<T, R = { success: true }>(request: NextRequest, cfg: EmailHandlerConfig<T, R>) {
  try {
    const ct = request.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 });
    }

    const body = await request.json().catch(() => undefined);
    const validated = cfg.validate(body);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const denied = await authorizeEmailRequest(request, cfg.access ?? 'staff', (validated.data as { to?: unknown })?.to);
    if (denied) return denied;

    // User or IP based key
    let userId: string | null = null;
    try {
      const supabase = await createServerClient();
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
    } catch { /* ignore */ }
    const rateKey = userId ? `user:${userId}` : `ip:${getTrustedClientIp(request)}`;
    // Redis-backed when configured, so limits hold across serverless instances.
    const limit = await rateLimit(`${cfg.rate.bucket}:${rateKey}`, cfg.rate.limit, cfg.rate.windowMs);
    if (!limit.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const result = await cfg.action(validated.data);
    const res = result
      ? NextResponse.json(typeof result === 'object' ? (result as any) : { success: true })
      : NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    res.headers.set('Cache-Control', 'no-store');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('Referrer-Policy', 'same-origin');
    return res;
  } catch (error) {
    logger.error('Email route error', { error, context: 'handleEmailPost' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}