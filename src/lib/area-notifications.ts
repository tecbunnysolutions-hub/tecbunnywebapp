import { createServiceClient, isSupabaseServiceConfigured } from './supabase/server';
import { resolveSiteUrl } from './site-url';

import improvedEmailService from './improved-email-service';
import { logger } from './logger';

type ManagerRole = 'sales_manager' | 'service_manager';
type RoutingStatus = 'assigned' | 'unassigned' | 'failed';

type AreaManager = {
  areaId: string;
  areaCode: string;
  areaName: string;
  managerId: string;
  managerName: string;
  managerEmail: string;
};

type RoutingResolution = {
  pincode: string | null;
  areaId: string | null;
  areaCode: string | null;
  areaName: string | null;
  manager: AreaManager | null;
  status: RoutingStatus;
};

type NotificationResult = {
  customerSent: boolean;
  internalSent: boolean;
  routing: RoutingResolution;
};

const SALES_EMAIL = process.env.SALES_TEAM_EMAIL || 'sales@tecbunny.com';
const SUPPORT_EMAIL = process.env.SUPPORT_TEAM_EMAIL || 'support@tecbunny.com';

const escapeHtml = (value: unknown): string => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const validEmail = (value: unknown): value is string =>
  typeof value === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.trim());

const normalizePincode = (value: unknown): string | null => {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const match = String(value).match(/(?:^|\D)([1-9][0-9]{5})(?:\D|$)/);
  return match?.[1] ?? null;
};

export const extractPincode = (payload: Record<string, any>): string | null => {
  const candidates = [
    payload.delivery_pincode,
    payload.service_pincode,
    payload.pincode,
    payload.postal_code,
    payload.zipcode,
    payload.shipping_address?.pincode,
    payload.shipping_address?.postal_code,
    payload.billing_address?.pincode,
    payload.customer_address,
    payload.delivery_address,
  ];

  for (const candidate of candidates) {
    const pincode = normalizePincode(candidate);
    if (pincode) return pincode;
  }
  return null;
};

const getAreaRecord = (relation: unknown): {
  id?: string;
  code?: string;
  name?: string;
  sales_manager_id?: string;
  service_manager_id?: string;
} => {
  if (Array.isArray(relation)) return relation[0] || {};
  return (relation && typeof relation === 'object') ? relation as Record<string, string> : {};
};

