import { apiSuccess } from '../../../../lib/api-contract';

export async function GET() {
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
}
