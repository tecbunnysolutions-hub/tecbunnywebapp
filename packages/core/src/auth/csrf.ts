import type { NextRequest } from 'next/server';

// Case-insensitive, boundary-aware path checking
export function checkPathPrefix(pathname: string, prefix: string): boolean {
  const path = pathname.toLowerCase();
  const pref = prefix.toLowerCase();
  return path === pref || path.startsWith(pref + '/');
}

export function validateCsrf(
  request: NextRequest,
  isInternalApiCall: boolean,
  exemptPaths: string[] = []
): boolean {
  const pathname = request.nextUrl.pathname;
  const isMutatingMethod = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method);
  
  if (!isMutatingMethod) return true;
  if (!checkPathPrefix(pathname, '/api')) return true;

  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const targetOrigin = request.nextUrl.origin;

  let isSameOrigin = false;
  if (origin) {
    isSameOrigin = origin === targetOrigin;
  } else if (referer) {
    try {
      isSameOrigin = new URL(referer).origin === targetOrigin;
    } catch {
      isSameOrigin = false;
    }
  }

  const secFetchSite = request.headers.get('sec-fetch-site');
  if (secFetchSite && secFetchSite !== 'same-origin' && secFetchSite !== 'none') {
    isSameOrigin = false;
  }

  const isCsrfExempt =
    isInternalApiCall ||
    exemptPaths.some(p => checkPathPrefix(pathname, p));

  if (!isCsrfExempt && !isSameOrigin) {
    return false; // CSRF validation failed
  }

  return true; // Validated
}
