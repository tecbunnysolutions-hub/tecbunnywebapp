import { IOrderRepository } from '@tecbunny/types';
import { BaseSupabaseClient } from '../supabase/base-client';

export class SupabaseOrderRepository implements IOrderRepository {
  constructor(private readonly baseClient: BaseSupabaseClient) {}

  async getCustomerOrders(userId: string, userEmail?: string, userPhone?: string): Promise<any[]> {
    // Callers must pass only verified contact details. Each identifier is a
    // separate equality filter so values never enter PostgREST filter syntax.
    const orders = () => this.baseClient.rawClient.from('orders').select('*');
    const queries = [orders().eq('customer_id', userId)];
    if (userEmail) queries.push(orders().eq('customer_email', userEmail));
    if (userPhone) {
      const digits = userPhone.replace(/\D/g, '');
      const variants = Array.from(new Set([userPhone, digits, `+${digits}`, digits.slice(-10)].filter((value) => value.length >= 10)));
      if (variants.length) queries.push(orders().in('customer_phone', variants));
    }

    const results = await Promise.all(queries.map((query) => this.baseClient.executeQuery(query, 'get_customer_orders')));
    const byId = new Map<string, any>();
    for (const { data } of results) {
      for (const order of (data as any[] | null) ?? []) byId.set(String(order.id), order);
    }
    return Array.from(byId.values()).sort((a, b) => String(b.created_at ?? '').localeCompare(String(a.created_at ?? '')));
  }

  async reserveOrderIdempotency(key: string, customerId: string | null): Promise<{ isNew: boolean; orderId: string | null }> {
    const { data: inserted, error: insertError } = await this.baseClient.rawClient
      .from('order_idempotency_keys')
      .insert({ idempotency_key: key, customer_id: customerId })
      .select('order_id')
      .maybeSingle();

    if (!insertError && inserted) {
      return { isNew: true, orderId: inserted.order_id ?? null };
    }

    const { data, error } = await this.baseClient.rawClient
      .from('order_idempotency_keys')
      .select('order_id')
      .eq('idempotency_key', key)
      .maybeSingle();

    if (error) {
      throw new Error(`Unable to verify order idempotency key: ${error.message}`);
    }

    return { isNew: false, orderId: data?.order_id ?? null };
  }

  async completeOrderIdempotency(key: string, orderId: string): Promise<void> {
    const { error } = await this.baseClient.rawClient
      .from('order_idempotency_keys')
      .update({ order_id: orderId })
      .eq('idempotency_key', key)
      .is('order_id', null);

    if (error) {
      throw new Error(`Unable to complete order idempotency key: ${error.message}`);
    }
  }

  async getOrderById(orderId: string): Promise<any> {
    const { data, error } = await this.baseClient.rawClient
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (error) {
      throw new Error(`Unable to load existing order: ${error.message}`);
    }
    return data || null;
  }

  async allocateOrderInventory(params: any): Promise<any> {
    const { data: rpcResult } = await this.baseClient.executeQuery(
      this.baseClient.rawClient.rpc('allocate_order_inventory_atomic', params),
      'allocate_order_inventory'
    );

    if (!rpcResult || !rpcResult.success || !rpcResult.order) {
      throw new Error(rpcResult?.error || 'Invalid response from allocation engine.');
    }
    return rpcResult.order;
  }

  async updateProfileAddress(userId: string, address: any): Promise<void> {
    await this.baseClient.executeQuery(
      this.baseClient.rawClient.from('profiles').update({ address }).eq('id', userId),
      'update_profile_address'
    );
  }

  async getAgentUserId(agentId: string): Promise<string | null> {
    const { data } = await this.baseClient.executeQuery<any>(
      this.baseClient.rawClient.from('sales_agents').select('user_id').eq('id', agentId).maybeSingle(),
      'get_agent_user_id'
    );
    return data?.user_id || null;
  }

  async getOrderForUpdate(orderId: string): Promise<any> {
    const { data } = await this.baseClient.executeQuery(
      this.baseClient.rawClient
        .from('orders')
        .select('id, type, payment_status, payment_method, status, customer_phone, customer_name, customer_email, total, customer_id, created_at, delivery_address')
        .eq('id', orderId)
        .maybeSingle(),
      'get_order_for_update'
    );
    return data || null;
  }

  async updateOrderStatusRpc(params: any): Promise<void> {
    const { error } = await this.baseClient.rawClient.rpc('update_order_status_v1', params);
    if (error) {
      throw new Error(error.message);
    }
  }
}
