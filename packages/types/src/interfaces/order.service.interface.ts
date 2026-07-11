export interface CreateOrderParams {
  effectiveUserId: string | null;
  correlationId: string | null;
  orderData: any; // Raw order data mapped from request body
}

export interface IOrderService {
  getCustomerOrders(userId: string, userEmail?: string, userPhone?: string): Promise<any[]>;
  createOrder(params: CreateOrderParams): Promise<any>;
  updateOrderStatus(
    userId: string,
    userRole: string,
    payload: any
  ): Promise<{ orderId: string; status: string }>;
}
