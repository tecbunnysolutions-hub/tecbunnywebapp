import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const apiDir = join(__dirname);
const read = (rel: string) => readFileSync(join(apiDir, rel), 'utf8');

describe('removed bootstrap and bypass endpoints', () => {
  it.each([
    'auth/quick-login/route.ts',
    'admin/setup-initial-admins/route.ts',
    'webhooks/custom-tunnel/[[...path]]/route.ts',
  ])('%s no longer exists', (rel) => {
    expect(existsSync(join(apiDir, rel))).toBe(false);
  });

  it('no API source reads the removed env flags', () => {
    const files = [
      'otp/generate/route.ts',
      'otp/resend/route.ts',
      'admin/manage-role/route.ts',
      'admin/payment-settings/dedupe/route.ts',
      'admin/homepage/auto-fill/run/route.ts',
    ];
    for (const rel of files) {
      expect(read(rel)).not.toMatch(/OTP_RATE_LIMIT_BYPASS|ADMIN_MAINT_TOKEN|AUTO_FILL_SECRET|x-admin-token|QUICK_LOGIN|TUNNEL_SECRET/);
    }
  });

  it('maintenance routes use role checks', () => {
    expect(read('admin/manage-role/route.ts')).toContain("requireRole('superadmin')");
    expect(read('admin/payment-settings/dedupe/route.ts')).toContain("requireRole('admin')");
  });
});
