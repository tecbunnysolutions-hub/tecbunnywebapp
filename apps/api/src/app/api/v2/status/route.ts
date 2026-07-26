import { apiSuccess } from '../../../../lib/api-contract';
import { logger } from '@tecbunny/core';

export async function GET() {
  try {
    logger.info('api_v2_status.audit.requested');
    return apiSuccess(
      {
        version: 'v2',
        status: 'preview',
        message: 'v2 namespace is reserved for upcoming backward-incompatible changes.',
      },
      {
        message: 'API version status',
        meta: { version: 'v2' },
      },
    );
  } catch (error) {
    logger.error('api_v2_status.audit.failed', { error: error instanceof Error ? error.message : String(error) });
    return apiSuccess(
      {
        version: 'v2',
        status: 'preview',
        message: 'status unavailable',
      },
      {
        message: 'API version status (fallback)',
        meta: { version: 'v2' },
      },
    );
  }
}
