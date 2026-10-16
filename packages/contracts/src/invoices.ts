import { z } from 'zod';

import { apiEnvelope } from './envelope';

const Row = z.looseObject({});

export const InvoiceDataSchema = z.object({ order: Row, products: z.array(Row) });
export const InvoiceDataResponseSchema = apiEnvelope(InvoiceDataSchema);
export type InvoiceData = z.infer<typeof InvoiceDataSchema>;

