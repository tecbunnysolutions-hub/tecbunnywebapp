import { NextRequest, NextResponse } from 'next/server';

import { createClient as createServerClient, createServiceClient, isSupabaseServiceConfigured } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';
import { resolveSiteUrl } from '@/lib/site-url';

import { apiError, apiSuccess } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { 
  sendOrderNotification,
  sendWhatsAppNotification
} from '@/lib/whatsapp-service';
import { otpService } from '@/lib/otp-service';
import { enhancedCommissionService } from '@/lib/enhanced-commission-service';
import { checkoutEngine } from '@/lib/checkout-engine';
import { formatPlaceOfSupply, resolveIndianStateFromText, resolveIndianStateInfo, TECBUNNY_REGISTERED_STATE } from '@/lib/indian-tax';
import { verifySuperadminSessionToken } from '@/lib/auth/superadmin-session';
import { extractPincode, sendOrderRoutingNotifications } from '@/lib/area-notifications';
import { checkServiceAreaAvailability } from '@/lib/service-area-availability';
import { deserializeOrder } from '@/lib/orders/normalizers';

const RATE_LIMIT = 5; // 5 orders
const RATE_WINDOW_MS = 60 * 1000; // per minute

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ orders: [] });
    }

    const serviceSupabase = isSupabaseServiceConfigured ? createServiceClient() : supabase;

    // Fetch all orders matching customer_id, customer_email, or customer_phone
    const conditions = [`customer_id.eq.${user.id}`];
    if (user.email) {
      conditions.push(`customer_email.eq.${user.email}`);
    }
    if (user.user_metadata?.mobile) {
      conditions.push(`customer_phone.eq.${user.user_metadata.mobile}`);
    }

    const { data: orders, error } = await serviceSupabase
      .from('orders')
      .select('*')
      .or(conditions.join(','))
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('failed_to_fetch_customer_orders_api', { userId: user.id, error: error.message });
      return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 });
    }

    const normalizedOrders = (orders ?? []).map(deserializeOrder);
    return NextResponse.json({ success: true, orders: normalizedOrders });
  } catch (error: any) {
    logger.error('uncaught_error_in_customer_orders_api', { error: error.message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const correlationId = request.headers.get('x-correlation-id') || null;

    // Check superadmin session cookie first to block order placements
    const superadminCookie = request.cookies.get('superadmin-session')?.value;
    if (await verifySuperadminSessionToken(superadminCookie)) {
      return apiError('FORBIDDEN', {
        correlationId,
        overrideMessage: '403 Forbidden - System Configuration Accounts Cannot Place Orders.'
      });
    }

    // Support both cookie-based auth (SSR) and Authorization: Bearer token (client fetch)
    // The Bearer token path is more reliable for client-side fetches where cookie
    // forwarding may be inconsistent (e.g. cross-subdomain, expired cookie, first login).
    let user = null;

    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    const supabase = await createServerClient();
    
    if (bearerToken) {
      const { data: { user: tokenUser } } = await supabase.auth.getUser(bearerToken);
      user = tokenUser;
    } else {
      const { data: { user: cookieUser } } = await supabase.auth.getUser();
      user = cookieUser;
    }

    const serviceSupabase = isSupabaseServiceConfigured ? createServiceClient() : await createServerClient();

    const effectiveUserId = user?.id ?? null;

    // Allow guest checkout; rate-limit by authenticated user or a guest key.
    const rateLimitKey = effectiveUserId || `guest:${request.headers.get('x-forwarded-for') || 'unknown'}:${request.headers.get('x-real-ip') || 'unknown'}`;
    const limitCheck = await rateLimit(rateLimitKey, RATE_LIMIT, RATE_WINDOW_MS);
    if (!limitCheck.allowed) {
      logger.warn('orders_rate_limited', { userId: effectiveUserId, rateLimitKey });
      return apiError('RATE_LIMITED', { correlationId });
    }

    const orderData = await request.json();

logger.info('order_create_attempt', { userId: effectiveUserId });

    // Validate required fields
    if (!orderData.customer_name || !orderData.customer_email || !orderData.customer_phone) {
      return apiError('VALIDATION_ERROR', { correlationId, overrideMessage: 'Missing required customer information' });
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

    const rawOrderType = orderData.service_type
      || orderData.type
      || orderData.order_type
      || orderData.category;

    let orderType = normalizeOrderType(rawOrderType);

    // Force service type when flagged explicitly
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

    // Security: Recalculate totals server-side to prevent price tampering
    // We now rely solely on the CheckoutEngine for the final source of truth for taxes and totals
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

    if (clientDiscountPaise > serverDiscountPaise + 100) { // 100 Paise (1 INR) tolerance
      logger.warn('order_discount_tampered', {
        userId: effectiveUserId,
        clientDiscount: clientDiscountPaise / 100,
        serverDiscount: serverDiscountPaise / 100
      });
      return apiError('VALIDATION_ERROR', { correlationId, overrideMessage: 'Invalid discount amount' });
    }

    const subtotal = checkoutResult.subtotal;
    const gst_amount = checkoutResult.gstAmount;
    const discount_amount = checkoutResult.totalDiscount;
    const shipping_amount = 0; // Fix: calculate shipping rules definitively here instead of trusting client
    const total = checkoutResult.finalTotal + shipping_amount;

    // Re-map validated items from checkout engine for the RPC
    const validatedItems = checkoutResult.itemPrices.map(item => ({
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
        return apiError('VALIDATION_ERROR', {
          correlationId,
          overrideMessage: availability.reason,
        });
      }
      orderData.delivery_pincode = availability.pincode;
    }

    // Store additional info that doesn't have dedicated columns in the items field
    const pickupStore = orderType === 'Pickup'
      ? (orderData.pickup_store || orderData.delivery_address || null)
      : null;
    const placeOfSupply = formatPlaceOfSupply(
      destinationState,
      typeof orderData.place_of_supply === 'string' ? orderData.place_of_supply : orderData.customer_state,
    );

    // Full JSONB payload stored in the orders.items column by the RPC so the entire
    // customer context (phone, email, address) is recoverable from the row alone.
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
      agent_id: orderData.agent_id || null, // Store agent info if this is an agent order
      otp_required: !!orderData.agent_id, // Flag for OTP requirement
      part_payment_amount: orderData.part_payment_amount ? Number(orderData.part_payment_amount) : null,
      quote_id: orderData.quote_id || null
    };

    // Execute atomic allocation and order placement via PostgreSQL RPC
    const { data: rpcResult, error: rpcError } = await serviceSupabase.rpc('allocate_order_inventory_atomic', {
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
      // Pass full customer-context JSONB so the RPC stores it in the items column
      p_items: orderItemsWithCustomerInfo,
      p_agent_id: orderData.agent_id || null
    });

    if (rpcError) {
      logger.error('order_create_rpc_error', { err: rpcError.message, userId: effectiveUserId });
      return apiError('VALIDATION_ERROR', { correlationId, overrideMessage: rpcError.message || 'Failed to allocate stock and create order.' });
    }

    if (!rpcResult || !rpcResult.success || !rpcResult.order) {
      logger.error('order_create_rpc_invalid_response', { rpcResult, userId: effectiveUserId });
      const errorMsg = rpcResult?.error || 'Invalid response from allocation engine.';
      return apiError('INTERNAL_ERROR', { correlationId, overrideMessage: errorMsg });
    }

    const createdOrder = rpcResult.order;

    logger.info('order_created', { orderId: createdOrder.id, userId: effectiveUserId });

    // Update user profile address if applicable
    if (effectiveUserId && orderData.delivery_address && !orderData.agent_id && orderType === 'Delivery') {
      try {
        const addressParts = orderData.delivery_address.split(', ');
        const street = addressParts.length > 0 ? addressParts[0] : orderData.delivery_address;
        
        await serviceSupabase.from('profiles').update({
          address: {
            street: street,
            city: addressParts.length > 1 ? addressParts[1] : '',
            state: orderData.customer_state || '',
            pincode: orderData.delivery_pincode || ''
          }
        }).eq('id', effectiveUserId);
      } catch (err) {
        logger.error('failed_to_update_profile_address', { err, userId: effectiveUserId });
      }
    }

    // Parse the additional info back for the response
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
      logger.info('order_area_notifications_complete', {
        orderId: createdOrder.id,
        managerRole,
        pincode: notificationResult.routing.pincode,
        areaId: notificationResult.routing.areaId,
        managerId: notificationResult.routing.manager?.managerId || null,
        routingStatus: notificationResult.routing.status,
        customerSent: notificationResult.customerSent,
        internalSent: notificationResult.internalSent,
      });
      fullOrder.area_id = notificationResult.routing.areaId;
      fullOrder.delivery_pincode = notificationResult.routing.pincode;
      if (managerRole === 'sales_manager') {
        fullOrder.assigned_sales_manager_id = notificationResult.routing.manager?.managerId || null;
      } else {
        fullOrder.assigned_service_manager_id = notificationResult.routing.manager?.managerId || null;
      }
    } catch (notificationError) {
      logger.warn('order_area_notifications_failed', {
        orderId: createdOrder.id,
        managerRole,
        error: notificationError instanceof Error ? notificationError.message : 'unknown',
      });
    }

    // Verify agent_id context against user session
    let isAgentThemselves = false;
    if (orderData.agent_id) {
      const { data: agentRecord } = await serviceSupabase
        .from('sales_agents')
        .select('user_id')
        .eq('id', orderData.agent_id)
        .maybeSingle();
      if (agentRecord && agentRecord.user_id === effectiveUserId) {
        isAgentThemselves = true;
      }
    }

    // Handle agent commission if this is an agent order
    if (orderData.agent_id) {
      try {
        if (isAgentThemselves) {
          // Calculate and save commission immediately
          const commissionResult = await enhancedCommissionService.calculateOrderCommission(
            createdOrder.id,
            orderData.agent_id
          );

          if (commissionResult.success && commissionResult.calculation) {
            const saveResult = await enhancedCommissionService.saveCommissionRecord(
              commissionResult.calculation
            );
            
            if (saveResult.success) {
              logger.info('order_commission_processed', { 
                orderId: createdOrder.id, 
                agentId: orderData.agent_id,
                commissionAmount: commissionResult.calculation.commission_amount
              });
            }
          }
        } else {
          logger.info('order_commission_deferred', {
            orderId: createdOrder.id,
            agentId: orderData.agent_id,
            reason: 'Placed by user other than the agent (deferred until OTP verification)'
          });
        }

        // Generate OTP for agent verification if customer phone is provided
        if (orderItemsData.customer_phone) {
          const otpResult = await otpService.generateOtp({
            order_id: createdOrder.id,
            agent_id: orderData.agent_id,
            customer_phone: orderItemsData.customer_phone,
            otp_type: 'agent_order'
          });

          if (otpResult.success) {
            logger.info('order_otp_generated', { 
              orderId: createdOrder.id, 
              agentId: orderData.agent_id 
            });
          }
        }
      } catch (agentError) {
        logger.warn('order_agent_processing_failure', { 
          orderId: createdOrder.id, 
          agentId: orderData.agent_id,
          error: agentError instanceof Error ? agentError.message : 'unknown' 
        });
        // Don't fail the order creation if agent processing fails
      }
    }

    // Send WhatsApp notifications concurrently
    try {
      const customerPhone = orderItemsData.customer_phone;
      
      if (customerPhone) {
        // Clean and format phone number
        const cleanPhone = customerPhone.replace(/[^\d+]/g, '');
        const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+91${cleanPhone}`;

        const notifications: Promise<any>[] = [];

        // 1. Customer Order Confirmation
        notifications.push(
          sendOrderNotification(formattedPhone, {
            orderNumber: createdOrder.id.toString(),
            customerName: orderData.customer_name
          }).then(() => {
            logger.info('order_whatsapp_customer_sent', { orderId: createdOrder.id, phone: formattedPhone });
          }).catch(err => {
            logger.warn('order_whatsapp_customer_failed', { orderId: createdOrder.id, error: err.message });
          })
        );

        // 2. Notify admin about new order
        const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER;
        if (adminPhone) {
          const itemsList = (orderItemsData.cart_items || [])
            .map((item: any) => `• ${item.name} (₹${item.price} x ${item.quantity})`)
            .join('\n');

          const siteUrl = resolveSiteUrl(request.headers.get('host') || undefined);
          const adminMessage = `🛒 New Order Received!\n\n` +
            `📋 Order ID: ${createdOrder.id}\n` +
            `👤 Customer: ${orderData.customer_name}\n` +
            `📱 Phone: ${formattedPhone}\n` +
            `💰 Total: ₹${fullOrder.total}\n` +
            `📦 Items:\n${itemsList || 'No items listed'}\n` +
            `🔗 View: ${siteUrl}/mgmt/admin/orders/${createdOrder.id}\n` +
            `⏰ Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;

          notifications.push(
            sendWhatsAppNotification(adminPhone, adminMessage).then(() => {
              logger.info('order_whatsapp_admin_sent', { orderId: createdOrder.id, adminPhone });
            }).catch(err => {
              logger.warn('order_whatsapp_admin_failed', { orderId: createdOrder.id, error: err.message });
            })
          );
        }

        // 3. Notify manager if different from admin
        const managerPhone = process.env.MANAGER_WHATSAPP_NUMBER;
        if (managerPhone && managerPhone !== adminPhone) {
          const managerMessage = `📋 Order #${createdOrder.id}\n` +
            `👤 ${orderData.customer_name}\n` +
            `💰 ₹${fullOrder.total}\n` +
            `⏰ ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;

          notifications.push(
            sendWhatsAppNotification(managerPhone, managerMessage).then(() => {
              logger.info('order_whatsapp_manager_sent', { orderId: createdOrder.id, managerPhone });
            }).catch(err => {
              logger.warn('order_whatsapp_manager_failed', { orderId: createdOrder.id, error: err.message });
            })
          );
        }

        // Execute all notifications concurrently in the background.
        Promise.allSettled(notifications).catch(e => {
          logger.warn('whatsapp_background_error', { error: e });
        });
      }
    } catch (whatsappError) {
      logger.warn('order_whatsapp_concurrency_failure', { 
        orderId: createdOrder.id, 
        error: whatsappError instanceof Error ? whatsappError.message : 'unknown' 
      });
      // Don't fail the order creation if WhatsApp fails
    }

    return apiSuccess({ order: fullOrder }, correlationId);

  } catch (error) {
    const correlationId = request.headers.get('x-correlation-id') || null;
    const isValidationError = error instanceof Error && (
      error.message.includes('stock') || 
      error.message.includes('invalid') || 
      error.message.includes('available') ||
      error.message.includes('Product')
    );

    if (isValidationError) {
      logger.warn('order_api_validation_error', { error: error.message });
      return apiError('VALIDATION_ERROR', { correlationId, overrideMessage: error.message });
    }

    logger.error('order_api_uncaught', { error: error instanceof Error ? error.message : 'unknown' });
    return apiError('INTERNAL_ERROR', { correlationId, details: { error: error instanceof Error ? error.message : 'Unknown error' } });
  }
}