async function resolveAreaManager(pincode: string | null, role: ManagerRole): Promise<RoutingResolution> {
  if (!pincode || !isSupabaseServiceConfigured) {
    return {
      pincode,
      areaId: null,
      areaCode: null,
      areaName: null,
      manager: null,
      status: 'unassigned',
    };
  }

  const supabase = createServiceClient();
  const { data: mapping, error: mappingError } = await supabase
    .from('area_pincodes')
    .select('area_id, areas(id, code, name, sales_manager_id, service_manager_id)')
    .eq('pincode', pincode)
    .eq('is_active', true)
    .maybeSingle();

  if (mappingError) {
    logger.warn('area_notification.pincode_lookup_failed', { pincode, role, error: mappingError.message });
    return { pincode, areaId: null, areaCode: null, areaName: null, manager: null, status: 'failed' };
  }

  if (!mapping?.area_id) {
    return { pincode, areaId: null, areaCode: null, areaName: null, manager: null, status: 'unassigned' };
  }

  const area = getAreaRecord(mapping.areas);
  const { data: assignments, error: assignmentError } = await supabase
    .from('user_area_assignments')
    .select('user_id, is_primary')
    .eq('area_id', mapping.area_id)
    .order('is_primary', { ascending: false });

  if (assignmentError) {
    logger.warn('area_notification.assignment_lookup_failed', {
      pincode,
      role,
      areaId: mapping.area_id,
      error: assignmentError.message,
    });
  }

  const explicitManagerId = role === 'sales_manager'
    ? area.sales_manager_id
    : area.service_manager_id;
  const userIds = Array.from(new Set([
    ...(explicitManagerId ? [explicitManagerId] : []),
    ...(assignments || []).map(item => item.user_id),
  ]));
  if (userIds.length === 0) {
    return {
      pincode,
      areaId: mapping.area_id,
      areaCode: area.code || null,
      areaName: area.name || null,
      manager: null,
      status: 'unassigned',
    };
  }

  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, name, full_name, email, role, is_active')
    .in('id', userIds)
    .eq('is_active', true);

  if (profileError) {
    logger.warn('area_notification.profile_lookup_failed', {
      pincode,
      role,
      areaId: mapping.area_id,
      error: profileError.message,
    });
  }

  let eligibleIds = new Set(
    (profiles || []).filter(profile => profile.role === role).map(profile => profile.id),
  );

  const { data: roleRows } = await supabase
    .from('user_roles')
    .select('user_id, roles!inner(name)')
    .in('user_id', userIds)
    .eq('roles.name', role);

  for (const roleRow of roleRows || []) eligibleIds.add(roleRow.user_id);

  const assignmentRank = new Map(userIds.map((id, index) => [id, index]));
  const managerProfile = (profiles || [])
    .filter(profile => eligibleIds.has(profile.id) && validEmail(profile.email))
    .sort((a, b) => (assignmentRank.get(a.id) ?? 999) - (assignmentRank.get(b.id) ?? 999))[0];

  if (!managerProfile) {
    return {
      pincode,
      areaId: mapping.area_id,
      areaCode: area.code || null,
      areaName: area.name || null,
      manager: null,
      status: 'unassigned',
    };
  }

  return {
    pincode,
    areaId: mapping.area_id,
    areaCode: area.code || null,
    areaName: area.name || null,
    manager: {
      areaId: mapping.area_id,
      areaCode: area.code || '',
      areaName: area.name || 'Assigned Area',
      managerId: managerProfile.id,
      managerName: managerProfile.full_name || managerProfile.name || 'Area Manager',
      managerEmail: managerProfile.email.trim(),
    },
    status: 'assigned',
  };
}

async function notificationAlreadySent(
  sourceType: 'order' | 'service_ticket',
  sourceId: string,
  notificationKind: string,
): Promise<boolean> {
  if (!isSupabaseServiceConfigured) return false;
  const { data, error } = await createServiceClient()
    .from('area_notification_deliveries')
    .select('id, error_message')
    .eq('source_type', sourceType)
    .eq('source_id', sourceId)
    .eq('notification_kind', notificationKind)
    .maybeSingle();

  if (error) {
    logger.warn('area_notification.dedupe_lookup_failed', {
      sourceType,
      sourceId,
      notificationKind,
      error: error.message,
    });
    return false;
  }
  return Boolean(data && !data.error_message);
}

async function recordNotification(params: {
  sourceType: 'order' | 'service_ticket';
  sourceId: string;
  notificationKind: string;
  routing: RoutingResolution;
  recipients: string[];
  messageIds: string[];
  error?: string;
}) {
  if (!isSupabaseServiceConfigured) return;
  const { error } = await createServiceClient()
    .from('area_notification_deliveries')
    .upsert({
      source_type: params.sourceType,
      source_id: params.sourceId,
      notification_kind: params.notificationKind,
      area_id: params.routing.areaId,
      manager_id: params.routing.manager?.managerId || null,
      pincode: params.routing.pincode,
      routing_status: params.error ? 'failed' : params.routing.status,
      recipients: params.recipients,
      provider_message_ids: params.messageIds,
      error_message: params.error || null,
    }, { onConflict: 'source_type,source_id,notification_kind' });

  if (error) {
    logger.warn('area_notification.audit_write_failed', {
      sourceType: params.sourceType,
      sourceId: params.sourceId,
      notificationKind: params.notificationKind,
      error: error.message,
    });
  }
}

