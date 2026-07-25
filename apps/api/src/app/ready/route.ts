import { apiSuccess } from '../../lib/api-contract';

export async function GET() {
  return apiSuccess(
    {
      status: 'ready',
    },
    {
      message: 'Readiness check passed',
      meta: { version: 'v1' },
    },
  );
}
