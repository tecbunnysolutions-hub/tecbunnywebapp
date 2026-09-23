import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const updateSession = vi.hoisted(() => vi.fn());
vi.mock('@tecbunny/database/middleware', () => ({ updateSession }));
vi.mock('../telemetry', () => ({ telemetry: {} }));
vi.mock('../logger-browser', () => ({ logger: { info: vi.fn() } }));
import { executeUnifiedPolicyMiddleware } from './unified-middleware';

describe('API gateway MFA policy', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    updateSession.mockResolvedValue(NextResponse.next());
  });

  it('requires privileged API callers to complete MFA', async () => {
    await executeUnifiedPolicyMiddleware(new NextRequest('https://api.test/api/payments/update'), { appType: 'api' });
    expect(updateSession).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ enforceMfaRoles: ['admin', 'superadmin'] }));
  });

  it.each(['setup', 'verify', 'status', 'disable'])('keeps authenticated factor %s reachable without a circular MFA requirement', async (action) => {
    await executeUnifiedPolicyMiddleware(new NextRequest(`https://api.test/api/auth/2fa/${action}`), { appType: 'api' });
    expect(updateSession).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ enforceMfaRoles: undefined, publicRoutes: [] }));
  });

  it('does not exempt arbitrary paths under an enrollment prefix', async () => {
    await executeUnifiedPolicyMiddleware(new NextRequest('https://api.test/api/auth/2fa/setup/admin'), { appType: 'api' });
    expect(updateSession).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ enforceMfaRoles: ['admin', 'superadmin'] }));
  });
});
