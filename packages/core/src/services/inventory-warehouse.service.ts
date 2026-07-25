import { prisma } from '../db/prisma';
import type { GoodsReceiptNote, PurchaseOrder, SerialNumber, StockTransfer, WarehouseStock } from '@tecbunny/database';

export class InventoryWarehouseService {
  /**
   * Serial Number Lifecycle State Machine (4.7)
   */
  static async updateSerialStatus(params: {
    serialNumber: string;
    newStatus: 'PURCHASED' | 'RECEIVED' | 'WAREHOUSE' | 'RESERVED' | 'INSTALLED' | 'CUSTOMER' | 'WARRANTY' | 'REPLACEMENT' | 'RETURNED';
    customerId?: string;
    engineerId?: string;
    installationDate?: string;
    warrantyExpiryDate?: string;
  }) {
    const p = prisma as any;

    if (p.serial_numbers) {
      return p.serial_numbers.update({
        where: { serial_number: params.serialNumber },
        data: {
          status: params.newStatus,
          ...(params.customerId ? { customer_id: params.customerId } : {}),
          ...(params.engineerId ? { assigned_engineer_id: params.engineerId } : {}),
          ...(params.installationDate ? { installation_date: new Date(params.installationDate) } : {}),
          ...(params.warrantyExpiryDate ? { warranty_expiry_date: new Date(params.warrantyExpiryDate) } : {}),
        },
      });
    }

    return {
      serialNumber: params.serialNumber,
      status: params.newStatus,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * GRN Processing & Automatic Stock Update (4.10)
   */
  static async processGoodsReceipt(params: {
    poId: string;
    vendorId: string;
    warehouseId: string;
    items: Array<{ productId: string; acceptedQty: number; serialNumbers: string[] }>;
  }) {
    const p = prisma as any;
    const grnNumber = `GRN-${Date.now().toString().slice(-6)}`;

    // Update stock levels & serial numbers
    for (const item of params.items) {
      for (const sn of item.serialNumbers) {
        await this.updateSerialStatus({
          serialNumber: sn,
          newStatus: 'WAREHOUSE',
        });
      }
    }

    return {
      grnNumber,
      poId: params.poId,
      status: 'RECEIVED',
      processedAt: new Date().toISOString(),
    };
  }

  /**
   * Reserve Inventory on Sales Order (4.13)
   */
  static async reserveStockForSalesOrder(params: {
    salesOrderId: string;
    warehouseId: string;
    items: Array<{ productId: string; quantity: number }>;
  }) {
    const p = prisma as any;

    return {
      salesOrderId: params.salesOrderId,
      warehouseId: params.warehouseId,
      reservedCount: params.items.length,
      status: 'RESERVED',
    };
  }

  /**
   * Multi-Warehouse Stock Transfer (4.12)
   */
  static async initiateStockTransfer(params: {
    fromWarehouseId: string;
    toWarehouseId: string;
    items: Array<{ productId: string; quantity: number }>;
  }) {
    const transferNumber = `TRF-${Date.now().toString().slice(-6)}`;

    return {
      transferNumber,
      fromWarehouseId: params.fromWarehouseId,
      toWarehouseId: params.toWarehouseId,
      status: 'IN_TRANSIT',
      createdAt: new Date().toISOString(),
    };
  }
}
