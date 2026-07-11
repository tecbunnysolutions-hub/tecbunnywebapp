import { IOrderRepository } from '@tecbunny/types';
import { BaseSupabaseClient } from '../supabase/base-client';
export declare class SupabaseOrderRepository implements IOrderRepository {
    private readonly baseClient;
    constructor(baseClient: BaseSupabaseClient);
    getCustomerOrders(userId: string, userEmail?: string, userPhone?: string): Promise<any[]>;
    allocateOrderInventory(params: any): Promise<any>;
    updateProfileAddress(userId: string, address: any): Promise<void>;
    getAgentUserId(agentId: string): Promise<string | null>;
    getOrderForUpdate(orderId: string): Promise<any>;
    updateOrderStatusRpc(params: any): Promise<void>;
}
//# sourceMappingURL=supabase-order.repository.d.ts.map