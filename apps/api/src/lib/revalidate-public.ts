import type { NextRequest } from 'next/server';

type RouteContext = { params: Promise<Record<string, string | string[]>> };
type Handler = (request: NextRequest, context: any) => Promise<Response | undefined | void> | Response | undefined | void;

/**
 * Asks the public site to drop cached API reads for the given tags. Best-effort: it needs
 * PUBLIC_SITE_URL and REVALIDATE_SECRET; without them cached pages simply expire via revalidate.
 */
export async function notifyPublicRevalidate(tags: string[]): Promise<void> {
  const site = process.env.PUBLIC_SITE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!site || !secret || tags.length === 0) return;
  try {
    await fetch(`${site.replace(/\/$/, '')}/api/revalidate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${secret}` },
      body: JSON.stringify({ tags }),
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // Pages fall back to time-based revalidation.
  }
}

/** Wraps a mutating handler so a successful response invalidates the listed public cache tags. */
export function withPublicRevalidation(tags: string[], handler: Handler): (request: NextRequest, context: RouteContext) => Promise<Response | undefined | void> {
  return async (request, context) => {
    const response = await handler(request, context);
    if (response && response.ok) await notifyPublicRevalidate(tags);
    return response;
  };
}
