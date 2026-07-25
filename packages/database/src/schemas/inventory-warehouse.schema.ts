import { z } from 'zod';

export const SerialNumberStatusEnum = z.enum([
  'PURCHASED',
  'RECEIVED',
  'WAREHOUSE',
  'RESERVED',
  'INSTALLED',
  'CUSTOMER',
  'WARRANTY',
  'REPLACEMENT',
  'RETURNED',
]);

export const SerialNumberSchema = z.object({
  id: z.string().uuid(),
  serial_number: z.string(),
  product_id: z.string().uuid(),
  warehouse_id: z.string().uuid().optional(),
  status: SerialNumberStatusEnum.default('WAREHOUSE'),
  customer_id: z.string().uuid().optional(),
  assigned_engineer_id: z.string().uuid().optional(),
  purchase_date: z.string().optional(),
  installation_date: z.string().optional(),
  warranty_expiry_date: z.string().optional(),
});

export const WarehouseSchema = z.object({
  id: z.string().uuid(),
  warehouse_code: z.string(),
  name: z.string(),
  manager_id: z.string().uuid().optional(),
  address: z.string(),
  capacity: z.number().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const WarehouseStockSchema = z.object({
  id: z.string().uuid(),
  warehouse_id: z.string().uuid(),
  product_id: z.string().uuid(),
  available_quantity: z.number().nonnegative().default(0),
  reserved_quantity: z.number().nonnegative().default(0),
  installed_quantity: z.number().nonnegative().default(0),
  damaged_quantity: z.number().nonnegative().default(0),
});

export const VendorSchema = z.object({
  id: z.string().uuid(),
  vendor_code: z.string(),
  company_name: z.string(),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  email: z.string().email(),
  mobile: z.string(),
  rating: z.number().min(0).max(100).default(100),
});

export const PurchaseOrderSchema = z.object({
  id: z.string().uuid(),
  po_number: z.string(),
  vendor_id: z.string().uuid(),
  expected_delivery_date: z.string(),
  total_amount: z.number().nonnegative(),
  status: z.enum(['DRAFT', 'APPROVED', 'SENT', 'PARTIALLY_RECEIVED', 'COMPLETED', 'CANCELLED']).default('DRAFT'),
  created_at: z.string().optional(),
});

export const GoodsReceiptNoteSchema = z.object({
  id: z.string().uuid(),
  grn_number: z.string(),
  po_id: z.string().uuid(),
  vendor_id: z.string().uuid(),
  warehouse_id: z.string().uuid(),
  received_quantity: z.number().positive(),
  accepted_quantity: z.number().nonnegative(),
  rejected_quantity: z.number().nonnegative().default(0),
  remarks: z.string().optional(),
  created_at: z.string().optional(),
});

export const StockTransferSchema = z.object({
  id: z.string().uuid(),
  transfer_number: z.string(),
  from_warehouse_id: z.string().uuid(),
  to_warehouse_id: z.string().uuid(),
  status: z.enum(['PENDING', 'APPROVED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED']).default('PENDING'),
  created_at: z.string().optional(),
});

export const EngineerInventorySchema = z.object({
  id: z.string().uuid(),
  engineer_id: z.string().uuid(),
  product_id: z.string().uuid(),
  assigned_quantity: z.number().nonnegative().default(0),
  used_quantity: z.number().nonnegative().default(0),
  returned_quantity: z.number().nonnegative().default(0),
  damaged_quantity: z.number().nonnegative().default(0),
});

export type SerialNumber = z.infer<typeof SerialNumberSchema>;
export type Warehouse = z.infer<typeof WarehouseSchema>;
export type WarehouseStock = z.infer<typeof WarehouseStockSchema>;
export type Vendor = z.infer<typeof VendorSchema>;
export type PurchaseOrder = z.infer<typeof PurchaseOrderSchema>;
export type GoodsReceiptNote = z.infer<typeof GoodsReceiptNoteSchema>;
export type StockTransfer = z.infer<typeof StockTransferSchema>;
export type EngineerInventory = z.infer<typeof EngineerInventorySchema>;
