export interface INotificationService {
    sendCredentialsEmail(email: string, name: string, password: string, siteUrl: string): Promise<void>;
    sendOrderCustomerNotification(phone: string, orderId: string, customerName: string): Promise<void>;
    sendOrderAdminNotification(orderId: string, customerName: string, phone: string, total: number, itemsList: string, siteUrl: string): Promise<void>;
    sendOrderManagerNotification(orderId: string, customerName: string, total: number, managerPhone: string): Promise<void>;
}
//# sourceMappingURL=notification.service.interface.d.ts.map