import { apiSuccess } from '../../lib/api-contract';

export async function GET() {
  return apiSuccess(
    {
      status: 'live',
    },
    {
      message: 'Liveness check passed',
      meta: { version: 'v1' },
    },
  );
}
