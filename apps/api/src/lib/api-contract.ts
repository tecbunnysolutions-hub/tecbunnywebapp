import { NextResponse } from 'next/server';
import { type ZodError, type ZodIssue } from 'zod';

export type ApiErrorItem = {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
};

export type ApiMeta = {
  requestId?: string | null;
  version?: string;
  [key: string]: unknown;
};

export type ApiResponseEnvelope<T> = {
  success: boolean;
  message: string;
  data: T | null;
  errors: ApiErrorItem[];
  meta: ApiMeta;
};

function baseMeta(meta?: ApiMeta): ApiMeta {
  return {
    version: 'v1',
    timestamp: new Date().toISOString(),
    ...meta,
  };
}

export function apiSuccess<T>(
  data: T,
  opts?: {
    message?: string;
    status?: number;
    meta?: ApiMeta;
  },
) {
  const body: ApiResponseEnvelope<T> = {
    success: true,
    message: opts?.message ?? '',
    data,
    errors: [],
    meta: baseMeta(opts?.meta),
  };

  return NextResponse.json(body, { status: opts?.status ?? 200 });
}

export function apiFailure(
  status: number,
  error: ApiErrorItem,
  opts?: {
    message?: string;
    meta?: ApiMeta;
    errors?: ApiErrorItem[];
  },
) {
  const errors = opts?.errors?.length ? opts.errors : [error];
  const body: ApiResponseEnvelope<null> = {
    success: false,
    message: opts?.message ?? error.message,
    data: null,
    errors,
    meta: baseMeta(opts?.meta),
  };

  return NextResponse.json(body, { status });
}

function issueToError(issue: ZodIssue): ApiErrorItem {
  const field = issue.path.length > 0 ? issue.path.join('.') : undefined;
  return {
    code: 'VALIDATION_ERROR',
    message: issue.message,
    field,
  };
}

export function apiValidationError(
  zodError: ZodError,
  meta?: ApiMeta,
  message = 'Validation failed',
) {
  const errors = zodError.issues.map(issueToError);
  return apiFailure(
    400,
    {
      code: 'VALIDATION_ERROR',
      message,
    },
    {
      message,
      errors,
      meta,
    },
  );
}