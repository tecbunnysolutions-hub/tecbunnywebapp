#!/usr/bin/env node
// Prints a SUPERADMIN_PASSWORD_HASH value (pbkdf2v1, same format as packages/core/src/auth/superadmin-password.ts).
//   SUPERADMIN_NEW_PASSWORD='...' node scripts/hash-superadmin-password.mjs
import { pbkdf2Sync, randomBytes } from 'node:crypto';

const password = process.env.SUPERADMIN_NEW_PASSWORD;
if (!password || password.length < 12) {
  console.error('Set SUPERADMIN_NEW_PASSWORD (at least 12 characters) in the environment.');
  process.exit(1);
}

const iterations = 600_000;
const salt = randomBytes(32);
const key = pbkdf2Sync(password, salt, iterations, 32, 'sha256');
const b64u = (buf) => buf.toString('base64url');
console.log(`pbkdf2v1:${iterations}:${b64u(salt)}:${b64u(key)}`);
