import { NextResponse } from 'next/server';
// Central catalogue (extend as needed)
export const ERROR_DEFS = {
    VALIDATION_ERROR: { status: 400, message: 'Validation failed' },
    RATE_LIMITED: { status: 429, message: 'Rate limit exceeded' },
    UNAUTHORIZED: { status: 401, message: 'Unauthorized' },
    FORBIDDEN: { status: 403, message: 'Forbidden' },
    NOT_FOUND: { status: 404, message: 'Resource not found' },
    CONFLICT: { status: 409, message: 'Conflict' },
    SERVICE_UNAVAILABLE: { status: 503, message: 'Service temporarily unavailable' },
    INTERNAL_ERROR: { status: 500, message: 'Internal server error' },
};
export function apiError(code, opts = {}) {
    const def = ERROR_DEFS[code];
    if (!def) {
        throw new Error(`Unknown error code: ${code}`);
    }
    const body = {
        error: {
            code,
            message: opts.overrideMessage || def.message,
        },
    };
    if (opts.details)
        body.error.details = opts.details;
    if (opts.correlationId)
        body.correlationId = opts.correlationId;
    return NextResponse.json(body, { status: def.status });
}
export function apiSuccess(data, correlationId) {
    const body = { success: true, ...data };
    if (correlationId)
        body.correlationId = correlationId;
    return NextResponse.json(body);
}
