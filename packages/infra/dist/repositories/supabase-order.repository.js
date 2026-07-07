export class SupabaseOrderRepository {
    baseClient;
    constructor(baseClient) {
        this.baseClient = baseClient;
    }
    async getCustomerOrders(userId, userEmail, userPhone) {
        const conditions = [`customer_id.eq.${userId}`];
        if (userEmail)
            conditions.push(`customer_email.eq.${userEmail}`);
        if (userPhone)
            conditions.push(`customer_phone.eq.${userPhone}`);
        const { data } = await this.baseClient.executeQuery(this.baseClient.rawClient.from('orders').select('*').or(conditions.join(',')).order('created_at', { ascending: false }), 'get_customer_orders');
        return data || [];
    }
    async allocateOrderInventory(params) {
        const { data: rpcResult } = await this.baseClient.executeQuery(this.baseClient.rawClient.rpc('allocate_order_inventory_atomic', params), 'allocate_order_inventory');
        if (!rpcResult || !rpcResult.success || !rpcResult.order) {
            throw new Error(rpcResult?.error || 'Invalid response from allocation engine.');
        }
        return rpcResult.order;
    }
    async updateProfileAddress(userId, address) {
        await this.baseClient.executeQuery(this.baseClient.rawClient.from('profiles').update({ address }).eq('id', userId), 'update_profile_address');
    }
    async getAgentUserId(agentId) {
        const { data } = await this.baseClient.executeQuery(this.baseClient.rawClient.from('sales_agents').select('user_id').eq('id', agentId).maybeSingle(), 'get_agent_user_id');
        return data?.user_id || null;
    }
}
