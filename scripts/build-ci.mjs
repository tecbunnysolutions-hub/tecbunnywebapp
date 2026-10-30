import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Compile-only fixtures. Never deploy these artifacts or use these values at runtime.
// Keep validation enabled so CI checks the configuration shape without real credentials.
const fixture = 'ci-build-only-not-a-secret-0000000000000000';
const env = {
  ...process.env,
  TECBUNNY_VALIDATE_ENV: 'strict',
  NEXT_TELEMETRY_DISABLED: '1',
  NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:9',
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: `sb_publishable_${fixture}`,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: `sb_publishable_${fixture}`,
  SUPABASE_SERVICE_ROLE_KEY: `sb_secret_${fixture}`,
  SUPABASE_SECRET_KEY: `sb_secret_${fixture}`,
  DATABASE_URL: 'postgresql://build:build@127.0.0.1:9/build?connect_timeout=1',
  DIRECT_URL: 'postgresql://build:build@127.0.0.1:9/build?connect_timeout=1',
  NEXT_PUBLIC_SITE_URL: 'https://build.example.test',
  NEXT_PUBLIC_BASE_DOMAIN: 'example.test',
  NEXT_PUBLIC_MGMT_URL: 'https://mgmt.example.test',
  NEXT_PUBLIC_SUPERADMIN_URL: 'https://superadmin.example.test',
  NEXT_PUBLIC_WABA_URL: 'https://waba.example.test',
  SMTP_HOST: '127.0.0.1', SMTP_PORT: '9', SMTP_SECURE: 'false',
  SMTP_USER: 'build@example.test', SMTP_PASS: fixture, SMTP_FROM: 'build@example.test',
  INFOBIP_API_KEY: fixture, INFOBIP_WHATSAPP_FROM: '0000000000', INFOBIP_BASE_URL: 'http://127.0.0.1:9',
  WHATSAPP_WEBHOOK_VERIFY_TOKEN: fixture,
  OTP_SECRET_PEPPER: fixture, SUPERADMIN_SESSION_SECRET: fixture,
  TOTP_SECRET_ENCRYPTION_KEY: '0'.repeat(64), SESSION_SECRET: fixture, SUPERADMIN_USER_ID: 'build-only',
  PAYU_MERCHANT_KEY: fixture, PAYU_MERCHANT_SALT: fixture,
  PAYU_CLIENT_ID: fixture, PAYU_CLIENT_SECRET: fixture, PAYU_ENVIRONMENT: 'test',
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: fixture, TURNSTILE_SECRET_KEY: fixture,
  REDIS_URL: '',
};
const root = fileURLToPath(new URL('..', import.meta.url));
function run(args) {
  const result = spawnSync(process.execPath, args, { cwd: root, env, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
run(['--import', 'tsx', 'packages/core/src/environment-validator.ts']);
const args = process.argv.slice(2);
const filters = args.some(arg => arg.startsWith('--filter=')) ? [] : ['--filter=./apps/*', '--filter=./packages/*'];
run([fileURLToPath(new URL('../node_modules/turbo/bin/turbo', import.meta.url)), 'run', 'build', ...filters, '--concurrency=1', ...args]);
