import { apiSuccess } from '../../lib/api-contract';

export async function GET() {
  return apiSuccess(
    {
      status: 'ok',
      checks: {
        app: 'up',
      },
    },
    {
      message: 'Health check passed',
      meta: { version: 'v1' },
    },
  );
}
