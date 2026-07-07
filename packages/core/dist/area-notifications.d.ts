type ManagerRole = 'sales_manager' | 'service_manager';
type RoutingStatus = 'assigned' | 'unassigned' | 'failed';
type AreaManager = {
    areaId: string;
    areaCode: string;
    areaName: string;
    managerId: string;
    managerName: string;
    managerEmail: string;
};
type RoutingResolution = {
    pincode: string | null;
    areaId: string | null;
    areaCode: string | null;
    areaName: string | null;
    manager: AreaManager | null;
    status: RoutingStatus;
};
type NotificationResult = {
    customerSent: boolean;
    internalSent: boolean;
    routing: RoutingResolution;
};
export declare const extractPincode: (payload: Record<string, any>) => string | null;
export declare function sendOrderRoutingNotifications(order: Record<string, any>, role?: ManagerRole): Promise<NotificationResult>;
export declare function sendServiceTicketRoutingNotifications(ticket: Record<string, any>): Promise<NotificationResult>;
export {};
//# sourceMappingURL=area-notifications.d.ts.map