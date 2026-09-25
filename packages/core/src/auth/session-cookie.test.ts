import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
const m = vi.hoisted(() => ({ options: null as any, getUser: vi.fn(), mfa: vi.fn() }));
vi.mock('@supabase/ssr', () => ({ createServerClient: (_url: string, _key: string, options: any) => { m.options = options; return { auth: { getUser: m.getUser, mfa: { getAuthenticatorAssuranceLevel: m.mfa } } }; } }));
vi.mock('../../../database/src/env', () => ({ requireSupabasePublicEnv: () => ({ url: 'https://test.supabase.co', publicKey: 'test' }) }));
import { updateSession } from '@tecbunny/database/middleware';
describe('Session refresh and bearer authentication', () => {
  beforeEach(() => { vi.clearAllMocks(); m.getUser.mockResolvedValue({ data: { user: { id: 'u', app_metadata: { role: 'customer' } } } }); });
  it('preserves every refreshed chunk and forwards new cookies to the handler', async () => {
    m.getUser.mockImplementation(async () => {
      m.options.cookies.setAll([{ name: 'token.0', value: 'first', options: { path: '/', httpOnly: true } }, { name: 'token.1', value: 'second', options: { path: '/' } }]);
      m.options.cookies.setAll([{ name: 'token.2', value: '', options: { path: '/', maxAge: 0 } }]);
      return { data: { user: { id: 'u', app_metadata: { role: 'customer' } } } };
    });
    const response = await updateSession(new NextRequest('https://test/orders'), { requestHeaders: new Headers({ 'x-nonce': 'test' }) });
    expect(response.cookies.getAll()).toHaveLength(3);
    expect(response.headers.get('x-middleware-request-cookie')).toContain('token.0=first');
    expect(response.headers.get('x-middleware-request-cookie')).toContain('token.1=second');
    expect(response.headers.get('x-middleware-request-x-nonce')).toBe('test');
  });
  it('validates bearer-only requests with the supplied token', async () => {
    const response = await updateSession(new NextRequest('https://test/orders', { headers: { Authorization: 'Bearer token' } }));
    expect(response.status).toBe(200); expect(m.getUser).toHaveBeenCalledWith('token');
    expect(m.options.global.headers.Authorization).toBe('Bearer token');
  });
  it.each([false, true])('preserves cookie deletions on denied requests (custom response: %s)', async (custom) => {
    m.getUser.mockImplementation(async () => {
      m.options.cookies.setAll([{ name: 'token.0', value: '', options: { path: '/', maxAge: 0 } }, { name: 'token.1', value: '', options: { path: '/', maxAge: 0 } }]);
      return { data: { user: null }, error: {} };
    });
    const response = await updateSession(new NextRequest('https://test/orders'), custom ? { onUnauthorized: () => NextResponse.json({}, { status: 401 }) } : undefined);
    expect(response.status).toBe(custom ? 401 : 307);
    expect(response.cookies.getAll()).toHaveLength(2);
    expect(response.cookies.get('token.0')?.maxAge).toBe(0);
  });
  it('rejects invalid bearer tokens', async () => {
    m.getUser.mockResolvedValue({ data: { user: null }, error: {} });
    const response = await updateSession(new NextRequest('https://test/api/orders', { headers: { Authorization: 'Bearer invalid' } }), { onUnauthorized: () => NextResponse.json({}, { status: 401 }) });
    expect(response.status).toBe(401);
  });
  it('checks MFA against the verified bearer, not another cookie session', async () => {
    m.getUser.mockResolvedValue({ data: { user: { id: 'u', app_metadata: { role: 'admin' } } } });
    m.mfa.mockResolvedValue({ data: { currentLevel: 'aal1' } });
    const response = await updateSession(new NextRequest('https://test/orders', { headers: { Authorization: 'Bearer token' } }), { enforceMfaRoles: ['admin'], onMfaRequired: () => NextResponse.json({}, { status: 403 }) });
    expect(response.status).toBe(403); expect(m.mfa).toHaveBeenCalledWith('token');
  });
});
