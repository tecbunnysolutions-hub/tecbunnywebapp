import { NextRequest } from 'next/server';

import { emailHelpers } from '@tecbunny/core/email';
import { logger } from '@tecbunny/core/server';

import { authorizeNotification, jsonError, jsonOk, readJsonObject } from '../../../../lib/notification-guard';

// Email verification OTP: signed-in users only, and only to their own address. 5 per 30 minutes.
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(request: NextRequest) {
  try {
    const gate = await authorizeNotification(request, {
      bucket: 'email_verification',
      allow: ['owner'],
      limit: 5,
      windowMs: 30 * 60 * 1000,
    });
    if ('error' in gate) return gate.error;
    if (gate.caller.kind !== 'user') return jsonError(403, 'Forbidden');

    const body = await readJsonObject(request);
    if (!body) return jsonError(400, 'Invalid JSON body');
    const { to, userName, otp } = body;
    if (typeof to !== 'string' || !EMAIL.test(to)) return jsonError(400, 'Invalid recipient email');
    if (typeof userName !== 'string' || !userName || typeof otp !== 'string') {
      return jsonError(400, 'Invalid userName or otp');
    }
    if (!gate.caller.email || gate.caller.email.trim().toLowerCase() !== to.trim().toLowerCase()) {
      return jsonError(403, 'Forbidden');
    }
    if (!/^\d{6}$/.test(otp)) return jsonError(400, 'Invalid OTP format');

    const success = await emailHelpers.sendEmailVerification(to, userName, otp);
    return success ? jsonOk({ message: 'Email verification sent successfully' }) : jsonError(500, 'Failed to send email verification');
  } catch (error) {
    logger.error('email_verification.route_error', { error: error instanceof Error ? error.message : String(error) });
    return jsonError(500, 'Internal server error');
  }
}
