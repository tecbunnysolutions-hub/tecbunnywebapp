import React from 'react';
import type { Order, OrderStatus } from '../types';
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
export declare const OrderContext: React.Context<OrderContextType | undefined>;
export declare const OrderProvider: React.FC<{
    children: React.ReactNode;
}>;
export declare const useOrder: () => OrderContextType;
export {};
//# sourceMappingURL=OrderProvider.d.ts.map