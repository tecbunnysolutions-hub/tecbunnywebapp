import { z } from 'zod';

import { apiEnvelope, paginationQuery } from './envelope';

// Products are wide, schema-evolving rows; the contract pins identity and passes the rest through.
export const ProductSchema = z.looseObject({
  id: z.union([z.string(), z.number()]),
});

export const AutoOfferSchema = z.looseObject({
  id: z.union([z.string(), z.number()]).optional(),
});

export const ProductListQuerySchema = paginationQuery({ pageSize: 200, maxPageSize: 500 });

export const ProductListDataSchema = z.object({
  products: z.array(ProductSchema),
  offers: z.array(AutoOfferSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});

export const ProductDataSchema = z.object({ product: ProductSchema });
export const ProductResponseSchema = apiEnvelope(ProductDataSchema);

export const ProductListResponseSchema = apiEnvelope(ProductListDataSchema);

export type Product = z.infer<typeof ProductSchema>;
export type AutoOffer = z.infer<typeof AutoOfferSchema>;
export type ProductListQuery = z.infer<typeof ProductListQuerySchema>;
export type ProductListData = z.infer<typeof ProductListDataSchema>;
