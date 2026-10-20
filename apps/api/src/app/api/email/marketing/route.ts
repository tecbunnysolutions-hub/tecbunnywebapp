import { NextRequest } from 'next/server';

import { emailHelpers } from '@tecbunny/core/email';
import { logger } from '@tecbunny/core/server';

import { authorizeNotification, jsonError, jsonOk, readJsonObject } from '../../../../lib/notification-guard';

// Marketing emails are bulk: staff (admin and above) only, 2 per 30 minutes.
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(request: NextRequest) {
  try {
    const gate = await authorizeNotification(request, {
      bucket: 'email_marketing',
      allow: ['staff'],
      minRole: 'admin',
      limit: 2,
      windowMs: 30 * 60 * 1000,
    });
    if ('error' in gate) return gate.error;

    const payload = await readJsonObject(request);
    if (!payload) return jsonError(400, 'Invalid JSON body');
    const { to, campaignTitle, campaignBody, ctaText, ctaUrl, bannerImageUrl, discountCode } = payload as any;
    if (!to) return jsonError(400, 'Missing required field: to');

    const recipients = Array.isArray(to) ? to : [to];
    if (recipients.some((e) => typeof e !== 'string' || !EMAIL.test(e))) {
      return jsonError(400, 'Invalid recipient email(s)');
    }

    const success = await emailHelpers.sendMarketingCampaign(recipients, {
      campaignTitle,
      campaignBody,
      ctaText,
      ctaUrl,
      bannerImageUrl,
      discountCode,
    });
    return success ? jsonOk({ message: 'Marketing email(s) sent' }) : jsonError(500, 'Failed to send marketing email(s)');
  } catch (error) {
    logger.error('marketing_email.route_error', { error: error instanceof Error ? error.message : String(error) });
    return jsonError(500, 'Internal server error');
  }
}
