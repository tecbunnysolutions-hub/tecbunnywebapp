export const protectedPublicRoutes = ['/dashboard', '/profile', '/orders', '/admin'] as const;

// A single order page loads through the API, which enforces ownership or a valid
// guest order token, so guests who just checked out can view it.
const guestOrderPagePattern = /^\/orders\/[^/]+\/?$/;

export function isProtectedPublicRoute(pathname: string): boolean {
  if (guestOrderPagePattern.test(pathname)) return false;
  return protectedPublicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function getSafeLocalReturnUrl(value: string | null, origin: string): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return null;
  }

  try {
    const target = new URL(value, origin);
    return target.origin === new URL(origin).origin
      ? `${target.pathname}${target.search}${target.hash}`
      : null;
  } catch {
    return null;
  }
}
