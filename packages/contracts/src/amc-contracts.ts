import { z } from 'zod';

import { apiEnvelope } from './envelope';

export const AmcContractQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  status: z.enum(['ALL', 'ACTIVE', 'EXPIRING', 'EXPIRED', 'DRAFT', 'CANCELLED']).default('ALL'),
});

export const AmcContractSchema = z.object({
  id: z.string(),
  customer_name: z.string().nullish(),
  customer_phone: z.string().nullish(),
  contract_number: z.string().nullish(),
  contract_type: z.string().nullish(),
  end_date: z.string().nullish(),
  annual_value: z.coerce.number().nullish(),
  status: z.string(),
  days_remaining: z.number().int().nullish(),
});

export const AmcContractsSchema = z.object({
  contracts: z.array(AmcContractSchema),
  counts: z.object({
    ACTIVE: z.number().int().nonnegative(),
    EXPIRING: z.number().int().nonnegative(),
    EXPIRED: z.number().int().nonnegative(),
  }),
});

export const AmcContractsResponseSchema = apiEnvelope(AmcContractsSchema);

export type AmcContractQuery = z.infer<typeof AmcContractQuerySchema>;
export type AmcContract = z.infer<typeof AmcContractSchema>;
export type AmcContracts = z.infer<typeof AmcContractsSchema>;
