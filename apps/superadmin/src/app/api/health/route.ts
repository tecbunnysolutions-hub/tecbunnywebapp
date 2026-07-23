import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@tecbunny/database/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const webmailRequiredEnv = ['WEBMAIL_IMAP_HOST', 'WEBMAIL_SMTP_HOST', 'WEBMAIL_MAILBOX_USER'];
  const missingWebmailEnv = webmailRequiredEnv.filter((key) => !process.env[key]);
  
  let apiFailures: { endpoint: string; method: string; status: number; count: number; problem: string }[] = [];
  try {
    const supabase = createSupabaseServiceClient();
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: errorEvents } = await supabase
      .from('enterprise_analytics_events')
      .select('api_endpoint, http_method, http_status')
      .eq('success', false)
      .gte('occurred_at', dayAgo);

    if (errorEvents && errorEvents.length > 0) {
      const errorsByGroup = new Map<string, { endpoint: string; method: string; status: number; count: number; problem: string }>();
      errorEvents.forEach((row) => {
        const endpoint = String(row.api_endpoint ?? 'unknown');
        const method = String(row.http_method ?? 'GET');
        const status = Number(row.http_status ?? 500);
        const key = `${method}:${endpoint}:${status}`;

        let problem = 'Unspecified connection or application error.';
        if (status === 400) problem = 'Bad Request - Malformed syntax or invalid parameters.';
        else if (status === 401) problem = 'Unauthorized - Missing or invalid authentication token.';
        else if (status === 403) problem = 'Forbidden - Client lacks permission to access resource.';
        else if (status === 404) problem = 'Not Found - The requested API endpoint does not exist.';
        else if (status === 405) problem = 'Method Not Allowed - HTTP method not supported for route.';
        else if (status === 408) problem = 'Request Timeout - Server timed out waiting for request.';
        else if (status === 422) problem = 'Unprocessable Entity - Request validation failed.';
        else if (status === 429) problem = 'Too Many Requests - Rate limit exceeded.';
        else if (status >= 500) {
          if (status === 502) problem = 'Bad Gateway - Invalid response from upstream API worker.';
          else if (status === 503) problem = 'Service Unavailable - Server overloaded or down.';
          else if (status === 504) problem = 'Gateway Timeout - Upstream server timed out.';
          else problem = `Internal Server Error (${status}) - Server encountered an unexpected error.`;
        }

        const existing = errorsByGroup.get(key);
        if (existing) {
          existing.count++;
        } else {
          errorsByGroup.set(key, { endpoint, method, status, count: 1, problem });
        }
      });
      apiFailures = Array.from(errorsByGroup.values()).sort((a, b) => b.count - a.count);
    }
  } catch (err) {
    console.error('Failed to query failed APIs for health check', err);
  }

  const checks = [
    {
      id: 'superadmin-runtime',
      label: 'Superadmin runtime',
      status: 'healthy',
      detail: 'Superadmin API route is responding.',
    },
    {
      id: 'webmail-provider',
      label: 'Webmail provider contract',
      status: missingWebmailEnv.length === 0 ? 'healthy' : 'configuration_required',
      detail: missingWebmailEnv.length === 0
        ? 'Required mailbox provider settings are present.'
        : `Missing ${missingWebmailEnv.join(', ')}.`,
    },
    {
      id: 'environment',
      label: 'Deployment environment',
      status: process.env.NODE_ENV === 'production' ? 'healthy' : 'informational',
      detail: `Running in ${process.env.NODE_ENV || 'development'} mode.`,
    },
  ];

  return NextResponse.json({
    status: checks.some((check) => check.status === 'configuration_required') ? 'configuration_required' : 'healthy',
    service: 'superadmin',
    checks,
    apiFailures,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  }, { status: 200 });
}
