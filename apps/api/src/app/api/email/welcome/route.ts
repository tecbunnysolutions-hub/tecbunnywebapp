import { NextRequest } from 'next/server';

import { emailHelpers } from '@tecbunny/core/email';

import {
  authorizeNotification,
  jsonError,
  jsonOk,
  readJsonObject,
  resolveTargetUser,
} from '../../../../lib/notification-guard';

// The signed-in user (or an internal caller naming a userId) only; the address comes from the user record.
export async function POST(request: NextRequest) {
  const gate = await authorizeNotification(request, {
    bucket: 'email_welcome',
    allow: ['internal', 'owner'],
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if ('error' in gate) return gate.error;

  const body = (await readJsonObject(request)) ?? {};
  const resolved = await resolveTargetUser(gate.caller, body);
  if ('error' in resolved) return resolved.error;
  const { target } = resolved;
  if (!target.email) return jsonError(422, 'User has no email address');

  const sent = await emailHelpers.sendWelcomeEmail(target.email, target.name || 'there');
  return sent ? jsonOk({}) : jsonError(500, 'Failed to send welcome email');
}
