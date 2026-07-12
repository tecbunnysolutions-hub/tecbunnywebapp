import { IOrderService, CreateOrderParams } from '@tecbunny/types';
import { IOrderRepository } from '@tecbunny/types';
import { INotificationService } from '@tecbunny/types';
import { logger } from '../logger';
import { checkoutEngine } from '../checkout-engine';
import { formatPlaceOfSupply, resolveIndianStateFromText, resolveIndianStateInfo, TECBUNNY_REGISTERED_STATE } from '../indian-tax';
import { extractPincode, sendOrderRoutingNotifications } from '../area-notifications';
import { checkServiceAreaAvailability } from '../service-area-availability';
import { deserializeOrder } from '../orders/normalizers';
import { enhancedCommissionService } from '../enhanced-commission-service';
import { otpService } from '../otp-service';

import { withTelemetry } from '../telemetry';
import { SupabaseClient } from '@supabase/supabase-js';
import { isAtLeast } from '../index';
import { envConfig } from '../environment-validator';
import { 
  sendWhatsAppNotification, 
  sendOutForDeliveryNotification, 
  sendPaymentConfirmationNotification,
  sendOrderCancelled,
  sendOrderDelayed,
  sendOrderActionNeeded,
  sendOrderPickupReady,
  sendPaymentActionRequired,
  sendDeliveryConfirmation
} from '../whatsapp-service';
import { enqueueOrderConfirmationEmail, publishEvent } from '../queue';
import type { OrderStatus } from '../types';
import type { UserRole } from '../roles';

const STATUS_NORMALIZATION: Record<string, OrderStatus> = {
  pending: 'Pending', 'awaiting payment': 'Awaiting Payment', 'payment confirmed': 'Payment Confirmed',
  confirmed: 'Confirmed', processing: 'Processing', 'ready to ship': 'Ready to Ship', shipped: 'Shipped',
  'ready for pickup': 'Ready for Pickup', 'ready for delivery': 'Ready for Delivery', delivered: 'Delivered',
  'delivered/picked up': 'Delivered/Picked Up', completed: 'Completed', cancelled: 'Cancelled',
  rejected: 'Rejected', 'on hold': 'On Hold', 'visit scheduled': 'Visit Scheduled',
  'visit complete': 'Visit Completed', 'visit completed': 'Visit Completed', 'diagnosis done': 'Diagnosis Done',
  'quote sent': 'Quote Sent', 'awaiting customer approval': 'Awaiting Customer Approval', approved: 'Approved',
  'parts ordered': 'Parts Ordered', 'work in progress': 'Work In Progress', wip: 'Work In Progress',
  'quality check': 'Quality Check', qc: 'Quality Check', 'warranty/support active': 'Warranty/Support Active',
};

const GENERAL_ORDER_STATUS_SET = new Set<OrderStatus>([
  'Pending', 'Awaiting Payment', 'Payment Confirmed', 'Confirmed', 'Processing', 'Ready to Ship',
  'Shipped', 'Ready for Pickup', 'Completed', 'Delivered', 'Cancelled', 'Rejected',
]);

const SERVICE_ORDER_STATUS_SET = new Set<OrderStatus>([
  'Pending', 'Awaiting Payment', 'Payment Confirmed', 'Visit Scheduled', 'Visit Completed',
  'Diagnosis Done', 'Quote Sent', 'Awaiting Customer Approval', 'Approved', 'Rejected', 'On Hold',
  'Parts Ordered', 'Work In Progress', 'Quality Check', 'Ready for Pickup', 'Ready for Delivery',
  'Delivered/Picked Up', 'Completed', 'Warranty/Support Active', 'Cancelled',
]);

const SERVICE_TYPE_SET = new Set(['service', 'repair', 'installation', 'setup']);
const PICKUP_TYPE_SET = new Set(['pickup', 'walk-in', 'walkin', 'walk in', 'walk_in']);
const ALLOWED_MUTABLE_FIELDS = new Set(['cancellation_reason', 'payment_reference', 'notes', 'shipping_amount', 'discount_amount']);

export interface UpdateStatusPayload { orderId?: unknown; status?: unknown; additionalData?: unknown; }

export class OrderService implements IOrderService {
  constructor(
    private readonly orderRepo: IOrderRepository,
    private readonly notificationService: INotificationService
  ) {}

