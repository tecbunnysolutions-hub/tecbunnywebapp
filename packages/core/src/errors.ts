/**
 * Centralised error taxonomy for the TecBunny platform.
 *
 * Every API error should use one of these codes so frontends and monitoring
 * tools can reliably distinguish error categories without parsing messages.
 *
 * Pattern: `TB_<DOMAIN>_<TYPE>`
 *
 * Also exports the Result monad helpers used by service classes.
 */

// --- Result monad ---

/** Discriminated union Result type used by all service classes. */
export type Result<T, E extends { message: string } = AppError> =
  | { success: true; data: T }
  | { success: false; error: E };

export function success<T>(data: T): Result<T, never> {
  return { success: true, data };
}

export function failure<E extends { message: string }>(error: E): Result<never, E> {
  return { success: false, error };
}

// --- AppError class ---

export class AppError extends Error {
  readonly code: string;
  readonly httpStatus: number;
  readonly retryable: boolean;
  readonly details?: Record<string, unknown>;

  /** Alias for httpStatus — legacy compatibility. */
  get statusCode(): number {
    return this.httpStatus;
  }

  constructor(
    code: string,
    message: string,
    httpStatus = 500,
    retryable = false,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.httpStatus = httpStatus;
    this.retryable = retryable;
    this.details = details;
  }

  static badRequest(message: string, detail?: string): AppError {
    return new AppError('TB_VAL_INVALID_INPUT', message, 400, false, detail ? { detail } : undefined);
  }

  static unauthorized(message = 'Unauthorized'): AppError {
    return new AppError('TB_AUTH_UNAUTHENTICATED', message, 401, false);
  }

  static forbidden(message = 'Forbidden'): AppError {
    return new AppError('TB_AUTH_FORBIDDEN', message, 403, false);
  }

  static notFound(message = 'Not found'): AppError {
    return new AppError('TB_NOT_FOUND', message, 404, false);
  }

  static conflict(message: string): AppError {
    return new AppError('TB_CONFLICT', message, 409, false);
  }

