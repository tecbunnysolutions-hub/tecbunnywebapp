import { z } from 'zod';

import { apiEnvelope } from './envelope';

// Home content: values are CMS-authored JSON, so the contract passes them through untouched.
export const HomeContentDataSchema = z.object({
  partnerBrands: z.unknown().nullable(),
  heroCarousel: z.unknown().nullable(),
});

export const FaqSchema = z.object({
  id: z.string(),
  category: z.string(),
  question: z.string(),
  answer: z.string(),
  display_order: z.number(),
});

export const FaqListDataSchema = z.object({ faqs: z.array(FaqSchema) });

export const ServiceRowSchema = z.looseObject({});

export const ServiceListDataSchema = z.object({ services: z.array(ServiceRowSchema) });

export const HomeContentResponseSchema = apiEnvelope(HomeContentDataSchema);
export const FaqListResponseSchema = apiEnvelope(FaqListDataSchema);
export const ServiceListResponseSchema = apiEnvelope(ServiceListDataSchema);

export type HomeContentData = z.infer<typeof HomeContentDataSchema>;
export type Faq = z.infer<typeof FaqSchema>;
export type FaqListData = z.infer<typeof FaqListDataSchema>;
export type ServiceRow = z.infer<typeof ServiceRowSchema>;
export type ServiceListData = z.infer<typeof ServiceListDataSchema>;
