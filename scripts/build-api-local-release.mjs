import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const require = createRequire(import.meta.url);
const source = require('dotenv').parse(readFileSync(`${root}/.env.local`));
const publicNames = ['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY','NEXT_PUBLIC_SITE_URL','NEXT_PUBLIC_MGMT_URL',
  'NEXT_PUBLIC_SUPERADMIN_URL','NEXT_PUBLIC_WABA_URL','NEXT_PUBLIC_TURNSTILE_SITE_KEY'];
const publicEnv = {};
for (const name of publicNames) {
  assert.ok(source[name] && !/ci-build-only|placeholder|example\.test/.test(source[name]), `Real public build configuration required: ${name}`);
  publicEnv[name] = source[name];
  if (name.endsWith('_URL')) {
    const url = new URL(source[name]);
    assert.equal(url.protocol, 'https:');
    assert.ok(!url.username && !url.password && !['localhost','127.0.0.1'].includes(url.hostname));
  }
}
assert.ok(publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.startsWith('sb_publishable_'));
assert.equal(JSON.parse(Buffer.from(publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY.split('.')[1], 'base64url')).role, 'anon');
publicEnv.NEXT_PUBLIC_BASE_DOMAIN = new URL(publicEnv.NEXT_PUBLIC_SITE_URL).hostname.replace(/^www\./, '');

// Only OS process essentials cross the build boundary. Production server secrets
// are never inherited or read into the child environment. Next's processed marker
// prevents .env files from adding private values during compilation.
const osNames = /^(path|systemroot|windir|comspec|pathext|temp|tmp|userprofile|appdata|localappdata|programfiles(?:\(x86\))?|programdata|homedrive|homepath|number_of_processors|processor_architecture)$/i;
const operatingSystem = Object.fromEntries(Object.entries(process.env).filter(([name]) => osNames.test(name)));
const canary = 'local-release-private-compile-placeholder-000000000000';
const env = { ...operatingSystem, ...publicEnv, NODE_ENV: 'production',
  __NEXT_PROCESSED_ENV: 'true', DOCKER_BUILD: 'false', NEXT_TELEMETRY_DISABLED: '1',
  TECBUNNY_VALIDATE_ENV: 'strict', NODE_OPTIONS: '--max-old-space-size=1536',
  SUPABASE_ANON_KEY: publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: `sb_secret_${canary}`, SUPABASE_SECRET_KEY: `sb_secret_${canary}`,
  DATABASE_URL: 'postgresql://build:build@127.0.0.1:9/build?connect_timeout=1',
  DIRECT_URL: 'postgresql://build:build@127.0.0.1:9/build?connect_timeout=1',
  SMTP_HOST: '127.0.0.1', SMTP_PORT: '9', SMTP_SECURE: 'false', SMTP_USER: 'build@example.test',
  SMTP_PASS: canary, SMTP_FROM: 'build@example.test',
  INFOBIP_API_KEY: canary, INFOBIP_WHATSAPP_FROM: '0000000000', INFOBIP_BASE_URL: 'http://127.0.0.1:9',
  WHATSAPP_WEBHOOK_VERIFY_TOKEN: canary, OTP_SECRET_PEPPER: canary,
  SUPERADMIN_SESSION_SECRET: canary, TOTP_SECRET_ENCRYPTION_KEY: '0'.repeat(64),
  SESSION_SECRET: canary, SUPERADMIN_USER_ID: 'build-only',
  PAYU_MERCHANT_KEY: canary, PAYU_MERCHANT_SALT: canary, PAYU_CLIENT_ID: canary,
  PAYU_CLIENT_SECRET: canary, PAYU_ENVIRONMENT: 'test', TURNSTILE_SECRET_KEY: canary, REDIS_URL: '',
};
function run(args, cwd = root) {
  const result = spawnSync(process.execPath, args, { cwd, env, stdio: 'inherit' });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, 'Local release build failed');
}
run(['scripts/apply-zod-security-backport.mjs','--check']);
run(['--import','tsx','packages/core/src/environment-validator.ts']);
run(['scripts/generate-api-manifest.mjs']);
run([`${root}/node_modules/next/dist/bin/next`,'build','--webpack'], `${root}/apps/api`);
const revision = spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).stdout.trim();
const manifest = { revision, buildId: readFileSync(`${root}/apps/api/.next/BUILD_ID`,'utf8').trim(),
  nextVersion: require('next/package.json').version, builtAt: new Date().toISOString(),
  platform: process.platform, mode: 'node-server-with-separate-linux-runtime',
  publicHosts: Object.fromEntries(Object.entries(publicEnv).filter(([name]) => name.endsWith('_URL')).map(([name,value]) => [name,new URL(value).hostname])),
  privateCompileCanary: canary, productionServerSecretsIncluded: false };
mkdirSync(`${root}/scratch/local-release`,{recursive:true});
writeFileSync(`${root}/scratch/local-release/build-manifest.json`,JSON.stringify(manifest,null,2)+'\n');
console.log('Local API release build finished with verified public configuration and no production server credentials');
