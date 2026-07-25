import { z } from 'zod';

export const QuotationStatusEnum = z.enum([
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'SENT',
  'VIEWED',
  'NEGOTIATION',
  'ACCEPTED',
  'REJECTED',
  'EXPIRED',
  'CONVERTED',
]);

export const BOQItemSchema = z.object({
  id: z.string().uuid().optional(),
  category: z.string(),
  product_id: z.string().uuid().optional(),
  item_name: z.string(),
  description: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  quantity: z.number().positive(),
  unit: z.string().default('Pcs'),
  unit_price: z.number().nonnegative(),
  discount_percentage: z.number().min(0).max(100).default(0),
  gst_percentage: z.number().min(0).default(18),
  hsn_sac_code: z.string().optional(),
  total_amount: z.number().nonnegative(),
});

export const QuotationSchema = z.object({
  id: z.string().uuid(),
  quotation_number: z.string(),
  revision_number: z.number().int().default(1),
  lead_id: z.string().uuid().optional(),
  customer_id: z.string().uuid(),
  branch_id: z.string().uuid().optional(),
  opportunity_id: z.string().uuid().optional(),
  salesperson_id: z.string().uuid(),
  quotation_date: z.string(),
  expiry_date: z.string(),
  status: QuotationStatusEnum.default('DRAFT'),
  subtotal: z.number().nonnegative(),
  service_total: z.number().nonnegative().default(0),
  discount_total: z.number().nonnegative().default(0),
  gst_total: z.number().nonnegative(),
  cgst: z.number().nonnegative().default(0),
  sgst: z.number().nonnegative().default(0),
  igst: z.number().nonnegative().default(0),
  grand_total: z.number().nonnegative(),
  payment_terms: z.string().optional(),
  delivery_terms: z.string().optional(),
  notes: z.string().optional(),
  digital_signature: z.string().optional(),
  approved_at: z.string().optional(),
  created_at: z.string().optional(),
});

export const SalesOrderSchema = z.object({
  id: z.string().uuid(),
  sales_order_number: z.string(),
  quotation_id: z.string().uuid(),
  customer_id: z.string().uuid(),
  total_amount: z.number().nonnegative(),
  status: z.enum(['CONFIRMED', 'IN_PROGRESS', 'FULFILLED', 'CANCELLED']).default('CONFIRMED'),
  created_at: z.string().optional(),
});

export const PaymentRecordSchema = z.object({
  id: z.string().uuid(),
  sales_order_id: z.string().uuid(),
  invoice_id: z.string().uuid().optional(),
  amount: z.number().positive(),
  payment_mode: z.enum(['UPI', 'BANK_TRANSFER', 'CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'CHEQUE']),
  transaction_reference: z.string(),
  payment_type: z.enum(['ADVANCE', 'PARTIAL', 'FULL']),
  payment_date: z.string(),
  status: z.enum(['SUCCESS', 'PENDING', 'FAILED']).default('SUCCESS'),
});

export const InvoiceSchema = z.object({
  id: z.string().uuid(),
  invoice_number: z.string(),
  sales_order_id: z.string().uuid(),
  customer_id: z.string().uuid(),
  gstin: z.string().optional(),
  subtotal: z.number().nonnegative(),
  tax_total: z.number().nonnegative(),
  grand_total: z.number().nonnegative(),
  status: z.enum(['DRAFT', 'ISSUED', 'PAID', 'OVERDUE', 'CANCELLED']).default('ISSUED'),
  created_at: z.string().optional(),
});

export type BOQItem = z.infer<typeof BOQItemSchema>;
export type Quotation = z.infer<typeof QuotationSchema>;
export type SalesOrder = z.infer<typeof SalesOrderSchema>;
export type PaymentRecord = z.infer<typeof PaymentRecordSchema>;
export type Invoice = z.infer<typeof InvoiceSchema>;
