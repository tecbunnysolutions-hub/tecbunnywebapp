import { z } from 'zod';

export const CommunicationChannelEnum = z.enum(['EMAIL', 'WHATSAPP', 'SMS', 'PUSH', 'IN_APP']);

export const CommunicationRecordSchema = z.object({
  id: z.string().uuid(),
  customer_id: z.string().uuid().optional(),
  channel: CommunicationChannelEnum,
  recipient: z.string(),
  subject_title: z.string().optional(),
  body_message: z.string(),
  media_url: z.string().url().optional(),
  status: z.enum(['QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED']).default('QUEUED'),
  delivery_timestamp: z.string().optional(),
  created_at: z.string().optional(),
});

export const NotificationTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  channel: CommunicationChannelEnum,
  subject_template: z.string().optional(),
  body_template: z.string(),
  placeholders: z.array(z.string()).default([]),
  is_system: z.boolean().default(true),
});

export const CampaignSchema = z.object({
  id: z.string().uuid(),
  campaign_name: z.string(),
  channel: CommunicationChannelEnum,
  template_id: z.string().uuid(),
  target_audience_filter: z.record(z.string(), z.any()).optional(),
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SCHEDULED', 'RUNNING', 'COMPLETED']).default('DRAFT'),
  scheduled_at: z.string().optional(),
  sent_count: z.number().int().nonnegative().default(0),
  delivered_count: z.number().int().nonnegative().default(0),
  opened_count: z.number().int().nonnegative().default(0),
});

export const FailedMessageQueueSchema = z.object({
  id: z.string().uuid(),
  communication_id: z.string().uuid(),
  retry_count: z.number().int().nonnegative().default(0),
  max_retries: z.number().int().default(3),
  error_reason: z.string(),
  next_retry_at: z.string(),
});

export type CommunicationRecord = z.infer<typeof CommunicationRecordSchema>;
export type NotificationTemplate = z.infer<typeof NotificationTemplateSchema>;
export type Campaign = z.infer<typeof CampaignSchema>;
export type FailedMessageQueue = z.infer<typeof FailedMessageQueueSchema>;