  static internal(message = 'Internal server error', detail?: string): AppError {
    return new AppError('TB_INTERNAL_ERROR', message, 500, true, detail ? { detail } : undefined);
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}

// --- Error codes ---

export type ErrorCode =
  | 'TB_AUTH_UNAUTHENTICATED'
  | 'TB_AUTH_FORBIDDEN'
  | 'TB_AUTH_TOKEN_EXPIRED'
  | 'TB_AUTH_TOKEN_INVALID'
  | 'TB_AUTH_MFA_REQUIRED'
  | 'TB_AUTH_SESSION_REVOKED'
  | 'TB_VAL_INVALID_INPUT'
  | 'TB_VAL_MISSING_FIELD'
  | 'TB_VAL_CONSTRAINT_VIOLATION'
  | 'TB_PAY_INIT_FAILED'
  | 'TB_PAY_HASH_MISMATCH'
  | 'TB_PAY_ALREADY_PAID'
  | 'TB_PAY_AMOUNT_MISMATCH'
  | 'TB_ORD_NOT_FOUND'
  | 'TB_ORD_INVALID_TRANSITION'
  | 'TB_ORD_INVENTORY_INSUFFICIENT'
  | 'TB_ORD_ALREADY_CANCELLED'
  | 'TB_PROD_NOT_FOUND'
  | 'TB_PROD_DELETED'
  | 'TB_PROD_OUT_OF_STOCK'
  | 'TB_WABA_SEND_FAILED'
  | 'TB_WABA_OUTSIDE_WINDOW'
  | 'TB_WABA_BROADCAST_QUOTA_EXCEEDED'
  | 'TB_WABA_SIGNATURE_INVALID'
  | 'TB_INFRA_DB_ERROR'
  | 'TB_INFRA_REDIS_UNAVAILABLE'
  | 'TB_INFRA_QUEUE_UNAVAILABLE'
  | 'TB_INFRA_EXTERNAL_SERVICE_ERROR'
  | 'TB_RATE_LIMITED'
  | 'TB_RATE_CRON_LOCKED'
  | 'TB_INTERNAL_ERROR'
  | 'TB_NOT_FOUND'
  | 'TB_CONFLICT';

// --- Registry ---

interface RegistryEntry {
  message: string;
  httpStatus: number;
  retryable: boolean;
}

export const ERROR_REGISTRY: Record<ErrorCode, RegistryEntry> = {
  TB_AUTH_UNAUTHENTICATED:         { message: 'Authentication required',              httpStatus: 401, retryable: false },
  TB_AUTH_FORBIDDEN:               { message: 'Insufficient permissions',             httpStatus: 403, retryable: false },
  TB_AUTH_TOKEN_EXPIRED:           { message: 'Session has expired',                  httpStatus: 401, retryable: false },
  TB_AUTH_TOKEN_INVALID:           { message: 'Invalid authentication token',         httpStatus: 401, retryable: false },
  TB_AUTH_MFA_REQUIRED:            { message: 'Multi-factor authentication required', httpStatus: 403, retryable: false },
  TB_AUTH_SESSION_REVOKED:         { message: 'Session has been revoked',             httpStatus: 401, retryable: false },
  TB_VAL_INVALID_INPUT:            { message: 'Invalid input',                        httpStatus: 400, retryable: false },
  TB_VAL_MISSING_FIELD:            { message: 'Required field missing',               httpStatus: 400, retryable: false },
  TB_VAL_CONSTRAINT_VIOLATION:     { message: 'Database constraint violated',         httpStatus: 409, retryable: false },
  TB_PAY_INIT_FAILED:              { message: 'Payment initialisation failed',        httpStatus: 500, retryable: true  },
  TB_PAY_HASH_MISMATCH:            { message: 'Payment hash verification failed',     httpStatus: 400, retryable: false },
  TB_PAY_ALREADY_PAID:             { message: 'Order has already been paid',          httpStatus: 409, retryable: false },
  TB_PAY_AMOUNT_MISMATCH:          { message: 'Payment amount does not match order',  httpStatus: 400, retryable: false },
  TB_ORD_NOT_FOUND:                { message: 'Order not found',                      httpStatus: 404, retryable: false },
  TB_ORD_INVALID_TRANSITION:       { message: 'Invalid order status transition',      httpStatus: 400, retryable: false },
  TB_ORD_INVENTORY_INSUFFICIENT:   { message: 'Insufficient inventory',               httpStatus: 409, retryable: true  },
  TB_ORD_ALREADY_CANCELLED:        { message: 'Order is already cancelled',           httpStatus: 409, retryable: false },
  TB_PROD_NOT_FOUND:               { message: 'Product not found',                    httpStatus: 404, retryable: false },
  TB_PROD_DELETED:                 { message: 'Product has been archived',            httpStatus: 410, retryable: false },
  TB_PROD_OUT_OF_STOCK:            { message: 'Product is out of stock',              httpStatus: 409, retryable: true  },
  TB_WABA_SEND_FAILED:             { message: 'WhatsApp message send failed',         httpStatus: 502, retryable: true  },
  TB_WABA_OUTSIDE_WINDOW:          { message: 'Outside 24-hour messaging window',     httpStatus: 400, retryable: false },
  TB_WABA_BROADCAST_QUOTA_EXCEEDED:{ message: 'Broadcast daily limit reached',        httpStatus: 429, retryable: false },
  TB_WABA_SIGNATURE_INVALID:       { message: 'Webhook signature invalid',            httpStatus: 401, retryable: false },
  TB_INFRA_DB_ERROR:               { message: 'Database error',                       httpStatus: 500, retryable: true  },
  TB_INFRA_REDIS_UNAVAILABLE:      { message: 'Cache unavailable',                    httpStatus: 503, retryable: true  },
  TB_INFRA_QUEUE_UNAVAILABLE:      { message: 'Job queue unavailable',                httpStatus: 503, retryable: true  },
  TB_INFRA_EXTERNAL_SERVICE_ERROR: { message: 'External service error',               httpStatus: 502, retryable: true  },
  TB_RATE_LIMITED:                 { message: 'Too many requests',                    httpStatus: 429, retryable: true  },
  TB_RATE_CRON_LOCKED:             { message: 'Cron job already running',             httpStatus: 409, retryable: true  },
  TB_INTERNAL_ERROR:               { message: 'Internal server error',                httpStatus: 500, retryable: true  },
  TB_NOT_FOUND:                    { message: 'Resource not found',                   httpStatus: 404, retryable: false },
  TB_CONFLICT:                     { message: 'Resource conflict',                    httpStatus: 409, retryable: false },
};

// --- Factory ---

export function createAppError(
  code: ErrorCode,
  details?: Record<string, unknown>,
): AppError {
  const entry = ERROR_REGISTRY[code];
  return new AppError(code, entry.message, entry.httpStatus, entry.retryable, details);
}
