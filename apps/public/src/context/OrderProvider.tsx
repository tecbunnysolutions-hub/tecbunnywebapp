'use client';

import React, { createContext, useState, useCallback, useContext, useRef } from 'react';

import type { CartItem, Order, OrderItem, OrderStatus } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { useToast } from "@tecbunny/ui";
import { useCart } from '@/lib/hooks';
import { useAuth } from '@/lib/hooks';
import { logger } from '@/lib/logger';
import { deserializeOrder, normalizeOrderStatus } from '@/lib/orders/normalizers';
import { formatOrderNumber, calculateCartTotals } from '@/lib/order-utils';

interface OrderContextType {
  orders: Order[];
  currentOrder: Order | null;
  isProcessingOrder: boolean;
  createOrder: (orderData: Partial<Order>) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: OrderStatus, additionalData?: Record<string, unknown>) => Promise<boolean>;
  getOrders: (customerId?: string) => Promise<void>;
  getOrderById: (orderId: string) => Promise<Order | null>;
  cancelOrder: (orderId: string, reason?: string) => Promise<boolean>;
}

export const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const { toast } = useToast();
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const supabase = createClient();

  const hydrateCartItemsWithProductData = useCallback(async (items: CartItem[]): Promise<CartItem[]> => {
    const itemsNeedingLookup = items.filter(item => {
      const missingHsn = !item.hsnCode || item.hsnCode === '9999';
      const missingGst = typeof item.gstRate !== 'number' || !Number.isFinite(item.gstRate);
      return missingHsn || missingGst;
    });

    if (itemsNeedingLookup.length === 0) {
      return items;
    }

    const ids = Array.from(
      new Set(
        itemsNeedingLookup
          .map(item => (item as any).productId || item.id)
          .filter((value): value is string => typeof value === 'string' && value.length > 0)
      )
    );
    if (ids.length === 0) {
      return items;
    }

    const { data, error } = await supabase
      .from('products')
      .select('id, hsn_code, gst_rate')
      .in('id', ids);

    if (error || !data) {
      if (error) {
        logger.warn('OrderProvider failed to hydrate cart items from products table', {
          error: error.message,
          ids,
        });
      }
      return items;
    }

    const productLookup = new Map<string, any>();
    data.forEach(record => {
      if (record?.id) {
        productLookup.set(record.id, record);
      }
    });

    return items.map(item => {
      const key = (item as any).productId || item.id;
      const productRecord = key ? productLookup.get(key) : undefined;
      if (!productRecord) {
        return item;
      }

      const resolvedHsn =
        productRecord.hsnCode ??
        productRecord.hsn_code ??
        productRecord.hsn ??
        productRecord.hsn_sac ??
        null;
      const resolvedGst =
        productRecord.gstRate ??
        productRecord.gst_rate ??
        productRecord.gst_percentage ??
        null;

      const normalizedHsn = resolvedHsn != null ? String(resolvedHsn).trim() : undefined;
      let normalizedGst: number | undefined;
      if (typeof resolvedGst === 'number' && Number.isFinite(resolvedGst)) {
        normalizedGst = resolvedGst;
      } else if (typeof resolvedGst === 'string') {
        const parsed = Number.parseFloat(resolvedGst);
        normalizedGst = Number.isFinite(parsed) ? parsed : undefined;
      }

      return {
        ...item,
        hsnCode: (!item.hsnCode || item.hsnCode === '9999') && normalizedHsn ? normalizedHsn : item.hsnCode,
        gstRate: typeof item.gstRate === 'number' && Number.isFinite(item.gstRate) ? item.gstRate : normalizedGst ?? item.gstRate,
      };
    });
  }, [supabase]);

  const isProcessingRef = useRef(false);

  const createOrder = useCallback(async (orderData: Partial<Order>): Promise<Order | null> => {
    if (isProcessingRef.current) return null;
    isProcessingRef.current = true;
    setIsProcessingOrder(true);
    try {
      const customerName = orderData.customer_name || user?.name || 'Customer';
      const customerEmail = orderData.customer_email || user?.email || '';
      const customerPhone = orderData.customer_phone || user?.mobile || '';
      
      // Validate required fields
      if (!customerName || !customerEmail || !customerPhone) {
        toast({
          title: "Missing Information",
          description: "Please provide your name, email, and phone number.",
          variant: "destructive"
        });
        return null;
      }

      // Ensure we use the items passed from the caller (e.g. Buy Now, Custom Setup) rather than just global cartItems
      const itemsToProcess = orderData.items && orderData.items.length > 0 ? orderData.items : cartItems;
      const hydratedItems = await hydrateCartItemsWithProductData(itemsToProcess as CartItem[]);

      // Calculate totals
      const { subtotal, gstAmount, total } = calculateCartTotals(hydratedItems);

      // Convert items to order items format
      const orderItems: OrderItem[] = hydratedItems.map(item => ({
        productId: (item as any).productId || item.id,
        quantity: item.quantity,
        price: item.price,
        gstRate: item.gstRate || 18,
        hsnCode: item.hsnCode || undefined,
        name: item.name,
        serialNumbers: []
      }));

      const hasService = hydratedItems.some(item => item.product_type === 'service');

      const orderPayload = {
        customer_name: customerName,
        customer_id: user?.id || null,
        status: orderData.status || 'Pending',
        subtotal: Math.round(subtotal * 100) / 100,
        gst_amount: Math.round(gstAmount * 100) / 100,
        total: Math.round(total * 100) / 100,
        type: hasService ? 'Service' : (orderData.type || 'Delivery'),
        is_service_order: hasService,
  items: orderItems,
        processed_by: orderData.processed_by || null,
        customer_email: customerEmail || null,
        customer_phone: customerPhone || null,
        delivery_address: orderData.delivery_address || null,
        delivery_pincode: (orderData as any).delivery_pincode || null,
        pickup_store: orderData.pickup_store || null,
        customer_state: orderData.customer_state || null,
        customer_state_code: orderData.customer_state_code || null,
        place_of_supply: orderData.place_of_supply || null,
        place_of_supply_state_code: orderData.place_of_supply_state_code || null,
        seller_state_code: orderData.seller_state_code || null,
        notes: orderData.notes || null,
        payment_method: orderData.payment_method || null,
        payment_status: orderData.payment_status || null,
        discount_amount: Math.round(((orderData.discount_amount || 0) as number) * 100) / 100,
        shipping_amount: Math.round(((orderData.shipping_amount || 0) as number) * 100) / 100,
        agent_id: orderData.agent_id || null,
        idempotency_key: (orderData as any).idempotency_key || null
      };

      // Get session token for Authorization header — more reliable than cookie-only auth
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const accessToken = currentSession?.access_token;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify(orderPayload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        const errorMessage = result?.error?.message || 'Failed to create order. Please try again.';
        logger.error('OrderProvider API order creation failed', {
          status: response.status,
          error: result?.error,
        });
        toast({
          title: "Order Failed",
          description: errorMessage,
          variant: "destructive"
        });
        return null;
      }

      // Merge the database result with our full order data
      const createdOrder = deserializeOrder(result.order);
      const hydratedOrder: Order = {
        ...createdOrder,
        customer_email: createdOrder.customer_email ?? customerEmail,
        customer_phone: createdOrder.customer_phone ?? customerPhone,
        pickup_store: createdOrder.pickup_store ?? (orderData.pickup_store as string | undefined) ?? undefined,
        delivery_address: createdOrder.delivery_address ?? (orderData.delivery_address as string | undefined) ?? undefined,
        customer_state: createdOrder.customer_state ?? orderData.customer_state ?? undefined,
        customer_state_code: createdOrder.customer_state_code ?? orderData.customer_state_code ?? undefined,
        place_of_supply: createdOrder.place_of_supply ?? orderData.place_of_supply ?? undefined,
        place_of_supply_state_code: createdOrder.place_of_supply_state_code ?? orderData.place_of_supply_state_code ?? undefined,
        seller_state_code: createdOrder.seller_state_code ?? orderData.seller_state_code ?? undefined,
      };

      setCurrentOrder(hydratedOrder);
      setOrders(prev => [hydratedOrder, ...prev]);
      
      // Clear cart after successful order
      clearCart();

      toast({
        title: "Order Created Successfully!",
        description: `Order #${formatOrderNumber(createdOrder.id)} has been placed.`,
      });

      return hydratedOrder;
    } catch (error) {
      logger.error('OrderProvider failed to create order', {
        error: error instanceof Error ? error.message : String(error),
        payload: orderData,
      });
      toast({
        title: "Order Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      isProcessingRef.current = false;
      setIsProcessingOrder(false);
    }
  }, [cartItems, clearCart, toast, user, hydrateCartItemsWithProductData, supabase.auth]);

  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus, additionalData?: Record<string, unknown>): Promise<boolean> => {
    try {
      const payload = { orderId, status, additionalData: additionalData ?? {} };
      const res = await fetch('/api/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        logger.error('OrderProvider updateOrderStatus failed', { status, orderId, resStatus: res.status, data });
        toast({
          title: 'Update Failed',
          description: data?.error || 'Failed to update order status.',
          variant: 'destructive',
        });
        return false;
      }

      const normalizedStatus = normalizeOrderStatus(status);

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: normalizedStatus } : order
      ));

      if (currentOrder?.id === orderId) {
        setCurrentOrder(prev => prev ? { ...prev, status: normalizedStatus } : null);
      }

      toast({
        title: 'Order Updated',
        description: `Order status updated to ${normalizedStatus}.`,
      });

      return true;
    } catch (error) {
      logger.error('OrderProvider failed to update order status', { error, orderId, status });
      toast({
        title: 'Update Failed',
        description: 'An unexpected error occurred while updating the order status.',
        variant: 'destructive'
      });
      return false;
    }
  }, [currentOrder, toast]);

  const getOrders = useCallback(async (customerId?: string): Promise<void> => {
    try {
      // First try to load from secure server API to bypass client RLS and get complete history
      const apiRes = await fetch('/api/orders');
      if (apiRes.ok) {
        const payload = await apiRes.json();
        if (payload?.success && Array.isArray(payload?.orders)) {
          setOrders(payload.orders);
          return;
        }
      }

      // Fallback to client-side Supabase select if server fetch fails
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (customerId) {
        if (user && (user.email || user.mobile)) {
          const conditions = [`customer_id.eq.${customerId}`];
          if (user.email) conditions.push(`customer_email.eq.${user.email}`);
          if (user.mobile) conditions.push(`customer_phone.eq.${user.mobile}`);
          query = query.or(conditions.join(','));
        } else {
          query = query.eq('customer_id', customerId);
        }
      }

      const { data, error } = await query;

      if (error) {
        return;
      }

      const normalizedOrders = (data ?? []).map(deserializeOrder);
      setOrders(normalizedOrders);
    } catch (error) {
      logger.error('OrderProvider getOrders failed', {
        error: error instanceof Error ? error.message : String(error),
        customerId,
      });
    }
  }, [supabase, user]);

  const getOrderById = useCallback(async (orderId: string): Promise<Order | null> => {
    try {
      // First try to load from secure server API to bypass client RLS for guests/COD
      const apiRes = await fetch(`/api/orders/${orderId}`);
      if (apiRes.ok) {
        const payload = await apiRes.json();
        if (payload?.success && payload?.order) {
          const order = payload.order;
          setCurrentOrder(order);
          return order;
        }
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) {
        return null;
      }

      const order = deserializeOrder(data);
      setCurrentOrder(order);
      return order;
    } catch (error) {
      logger.error('OrderProvider getOrderById failed', {
        error: error instanceof Error ? error.message : String(error),
        orderId,
      });
      return null;
    }
  }, [supabase]);

  const cancelOrder = useCallback(async (orderId: string, reason?: string): Promise<boolean> => {
    try {
      const payload = { orderId, status: 'Cancelled', additionalData: { cancellation_reason: reason || 'Cancelled by user' } };
      const res = await fetch('/api/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        logger.error('OrderProvider cancelOrder failed', { orderId, resStatus: res.status, data });
        toast({
          title: 'Cancellation Failed',
          description: data?.error || 'Failed to cancel order.',
          variant: 'destructive'
        });
        return false;
      }

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: 'Cancelled' as OrderStatus } : order
      ));

      if (currentOrder?.id === orderId) {
        setCurrentOrder(prev => prev ? { ...prev, status: 'Cancelled' as OrderStatus } : null);
      }

      toast({
        title: 'Order Cancelled',
        description: 'Order has been cancelled successfully.',
      });

      return true;
    } catch (error) {
      logger.error('OrderProvider cancelOrder failed', {
        error: error instanceof Error ? error.message : String(error),
        orderId,
      });
      toast({
        title: 'Cancellation Failed',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
      return false;
    }
  }, [currentOrder, toast]);

  const value = {
    orders,
    currentOrder,
    isProcessingOrder,
    createOrder,
    updateOrderStatus,
    getOrders,
    getOrderById,
    cancelOrder,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
