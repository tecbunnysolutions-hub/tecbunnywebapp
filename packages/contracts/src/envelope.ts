import { z } from 'zod';

export const ApiErrorItemSchema = z.object({
  code: z.string(),
  message: z.string(),
  field: z.string().optional(),
  details: z.record(z.string(), z.unknown()).optional(),
});

export const ApiMetaSchema = z.looseObject({
  requestId: z.string().nullish(),
  version: z.string().optional(),
});

export const apiEnvelope = <T extends z.ZodType>(data: T) =>
  z.object({
    success: z.boolean(),
    message: z.string(),
    data: data.nullable(),
    errors: z.array(ApiErrorItemSchema),
    meta: ApiMetaSchema,
  });

export type ApiErrorItem = z.infer<typeof ApiErrorItemSchema>;
export type ApiMeta = z.infer<typeof ApiMetaSchema>;
export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T | null;
  errors: ApiErrorItem[];
  meta: ApiMeta;
};

export const paginationQuery = (defaults: { pageSize: number; maxPageSize: number }) =>
  z.object({
    page: z.coerce.number().int().min(1).max(10_000).default(1),
    pageSize: z.coerce.number().int().min(1).max(defaults.maxPageSize).default(defaults.pageSize),
  });
