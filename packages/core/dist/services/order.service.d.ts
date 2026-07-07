import { IOrderService, CreateOrderParams } from '@tecbunny/types';
import { IOrderRepository } from '@tecbunny/types';
import { INotificationService } from '@tecbunny/types';
export declare class OrderService implements IOrderService {
    private readonly orderRepo;
    private readonly notificationService;
    constructor(orderRepo: IOrderRepository, notificationService: INotificationService);
    getCustomerOrders(userId: string, userEmail?: string, userPhone?: string): Promise<any[]>;
    createOrder(params: CreateOrderParams): Promise<any>;
}
//# sourceMappingURL=order.service.d.ts.map