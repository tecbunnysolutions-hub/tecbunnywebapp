/**
 * Utility functions for order ID formatting and display
 */
export declare function formatInvoiceDate(value: string | Date | null | undefined): string;
/**
 * Converts a UUID order ID to a short, human-readable order number
 * Format: TB + 8 characters of entropy (reduced collision risk)
 */
export declare function formatOrderNumber(orderId: string): string;
/**
 * Converts a UUID order ID to a medium-length order number
 * Format: TB + 8 alphanumeric characters
 */
export declare function formatOrderNumberMedium(orderId: string): string;
/**
 * Legacy function for backward compatibility - formats to 8-character display
 */
export declare function formatOrderId(orderId: string): string;
/**
 * Get a human-readable order display text
 */
export declare function getOrderDisplayText(orderId: string): string;
export interface BaseCartItem {
    price: number;
    quantity: number;
    gstRate?: number;
}
export declare function calculateCartTotals(items: BaseCartItem[]): {
    subtotal: number;
    gstAmount: number;
    total: number;
};
//# sourceMappingURL=order-utils.d.ts.map