const getOrderItems = (order: Record<string, any>): Array<Record<string, any>> => {
  if (Array.isArray(order.items)) return order.items;
  if (Array.isArray(order.items?.cart_items)) return order.items.cart_items;
  return [];
};

const renderItems = (items: Array<Record<string, any>>) =>
  items.map(item => {
    const name = escapeHtml(item.name || item.title || item.productId || item.id || 'Item');
    return `<li>${name} &times; ${escapeHtml(item.quantity || 1)}</li>`;
  }).join('');

async function updateOrderAssignment(orderId: string, routing: RoutingResolution, role: ManagerRole) {
  if (!isSupabaseServiceConfigured) return;
  const update = role === 'sales_manager'
    ? {
        area_id: routing.areaId,
        delivery_pincode: routing.pincode,
        assigned_sales_manager_id: routing.manager?.managerId || null,
      }
    : {
        area_id: routing.areaId,
        delivery_pincode: routing.pincode,
        assigned_service_manager_id: routing.manager?.managerId || null,
      };

  const { error } = await createServiceClient().from('orders').update(update).eq('id', orderId);
  if (error) logger.warn('area_notification.order_assignment_update_failed', { orderId, error: error.message });
}

async function updateTicketAssignment(ticketId: string, routing: RoutingResolution) {
  if (!isSupabaseServiceConfigured) return;
  const { error } = await createServiceClient()
    .from('service_tickets')
    .update({
      area_id: routing.areaId,
      service_pincode: routing.pincode,
      assigned_service_manager_id: routing.manager?.managerId || null,
    })
    .eq('id', ticketId);
  if (error) logger.warn('area_notification.ticket_assignment_update_failed', { ticketId, error: error.message });
}

