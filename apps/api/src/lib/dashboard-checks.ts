export type ApiRow = { path: string; group: string; dynamic: boolean; method: string; access: string };
export type RequestConfig = {
  params?: Record<string, string>;
  query?: Record<string, string>;
  headers?: Record<string, string>;
  body?: unknown;
  expectedStatus?: number;
  allowSideEffects?: boolean;
};
export type CheckResult = {
  state: 'running' | 'passed' | 'failed' | 'auth_required' | 'needs_input' | 'skipped' | 'cancelled';
  status?: number;
  ms?: number;
  detail: string;
  checkedAt: string;
  authContext?: string;
};

// Some GET handlers dispatch jobs, send messages or alter state.
const LIVE_ACTION = /\/(cron|webhooks?|logout|callback|deployment|indexnow|release-notes|monitoring|upload|uploads|payment|payments|sync|trigger|triggers|send|generate|refresh|rebuild|seed|cleanup|auto-fill|update|confirm)(\/|$)/i;
export const keyOf = (row: ApiRow) => `${row.method} ${row.path}`;
export const isLiveAction = (row: ApiRow) => !['GET', 'HEAD', 'OPTIONS'].includes(row.method) || LIVE_ACTION.test(row.path);

export function parseConfig(text: string): RequestConfig {
  const value: unknown = JSON.parse(text || '{}');
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Request settings must be a JSON object.');
  const config = value as RequestConfig;
  for (const field of ['params', 'query', 'headers'] as const) {
    const item = config[field];
    if (item !== undefined && (!item || typeof item !== 'object' || Array.isArray(item) || Object.values(item).some((v) => typeof v !== 'string'))) {
      throw new Error(`${field} must contain string values.`);
    }
  }
  if (config.expectedStatus !== undefined && (!Number.isInteger(config.expectedStatus) || config.expectedStatus < 200 || config.expectedStatus > 599)) {
    throw new Error('expectedStatus must be an HTTP status from 200 to 599.');
  }
  if (config.allowSideEffects !== undefined && typeof config.allowSideEffects !== 'boolean') throw new Error('allowSideEffects must be true or false.');
  return config;
}

export function requestPath(row: ApiRow, config: RequestConfig): string {
  const path = row.path.replace(/\[\[\.\.\.([^\]]+)\]\]|\[\.\.\.([^\]]+)\]|\[([^\]]+)\]/g, (_, optional: string, catchAll: string, single: string) => {
    const name = optional || catchAll || single;
    const value = config.params?.[name];
    if (!value && optional) return '';
    if (!value) throw new Error(`Set params.${name} to a demo record ID.`);
    const parts = optional || catchAll ? value.split('/') : [value];
    if (parts.some((part) => !part || part === '.' || part === '..' || /[\\/?#]/.test(part))) throw new Error(`Invalid path parameter: ${name}`);
    return parts.map(encodeURIComponent).join('/');
  }).replace(/\/$/, '');
  if (!path.startsWith('/api/') || path.includes('[')) throw new Error('Invalid API path.');
  const query = new URLSearchParams(config.query);
  return path + (query.size ? `?${query}` : '');
}

export function preparation(row: ApiRow, config: RequestConfig, includeActions: boolean): string | null {
  if (isLiveAction(row) && (!includeActions || !config.allowSideEffects)) return 'Live action: configure the request, set allowSideEffects to true, and enable live actions.';
  if (['GET', 'HEAD'].includes(row.method) && config.body !== undefined) return 'GET and HEAD requests cannot have a body.';
  try { requestPath(row, config); } catch (error) { return error instanceof Error ? error.message : 'Invalid request settings.'; }
  return null;
}

export function classify(status: number, expected?: number): CheckResult['state'] {
  if (expected !== undefined) return status === expected ? 'passed' : 'failed';
  if (status >= 200 && status < 300) return 'passed';
  if (status === 401 || status === 403) return 'auth_required';
  if (status === 400 || status === 422) return 'needs_input';
  return 'failed';
}

export function responseFailed(text: string): boolean {
  try {
    const value = JSON.parse(text);
    return value?.ok === false || value?.success === false || ['degraded', 'unhealthy', 'down', 'error'].includes(value?.status);
  } catch { return false; }
}

// Report response shapes only: API data may contain customer information or tokens.
export function responseShape(text: string): string {
  if (!text) return 'Empty response';
  try {
    const value: unknown = JSON.parse(text);
    if (Array.isArray(value)) return `JSON array (${value.length} items)`;
    if (value && typeof value === 'object') return `JSON fields: ${Object.keys(value).slice(0, 8).join(', ')}`;
    return `JSON ${typeof value}`;
  } catch { return 'Non-JSON response'; }
}

export function reportRows(rows: ApiRow[], results: Record<string, CheckResult>) {
  return rows.map((row) => ({ ...row, ...(results[keyOf(row)] ?? { state: 'not_checked', detail: 'Not included in a completed check.', checkedAt: '' }) }));
}

export function reportCsv(rows: ReturnType<typeof reportRows>): string {
  const fields = ['method', 'path', 'group', 'access', 'authContext', 'state', 'status', 'ms', 'detail', 'checkedAt'] as const;
  const cell = (value: unknown) => {
    const text = String(value ?? '');
    return `"${(/^[=+@\-\t\r]/.test(text) ? "'" : '') + text.replace(/"/g, '""')}"`;
  };
  return [fields.join(','), ...rows.map((row) => fields.map((field) => cell(row[field as keyof typeof row])).join(','))].join('\r\n');
}
