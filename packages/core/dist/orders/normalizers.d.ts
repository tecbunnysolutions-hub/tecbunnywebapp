import type { Order, OrderStatus } from '../types';
export declare const STATUS_MAP: Record<string, OrderStatus>;
export declare function normalizeOrderStatus(status: string | OrderStatus | null | undefined): OrderStatus;
export declare function deserializeOrder(rawOrder: any): Order;
//# sourceMappingURL=normalizers.d.ts.map