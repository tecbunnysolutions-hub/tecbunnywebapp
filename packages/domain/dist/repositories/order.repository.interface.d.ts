export interface IOrderRepository {
    getCustomerOrders(userId: string, userEmail?: string, userPhone?: string): Promise<any[]>;
    allocateOrderInventory(params: any): Promise<any>;
    updateProfileAddress(userId: string, address: any): Promise<void>;
    getAgentUserId(agentId: string): Promise<string | null>;
}
//# sourceMappingURL=order.repository.interface.d.ts.map