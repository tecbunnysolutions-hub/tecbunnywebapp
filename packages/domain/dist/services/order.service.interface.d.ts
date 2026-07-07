export interface CreateOrderParams {
    effectiveUserId: string | null;
    correlationId: string | null;
    orderData: any;
}
export interface IOrderService {
    getCustomerOrders(userId: string, userEmail?: string, userPhone?: string): Promise<any[]>;
    createOrder(params: CreateOrderParams): Promise<any>;
}
//# sourceMappingURL=order.service.interface.d.ts.map