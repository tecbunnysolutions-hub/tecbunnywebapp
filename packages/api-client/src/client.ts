import { apiEnvelope, type ApiEnvelope, type ApiErrorItem } from '@tecbunny/contracts';
import type { z } from 'zod';

export type NextFetchOptions = { revalidate?: number | false; tags?: string[] };

export type ApiClientOptions = {
  baseUrl?: string;
  getToken?: () => string | null | undefined | Promise<string | null | undefined>;
  /** Extra headers per request (e.g. forwarding the caller's cookie from a server component). */
  getHeaders?: () => Record<string, string> | Promise<Record<string, string>>;
  timeoutMs?: number;
  fetch?: typeof fetch;
};

export type RequestOptions<S extends z.ZodType> = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  query?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
  schema: S;
  signal?: AbortSignal;
  timeoutMs?: number;
  next?: NextFetchOptions;
  cache?: RequestCache;
  /** Treat these HTTP statuses as `null` data instead of throwing. */
  nullOnStatus?: number[];
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly errors: ApiErrorItem[];
  readonly requestId: string | null;

  constructor(init: { status: number; code: string; message: string; errors?: ApiErrorItem[]; requestId?: string | null }) {
    super(init.message);
    this.name = 'ApiError';
    this.status = init.status;
    this.code = init.code;
    this.errors = init.errors ?? [];
    this.requestId = init.requestId ?? null;
  }
}

const DEFAULT_BASE_URL = 'https://api.tecbunny.com';
const DEFAULT_TIMEOUT_MS = 10_000;
const RETRYABLE_STATUSES = new Set([502, 503, 504]);

const resolveBaseUrl = (explicit?: string) => {
  const fromEnv = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined;
  return (explicit ?? fromEnv ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
};

const buildUrl = (baseUrl: string, path: string, query?: RequestOptions<z.ZodType>['query']) => {
  const url = new URL(`${baseUrl}${path.startsWith('/') ? path : `/${path}`}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }
  return url.toString();
};

export type ApiClient = ReturnType<typeof createApiClient>;

export function createApiClient(options: ApiClientOptions = {}) {
  const baseUrl = resolveBaseUrl(options.baseUrl);
  const doFetch = options.fetch ?? fetch;

  async function attempt(url: string, init: RequestInit, timeoutMs: number, signal?: AbortSignal) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(new Error('timeout')), timeoutMs);
    const onAbort = () => controller.abort(signal?.reason);
    signal?.addEventListener('abort', onAbort, { once: true });
    try {
      return await doFetch(url, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    }
  }

  async function request<S extends z.ZodType>(path: string, opts: RequestOptions<S>): Promise<z.infer<S> | null> {
    const method = opts.method ?? 'GET';
    const isIdempotent = method === 'GET';
    const headers: Record<string, string> = { Accept: 'application/json' };
    const token = await options.getToken?.();
    Object.assign(headers, await options.getHeaders?.());
    if (token) headers.Authorization = `Bearer ${token}`;
    if (opts.body !== undefined) headers['Content-Type'] = 'application/json';

    const init: RequestInit & { next?: NextFetchOptions } = {
      method,
      headers,
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
      cache: opts.cache,
      next: opts.next,
    };
    const url = buildUrl(baseUrl, path, opts.query);
    const timeoutMs = opts.timeoutMs ?? options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const maxAttempts = isIdempotent ? 2 : 1;

    let response: Response | undefined;
    let networkError: unknown;
    for (let tryNumber = 1; tryNumber <= maxAttempts; tryNumber += 1) {
      try {
        response = await attempt(url, init, timeoutMs, opts.signal);
        networkError = undefined;
        if (!RETRYABLE_STATUSES.has(response.status) || tryNumber === maxAttempts) break;
      } catch (error) {
        networkError = error;
        if (opts.signal?.aborted || tryNumber === maxAttempts) break;
      }
    }

    if (!response) {
      const timedOut = networkError instanceof Error && /timeout|abort/i.test(networkError.message);
      throw new ApiError({
        status: 0,
        code: timedOut ? 'TIMEOUT' : 'NETWORK_ERROR',
        message: timedOut ? 'The request timed out.' : 'The API could not be reached.',
      });
    }

    if (opts.nullOnStatus?.includes(response.status)) return null;

    const requestId = response.headers.get('x-request-id');
    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      const errors = (payload as { errors?: ApiErrorItem[] } | null)?.errors ?? [];
      const message = (payload as { message?: string } | null)?.message ?? `Request failed with status ${response.status}`;
      throw new ApiError({
        status: response.status,
        code: errors[0]?.code ?? 'HTTP_ERROR',
        message,
        errors,
        requestId,
      });
    }

    const parsed = apiEnvelope(opts.schema).safeParse(payload);
    if (!parsed.success) {
      throw new ApiError({
        status: response.status,
        code: 'INVALID_RESPONSE',
        message: 'The API returned a response that does not match its contract.',
        requestId,
      });
    }
    return (parsed.data as ApiEnvelope<z.infer<S>>).data;
  }

  return { request, baseUrl };
}
