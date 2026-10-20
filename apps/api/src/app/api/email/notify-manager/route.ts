import { NextRequest } from 'next/server';

import * as z from 'zod';

import { emailHelpers } from '@tecbunny/core/email';
import { getAdminDb, logger } from '@tecbunny/core/server';

import {
  authorizeNotification,
  jsonError,
  jsonOk,
  readJsonObject,
} from '../../../../lib/notification-guard';

// Simple in-memory dedupe to avoid duplicate sends in quick succession (best-effort only)
const recentSends = new Map<string, number>();
const DEDUPE_WINDOW_MS = 60_000;

// There is deliberately no `to`: recipients only come from the manager allowlist (settings or env).
const PayloadSchema = z.object({
  orderId: z.union([z.string(), z.number()]).transform((v) => String(v)),
  orderItems: z
    .array(z.object({ name: z.string(), quantity: z.number().int().min(1), price: z.number().nonnegative() }))
    .optional(),
  orderTotal: z.number().nonnegative().optional(),
});

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function parseEmails(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string');
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter((v): v is string => typeof v === 'string');
  } catch {
    // CSV
  }
  return value.split(',');
}

async function resolveManagerRecipients(): Promise<string[]> {
  let emails: string[] = [];
  try {
    const { data, error } = await getAdminDb()
      .from('settings')
      .select('key, value')
      .in('key', ['managerEmails', 'notificationManagerEmails'])
      .limit(2);
    if (error) throw error;
    emails = (data || []).flatMap((row: { value: unknown }) => parseEmails(row.value));
  } catch (error) {
    logger.warn('notify_manager.settings_lookup_failed', { error: error instanceof Error ? error.message : String(error) });
  }
  if (emails.length === 0) {
    emails = parseEmails(process.env.MANAGER_EMAILS || process.env.SMTP_FROM_EMAIL || '');
  }
  return [...new Set(emails.map((e) => e.trim()).filter((e) => EMAIL.test(e)))];
}

export async function POST(request: NextRequest) {
  try {
    const gate = await authorizeNotification(request, {
      bucket: 'email_notify_manager',
      allow: ['internal', 'staff'],
      minRole: 'manager',
      limit: 20,
      windowMs: 10 * 60 * 1000,
    });
    if ('error' in gate) return gate.error;

    const body = await readJsonObject(request);
    const parsed = PayloadSchema.safeParse(body);
    if (!parsed.success) return jsonError(400, 'Invalid payload');
    const { orderId, orderItems, orderTotal } = parsed.data;

    const now = Date.now();
    const last = recentSends.get(orderId);
    if (last && now - last < DEDUPE_WINDOW_MS) return jsonOk({ message: 'Duplicate suppressed' });

    const recipients = await resolveManagerRecipients();
    if (recipients.length === 0) return jsonError(500, 'No manager recipients configured');

    const success = await emailHelpers.notifyManagerNewOrder(recipients, { orderId, orderItems, orderTotal });
    if (!success) return jsonError(500, 'Failed to send manager notification');

    recentSends.set(orderId, now);
    return jsonOk({ message: 'Manager notification sent' });
  } catch (error) {
    logger.error('notify_manager.route_error', { error: error instanceof Error ? error.message : String(error) });
    return jsonError(500, 'Internal server error');
  }
}
