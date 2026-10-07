import { z } from 'zod';

import { apiEnvelope } from './envelope';

const Row = z.looseObject({});

export const MeOverviewSchema = z.object({
  profile: Row.nullable(),
  salesAgent: Row.nullable(),
  orders: z.array(Row),
  serviceTickets: z.array(Row),
  quotes: z.array(Row),
});

export const MeOverviewResponseSchema = apiEnvelope(MeOverviewSchema);

export type MeOverview = z.infer<typeof MeOverviewSchema>;
