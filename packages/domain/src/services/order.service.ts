import { IOrderService, CreateOrderParams } from '@tecbunny/types';
import { IOrderRepository } from '@tecbunny/types';
import { INotificationService } from '@tecbunny/types';
import { logger } from '@tecbunny/core';
import { checkoutEngine } from '@tecbunny/core/checkout-engine';
import { formatPlaceOfSupply, resolveIndianStateFromText, resolveIndianStateInfo, TECBUNNY_REGISTERED_STATE } from '@tecbunny/core/indian-tax';
import { extractPincode, sendOrderRoutingNotifications } from '@tecbunny/core/area-notifications';
import { checkServiceAreaAvailability } from '@tecbunny/core/service-area-availability';
import { deserializeOrder } from '@tecbunny/core/orders/normalizers';
import { enhancedCommissionService } from '@tecbunny/core/enhanced-commission-service';
import { otpService } from '@tecbunny/core/otp-service';

export class OrderService implements IOrderService {
  constructor(
    private readonly orderRepo: IOrderRepository,
    private readonly notificationService: INotificationService
  ) {}

  async getCustomerOrders(userId: string, userEmail?: string, userPhone?: string): Promise<any[]> {
    const rawOrders = await this.orderRepo.getCustomerOrders(userId, userEmail, userPhone);
    return rawOrders.map(deserializeOrder);
  }

  async createOrder(params: CreateOrderParams): Promise<any> {
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

    return fullOrder;
  }
}
