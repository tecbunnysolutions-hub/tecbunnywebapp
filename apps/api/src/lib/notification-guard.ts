import { NextResponse, type NextRequest } from 'next/server';

import { rateLimit } from '@tecbunny/core/rate-limit';
import { isAtLeast } from '@tecbunny/core/roles';
import { getServerAuthState } from '@tecbunny/core/server-role-guard';
import { getAdminDb, logger } from '@tecbunny/core/server';

import { hasInternalToken } from './internal-auth';

type Role = Parameters<typeof isAtLeast>[0];

export type NotifyAudience = 'internal' | 'staff' | 'owner';

export type NotifyCaller =
  | { kind: 'internal' }
  | { kind: 'staff'; userId: string; role: string }
  | { kind: 'user'; userId: string; email: string | null; emailConfirmed: boolean };

const STAFF_ROLES: Role[] = ['sales_executive', 'store_executive', 'warehouse', 'delivery', 'support', 'accounts'];

export const isNotifyStaff = (role: string) => STAFF_ROLES.some((r) => isAtLeast(role as Role, r));

export function jsonError(status: number, error: string) {
  return noStore(NextResponse.json({ error }, { status }));
}

export function jsonOk(body: Record<string, unknown>) {
  return noStore(NextResponse.json({ success: true, ...body }));
}

function noStore(res: NextResponse) {
  res.headers.set('Cache-Control', 'no-store');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'same-origin');
  return res;
}

export function clientIp(request: NextRequest) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

export interface NotifyAuthOptions {
  bucket: string;
  allow: NotifyAudience[];
  /** Per-user limit per window. Staff get 5x; the per-IP limit is also 5x. */
  limit: number;
  windowMs: number;
}

/**
 * Authenticates a notification request: internal token (constant-time), staff, or the owning user.
 * Rate limits per IP and per user. Internal callers are exempt from rate limits.
 */
export async function authorizeNotification(
  request: NextRequest,
  options: NotifyAuthOptions,
): Promise<{ caller: NotifyCaller } | { error: NextResponse }> {
  if (options.allow.includes('internal') && hasInternalToken(request)) {
    return { caller: { kind: 'internal' } };
  }

  const ipAllowed = rateLimit(`ip:${clientIp(request)}`, `${options.bucket}:ip`, {
    limit: options.limit * 5,
    windowMs: options.windowMs,
  });
  if (!ipAllowed) return { error: jsonError(429, 'Rate limit exceeded') };

  const { session, role, mfaLevel } = await getServerAuthState();
  if (!session?.user?.id) return { error: jsonError(401, 'Authentication required') };

  if ((role === 'admin' || role === 'superadmin') && mfaLevel !== 'aal2') {
    return { error: jsonError(403, 'MFA Required') };
  }

  const userId = session.user.id;
  const staff = options.allow.includes('staff') && isNotifyStaff(role);
  if (!staff && !options.allow.includes('owner')) return { error: jsonError(403, 'Forbidden') };

  const userAllowed = rateLimit(`user:${userId}`, options.bucket, {
    limit: staff ? options.limit * 5 : options.limit,
    windowMs: options.windowMs,
  });
  if (!userAllowed) return { error: jsonError(429, 'Rate limit exceeded') };

  if (staff) return { caller: { kind: 'staff', userId, role } };
  return {
    caller: {
      kind: 'user',
      userId,
      email: session.user.email ?? null,
      emailConfirmed: Boolean(session.user.email_confirmed_at),
    },
  };
}

export async function readJsonObject(request: NextRequest): Promise<Record<string, unknown> | null> {
  const body = await request.json().catch(() => null);
  return body && typeof body === 'object' && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
}

