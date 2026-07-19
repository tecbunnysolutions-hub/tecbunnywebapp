import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseServiceRoleClient } from '@supabase/supabase-js';
import { isSupabaseServiceConfigured, requireSupabaseServiceEnv } from '@tecbunny/database';
import { verifySuperadminSessionToken } from '@tecbunny/core/auth/superadmin-session';

type ExtensionRole = 'admin' | 'superadmin';

export class ExtensionAuthError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const DEFAULT_ALLOWED_ORIGINS = ['https://www.tecbunny.com', 'https://tecbunny.com'];

function createSupabaseServiceClient() {
  const { url, serviceKey } = requireSupabaseServiceEnv();
  return createSupabaseServiceRoleClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function configuredExtensionOrigins() {
  const configured = (process.env.CHROME_EXTENSION_ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const extensionId = process.env.CHROME_EXTENSION_ID?.trim();
  if (extensionId) {
    configured.push(`chrome-extension://${extensionId}`);
  }

  return configured;
}

function allowedOrigins() {
  return new Set([...DEFAULT_ALLOWED_ORIGINS, ...configuredExtensionOrigins()]);
}

export function getExtensionCorsHeaders(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  const headers: Record<string, string> = {
    Vary: 'Origin',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-correlation-id',
    'Access-Control-Max-Age': '600',
  };

  if (origin && allowedOrigins().has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

export function isAllowedExtensionOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  return !origin || allowedOrigins().has(origin);
}

export function extensionOptionsResponse(request: NextRequest) {
  const headers = getExtensionCorsHeaders(request);
  return new NextResponse(null, {
    status: isAllowedExtensionOrigin(request) ? 204 : 403,
    headers,
  });
}

export function extensionJson(request: NextRequest, body: unknown, init: ResponseInit = {}) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...getExtensionCorsHeaders(request),
      ...(init.headers || {}),
    },
  });
}

export function assertExtensionOrigin(request: NextRequest) {
  if (!isAllowedExtensionOrigin(request)) {
    throw new ExtensionAuthError(403, 'Forbidden origin');
  }
}

function bearerToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return '';
  return authHeader.substring(7).trim();
}

function isExtensionRole(role: unknown): role is ExtensionRole {
  return role === 'admin' || role === 'superadmin';
}

export async function requireExtensionAdmin(request: NextRequest) {
  assertExtensionOrigin(request);

  const token = bearerToken(request);
  if (!token) {
    throw new ExtensionAuthError(401, 'Unauthorized: Missing token');
  }

  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const ua = request.headers.get('user-agent') || 'unknown';
  const superadminPayload = await verifySuperadminSessionToken(token, ip, ua);
  if (superadminPayload) {
    return {
      user: { id: 'superadmin-root-id', email: superadminPayload.email },
      role: 'superadmin' as const,
    };
  }

  if (!isSupabaseServiceConfigured) {
    throw new ExtensionAuthError(503, 'Service configuration error: Supabase service role is not configured');
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    throw new ExtensionAuthError(403, 'Forbidden: Invalid token');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle();

  if (profileError) {
    throw new ExtensionAuthError(500, 'Failed to verify admin profile');
  }

  const role = profile?.role || data.user.app_metadata?.role;
  if (!isExtensionRole(role)) {
    throw new ExtensionAuthError(403, 'Forbidden: Requires admin privileges');
  }

  return { user: data.user, role };
}