export async function sendOrderRoutingNotifications(
  order: Record<string, any>,
  role: ManagerRole = 'sales_manager',
): Promise<NotificationResult> {
  const orderId = String(order.id);
  const pincode = extractPincode(order);
  const routing = await resolveAreaManager(pincode, role);
  const centralEmail = role === 'sales_manager' ? SALES_EMAIL : SUPPORT_EMAIL;
  const teamLabel = role === 'sales_manager' ? 'Sales' : 'Service';
  const isService = role === 'service_manager';

  await updateOrderAssignment(orderId, routing, role);

  const customerKind = isService ? 'service_order_customer_confirmation' : 'product_order_customer_confirmation';
  const internalKind = isService ? 'service_order_internal_notification' : 'product_order_internal_notification';
  const orderLink = `${resolveSiteUrl()}/orders/${encodeURIComponent(orderId)}`;
  const customerEmail = validEmail(order.customer_email) ? order.customer_email.trim() : null;
  const items = getOrderItems(order);

  let customerSent = false;
  let internalSent = false;

  if (customerEmail && !(await notificationAlreadySent('order', orderId, customerKind))) {
    const result = await improvedEmailService.sendEmail({
      to: customerEmail,
      replyTo: centralEmail,
      subject: `${isService ? 'Service order' : 'Order'} confirmation #${escapeHtml(order.order_number || orderId)}`,
      html: `
        <h2>Thank you, ${escapeHtml(order.customer_name || 'Customer')}.</h2>
        <p>Your ${isService ? 'service request' : 'product order'} has been received.</p>
        <p><strong>Order:</strong> ${escapeHtml(order.order_number || orderId)}</p>
        <p><strong>Total:</strong> INR ${escapeHtml(order.total || 0)}</p>
        ${items.length ? `<p><strong>Items</strong></p><ul>${renderItems(items)}</ul>` : ''}
        <p><a href="${orderLink}">View order status</a></p>
        <p>Need assistance? Reply to this message and it will reach our ${teamLabel.toLowerCase()} team.</p>
      `,
      text: [
        `${isService ? 'Service order' : 'Order'} confirmation #${order.order_number || orderId}`,
        `Thank you, ${order.customer_name || 'Customer'}.`,
        `Total: INR ${order.total || 0}`,
        `View order: ${orderLink}`,
        `Reply to contact the TecBunny ${teamLabel} team.`,
      ].join('\n'),
    });
    customerSent = result.success;
    await recordNotification({
      sourceType: 'order',
      sourceId: orderId,
      notificationKind: customerKind,
      routing,
      recipients: [customerEmail],
      messageIds: result.messageId ? [result.messageId] : [],
      error: result.success ? undefined : result.error,
    });
  }

  if (!(await notificationAlreadySent('order', orderId, internalKind))) {
    const managerEmail = routing.manager?.managerEmail;
    const recipients = managerEmail ? [managerEmail, centralEmail] : [centralEmail];
    const result = await improvedEmailService.sendEmail({
      to: managerEmail || centralEmail,
      cc: managerEmail ? centralEmail : undefined,
      replyTo: centralEmail,
      skipRateLimit: true,
      subject: `${routing.status === 'assigned' ? '' : '[UNASSIGNED PINCODE] '}${isService ? '[NEW SERVICE ORDER]' : '[NEW PRODUCT ORDER]'} ${order.order_number || orderId} - ${routing.areaName || pincode || 'Pincode missing'}`,
      html: `
        <h2>${isService ? 'New service order' : 'New product order'}</h2>
        ${routing.manager ? `<p>Hi ${escapeHtml(routing.manager.managerName)},</p>` : '<p>Manual area assignment is required.</p>'}
        <p><strong>Order:</strong> ${escapeHtml(order.order_number || orderId)}</p>
        <p><strong>Customer:</strong> ${escapeHtml(order.customer_name || 'Unknown')}</p>
        <p><strong>Phone:</strong> ${escapeHtml(order.customer_phone || 'Not provided')}</p>
        <p><strong>Email:</strong> ${escapeHtml(order.customer_email || 'Not provided')}</p>
        <p><strong>Value:</strong> INR ${escapeHtml(order.total || 0)}</p>
        <p><strong>Pincode:</strong> ${escapeHtml(pincode || 'Missing')}</p>
        <p><strong>Area:</strong> ${escapeHtml(routing.areaName || 'Unassigned')}</p>
        ${items.length ? `<p><strong>Items</strong></p><ul>${renderItems(items)}</ul>` : ''}
        <p><a href="${orderLink}">Review order</a></p>
      `,
      text: [
        `New ${isService ? 'service' : 'product'} order ${order.order_number || orderId}`,
        `Customer: ${order.customer_name || 'Unknown'}`,
        `Phone: ${order.customer_phone || 'Not provided'}`,
        `Value: INR ${order.total || 0}`,
        `Pincode: ${pincode || 'Missing'}`,
        `Area: ${routing.areaName || 'Unassigned'}`,
        `Review: ${orderLink}`,
      ].join('\n'),
    });
    internalSent = result.success;
    await recordNotification({
      sourceType: 'order',
      sourceId: orderId,
      notificationKind: internalKind,
      routing,
      recipients,
      messageIds: result.messageId ? [result.messageId] : [],
      error: result.success ? undefined : result.error,
    });
  }

  return { customerSent, internalSent, routing };
}

