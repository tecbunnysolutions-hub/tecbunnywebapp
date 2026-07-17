import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';

/**
 * Verify CRON_SECRET on scheduled job endpoints.
 *
 * Set CRON_SECRET in environment variables (min 32 chars recommended).
 * Vercel Cron will forward it as `Authorization: Bearer <secret>`.
 *
 * Returns a 401 NextResponse if verification fails, or null if OK.
 * Uses timing-safe comparison to prevent timing-based secret extraction.
 *
 * @example
 * export async function GET(req: NextRequest) {
 *   const deny = verifyCronSecret(req);
 *   if (deny) return deny;
 *   // ... safe to proceed
 * }
 */
export function verifyCronSecret(request: NextRequest): NextResponse | null {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      // Block ALL cron access in production if CRON_SECRET is not configured
      return NextResponse.json(
        { error: 'Cron endpoints require CRON_SECRET to be configured in production.' },
        { status: 503 }
      );
    }
    // In dev/test, allow without secret
    return null;
  }

  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Timing-safe comparison
  try {
    const secretBuf = Buffer.from(secret, 'utf8');
    const tokenBuf  = Buffer.from(token,  'utf8');

    if (secretBuf.length !== tokenBuf.length) {
      // Create equal-length dummy comparison to avoid length timing leak
      timingSafeEqual(secretBuf, secretBuf);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!timingSafeEqual(secretBuf, tokenBuf)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null; // OK
}
