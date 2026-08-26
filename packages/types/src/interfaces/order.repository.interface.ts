export interface IOrderRepository {
  getCustomerOrders(userId: string, userEmail?: string, userPhone?: string): Promise<any[]>;
  reserveOrderIdempotency(key: string, customerId: string | null): Promise<{ isNew: boolean; orderId: string | null }>;
  completeOrderIdempotency(key: string, orderId: string): Promise<void>;
  getOrderById(orderId: string): Promise<any>;
  allocateOrderInventory(params: any): Promise<any>;
  updateProfileAddress(userId: string, address: any): Promise<void>;
  getAgentUserId(agentId: string): Promise<string | null>;
  getOrderForUpdate(orderId: string): Promise<any>;
  updateOrderStatusRpc(params: any): Promise<void>;
}
