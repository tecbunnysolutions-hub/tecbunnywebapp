import { z } from 'zod';

import { apiEnvelope } from './envelope';

const Row = z.looseObject({});

export const AdminOrdersQuerySchema = z.object({
  type: z.string().trim().min(1).max(40).optional(),
  status: z.string().trim().min(1).max(40).optional(),
  paymentStatus: z.string().trim().min(1).max(40).optional(),
  /** `me` or a user id; other users' ids are honoured only for admin roles. */
  processedBy: z.string().trim().min(1).max(64).optional(),
  /** Case-insensitive substring match on the order id. */
  search: z.string().trim().min(1).max(64).optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
});
export type AdminOrdersQuery = z.infer<typeof AdminOrdersQuerySchema>;

export const AdminOrdersSchema = z.object({ orders: z.array(Row), total: z.number().int().nonnegative() });
export const AdminOrdersResponseSchema = apiEnvelope(AdminOrdersSchema);
export type AdminOrders = z.infer<typeof AdminOrdersSchema>;
