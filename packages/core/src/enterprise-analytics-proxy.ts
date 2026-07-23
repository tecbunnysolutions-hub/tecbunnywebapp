import type { NextFetchEvent, NextRequest } from 'next/server';

type ProxyTelemetryOptions = {
  application: string;
  response: Response;
  startedAt: number;
  event?: NextFetchEvent;
  sameOriginIngest?: boolean;
};

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const SENSITIVE_PATH_PATTERN = /auth|admin|superadmin|roles?|permissions?|settings|payment|invoice|order|inventory|users?|webhook|upload|export|import|campaign|template|ai|gemini|security/i;

function analyticsIngestUrl(request: NextRequest, sameOriginIngest?: boolean) {
  if (sameOriginIngest) return new URL('/api/analytics/track', request.url).toString();

  const configured = process.env.NEXT_PUBLIC_ENTERPRISE_ANALYTICS_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!configured) return null;

  return new URL('/api/analytics/track', configured).toString();
}

function moduleFromPath(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] === 'api') return segments[1] || 'api';
  return segments[0] || 'app';
}

function actionFromRequest(method: string, pathname: string) {
  if (method === 'GET') return 'view';
  if (method === 'POST' && pathname.includes('/login')) return 'login';
  if (method === 'POST') return 'create_or_execute';
  if (method === 'PUT' || method === 'PATCH') return 'update';
  if (method === 'DELETE') return 'delete';
  return method.toLowerCase();
}

function requestId(request: NextRequest) {
  return request.headers.get('x-request-id') || request.headers.get('x-correlation-id') || crypto.randomUUID();
}

function actorContext(request: NextRequest, id: string) {
  return {
    requestId: id,
    sessionId: request.cookies.get('analytics_session_id')?.value || request.cookies.get('sb-access-token')?.value?.slice(0, 16) || null,
  };
}

// A response is only a real reliability failure on 4xx/5xx. 3xx redirects (e.g. an
// unauthenticated visitor being redirected to the login page by middleware) are normal,
// expected navigation outcomes -- `Response.ok` is FALSE for any non-2xx status including
// redirects, so using it directly here mislabels every routine auth redirect as a failed
// API/telemetry event and drags down the SLO availability metric with false positives.
function isTelemetrySuccess(status: number) {
  return status < 400;
}

function basePayload(request: NextRequest, options: ProxyTelemetryOptions, id: string) {
  const pathname = request.nextUrl.pathname;
  const success = isTelemetrySuccess(options.response.status);
  return {
    application: options.application,
    module: moduleFromPath(pathname),
    screen: pathname,
    action: actionFromRequest(request.method, pathname),
    trigger: 'http_request',
    apiEndpoint: pathname,
    httpMethod: request.method,
    httpStatus: options.response.status,
    executionTimeMs: Date.now() - options.startedAt,
    success,
    requestId: id,
    context: actorContext(request, id),
    entityType: 'api_endpoint',
    entityId: pathname,
    metadata: {
      query: Object.fromEntries(request.nextUrl.searchParams.entries()),
      oldNewValuesCaptured: false,
      bodyCaptured: false,
    },
  };
}

export function emitEnterpriseProxyTelemetry(request: NextRequest, options: ProxyTelemetryOptions) {
  const pathname = request.nextUrl.pathname;
  if (pathname === '/api/analytics/track') return;

  const url = analyticsIngestUrl(request, options.sameOriginIngest);
  if (!url) return;

  const id = requestId(request);
  const base = basePayload(request, options, id);
  const success = base.success;
  const writes: Promise<unknown>[] = [
    fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-request-id': id },
      body: JSON.stringify({
        ...base,
        eventType: 'api_request',
        eventName: 'api_request',
        eventCategory: success ? 'api' : 'error',
        priority: success ? 'medium' : 'high',
      }),
    }).catch(() => undefined),
  ];

  if (MUTATING_METHODS.has(request.method)) {
    writes.push(fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-request-id': id },
      body: JSON.stringify({
        ...base,
        logType: 'staff_activity',
        eventType: base.action,
        eventName: base.action,
        description: `${request.method} ${pathname}`,
        priority: success ? 'high' : 'critical',
      }),
    }).catch(() => undefined));
  }

  if (MUTATING_METHODS.has(request.method) && SENSITIVE_PATH_PATTERN.test(pathname)) {
    writes.push(fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-request-id': id },
      body: JSON.stringify({
        ...base,
        logType: 'audit',
        eventType: base.action,
        eventName: base.action,
        entityType: 'api_endpoint',
        reason: 'Automatic proxy-level audit for privileged or sensitive mutation. Route-level instrumentation should add old/new values where applicable.',
        remarks: success ? 'Request completed' : 'Request failed or was denied',
        priority: 'critical',
      }),
    }).catch(() => undefined));
  }

  const writeAll = Promise.all(writes);
  if (options.event) options.event.waitUntil(writeAll);
}