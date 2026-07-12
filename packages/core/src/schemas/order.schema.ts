import { z } from 'zod';

export const orderItemSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  productId: z.union([z.string(), z.number()]).optional(),
  quantity: z.number().positive(),
  price: z.number().min(0),
}).refine(data => data.id || data.productId, {
  message: "Either id or productId must be provided for an item"
});

export const createOrderSchema = z.object({
  customer_name: z.string().min(1, "Customer name is required"),
  customer_email: z.string().email("Invalid email address"),
  customer_phone: z.string().min(10, "Phone number must be at least 10 digits"),
  
  // Order Type mapping
  service_type: z.string().optional(),
  type: z.string().optional(),
  order_type: z.string().optional(),
  category: z.string().optional(),
  is_service_order: z.boolean().optional(),
  
  // Location & Supply
  place_of_supply_state_code: z.string().optional(),
  customer_state_code: z.string().optional(),
  customer_state: z.string().optional(),
  delivery_address: z.string().optional(),
  delivery_pincode: z.string().optional(),
  place_of_supply: z.string().optional(),
  pickup_store: z.string().optional(),

  // Items
  items: z.array(orderItemSchema).min(1, "At least one item is required"),

  // Checkout info
  coupon_code: z.string().optional(),
  couponCode: z.string().optional(),
  discount_amount: z.number().min(0).optional(),
  shipping_amount: z.number().min(0).optional(),
  part_payment_amount: z.union([z.string(), z.number()]).optional(),
  payment_method: z.string().optional(),
  payment_status: z.string().optional(),

  // Meta
  agent_id: z.string().optional(),
  notes: z.string().optional(),
  quote_id: z.string().optional()
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
