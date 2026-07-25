import { z } from 'zod';

export const WorkflowTriggerEnum = z.enum([
  'LEAD_CREATED',
  'QUOTATION_APPROVED',
  'ORDER_CONFIRMED',
  'LOW_STOCK_ALERT',
  'PROJECT_CREATED',
  'TICKET_CREATED',
  'SLA_BREACHED',
  'INVOICE_OVERDUE',
  'CRON_SCHEDULE',
]);

export const WorkflowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  trigger_event: WorkflowTriggerEnum,
  status: z.enum(['DRAFT', 'PUBLISHED', 'DISABLED', 'ARCHIVED']).default('DRAFT'),
  version: z.number().int().default(1),
  created_by_id: z.string().uuid(),
  created_at: z.string().optional(),
});

export const WorkflowExecutionSchema = z.object({
  id: z.string().uuid(),
  workflow_id: z.string().uuid(),
  trigger_event: z.string(),
  start_time: z.string(),
  end_time: z.string().optional(),
  status: z.enum(['RUNNING', 'SUCCESS', 'FAILED', 'TIMED_OUT']).default('RUNNING'),
  error_message: z.string().optional(),
});

export const BusinessRuleSchema = z.object({
  id: z.string().uuid(),
  rule_name: z.string(),
  module: z.enum(['SALES', 'INVENTORY', 'PROJECTS', 'SERVICE', 'FINANCE', 'HR']),
  condition_expression: z.string(),
  action_type: z.enum(['REQUIRE_APPROVAL', 'BLOCK_OPERATION', 'RAISE_ALERT', 'AUTO_ASSIGN']),
  is_enabled: z.boolean().default(true),
});

export const WebhookSubscriptionSchema = z.object({
  id: z.string().uuid(),
  event_name: z.string(),
  target_url: z.string().url(),
  secret_key: z.string(),
  is_active: z.boolean().default(true),
});

export type Workflow = z.infer<typeof WorkflowSchema>;
export type WorkflowExecution = z.infer<typeof WorkflowExecutionSchema>;
export type BusinessRule = z.infer<typeof BusinessRuleSchema>;
export type WebhookSubscription = z.infer<typeof WebhookSubscriptionSchema>;