export async function sendServiceTicketRoutingNotifications(
  ticket: Record<string, any>,
): Promise<NotificationResult> {
  const ticketId = String(ticket.id);
  const pincode = extractPincode(ticket);
  const routing = await resolveAreaManager(pincode, 'service_manager');
  await updateTicketAssignment(ticketId, routing);

  const ticketLink = `${resolveSiteUrl()}/mgmt/service-manager/tickets`;
  const customerEmail = validEmail(ticket.customer_email) ? ticket.customer_email.trim() : null;
  let customerSent = false;
  let internalSent = false;

  if (customerEmail && !(await notificationAlreadySent('service_ticket', ticketId, 'service_ticket_customer_confirmation'))) {
    const result = await improvedEmailService.sendEmail({
      to: customerEmail,
      replyTo: SUPPORT_EMAIL,
      subject: `We received your TecBunny service request - Ticket ${escapeHtml(ticketId)}`,
      html: `
        <h2>Hi ${escapeHtml(ticket.customer_name || 'Customer')},</h2>
        <p>We received your service request and created ticket <strong>${escapeHtml(ticketId)}</strong>.</p>
        <p>Our support team normally responds within 12-24 hours.</p>
        <p><strong>Issue:</strong> ${escapeHtml(ticket.issue_description || 'Not provided')}</p>
        <p>Reply to this message if you need to add information. Please do not send passwords or full payment-card details.</p>
      `,
      text: `We received your service request.\nTicket: ${ticketId}\nExpected response: 12-24 hours.\nReply to add more information.`,
    });
    customerSent = result.success;
    await recordNotification({
      sourceType: 'service_ticket',
      sourceId: ticketId,
      notificationKind: 'service_ticket_customer_confirmation',
      routing,
      recipients: [customerEmail],
      messageIds: result.messageId ? [result.messageId] : [],
      error: result.success ? undefined : result.error,
    });
  }

  if (!(await notificationAlreadySent('service_ticket', ticketId, 'service_ticket_internal_notification'))) {
    const managerEmail = routing.manager?.managerEmail;
    const recipients = managerEmail ? [managerEmail, SUPPORT_EMAIL] : [SUPPORT_EMAIL];
    const result = await improvedEmailService.sendEmail({
      to: managerEmail || SUPPORT_EMAIL,
      cc: managerEmail ? SUPPORT_EMAIL : undefined,
      replyTo: SUPPORT_EMAIL,
      skipRateLimit: true,
      subject: `${routing.status === 'assigned' ? '' : '[UNASSIGNED SERVICE PINCODE] '}[NEW SERVICE TICKET] ${ticketId} - ${routing.areaName || pincode || 'Pincode missing'}`,
      html: `
        <h2>New service ticket</h2>
        ${routing.manager ? `<p>Hi ${escapeHtml(routing.manager.managerName)},</p>` : '<p>Manual service-area assignment is required.</p>'}
        <p><strong>Ticket:</strong> ${escapeHtml(ticketId)}</p>
        <p><strong>Customer:</strong> ${escapeHtml(ticket.customer_name || 'Unknown')}</p>
        <p><strong>Phone:</strong> ${escapeHtml(ticket.customer_phone || 'Not provided')}</p>
        <p><strong>Service pincode:</strong> ${escapeHtml(pincode || 'Missing')}</p>
        <p><strong>Area:</strong> ${escapeHtml(routing.areaName || 'Unassigned')}</p>
        <p><strong>Priority:</strong> ${escapeHtml(ticket.priority || 'medium')}</p>
        <p><strong>Issue:</strong> ${escapeHtml(ticket.issue_description || 'Not provided')}</p>
        <p><a href="${ticketLink}">Open service workspace</a></p>
      `,
      text: [
        `New service ticket ${ticketId}`,
        `Customer: ${ticket.customer_name || 'Unknown'}`,
        `Phone: ${ticket.customer_phone || 'Not provided'}`,
        `Pincode: ${pincode || 'Missing'}`,
        `Area: ${routing.areaName || 'Unassigned'}`,
        `Priority: ${ticket.priority || 'medium'}`,
        `Issue: ${ticket.issue_description || 'Not provided'}`,
        `Open: ${ticketLink}`,
      ].join('\n'),
    });
    internalSent = result.success;
    await recordNotification({
      sourceType: 'service_ticket',
      sourceId: ticketId,
      notificationKind: 'service_ticket_internal_notification',
      routing,
      recipients,
      messageIds: result.messageId ? [result.messageId] : [],
      error: result.success ? undefined : result.error,
    });
  }

  return { customerSent, internalSent, routing };
}
