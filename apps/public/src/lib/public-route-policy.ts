export const protectedPublicRoutes = ['/dashboard', '/profile', '/orders', '/admin'] as const;

export function isProtectedPublicRoute(pathname: string): boolean {
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
