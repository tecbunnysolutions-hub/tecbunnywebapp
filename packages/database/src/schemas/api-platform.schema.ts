import { z } from 'zod';

export const ApiVersionStatusEnum = z.enum(['ACTIVE', 'DEPRECATED', 'SUNSET']);
export const ApiClientStatusEnum = z.enum(['ACTIVE', 'SUSPENDED', 'REVOKED']);
export const ApiKeyStatusEnum = z.enum(['ACTIVE', 'EXPIRED', 'REVOKED', 'ROTATED']);
export const HttpMethodEnum = z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
export const SyncJobStatusEnum = z.enum(['PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'PARTIAL_SUCCESS']);
export const ProviderHealthStatusEnum = z.enum(['UP', 'DEGRADED', 'DOWN']);

export const ApiVersionSchema = z.object({
  id: z.string().uuid(),
  version: z.string(),
  base_path: z.string(),
  status: ApiVersionStatusEnum.default('ACTIVE'),
  deprecated_at: z.string().optional(),
  sunset_at: z.string().optional(),
});

export const ApiClientSchema = z.object({
  id: z.string().uuid(),
  client_name: z.string(),
  contact_email: z.string().email(),
  status: ApiClientStatusEnum.default('ACTIVE'),
  allowed_ip_ranges: z.array(z.string()).default([]),
  created_at: z.string().optional(),
});

export const ApiPermissionSchema = z.object({
  id: z.string().uuid(),
  resource: z.string(),
  action: z.string(),
  description: z.string().optional(),
});

export const ApiKeySchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid(),
  key_prefix: z.string(),
  key_hash: z.string(),
  secret_hint: z.string().optional(),
  permission_scopes: z.array(z.string()).default([]),
  expires_at: z.string().optional(),
  last_used_at: z.string().optional(),
  total_requests: z.number().int().nonnegative().default(0),
  failed_requests: z.number().int().nonnegative().default(0),
  status: ApiKeyStatusEnum.default('ACTIVE'),
});

export const ApiRateLimitSchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid(),
  per_minute: z.number().int().positive(),
  per_hour: z.number().int().positive(),
  per_day: z.number().int().positive(),
  burst_limit: z.number().int().positive().optional(),
});

export const ApiRequestLogSchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid().optional(),
  api_key_id: z.string().uuid().optional(),
  method: HttpMethodEnum,
  endpoint: z.string(),
  status_code: z.number().int(),
  response_time_ms: z.number().nonnegative(),
  request_size_bytes: z.number().nonnegative().optional(),
  response_size_bytes: z.number().nonnegative().optional(),
  correlation_id: z.string(),
  error_code: z.string().optional(),
  created_at: z.string().optional(),
});

export const ApiWebhookSubscriptionSchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid(),
  callback_url: z.string().url(),
  secret: z.string(),
  headers: z.record(z.string(), z.string()).default({}),
  events: z.array(z.string()).default([]),
  max_retries: z.number().int().positive().default(3),
  status: z.enum(['ACTIVE', 'PAUSED', 'DISABLED']).default('ACTIVE'),
});

export const ApiWebhookDeliveryLogSchema = z.object({
  id: z.string().uuid(),
  subscription_id: z.string().uuid(),
  event_name: z.string(),
  payload_hash: z.string(),
  http_status: z.number().int().optional(),
  attempt_number: z.number().int().positive(),
  delivered_at: z.string().optional(),
  next_retry_at: z.string().optional(),
  status: z.enum(['PENDING', 'SUCCESS', 'FAILED', 'RETRYING']).default('PENDING'),
  error_message: z.string().optional(),
});

export const IntegrationProviderSchema = z.object({
  id: z.string().uuid(),
  provider_type: z.enum(['PAYMENT', 'EMAIL', 'WHATSAPP', 'SMS', 'MAPS', 'STORAGE', 'ACCOUNTING', 'CALENDAR']),
  provider_name: z.string(),
  is_primary: z.boolean().default(false),
  is_enabled: z.boolean().default(true),
});

export const IntegrationSettingSchema = z.object({
  id: z.string().uuid(),
  provider_id: z.string().uuid(),
  key: z.string(),
  value_encrypted: z.string(),
  updated_at: z.string().optional(),
});

export const SyncJobSchema = z.object({
  id: z.string().uuid(),
  integration_type: z.enum(['ACCOUNTING', 'CALENDAR', 'CRM_IMPORT', 'INVENTORY_IMPORT', 'EXPORT']),
  trigger_mode: z.enum(['MANUAL', 'SCHEDULED', 'WEBHOOK']),
  status: SyncJobStatusEnum.default('PENDING'),
  last_cursor: z.string().optional(),
  started_at: z.string().optional(),
  completed_at: z.string().optional(),
});

export const SyncJobHistorySchema = z.object({
  id: z.string().uuid(),
  sync_job_id: z.string().uuid(),
  status: SyncJobStatusEnum,
  records_processed: z.number().int().nonnegative().default(0),
  records_failed: z.number().int().nonnegative().default(0),
  summary: z.string().optional(),
  executed_at: z.string().optional(),
});

export const PaymentTransactionSchema = z.object({
  id: z.string().uuid(),
  provider_id: z.string().uuid(),
  reference_number: z.string(),
  amount: z.number().nonnegative(),
  currency: z.string().default('INR'),
  status: z.enum(['CREATED', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED']).default('CREATED'),
  settlement_status: z.enum(['PENDING', 'SETTLED', 'FAILED']).default('PENDING'),
  external_transaction_id: z.string().optional(),
  created_at: z.string().optional(),
});

export const ProviderHealthSchema = z.object({
  id: z.string().uuid(),
  provider_id: z.string().uuid(),
  status: ProviderHealthStatusEnum,
  response_time_ms: z.number().nonnegative(),
  error_rate_percent: z.number().min(0).max(100),
  checked_at: z.string().optional(),
});

export const DeveloperApplicationSchema = z.object({
  id: z.string().uuid(),
  app_name: z.string(),
  owner_name: z.string(),
  owner_email: z.string().email(),
  client_id: z.string().uuid(),
  oauth_redirect_urls: z.array(z.string().url()).default([]),
  status: z.enum(['PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED']).default('PENDING_APPROVAL'),
  created_at: z.string().optional(),
});

export type ApiVersion = z.infer<typeof ApiVersionSchema>;
export type ApiClient = z.infer<typeof ApiClientSchema>;
export type ApiPermission = z.infer<typeof ApiPermissionSchema>;
export type ApiKey = z.infer<typeof ApiKeySchema>;
export type ApiRateLimit = z.infer<typeof ApiRateLimitSchema>;
export type ApiRequestLog = z.infer<typeof ApiRequestLogSchema>;
export type ApiWebhookSubscription = z.infer<typeof ApiWebhookSubscriptionSchema>;
export type ApiWebhookDeliveryLog = z.infer<typeof ApiWebhookDeliveryLogSchema>;
export type IntegrationProvider = z.infer<typeof IntegrationProviderSchema>;
export type IntegrationSetting = z.infer<typeof IntegrationSettingSchema>;
export type SyncJob = z.infer<typeof SyncJobSchema>;
export type SyncJobHistory = z.infer<typeof SyncJobHistorySchema>;
export type PaymentTransaction = z.infer<typeof PaymentTransactionSchema>;
export type ProviderHealth = z.infer<typeof ProviderHealthSchema>;
export type DeveloperApplication = z.infer<typeof DeveloperApplicationSchema>;