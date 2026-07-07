import { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../logger';
import { resolveSiteUrl } from '../site-url';
import { generatePayuHash, getPayuPaymentUrl, normalisePayuEnvironment, type PayuConfig, type PayuRequestPayload, type PayuEnvironment } from '../payu-service';
import { sendPaymentConfirmationNotification, sendWhatsAppNotification } from '../whatsapp-service';

export interface InitiatePayuPaymentParams {
  orderId: string;
  userId: string | null;
  userRole: string | null;
  clientIp: string;
  host: string | undefined;
  correlationId: string;
  staffPaymentRoles: Set<string>;
}

export interface UpdatePaymentStatusParams {
  orderId: string;
  paymentId?: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  amount: number;
  gateway?: string;
  transactionId?: string;
  failureReason?: string;
  correlationId: string;
}

export class PaymentService {
  constructor(private readonly supabase: SupabaseClient) {}

  private generateTransactionId(orderId: string): string {
    const cleanedOrder = orderId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-6);
    const timestampFragment = Date.now().toString(36).toUpperCase();
    const randomFragment = Math.random().toString(36).slice(2, 8).toUpperCase();
    const candidate = `TB${cleanedOrder}${timestampFragment}${randomFragment}`;
    return candidate.slice(0, 25);
  }

  private resolveEnvironmentPreference(envs: Array<string | null | undefined>): PayuEnvironment {
    const normalisedValues = envs
      .filter((candidate): candidate is string => typeof candidate === 'string' && candidate.trim().length > 0)
      .map(candidate => normalisePayuEnvironment(candidate));

    if (normalisedValues.includes('production')) return 'production';
    if (normalisedValues.includes('test')) return 'test';
    return 'test';
  }

  async initiatePayuPayment(params: InitiatePayuPaymentParams) {
    const { orderId, userId, userRole, host, correlationId, staffPaymentRoles } = params;

    // Fetch settings from database first, fallback to env vars
    let dbMerchantKey = '';
    let dbMerchantSalt = '';
    let dbEnvironment = '';
    let dbEnabled = 'true';
    try {
      const { data: dbSettings } = await this.supabase
        .from('settings')
        .select('key, value')
        .in('key', ['payu_merchant_key', 'payu_merchant_salt', 'payu_environment', 'payu_enabled']);
      
      if (dbSettings) {
        dbMerchantKey = dbSettings.find((s: any) => s.key === 'payu_merchant_key')?.value || '';
        dbMerchantSalt = dbSettings.find((s: any) => s.key === 'payu_merchant_salt')?.value || '';
        dbEnvironment = dbSettings.find((s: any) => s.key === 'payu_environment')?.value || '';
        dbEnabled = dbSettings.find((s: any) => s.key === 'payu_enabled')?.value || 'true';
      }
    } catch (err) {
      logger.error('Failed to load PayU settings from DB', { error: err, correlationId });
    }

    const payuConfig = {
      enabled: dbEnabled === 'true',
      config: {
        environment: dbEnvironment || process.env.PAYU_ENVIRONMENT || 'test'
      }
    };

    if (!payuConfig.enabled) {
      throw new Error('PayU payment method is disabled');
    }

    const rawConfig = (payuConfig.config ?? {}) as any;
    const envMerchantKey = (process.env.PAYU_MERCHANT_KEY || '').trim();
    const envMerchantSalt = (process.env.PAYU_MERCHANT_SALT || '').trim();

    const merchantKey = dbMerchantKey || rawConfig.merchantKey || rawConfig.key || rawConfig.merchant_key || envMerchantKey;
    const merchantSalt = dbMerchantSalt || rawConfig.merchantSalt || rawConfig.merchant_salt || rawConfig.salt || envMerchantSalt;

    if (!merchantKey || !merchantSalt) {
      throw new Error('PayU configuration incomplete');
    }

    const environment = this.resolveEnvironmentPreference([
      rawConfig.environment,
      process.env.PAYU_ENVIRONMENT,
      process.env.PAYU_MODE,
      process.env.PAYU_GATEWAY_ENV,
    ]);

    const { data: order, error: orderError } = await this.supabase
      .from('orders')
      .select('id, customer_id, total, customer_name, customer_email, customer_phone, items')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    const orderOwnerId = typeof order.customer_id === 'string' ? order.customer_id : null;
    const canManagePayments = Boolean(userRole && staffPaymentRoles.has(userRole));
    
    if (orderOwnerId && orderOwnerId !== userId && !canManagePayments) {
      throw new Error('You are not allowed to initiate payment for this order');
    }

    const extras = typeof order.items === 'string' ? JSON.parse(order.items || '{}') : (order.items || {});
    const partPaymentAmount = extras.part_payment_amount;
    const amountNumber = partPaymentAmount ? Number(partPaymentAmount) : Number(order.total ?? 0);
    
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      throw new Error('Order amount is invalid for payment');
    }

    const amount = amountNumber.toFixed(2);
    const productInfo = `Order ${orderId}`.slice(0, 100) || 'TecBunny Order';
    const firstName = typeof order.customer_name === 'string' && order.customer_name.trim().length > 0
      ? order.customer_name.trim().split(' ')[0]
      : (process.env.PAYU_FALLBACK_FIRSTNAME || 'Customer');
    const email = typeof order.customer_email === 'string' && order.customer_email.trim().length > 0
      ? order.customer_email.trim()
      : (process.env.PAYU_FALLBACK_EMAIL || process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@tecbunny.com');
    const phone = typeof order.customer_phone === 'string' && order.customer_phone.trim().length > 0
      ? order.customer_phone.trim()
      : (process.env.PAYU_FALLBACK_PHONE || '9999999999');

    const txnId = this.generateTransactionId(orderId);
    const siteUrl = resolveSiteUrl(host);
    const callbackUrl = `${siteUrl}/api/payment/payu/callback`;

    const cartItemsList = Array.isArray(extras.cart_items) ? extras.cart_items : [];
    const hasService = cartItemsList.some((item: any) =>
      String(item.productId || item.id).startsWith('service-') ||
      String(item.productId || item.id).startsWith('pricing-')
    );

    let udf2 = '', udf3 = '', udf4 = '', udf5 = '', udf6 = '';

    if (hasService) {
      udf2 = String(extras.delivery_address || '').slice(0, 255);
      udf3 = String(extras.city || extras.delivery_address?.split(',')?.[1]?.trim() || '').slice(0, 100);
      udf4 = String(extras.customer_state || '').slice(0, 100);
      udf5 = String(extras.pincode || extras.delivery_address?.split('-')?.pop()?.trim() || '').slice(0, 20);
      udf6 = String(extras.customer_phone || '').slice(0, 50);
    }

    const payuPayload: PayuRequestPayload = {
      txnId, amount, productInfo, firstName, email, phone, udf1: orderId,
      ...(hasService ? { udf2, udf3, udf4, udf5, udf6 } : {}),
    };

    const hash = generatePayuHash({ merchantKey, merchantSalt, environment } as PayuConfig, payuPayload);

    const paymentParams = {
      key: merchantKey,
      txnid: txnId,
      amount,
      productinfo: productInfo,
      firstname: firstName,
      email,
      phone,
      surl: callbackUrl,
      furl: callbackUrl,
      hash,
      udf1: orderId,
      ...(hasService ? { udf2, udf3, udf4, udf5, udf6 } : {}),
      service_provider: 'payu_paisa',
    } as const;

    const { error: txnError } = await this.supabase
      .from('payment_transactions')
      .insert({
        order_id: orderId,
        transaction_id: txnId,
        payment_method: 'payu',
        amount: amountNumber,
        status: 'initiated',
        gateway_response: { request: paymentParams },
        created_at: new Date().toISOString(),
      });

    if (txnError) {
      logger.error('payu_init.transaction_store_failed', { error: txnError.message, orderId, correlationId });
    }

    return {
      paymentUrl: getPayuPaymentUrl(environment),
      params: paymentParams,
      transactionId: txnId,
      environment,
    };
  }

  async updatePaymentStatus(params: UpdatePaymentStatusParams) {
    const { orderId, status, amount, gateway = 'unknown', transactionId, failureReason, correlationId } = params;

    const { data: order, error: orderError } = await this.supabase
      .from('orders')
      .select('*, items')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    const orderItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    const customerPhone = orderItems?.customer_phone;

    let newOrderStatus: string = order.status;
    let newPaymentStatus: string | null = order.payment_status ?? null;

    switch (status) {
      case 'success':
        newOrderStatus = 'Payment Confirmed';
        newPaymentStatus = 'Payment Confirmed';
        break;
      case 'pending':
        newOrderStatus = 'Awaiting Payment';
        newPaymentStatus = 'Payment Confirmation Pending';
        break;
      case 'failed':
        newOrderStatus = 'Awaiting Payment';
        newPaymentStatus = 'Payment Failed';
        break;
      case 'refunded':
        newPaymentStatus = 'Refund Initiated';
        break;
      default:
        newPaymentStatus = status;
        break;
    }

    const { data: updatedOrder, error: updateError } = await this.supabase
      .from('orders')
      .update({ 
        status: newOrderStatus,
        payment_status: newPaymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      throw new Error('Failed to update order status');
    }

    if (customerPhone) {
      try {
        const cleanPhone = customerPhone.replace(/[^\d+]/g, '');
        const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+91${cleanPhone}`;
        let customerMessage = '';

        switch (status) {
          case 'success':
            customerMessage = `✅ Payment Successful!\n\n💰 Amount: ₹${amount}\n📋 Order ID: ${orderId}\n🎯 Transaction ID: ${transactionId || 'N/A'}\n📦 Your order is now confirmed and being processed!\n📅 Date: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;
            break;
          case 'failed':
            customerMessage = `❌ Payment Failed\n\n💰 Amount: ₹${amount}\n📋 Order ID: ${orderId}\n🔍 Reason: ${failureReason || 'Unknown error'}\n🔄 Please try again or contact support.\n📅 Date: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;
            break;
          case 'refunded':
            customerMessage = `💸 Refund Processed\n\n💰 Amount: ₹${amount}\n📋 Order ID: ${orderId}\n🏦 Refund will be credited to your account within 5-7 business days.\n📅 Date: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;
            break;
          default:
            customerMessage = `📄 Payment Status Update\n\n💰 Amount: ₹${amount}\n📋 Order ID: ${orderId}\n📊 Status: ${status}\n📅 Date: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;
        }

        if (status === 'success') {
          await sendPaymentConfirmationNotification(formattedPhone, {
            orderNumber: orderId,
            amount: `₹${amount}`,
            customerName: order.customer_name
          });
        } else {
          await sendWhatsAppNotification(formattedPhone, customerMessage);
        }

        const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER;
        if (adminPhone) {
          let adminMessage = `💳 Payment ${status.toUpperCase()}\n\n📋 Order ID: ${orderId}\n👤 Customer: ${order.customer_name}\n📱 Phone: ${formattedPhone}\n💰 Amount: ₹${amount}\n🏦 Gateway: ${gateway}\n🆔 Transaction: ${transactionId || 'N/A'}\n📅 Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;
          if (status === 'failed' && failureReason) {
            adminMessage += `\n❌ Reason: ${failureReason}`;
          }
          await sendWhatsAppNotification(adminPhone, adminMessage);
        }

        const managerPhone = process.env.MANAGER_WHATSAPP_NUMBER;
        if (managerPhone && managerPhone !== adminPhone) {
          const managerMessage = `💳 Payment ${status.toUpperCase()}\n📋 Order: ${orderId}\n💰 ₹${amount}\n👤 ${order.customer_name}\n⏰ ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;
          await sendWhatsAppNotification(managerPhone, managerMessage);
        }
      } catch (whatsappError) {
        logger.warn('payment_whatsapp_failure', { orderId, error: whatsappError instanceof Error ? whatsappError.message : 'unknown', correlationId });
      }
    }

    return {
      orderId,
      paymentStatus: status,
      orderStatus: newOrderStatus,
      amount,
      updatedAt: updatedOrder.updated_at
    };
  }

  async getPaymentStatus(orderId: string) {
    const { data: order, error } = await this.supabase
      .from('orders')
      .select('id, status, total, created_at, updated_at')
      .eq('id', orderId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error('Database error');
    }

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }
}
