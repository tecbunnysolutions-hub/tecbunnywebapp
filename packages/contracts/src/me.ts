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

export const MeProfileSchema = z.object({ profile: Row.nullable() });
export const MeProfileResponseSchema = apiEnvelope(MeProfileSchema);
export type MeProfile = z.infer<typeof MeProfileSchema>;


export const MeOrderSchema = z.object({ order: Row });
export type MeOrder = z.infer<typeof MeOrderSchema>;
