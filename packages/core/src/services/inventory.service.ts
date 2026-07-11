import { IInventoryRepository } from '@tecbunny/types';
import { logger } from '../logger';

const LEGACY_MOVEMENT_MAP: Record<string, string> = {
  in: 'purchase_receipt',
  out: 'online_sale',
  adjustment: 'adjustment',
  transfer: 'transfer',
};

export class InventoryService {
  constructor(private readonly inventoryRepo: IInventoryRepository) {}

  async getInventorySummary() {
    try {
      const inventory = await this.inventoryRepo.getInventorySummary();
      return { inventory };
    } catch (error: any) {
      logger.error('Inventory fetch error, using fallback', { error: error.message });
      
      const products = await this.inventoryRepo.getProductsFallback();
      const inventoryData = products.map((product: any) => ({
        ...product,
        stock_quantity: product.stock_quantity || 0,
        stock_label: product.stock_quantity === 0 ? 'Out of Stock' : 
                    product.stock_quantity <= 5 ? 'Low Stock' : 'In Stock',
        warehouse_location: 'Main Warehouse',
        minimum_stock: product.minimum_stock || 5,
        available_serials: 0
      }));

      return { inventory: inventoryData };
    }
  }

  async adjustStock(params: {
    productId: string;
    movementType: string;
    quantity: number;
    referenceType?: string;
    notes?: string;
    userId: string;
  }) {
    const validMovementTypes = ['in', 'out', 'adjustment', 'transfer'];
    if (!validMovementTypes.includes(params.movementType)) {
      throw new Error(`Invalid movement_type. Must be one of: ${validMovementTypes.join(', ')}`);
    }

    if (!Number.isSafeInteger(params.quantity) || params.quantity <= 0) {
      throw new Error('quantity must be a positive integer');
    }

    const canonicalMovementType = LEGACY_MOVEMENT_MAP[params.movementType] || params.movementType;

    try {
      const movementId = await this.inventoryRepo.recordAtomicStockMovement({
        productId: params.productId,
        movementType: canonicalMovementType,
        quantity: params.quantity,
        referenceType: params.referenceType || 'api_adjustment',
        notes: params.notes || `Stock ${canonicalMovementType} via API`,
        createdBy: params.userId
      });

      return { movementId };
    } catch (error: any) {
      logger.error('Stock update error', { error: error.message });
      throw new Error(`Atomic stock movement failed: ${error.message}`);
    }
  }

  async setAbsoluteStock(params: {
    productId: string;
    newQuantity: number;
    userId: string;
  }) {
    if (!Number.isSafeInteger(params.newQuantity) || params.newQuantity < 0) {
      throw new Error('new_quantity must be a non-negative integer');
    }

    try {
      const movementId = await this.inventoryRepo.recordAtomicStockMovement({
        productId: params.productId,
        movementType: 'adjustment',
        quantity: params.newQuantity,
        referenceType: 'api_adjustment',
        notes: 'Inventory absolute quantity adjustment',
        createdBy: params.userId
      });

      return { newQuantity: params.newQuantity, movementId };
    } catch (error: any) {
      logger.error('Inventory absolute adjustment error', { error: error.message });
      throw new Error(`Atomic stock adjustment failed: ${error.message}`);
    }
  }
}
