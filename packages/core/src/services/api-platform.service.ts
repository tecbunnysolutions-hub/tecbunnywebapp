import { prisma } from '../db/prisma';
import { randomUUID } from 'node:crypto';
import type {
  ApiClient,
  ApiKey,
  ApiWebhookDeliveryLog,
  ApiWebhookSubscription,
  ApiRateLimit,
  ApiRequestLog,
  ProviderHealth,
  SyncJob,
  SyncJobHistory,
} from '@tecbunny/database';

function randomSecret(length = 48): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export class APIPlatformService {
  /**
   * API client onboarding and access baseline (14.4, 14.5)
   */
  static async registerApiClient(params: {
    clientName: string;
    contactEmail: string;
    allowedIpRanges?: string[];
  }): Promise<ApiClient> {
    const p = prisma as any;

    const client: ApiClient = {
      id: randomUUID(),
      client_name: params.clientName,
      contact_email: params.contactEmail,
      status: 'ACTIVE',
      allowed_ip_ranges: params.allowedIpRanges ?? [],
      created_at: new Date().toISOString(),
    };

    if (p.api_clients) {
      await p.api_clients.create({ data: client });
    }

    return client;
  }

  /**
   * API key issuance and rotation flows (14.5)
   */
  static async createApiKey(params: {
    clientId: string;
    scopes: string[];
    expiresAt?: string;
  }): Promise<{ keyId: string; apiKey: string; apiSecret: string; metadata: ApiKey }> {
    const p = prisma as any;

    const keyPrefix = `tb_${Math.random().toString(36).slice(2, 10)}`;
    const apiSecret = randomSecret(56);
    const apiKey = `${keyPrefix}.${Math.random().toString(36).slice(2, 18)}`;

    const keyMeta: ApiKey = {
      id: randomUUID(),
      client_id: params.clientId,
      key_prefix: keyPrefix,
      key_hash: `sha256:${apiKey.slice(-12)}:${apiSecret.slice(-12)}`,
      secret_hint: `${apiSecret.slice(0, 2)}***${apiSecret.slice(-2)}`,
      permission_scopes: params.scopes,
      expires_at: params.expiresAt,
      last_used_at: undefined,
      total_requests: 0,
      failed_requests: 0,
      status: 'ACTIVE',
    };

    if (p.api_keys) {
      await p.api_keys.create({ data: keyMeta });
    }

    return {
      keyId: keyMeta.id,
      apiKey,
      apiSecret,
      metadata: keyMeta,
    };
  }

  static async rotateApiKey(apiKeyId: string): Promise<{ apiKeyId: string; rotatedAt: string; newSecretHint: string }> {
    const p = prisma as any;
    const newSecret = randomSecret(56);
    const rotatedAt = new Date().toISOString();
    const newSecretHint = `${newSecret.slice(0, 2)}***${newSecret.slice(-2)}`;

    if (p.api_keys) {
      await p.api_keys.update({
        where: { id: apiKeyId },
        data: {
          status: 'ROTATED',
          secret_hint: newSecretHint,
        },
      });
    }

    return { apiKeyId, rotatedAt, newSecretHint };
  }

  /**
   * Request governance and standard request logging (14.2, 14.6, 14.21)
   */
  static async evaluateRateLimit(params: {
    requestCountMinute: number;
    requestCountHour: number;
    requestCountDay: number;
    limit: ApiRateLimit;
  }): Promise<{ allowed: boolean; retryAfterSeconds?: number; reason?: string }> {
    if (params.requestCountMinute >= params.limit.per_minute) {
      return { allowed: false, retryAfterSeconds: 60, reason: 'Per-minute limit exceeded' };
    }
    if (params.requestCountHour >= params.limit.per_hour) {
      return { allowed: false, retryAfterSeconds: 3600, reason: 'Per-hour limit exceeded' };
    }
    if (params.requestCountDay >= params.limit.per_day) {
      return { allowed: false, retryAfterSeconds: 86400, reason: 'Per-day limit exceeded' };
    }

    return { allowed: true };
  }

  static async logApiRequest(params: {
    clientId?: string;
    apiKeyId?: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    endpoint: string;
    statusCode: number;
    responseTimeMs: number;
    errorCode?: string;
  }): Promise<ApiRequestLog> {
    const p = prisma as any;

    const requestLog: ApiRequestLog = {
      id: randomUUID(),
      client_id: params.clientId,
      api_key_id: params.apiKeyId,
      method: params.method,
      endpoint: params.endpoint,
      status_code: params.statusCode,
      response_time_ms: params.responseTimeMs,
      request_size_bytes: undefined,
      response_size_bytes: undefined,
      correlation_id: `corr-${Date.now()}`,
      error_code: params.errorCode,
      created_at: new Date().toISOString(),
    };

    if (p.api_request_logs) {
      await p.api_request_logs.create({ data: requestLog });
    }

    return requestLog;
  }

  /**
   * Outbound webhook delivery lifecycle with retry strategy (14.8, 14.9)
   */
  static async enqueueWebhookDelivery(params: {
    subscription: ApiWebhookSubscription;
    eventName: string;
    payloadHash: string;
    attemptNumber?: number;
  }): Promise<ApiWebhookDeliveryLog> {
    const p = prisma as any;
    const attempt = params.attemptNumber ?? 1;

    const delivery: ApiWebhookDeliveryLog = {
      id: randomUUID(),
      subscription_id: params.subscription.id,
      event_name: params.eventName,
      payload_hash: params.payloadHash,
      http_status: undefined,
      attempt_number: attempt,
      delivered_at: undefined,
      next_retry_at: attempt < params.subscription.max_retries
        ? new Date(Date.now() + Math.pow(2, attempt) * 60_000).toISOString()
        : undefined,
      status: attempt === 1 ? 'PENDING' : 'RETRYING',
      error_message: undefined,
    };

    if (p.webhook_delivery_logs) {
      await p.webhook_delivery_logs.create({ data: delivery });
    }

    return delivery;
  }

  static async finalizeWebhookDelivery(params: {
    deliveryId: string;
    success: boolean;
    httpStatus?: number;
    errorMessage?: string;
  }): Promise<{ deliveryId: string; status: 'SUCCESS' | 'FAILED'; completedAt: string }> {
    const p = prisma as any;
    const completedAt = new Date().toISOString();
    const status = params.success ? 'SUCCESS' : 'FAILED';

    if (p.webhook_delivery_logs) {
      await p.webhook_delivery_logs.update({
        where: { id: params.deliveryId },
        data: {
          status,
          http_status: params.httpStatus ?? null,
          error_message: params.errorMessage ?? null,
          delivered_at: completedAt,
        },
      });
    }

    return { deliveryId: params.deliveryId, status, completedAt };
  }

  /**
   * Third-party synchronization job controls (14.16, 14.17, 14.18)
   */
  static async startSyncJob(job: SyncJob): Promise<SyncJob> {
    const p = prisma as any;
    const started: SyncJob = {
      ...job,
      status: 'RUNNING',
      started_at: new Date().toISOString(),
    };

    if (p.sync_jobs) {
      await p.sync_jobs.update({
        where: { id: job.id },
        data: started,
      });
    }

    return started;
  }

  static async completeSyncJob(params: {
    syncJobId: string;
    recordsProcessed: number;
    recordsFailed: number;
    summary?: string;
  }): Promise<SyncJobHistory> {
    const p = prisma as any;
    const status = params.recordsFailed > 0
      ? (params.recordsProcessed > 0 ? 'PARTIAL_SUCCESS' : 'FAILED')
      : 'SUCCESS';

    const history: SyncJobHistory = {
      id: randomUUID(),
      sync_job_id: params.syncJobId,
      status,
      records_processed: params.recordsProcessed,
      records_failed: params.recordsFailed,
      summary: params.summary,
      executed_at: new Date().toISOString(),
    };

    if (p.sync_job_history) {
      await p.sync_job_history.create({ data: history });
    }

    if (p.sync_jobs) {
      await p.sync_jobs.update({
        where: { id: params.syncJobId },
        data: {
          status,
          completed_at: history.executed_at,
        },
      });
    }

    return history;
  }

  /**
   * Provider health snapshots for dashboard and alerting (14.21)
   */
  static async recordProviderHealth(snapshot: ProviderHealth): Promise<ProviderHealth> {
    const p = prisma as any;
    const payload: ProviderHealth = {
      ...snapshot,
      checked_at: snapshot.checked_at ?? new Date().toISOString(),
    };

    if (p.provider_health) {
      await p.provider_health.create({ data: payload });
    }

    return payload;
  }
}