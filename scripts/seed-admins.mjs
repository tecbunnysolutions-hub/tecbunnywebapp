#!/usr/bin/env node
// One-time admin bootstrap. Replaces the removed POST /api/admin/setup-initial-admins route.
//
//   ADMIN_SEED_EMAIL=... ADMIN_SEED_PASSWORD=... node scripts/seed-admins.mjs [--force]
//
// Secrets are read from the environment at run time and are never printed.
// Required: NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL), SUPABASE_SECRET_KEY (or deprecated
// SUPABASE_SERVICE_ROLE_KEY), ADMIN_SEED_EMAIL, ADMIN_SEED_PASSWORD.
// Optional: ADMIN_SEED_NAME, ADMIN_SEED_MOBILE.
import { createClient } from '@supabase/supabase-js';

const force = process.argv.includes('--force');
const env = process.env;

const fail = (message) => {
  console.error(`seed-admins: ${message}`);
  process.exit(1);
};

const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
let serviceKey = env.SUPABASE_SECRET_KEY;
if (!serviceKey && env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('seed-admins: deprecated env name SUPABASE_SERVICE_ROLE_KEY used; set SUPABASE_SECRET_KEY instead.');
  serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
}
const email = env.ADMIN_SEED_EMAIL?.trim().toLowerCase();
const password = env.ADMIN_SEED_PASSWORD;
const name = env.ADMIN_SEED_NAME?.trim() || 'Admin';
const mobile = env.ADMIN_SEED_MOBILE?.trim() || '';

const missing = [
  ['NEXT_PUBLIC_SUPABASE_URL', url],
  ['SUPABASE_SECRET_KEY', serviceKey],
  ['ADMIN_SEED_EMAIL', email],
  ['ADMIN_SEED_PASSWORD', password],
].filter(([, value]) => !value).map(([key]) => key);
if (missing.length) fail(`missing environment variables: ${missing.join(', ')}`);
if (password.length < 12) fail('ADMIN_SEED_PASSWORD must be at least 12 characters.');

const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

const { data: admins, error: adminCheckError } = await supabase.from('profiles').select('id, email').eq('role', 'admin').limit(1);
if (adminCheckError) fail(`could not check existing admins: ${adminCheckError.message}`);
if (admins?.length && !force) {
  fail('an admin already exists; nothing changed. Re-run with --force to create or update the seed admin anyway.');
}

const profile = { name, mobile, role: 'admin', is_active: true, email_verified: true };
const authFields = { password, email_confirm: true, app_metadata: { role: 'admin' }, user_metadata: { name } };

const { data: existing, error: lookupError } = await supabase.from('profiles').select('id').eq('email', email).maybeSingle();
if (lookupError) fail(`profile lookup failed: ${lookupError.message}`);

let userId = existing?.id;
if (userId) {
  const { error } = await supabase.auth.admin.updateUserById(userId, authFields);
  if (error) fail(`could not update auth user: ${error.message}`);
  const { error: profileError } = await supabase.from('profiles').update(profile).eq('id', userId);
  if (profileError) fail(`could not update profile: ${profileError.message}`);
} else {
  const { data, error } = await supabase.auth.admin.createUser({ email, ...authFields });
  if (error || !data.user) fail(`could not create auth user: ${error?.message ?? 'unknown error'}`);
  userId = data.user.id;
  const { error: profileError } = await supabase.from('profiles').upsert({ id: userId, email, ...profile });
  if (profileError) fail(`could not create profile: ${profileError.message}`);
}

console.log(`seed-admins: admin ready for ${email} (${existing?.id ? 'updated' : 'created'}).`);
