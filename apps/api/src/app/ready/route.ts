import { apiSuccess } from '../../lib/api-contract';

function applySecurityHeaders(response: Response) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
}

export async function GET() {
  const response = apiSuccess(
    {
      status: 'ready',
    },
    {
      message: 'Readiness check passed',
      meta: { version: 'v1' },
    },
  );

  applySecurityHeaders(response);
  return response;
}
