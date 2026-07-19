export type TecBunnyApplication =
  | 'public'
  | 'customer'
  | 'mgmt'
  | 'superadmin'
  | 'waba'
  | 'webmail'
  | 'api'
  | 'chrome_extension'
  | 'shared_package';

export type EnterpriseEventCategory =
  | 'user'
  | 'business'
  | 'sales'
  | 'revenue'
  | 'inventory'
  | 'crm'
  | 'marketing'
  | 'support'
  | 'service'
  | 'engineer'
  | 'employee'
  | 'api'
  | 'database'
  | 'performance'
  | 'system'
  | 'security'
  | 'storage'
  | 'ai'
  | 'gemini'
  | 'notification'
  | 'email'
  | 'whatsapp'
  | 'search'
  | 'feature_usage'
  | 'dashboard'
  | 'error';

export type EnterprisePriority = 'low' | 'medium' | 'high' | 'critical';

export type EnterpriseActorContext = {
  userId?: string | null;
  userEmail?: string | null;
  role?: string | null;
  companyId?: string | null;
  companyName?: string | null;
  branchId?: string | null;
  branchName?: string | null;
  department?: string | null;
  sessionId?: string | null;
  requestId?: string | null;
};

export type EnterpriseAnalyticsEvent = {
  eventName: string;
  eventCategory: EnterpriseEventCategory;
  description?: string;
  application: TecBunnyApplication | string;
  module?: string;
  screen?: string;
  action?: string;
  trigger?: string;
  priority?: EnterprisePriority;
  context?: EnterpriseActorContext;
  entityType?: string;
  entityId?: string;
  databaseTable?: string;
  apiEndpoint?: string;
  httpMethod?: string;
  httpStatus?: number;
  executionTimeMs?: number;
  success?: boolean;
  value?: number;
  currency?: string;
  dashboard?: string;
  retentionPeriod?: string;
  metadata?: Record<string, unknown>;
  occurredAt?: string;
};

export type StaffActivityEvent = Omit<EnterpriseAnalyticsEvent, 'eventCategory' | 'eventName'> & {
  action: string;
  module: string;
  description?: string;
};

export type AuditEvent = StaffActivityEvent & {
  entityType: string;
  oldValue?: unknown;
  newValue?: unknown;
  reason?: string;
  remarks?: string;
};

function analyticsEndpoint(path: string) {
  const baseUrl = typeof process !== 'undefined'
    ? process.env.NEXT_PUBLIC_ENTERPRISE_ANALYTICS_URL || process.env.NEXT_PUBLIC_API_URL || ''
    : '';
  return `${baseUrl}${path}`;
}

async function postEnterpriseEvent(path: string, payload: Record<string, unknown>) {
  try {
    const response = await fetch(analyticsEndpoint(path), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: typeof window !== 'undefined',
    });

    return { success: response.ok, status: response.status };
  } catch (error) {
    return { success: false, error };
  }
}

export function trackEnterpriseEvent(event: EnterpriseAnalyticsEvent) {
  return postEnterpriseEvent('/api/analytics/track', {
    ...event,
    eventType: event.eventName,
  });
}

export function logStaffActivity(event: StaffActivityEvent) {
  return postEnterpriseEvent('/api/enterprise-analytics/staff-logs', {
    ...event,
    logType: 'staff_activity',
    eventType: event.action,
  });
}

export function logAuditEvent(event: AuditEvent) {
  return postEnterpriseEvent('/api/enterprise-analytics/audit-logs', {
    ...event,
    logType: 'audit',
    eventType: event.action,
  });
}

export async function withStaffActivity<T>(event: StaffActivityEvent, fn: () => Promise<T> | T): Promise<T> {
  const started = Date.now();
  try {
    const result = await fn();
    void logStaffActivity({ ...event, success: true, executionTimeMs: Date.now() - started });
    return result;
  } catch (error) {
    void logStaffActivity({
      ...event,
      success: false,
      executionTimeMs: Date.now() - started,
      metadata: { ...(event.metadata ?? {}), error: error instanceof Error ? error.message : String(error) },
    });
    throw error;
  }
}

export async function withAuditEvent<T>(event: AuditEvent, fn: () => Promise<T> | T): Promise<T> {
  const started = Date.now();
  try {
    const result = await fn();
    void logAuditEvent({ ...event, success: true, executionTimeMs: Date.now() - started });
    return result;
  } catch (error) {
    void logAuditEvent({
      ...event,
      success: false,
      executionTimeMs: Date.now() - started,
      metadata: { ...(event.metadata ?? {}), error: error instanceof Error ? error.message : String(error) },
    });
    throw error;
  }
}