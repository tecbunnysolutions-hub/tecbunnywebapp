import { z } from 'zod';

import { apiEnvelope } from './envelope';

export const BlueprintSummarySchema = z.object({
  id: z.union([z.string(), z.number()]),
  updated_at: z.string().nullish(),
});

export const BlueprintSchema = z.looseObject({
  id: z.union([z.string(), z.number()]),
  config_payload: z.looseObject({}),
  profiles: z.object({ name: z.string().nullish(), avatar_url: z.string().nullish() }).nullish(),
});

export const BlueprintListDataSchema = z.object({ blueprints: z.array(BlueprintSummarySchema) });
export const BlueprintDataSchema = z.object({ blueprint: BlueprintSchema });

export const BlueprintListResponseSchema = apiEnvelope(BlueprintListDataSchema);
export const BlueprintResponseSchema = apiEnvelope(BlueprintDataSchema);

export type BlueprintSummary = z.infer<typeof BlueprintSummarySchema>;
export type Blueprint = z.infer<typeof BlueprintSchema>;
export type BlueprintListData = z.infer<typeof BlueprintListDataSchema>;
