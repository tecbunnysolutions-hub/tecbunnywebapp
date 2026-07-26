import { apiSuccess } from '../../../lib/api-contract';
import { logger } from '@tecbunny/core';

export async function GET() {
  try {
    logger.info('api_docs.audit.index_requested');
    return apiSuccess(
      {
        openapi: '/api/docs/openapi',
        authentication: {
          session: 'Cookie-based Supabase session for internal dashboards',
          superadmin: 'POST /api/v1/admin-auth/login sets secure superadmin-session cookie',
        },
        examples: {
          requestOtp: {
            url: '/api/v1/auth/send-otp',
            method: 'POST',
            body: { email: 'user@example.com' },
          },
          verifyOtp: {
            url: '/api/v1/auth/verify-otp',
            method: 'POST',
            body: { email: 'user@example.com', otp: '123456' },
          },
        },
        errorCodes: [
          'VALIDATION_ERROR',
          'RATE_LIMITED',
          'INVALID_CREDENTIALS',
          'FORBIDDEN',
          'SERVICE_UNAVAILABLE',
          'INTERNAL_ERROR',
        ],
        changelog: [
          {
            version: '2026-07-25',
            changes: [
              'Introduced standardized API response contract for critical auth endpoints.',
              'Added strict schema validation with consistent HTTP 400 payloads.',
              'Added versioned aliases under /api/v1 and reserved /api/v2 namespace.',
              'Added OpenAPI spec endpoint at /api/docs/openapi.',
            ],
          },
        ],
      },
      {
        message: 'API documentation index',
        meta: { version: 'v1' },
      },
    );
  } catch (error) {
    logger.error('api_docs.audit.index_failed', { error: error instanceof Error ? error.message : String(error) });
    return apiSuccess(
      { openapi: '/api/docs/openapi' },
      {
        message: 'API documentation index (fallback)',
        meta: { version: 'v1' },
      },
    );
  }
}
