export interface IInventoryRepository {
  getInventorySummary(): Promise<any[]>;
  getProductsFallback(): Promise<any[]>;
  recordAtomicStockMovement(params: {
    productId: string;
    movementType: string;
    quantity: number;
    referenceType: string;
    notes: string;
    createdBy: string | null;
  }): Promise<string>;
}