  async getCustomerOrders(userId: string, userEmail?: string, userPhone?: string): Promise<any[]> {
    return withTelemetry('OrderService.getCustomerOrders', async () => {
      const rawOrders = await this.orderRepo.getCustomerOrders(userId, userEmail, userPhone);
      return rawOrders.map(deserializeOrder);
    }, { userId, userEmail, userPhone });
  }

  async createOrder(params: CreateOrderParams): Promise<any> {
    return withTelemetry('OrderService.createOrder', async () => {
      const { effectiveUserId, orderData } = params;

      logger.info('order_create_attempt', { userId: effectiveUserId });

    if (!orderData.customer_name || !orderData.customer_email || !orderData.customer_phone) {
      throw new Error('Missing required customer information');
    }

    const normalizeOrderType = (value: unknown): string => {
      if (typeof value !== 'string') return '';
      const key = value.trim().toLowerCase();
      if (['pickup', 'pick-up', 'store pickup', 'store-pickup'].includes(key)) return 'Pickup';
      if (['walk-in', 'walkin', 'walk in'].includes(key)) return 'Walk-in';
      if (['service', 'service order', 'service_call', 'service-call'].includes(key)) return 'Service';
      if (['repair', 'repair order', 'rma'].includes(key)) return 'Repair';
      if (['installation', 'install', 'installation order'].includes(key)) return 'Installation';
      if (['setup', 'set-up', 'custom setup', 'customised setup'].includes(key)) return 'Setup';
      if (['delivery', 'ship', 'shipping'].includes(key)) return 'Delivery';
      return '';
    };

    let orderType = normalizeOrderType(orderData.service_type || orderData.type || orderData.order_type || orderData.category);
    if (!orderType && orderData.is_service_order === true) {
      orderType = 'Service';
    }
    if (!orderType) {
      orderType = 'Delivery';
    }

    const destinationState = resolveIndianStateInfo(orderData.place_of_supply_state_code)
      ?? resolveIndianStateInfo(orderData.customer_state_code)
      ?? resolveIndianStateInfo(orderData.customer_state)
      ?? resolveIndianStateFromText(orderData.delivery_address)
      ?? (orderType === 'Pickup' ? TECBUNNY_REGISTERED_STATE : null);

    const checkoutResult = await checkoutEngine.calculate({
      items: (orderData.items || []).map((item: any) => ({
        id: item.id || item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
      userId: effectiveUserId || undefined,
      couponCode: orderData.coupon_code || orderData.couponCode || undefined,
      salesAgentId: orderData.agent_id || undefined,
      customerState: destinationState?.name || undefined
    });

    const serverDiscountPaise = Math.round(checkoutResult.totalDiscount * 100);
    const clientDiscountPaise = Math.round(Math.max(0, orderData.discount_amount || 0) * 100);

    if (clientDiscountPaise > serverDiscountPaise + 100) {
      logger.warn('order_discount_tampered', {
        userId: effectiveUserId,
        clientDiscount: clientDiscountPaise / 100,
        serverDiscount: serverDiscountPaise / 100
      });
      throw new Error('Invalid discount amount');
    }

    const subtotal = checkoutResult.subtotal;
    const gst_amount = checkoutResult.gstAmount;
    const discount_amount = checkoutResult.totalDiscount;
    const shipping_amount = 0;
    const total = checkoutResult.finalTotal + shipping_amount;

    const validatedItems = checkoutResult.itemPrices.map((item: any) => ({
      id: item.product_id,
      productId: item.product_id,
      quantity: item.quantity,
      price: item.unit_price,
      total_price: item.total_price,
      discount_amount: item.discount_amount,
      isService: item.isService || false,
      hsnCode: item.hsnCode || null,
      sacCode: item.sacCode || null,
      gstRate: item.gstRate || 18,
      taxableBase: item.taxableBase || item.total_price,
      gstAmount: item.gstAmount || 0,
      cgst: item.cgst || 0,
      sgst: item.sgst || 0,
      igst: item.igst || 0
    }));

    const serviceOrderTypes = new Set(['Service', 'Repair', 'Installation', 'Setup']);
    if (serviceOrderTypes.has(orderType)) {
      const servicePincode = extractPincode(orderData);
      const availability = await checkServiceAreaAvailability(servicePincode);
      if (!availability.available) {
        logger.warn('service_order_outside_enabled_area', {
          userId: effectiveUserId,
          pincode: availability.pincode,
          orderType,
          reason: availability.reason,
        });
        throw new Error(availability.reason);
      }
      orderData.delivery_pincode = availability.pincode;
    }

    const pickupStore = orderType === 'Pickup'
      ? (orderData.pickup_store || orderData.delivery_address || null)
      : null;
    const placeOfSupply = formatPlaceOfSupply(
      destinationState,
      typeof orderData.place_of_supply === 'string' ? orderData.place_of_supply : orderData.customer_state,
    );

    const orderItemsWithCustomerInfo = {
      cart_items: validatedItems,
      customer_email: orderData.customer_email,
      customer_phone: orderData.customer_phone,
      delivery_address: orderData.delivery_address,
      delivery_pincode: orderData.delivery_pincode || null,
      pickup_store: pickupStore,
      customer_state: destinationState?.name || orderData.customer_state || null,
      customer_state_code: destinationState?.code || orderData.customer_state_code || null,
      place_of_supply: placeOfSupply,
      place_of_supply_state_code: destinationState?.code || orderData.place_of_supply_state_code || null,
      seller_state_code: TECBUNNY_REGISTERED_STATE.code,
      payment_method: orderData.payment_method,
      customer_notes: orderData.notes,
      agent_id: orderData.agent_id || null,
      otp_required: !!orderData.agent_id,
      part_payment_amount: orderData.part_payment_amount ? Number(orderData.part_payment_amount) : null,
      quote_id: orderData.quote_id || null
    };

    const createdOrder = await this.orderRepo.allocateOrderInventory({
      p_customer_name: orderData.customer_name,
      p_customer_id: effectiveUserId,
      p_customer_email: orderData.customer_email,
      p_customer_phone: orderData.customer_phone,
      p_delivery_address: orderData.delivery_address || pickupStore || null,
      p_notes: orderData.notes || null,
      p_payment_method: orderData.payment_method || null,
      p_subtotal: Math.round(subtotal * 100) / 100,
      p_gst_amount: Math.round(gst_amount * 100) / 100,
      p_total: Math.round(total * 100) / 100,
      p_discount_amount: Math.round(discount_amount * 100) / 100,
      p_shipping_amount: Math.round(shipping_amount * 100) / 100,
      p_payment_status: orderData.payment_status || null,
      p_order_type: orderType,
      p_items: orderItemsWithCustomerInfo,
      p_agent_id: orderData.agent_id || null
    });

    logger.info('order_created', { orderId: createdOrder.id, userId: effectiveUserId });

    if (effectiveUserId && orderData.delivery_address && !orderData.agent_id && orderType === 'Delivery') {
      try {
        const addressParts = orderData.delivery_address.split(', ');
        const street = addressParts.length > 0 ? addressParts[0] : orderData.delivery_address;
        
        await this.orderRepo.updateProfileAddress(effectiveUserId, {
          street: street,
          city: addressParts.length > 1 ? addressParts[1] : '',
          state: orderData.customer_state || '',
          pincode: orderData.delivery_pincode || ''
        });
      } catch (err) {
        logger.error('failed_to_update_profile_address', { err, userId: effectiveUserId });
      }
    }

    const orderItemsData = typeof createdOrder.items === 'string'
      ? JSON.parse(createdOrder.items || '{}')
      : (createdOrder.items || {});
      
    const fullOrder = {
      ...createdOrder,
      customer_email: createdOrder.customer_email || orderItemsData.customer_email,
      customer_phone: createdOrder.customer_phone || orderItemsData.customer_phone,
      delivery_address: createdOrder.delivery_address || orderItemsData.delivery_address,
      delivery_pincode: createdOrder.delivery_pincode || orderItemsData.delivery_pincode,
      customer_state: orderItemsData.customer_state,
      customer_state_code: orderItemsData.customer_state_code,
      place_of_supply: orderItemsData.place_of_supply,
      place_of_supply_state_code: orderItemsData.place_of_supply_state_code,
      seller_state_code: orderItemsData.seller_state_code,
      payment_method: createdOrder.payment_method || orderItemsData.payment_method,
      notes: createdOrder.notes || orderItemsData.customer_notes,
      items: orderItemsData.cart_items || [],
      pickup_store: orderItemsData.pickup_store || pickupStore || null
    };

    const managerRole = serviceOrderTypes.has(orderType) ? 'service_manager' : 'sales_manager';

    try {
      const notificationResult = await sendOrderRoutingNotifications(fullOrder, managerRole);
      fullOrder.area_id = notificationResult.routing.areaId;
      fullOrder.delivery_pincode = notificationResult.routing.pincode;
      if (managerRole === 'sales_manager') {
        fullOrder.assigned_sales_manager_id = notificationResult.routing.manager?.managerId || null;
      } else {
        fullOrder.assigned_service_manager_id = notificationResult.routing.manager?.managerId || null;
      }
    } catch (notificationError) {}

    let isAgentThemselves = false;
    if (orderData.agent_id && effectiveUserId) {
      const agentUserId = await this.orderRepo.getAgentUserId(orderData.agent_id);
      if (agentUserId === effectiveUserId) {
        isAgentThemselves = true;
      }
    }

    if (orderData.agent_id) {
      try {
        if (isAgentThemselves) {
          const commissionResult = await enhancedCommissionService.calculateOrderCommission(
            createdOrder.id,
            orderData.agent_id
          );
          if (commissionResult.success && commissionResult.calculation) {
            await enhancedCommissionService.saveCommissionRecord(commissionResult.calculation);
          }
        }
        if (orderItemsData.customer_phone) {
          await otpService.generateOtp({
            order_id: createdOrder.id,
            agent_id: orderData.agent_id,
            customer_phone: orderItemsData.customer_phone,
            otp_type: 'agent_order'
          });
        }
      } catch (agentError) {}
    }

    if (orderItemsData.customer_phone) {
      const siteUrl = 'https://tecbunny.com'; // In a real scenario, inject this
      this.notificationService.sendOrderCustomerNotification(orderItemsData.customer_phone, createdOrder.id.toString(), orderData.customer_name);
      
      const itemsList = (orderItemsData.cart_items || [])
        .map((item: any) => `• ${item.name} (₹${item.price} x ${item.quantity})`)
        .join('\n');

      this.notificationService.sendOrderAdminNotification(createdOrder.id.toString(), orderData.customer_name, orderItemsData.customer_phone, fullOrder.total, itemsList, siteUrl);
      this.notificationService.sendOrderManagerNotification(createdOrder.id.toString(), orderData.customer_name, fullOrder.total, '');
    }

    publishEvent('ORDER_CREATED', {
      orderId: fullOrder.id,
      userId: effectiveUserId,
      orderType,
      total: fullOrder.total
    }, 'core/order-service').catch(() => {});

    return fullOrder;
    }, { effectiveUserId: params.effectiveUserId });
  }

  static normalizeStatus(value: unknown): OrderStatus | null {
    if (typeof value !== 'string' || !value.trim()) return null;
    const key = value.trim().toLowerCase();
    return STATUS_NORMALIZATION[key] ?? (value as OrderStatus);
  }

  static sanitizeAdditionalData(raw: unknown) {
    if (!raw || typeof raw !== 'object') return {};
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(raw as Record<string, unknown>)) {
      if (!ALLOWED_MUTABLE_FIELDS.has(key)) continue;
      if (key === 'cancellation_reason' || key === 'notes' || key === 'payment_reference') {
        if (typeof val === 'string' && val.trim()) result[key] = val.trim();
        continue;
      }
      if (key === 'shipping_amount' || key === 'discount_amount') {
        const numeric = typeof val === 'number' ? val : Number(val);
        if (Number.isFinite(numeric)) result[key] = Math.round(numeric * 100) / 100;
        continue;
      }
    }
    return result;
  }

  static resolvePaymentStatusUpdate(order: { payment_status?: string | null; payment_method?: string | null }, newStatus: OrderStatus) {
    const method = (order.payment_method ?? '').toLowerCase();
    switch (newStatus) {
      case 'Awaiting Payment': return { payment_status: 'Payment Confirmation Pending' };
      case 'Payment Confirmed': return { payment_status: 'Payment Confirmed' };
      case 'Confirmed':
        if (method === 'cod') return {};
        if ((order.payment_status ?? '').toLowerCase() === 'payment confirmed') return {};
        return { payment_status: 'Payment Confirmed' };
      case 'Processing':
      case 'Ready to Ship':
      case 'Ready for Pickup':
      case 'Shipped':
      case 'Completed':
      case 'Delivered':
        if (method === 'cod') return {};
        return { payment_status: 'Payment Confirmed' };
      case 'Cancelled':
      case 'Rejected':
        return { payment_status: 'Payment Cancelled' };
      default: return {};
    }
  }

  async updateOrderStatus(
    userId: string, 
    userRole: UserRole, 
    payload: UpdateStatusPayload
  ) {
    const orderIdRaw = payload?.orderId;
    const statusRaw = payload?.status;
    const additionalRaw = payload?.additionalData;

    if (typeof orderIdRaw !== 'string' || !orderIdRaw.trim()) throw new Error('Invalid orderId');

    const normalizedStatus = OrderService.normalizeStatus(statusRaw);
    if (!normalizedStatus) throw new Error('Invalid status');

    const orderId = orderIdRaw.trim();

    const orderRecord = await this.orderRepo.getOrderForUpdate(orderId);

    if (!orderRecord) {
      logger.error('order_update_status_fetch_error', { orderId });
      throw new Error('Order not found or failed to load');
    }

    const typeKey = (orderRecord.type ?? '').toString().trim().toLowerCase();
    const isServiceOrder = SERVICE_TYPE_SET.has(typeKey);
    const needsPickupRole = PICKUP_TYPE_SET.has(typeKey);
    const requiredRole: UserRole = needsPickupRole ? 'sales' : 'manager';

    const allowedStatuses = isServiceOrder ? SERVICE_ORDER_STATUS_SET : GENERAL_ORDER_STATUS_SET;
    if (!allowedStatuses.has(normalizedStatus)) throw new Error('Status not allowed for this order type');

    const isCustomer = userRole === 'customer';
    const isCustomerCancel = isCustomer && normalizedStatus === 'Cancelled';

    if (isCustomer) {
      if (!isCustomerCancel) throw new Error('Forbidden');
      if (!orderRecord.customer_id || orderRecord.customer_id !== userId) throw new Error('Forbidden');
      if (orderRecord.status !== 'Pending') throw new Error('Order can no longer be cancelled');
    } else if (!isAtLeast(userRole, requiredRole)) {
      throw new Error('Forbidden');
    }

    const paymentStatusUpdate = OrderService.resolvePaymentStatusUpdate(orderRecord, normalizedStatus);
    const sanitizedAdditional = OrderService.sanitizeAdditionalData(additionalRaw) as Record<string, unknown>;

    const additionalDataPayload: Record<string, unknown> = { ...sanitizedAdditional };
    if (normalizedStatus === 'Cancelled' || normalizedStatus === 'Rejected') {
      const cancellationReason = sanitizedAdditional.cancellation_reason 
        || (isCustomerCancel ? 'Cancelled by customer' : 'Cancelled via admin portal');
      additionalDataPayload.cancellation_reason = cancellationReason;
    }

    let pickupCode: string | null = null;
    if (normalizedStatus === 'Ready for Pickup' && orderRecord.customer_phone) {
      try {
        const otpResult = await otpService.generateOtp({
          order_id: orderId,
          customer_phone: orderRecord.customer_phone,
          otp_type: 'pickup',
          created_by: 'system'
        } as any, true);
        pickupCode = otpResult.otp_code || 'CODE-PENDING';
      } catch (otpErr: any) {
        logger.error('Failed to pre-generate pickup OTP', { error: otpErr.message, orderId });
      }
    }

    try {
      await this.orderRepo.updateOrderStatusRpc({
        target_order_id: orderId,
        new_status: normalizedStatus,
        new_payment_status: paymentStatusUpdate.payment_status || null,
        additional_data: additionalDataPayload,
        p_pickup_code: pickupCode,
        p_processed_by: userId
      });
    } catch (updateError: any) {
      logger.error('order_update_status_failed', { error: updateError.message, orderId, status: normalizedStatus });
      throw new Error(updateError.message || 'Failed to update order');
    }

    logger.info('order_update_status_success', { orderId, status: normalizedStatus, by: userId });

    // Side Effects
    if (orderRecord.customer_phone) {
      await this.sendOrderStatusUpdateWhatsApp(orderRecord.customer_phone, {
        orderId: orderRecord.id,
        status: normalizedStatus,
        customerName: orderRecord.customer_name,
        amount: orderRecord.total,
        currency: 'INR',
        cancelReason: additionalDataPayload.cancellation_reason as string,
        pickupCode
      });
    }

    if (normalizedStatus === 'Confirmed' || normalizedStatus === 'Payment Confirmed') {
      const emailRecipient = orderRecord.customer_email || (orderRecord as any).email || null;
      if (emailRecipient && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailRecipient)) {
        try {
          const emailOrderData = {
            id: orderRecord.id,
            customer_name: orderRecord.customer_name || 'Valued Customer',
            created_at: orderRecord.created_at || new Date().toISOString(),
            total: orderRecord.total || 0,
            delivery_address: orderRecord.delivery_address || null,
          };
          await enqueueOrderConfirmationEmail({ recipient: emailRecipient, orderData: emailOrderData });
          logger.info('Order confirmation email queued successfully', { orderId, email: emailRecipient, status: normalizedStatus });
        } catch (emailErr: any) {
          logger.error('Failed to queue order confirmation email', { error: emailErr.message, orderId });
        }
      }
    }

    return { orderId, status: normalizedStatus };
  }

  private async sendOrderStatusUpdateWhatsApp(phoneNumber: string, data: any) {
    try {
      let message = '';
      const { orderId, status, customerName, amount, currency, cancelReason, pickupCode } = data;
      const namePrefix = customerName ? `Hi ${customerName}! ` : '';
      const priceDisplay = amount ? `(${currency || 'INR'} ${amount})` : '';

      switch (status) {
        case 'Awaiting Payment':
          await sendPaymentActionRequired(phoneNumber, {
            customerName,
            amount: `${currency || 'INR'} ${amount}`,
            orderNumber: orderId,
            paymentLink: `${envConfig.app.siteUrl}/orders/${orderId}`
          });
          return;
        case 'Cancelled':
        case 'Rejected':
          await sendOrderCancelled(phoneNumber, { customerName, orderNumber: orderId, reason: cancelReason || 'Order cancelled' });
          return;
        case 'On Hold':
          await sendOrderDelayed(phoneNumber, { customerName, orderNumber: orderId });
          return;
        case 'Awaiting Customer Approval':
          await sendOrderActionNeeded(phoneNumber, {
            customerName,
            orderNumber: orderId,
            actionLink: `${envConfig.app.siteUrl}/account/orders/${orderId}`
          });
          return;
        case 'Ready for Pickup':
          await sendOrderPickupReady(phoneNumber, {
            customerName,
            orderNumber: orderId,
            pickupCode: pickupCode || 'CODE-PENDING'
          });
          return;
        case 'Ready for Delivery':
          await sendOutForDeliveryNotification(phoneNumber, { orderNumber: orderId, customerName });
          break;
        case 'Payment Confirmed':
          await sendPaymentConfirmationNotification(phoneNumber, {
            customerName,
            amount: `${currency || 'INR'} ${amount}`,
            orderNumber: orderId
          });
          break;
        case 'Delivered':
        case 'Delivered/Picked Up':
        case 'Completed':
          await sendDeliveryConfirmation(phoneNumber, { customerName, orderNumber: orderId });
          try {
            fetch(`${envConfig.app.siteUrl}/api/marketing/triggers/order-delivered-followup`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId })
            }).catch(err => logger.error('upsell_trigger_fetch_failed', { err: err instanceof Error ? err.message : String(err) }));
          } catch (e) {
             // Ignored
          }
          return;
        default:
          message = `
🔔 Order Status Update - TecBunny Store

${namePrefix}Your order status has been updated.

📦 Order: ${orderId}${priceDisplay ? ` ${priceDisplay}` : ''}
🔄 New Status: ${status}

Track full details here: ${envConfig.app.siteUrl}/orders/${orderId}

Need help? Reply to this message.
Thank you! 🚀`.trim();
          break;
      }

      if (message) {
        await sendWhatsAppNotification(phoneNumber, message);
      }
    } catch (error: any) {
      logger.error('Failed to send order status WhatsApp:', { error: error.message });
    }
  }
}
