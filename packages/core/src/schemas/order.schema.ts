import { z } from 'zod';

export const orderItemSchema = z.object({
  id: z.union([z.string(), z.number()]).nullable().optional(),
  productId: z.union([z.string(), z.number()]).nullable().optional(),
  quantity: z.number().positive(),
  price: z.number().min(0),
  name: z.string().nullable().optional(),
  gstRate: z.number().nullable().optional(),
  hsnCode: z.string().nullable().optional(),
  product_type: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  serialNumbers: z.array(z.string()).nullable().optional(),
}).passthrough().refine(data => Boolean(data.id || data.productId), {
  message: "Either id or productId must be provided for an item"
});

export const createOrderSchema = z.object({
  customer_name: z.string().min(1, "Customer name is required"),
  customer_email: z.string().email("Invalid email address"),
  customer_phone: z.string().min(10, "Phone number must be at least 10 digits"),
  customer_id: z.string().nullable().optional(),
  
  // Order Type mapping
  service_type: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  order_type: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  is_service_order: z.boolean().nullable().optional(),
  
  // Location & Supply
  place_of_supply_state_code: z.string().nullable().optional(),
  customer_state_code: z.string().nullable().optional(),
  customer_state: z.string().nullable().optional(),
  delivery_address: z.string().nullable().optional(),
  delivery_pincode: z.string().nullable().optional(),
  place_of_supply: z.string().nullable().optional(),
  pickup_store: z.string().nullable().optional(),
  seller_state_code: z.string().nullable().optional(),

  // Items
  items: z.array(orderItemSchema).min(1, "At least one item is required"),

  // Checkout info
  coupon_code: z.string().nullable().optional(),
  couponCode: z.string().nullable().optional(),
  discount_amount: z.number().min(0).nullable().optional(),
  shipping_amount: z.number().min(0).nullable().optional(),
  part_payment_amount: z.union([z.string(), z.number()]).nullable().optional(),
  payment_method: z.string().nullable().optional(),
  payment_status: z.string().nullable().optional(),
  subtotal: z.number().nullable().optional(),
  gst_amount: z.number().nullable().optional(),
  total: z.number().nullable().optional(),
  status: z.string().nullable().optional(),
  company_gstin: z.string().nullable().optional(),

  // Meta
  agent_id: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  quote_id: z.string().nullable().optional(),
  processed_by: z.string().nullable().optional(),
  idempotency_key: z.string().nullable().optional(),
}).passthrough();

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;