function parseItems(items: unknown): Record<string, unknown> {
  try {
    const parsed = typeof items === 'string' ? JSON.parse(items) : items;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export type OrderRecord = Record<string, any>;

export function userOwnsOrder(caller: Extract<NotifyCaller, { kind: 'user' }>, order: OrderRecord): boolean {
  if (order.user_id === caller.userId || order.customer_id === caller.userId) return true;
  return Boolean(
    caller.emailConfirmed &&
      caller.email &&
      order.customer_email &&
      caller.email.toLowerCase() === String(order.customer_email).toLowerCase(),
  );
}

/** Loads the order from the database and enforces ownership for customer callers. */
export async function loadOrderForCaller(
  caller: NotifyCaller,
  orderId: string,
): Promise<{ order: OrderRecord } | { error: NextResponse }> {
  const { data: order, error } = await getAdminDb().from('orders').select('*').eq('id', orderId).maybeSingle();
  if (error) {
    logger.error('notification.order_lookup_failed', { orderId });
    return { error: jsonError(503, 'Could not load order') };
  }
  if (caller.kind === 'user') {
    // Missing and not-owned are indistinguishable to customers to prevent order id enumeration.
    if (!order || !userOwnsOrder(caller, order)) return { error: jsonError(403, 'Access denied') };
  } else if (!order) {
    return { error: jsonError(404, 'Order not found') };
  }
  return { order };
}

export function orderContact(order: OrderRecord): { email: string | null; phone: string | null; name: string | null } {
  const items = parseItems(order.items);
  const email = order.customer_email || items.customer_email;
  const phone = order.customer_phone || items.customer_phone;
  return {
    email: typeof email === 'string' && email.includes('@') ? email : null,
    phone: typeof phone === 'string' && phone.trim() ? phone : null,
    name: typeof order.customer_name === 'string' ? order.customer_name : null,
  };
}

/** Whitelisted projection of the order used by templates; never forwards caller-supplied order data. */
export function toOrderEmailData(order: OrderRecord) {
  const contact = orderContact(order);
  return {
    id: order.id,
    created_at: order.created_at,
    customer_name: contact.name,
    customer_email: contact.email,
    customer_phone: contact.phone,
    delivery_address: order.delivery_address,
    pickup_store: order.pickup_store,
    type: order.type,
    items: order.items,
    subtotal: order.subtotal,
    gst_amount: order.gst_amount,
    discount_amount: order.discount_amount,
    shipping_amount: order.shipping_amount,
    total: order.total,
  };
}

export function toPaymentData(order: OrderRecord) {
  return { method: order.payment_method, transactionId: order.payment_reference };
}

export function formatOrderNumber(id: unknown) {
  return typeof id === 'string' && id ? id.slice(-6).toUpperCase() : '';
}

export function parseOrderId(body: Record<string, unknown>): string | null {
  const raw = body.orderId;
  const value = typeof raw === 'number' ? String(raw) : raw;
  return typeof value === 'string' && value.length > 0 && value.length <= 64 ? value : null;
}

export interface OrderNotificationContext<X> {
  caller: NotifyCaller;
  order: OrderRecord;
  orderData: ReturnType<typeof toOrderEmailData>;
  email: string | null;
  phone: string | null;
  name: string | null;
  extra: X;
}

export interface OrderNotificationConfig<X> extends NotifyAuthOptions {
  /** 'email' needs an order email, 'whatsapp' a phone (skips quietly when absent), 'team' needs neither. */
  channel: 'email' | 'whatsapp' | 'team';
  successMessage: string;
  failureMessage: string;
  parseExtra?: (body: Record<string, unknown>) => { ok: true; data: X } | { ok: false; error: string };
  /** Returns a message when the order is not in a state that allows this notification. */
  precondition?: (order: OrderRecord) => string | null;
  send: (ctx: OrderNotificationContext<X>) => Promise<boolean>;
}

/**
 * Shared handler for order-scoped notifications. Recipients and order data always come
 * from the database; the request body only carries the order id and small, validated extras.
 */
export async function handleOrderNotification<X = undefined>(
  request: NextRequest,
  cfg: OrderNotificationConfig<X>,
): Promise<NextResponse> {
  try {
    const gate = await authorizeNotification(request, cfg);
    if ('error' in gate) return gate.error;

    const body = await readJsonObject(request);
    if (!body) return jsonError(400, 'Invalid JSON body');
    const orderId = parseOrderId(body);
    if (!orderId) return jsonError(400, 'Invalid orderId');

    let extra = undefined as X;
    if (cfg.parseExtra) {
      const parsed = cfg.parseExtra(body);
      if (!parsed.ok) return jsonError(400, parsed.error);
      extra = parsed.data;
    }

    const loaded = await loadOrderForCaller(gate.caller, orderId);
    if ('error' in loaded) return loaded.error;
    const { order } = loaded;

    const blocked = cfg.precondition?.(order);
    if (blocked) return jsonError(409, blocked);

    const contact = orderContact(order);
    if (cfg.channel === 'email' && !contact.email) return jsonError(422, 'Order has no customer email');
    if (cfg.channel === 'whatsapp' && !contact.phone) return jsonOk({ skipped: true, message: 'Skipped - no phone on order' });

    const sent = await cfg.send({
      caller: gate.caller,
      order,
      orderData: toOrderEmailData(order),
      email: contact.email,
      phone: contact.phone,
      name: contact.name,
      extra,
    });
    return sent ? jsonOk({ message: cfg.successMessage }) : jsonError(500, cfg.failureMessage);
  } catch (error) {
    logger.error('notification.route_error', { bucket: cfg.bucket, error: error instanceof Error ? error.message : String(error) });
    return jsonError(500, 'Internal server error');
  }
}

export interface TargetUser {
  userId: string;
  email: string | null;
  phone: string | null;
  name: string | null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Resolves the notification target user from the database: the caller themself, or `userId` for internal callers. */
export async function resolveTargetUser(
  caller: NotifyCaller,
  body: Record<string, unknown>,
): Promise<{ target: TargetUser } | { error: NextResponse }> {
  let userId: string;
  if (caller.kind === 'user') {
    userId = caller.userId;
  } else if (caller.kind === 'internal' && typeof body.userId === 'string' && UUID.test(body.userId)) {
    userId = body.userId;
  } else {
    return { error: jsonError(400, 'Invalid userId') };
  }

  const { data: profile, error } = await getAdminDb()
    .from('profiles')
    .select('email, mobile, first_name')
    .eq('id', userId)
    .maybeSingle();
  if (error) return { error: jsonError(503, 'Could not load user') };
  if (!profile) return { error: jsonError(404, 'User not found') };

  const email = (caller.kind === 'user' ? caller.email : null) || profile.email || null;
  return { target: { userId, email, phone: profile.mobile || null, name: profile.first_name || null } };
}
