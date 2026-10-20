import { NextRequest } from 'next/server';

import { emailHelpers } from '@tecbunny/core/email';

import {
  authorizeNotification,
  jsonError,
  jsonOk,
  readJsonObject,
  resolveTargetUser,
} from '../../../../lib/notification-guard';

// OTP relay for server-side flows: internal token only. The address comes from the user record.
export async function POST(request: NextRequest) {
  const gate = await authorizeNotification(request, {
    bucket: 'email_password_reset',
    allow: ['internal'],
    limit: 5,
    windowMs: 30 * 60 * 1000,
  });
  if ('error' in gate) return gate.error;

  const body = await readJsonObject(request);
  const otp = body?.otp;
  if (!body || typeof otp !== 'string' || !/^\d{6}$/.test(otp)) return jsonError(400, 'Invalid OTP format');

  const resolved = await resolveTargetUser(gate.caller, body);
  if ('error' in resolved) return resolved.error;
  if (!resolved.target.email) return jsonError(422, 'User has no email address');

  const sent = await emailHelpers.sendPasswordResetOTP(resolved.target.email, resolved.target.name || 'there', otp);
  return sent ? jsonOk({}) : jsonError(500, 'Failed to send password reset OTP email');
}
