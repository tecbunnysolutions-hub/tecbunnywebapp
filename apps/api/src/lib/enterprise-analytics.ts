import { createClient } from '@supabase/supabase-js';
import { requireSupabaseServiceEnv } from '@tecbunny/database';

type JsonRecord = Record<string, unknown>;

const SENSITIVE_KEY_PATTERN = /password|passcode|token|secret|api[_-]?key|authorization|cookie|otp|pin|card|cvv|pan|aadhaar/i;

export function getEnterpriseServiceClient() {
  const { url, serviceKey } = requireSupabaseServiceEnv();
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function maskSensitive(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(maskSensitive);
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(Object.entries(value as JsonRecord).map(([key, entry]) => [
    key,
    SENSITIVE_KEY_PATTERN.test(key) ? '[MASKED]' : maskSensitive(entry),
  ]));
}

export function pickString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

export function pickNullableString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function pickBoolean(value: unknown, fallback = true) {
  return typeof value === 'boolean' ? value : fallback;
}

export function pickNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function requestIp(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwardedFor || request.headers.get('x-real-ip') || null;
}

export function requestUserAgent(request: Request) {
  const userAgent = request.headers.get('user-agent') || '';
  const browser = userAgent.includes('Chrome') ? 'Chrome' : userAgent.includes('Firefox') ? 'Firefox' : userAgent.includes('Safari') ? 'Safari' : userAgent ? 'Other' : null;
  const operatingSystem = userAgent.includes('Windows') ? 'Windows' : userAgent.includes('Mac OS') ? 'macOS' : userAgent.includes('Android') ? 'Android' : userAgent.includes('iPhone') || userAgent.includes('iPad') ? 'iOS' : userAgent.includes('Linux') ? 'Linux' : null;
  const device = /Mobile|Android|iPhone|iPad/i.test(userAgent) ? 'mobile' : userAgent ? 'desktop' : null;
  return { browser, operatingSystem, device };
}

export function dateRangeFromSearchParams(searchParams: URLSearchParams) {
  const days = Math.min(Math.max(Number(searchParams.get('days') || '30'), 1), 366);
  const to = searchParams.get('to') ? new Date(searchParams.get('to')!) : new Date();
  const from = searchParams.get('from') ? new Date(searchParams.get('from')!) : new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  return { from: from.toISOString(), to: to.toISOString(), days };
}

export async function insertEnterpriseEvent(request: Request, body: JsonRecord) {
  const supabase = getEnterpriseServiceClient();
  const { browser, operatingSystem, device } = requestUserAgent(request);
  const metadata = maskSensitive((body.metadata && typeof body.metadata === 'object') ? body.metadata : {}) as JsonRecord;
  const context = (body.context && typeof body.context === 'object') ? body.context as JsonRecord : {};
  const target = pickString(body.logType, 'analytics');

  const common = {
    user_id: pickNullableString(context.userId ?? body.userId),
    user_email: pickNullableString(context.userEmail ?? body.userEmail),
    role: pickNullableString(context.role ?? body.role),
    company_id: pickNullableString(context.companyId ?? body.companyId),
    company_name: pickNullableString(context.companyName ?? body.companyName),
    branch_id: pickNullableString(context.branchId ?? body.branchId),
    branch_name: pickNullableString(context.branchName ?? body.branchName),
    department: pickNullableString(context.department ?? body.department),
    session_id: pickNullableString(context.sessionId ?? body.sessionId),
    request_id: pickNullableString(context.requestId ?? body.requestId ?? request.headers.get('x-request-id')),
    ip_address: requestIp(request),
    browser: pickNullableString(body.browser) ?? browser,
    operating_system: pickNullableString(body.operatingSystem) ?? operatingSystem,
    device: pickNullableString(body.device) ?? device,
    api_endpoint: pickNullableString(body.apiEndpoint),
    http_method: pickNullableString(body.httpMethod),
    http_status: pickNumber(body.httpStatus),
    execution_time_ms: pickNumber(body.executionTimeMs),
    success: pickBoolean(body.success, true),
    metadata,
  };

  if (target === 'staff_activity') {
    return supabase.from('enterprise_staff_activity_logs').insert({
      ...common,
      application: pickString(body.application, 'unknown'),
      module: pickString(body.module, 'general'),
      screen: pickNullableString(body.screen),
      action: pickString(body.action ?? body.eventName, 'unknown'),
      description: pickNullableString(body.description),
      entity_type: pickNullableString(body.entityType),
      entity_id: pickNullableString(body.entityId),
    }).select('id').single();
  }

  if (target === 'audit') {
    return supabase.from('enterprise_audit_logs').insert({
      ...common,
      application: pickString(body.application, 'unknown'),
      module: pickString(body.module, 'general'),
      screen: pickNullableString(body.screen),
      action: pickString(body.action ?? body.eventName, 'unknown'),
      entity_type: pickString(body.entityType, 'unknown'),
      entity_id: pickNullableString(body.entityId),
      old_value: maskSensitive(body.oldValue) as JsonRecord,
      new_value: maskSensitive(body.newValue) as JsonRecord,
      reason: pickNullableString(body.reason),
      remarks: pickNullableString(body.remarks),
    }).select('id').single();
  }

  return supabase.from('enterprise_analytics_events').insert({
    ...common,
    event_name: pickString(body.eventName, 'unknown_event'),
    event_category: pickString(body.eventCategory, 'feature_usage'),
    description: pickNullableString(body.description),
    application: pickString(body.application, 'unknown'),
    module: pickNullableString(body.module),
    screen: pickNullableString(body.screen),
    action: pickNullableString(body.action),
    trigger_type: pickNullableString(body.trigger),
    priority: pickString(body.priority, 'medium'),
    entity_type: pickNullableString(body.entityType),
    entity_id: pickNullableString(body.entityId),
    database_table: pickNullableString(body.databaseTable),
    value_numeric: pickNumber(body.value),
    currency: pickNullableString(body.currency),
    location: maskSensitive(body.location ?? {}) as JsonRecord,
    dashboard: pickNullableString(body.dashboard),
    retention_period: pickString(body.retentionPeriod, '26 months'),
    occurred_at: pickNullableString(body.occurredAt) ?? new Date().toISOString(),
  }).select('id').single();
}