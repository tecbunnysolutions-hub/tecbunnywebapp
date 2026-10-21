import { describe, expect, it } from 'vitest';
import { getSafeLocalReturnUrl, isProtectedPublicRoute } from './public-route-policy';

describe('public route policy', () => {
  it.each(['/orders', '/orders/123/invoice', '/dashboard', '/profile', '/admin/settings'])(
    'keeps %s protected',
    (pathname) => {
      expect(isProtectedPublicRoute(pathname)).toBe(true);
    }
  );

  it.each(['/checkout', '/checkout/review', '/payment', '/payment/upi/123', '/orders/123', '/orders/123/'])(
    'allows guests on %s',
    (pathname) => {
      expect(isProtectedPublicRoute(pathname)).toBe(false);
    }
  );
});

describe('safe local return URL', () => {
  const origin = 'https://tecbunny.com';

  it('retains the local path and query string, including quote credentials', () => {
    expect(
      getSafeLocalReturnUrl('/quotes/quote-1/advance-payment?quoteId=quote-1&token=secret', origin)
    ).toBe('/quotes/quote-1/advance-payment?quoteId=quote-1&token=secret');
  });

  it.each([
    'https://attacker.example/path',
    '//attacker.example/path',
    '/\\attacker.example/path',
    '',
    null,
  ])('rejects unsafe return value %s', (value) => {
    expect(getSafeLocalReturnUrl(value, origin)).toBeNull();
  });
});
