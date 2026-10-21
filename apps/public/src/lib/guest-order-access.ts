const STORAGE_PREFIX = 'tb-guest-order-token:';

export function getGuestOrderToken(orderId: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage.getItem(`${STORAGE_PREFIX}${orderId}`);
  } catch {
    return null;
  }
}

export function storeGuestOrderToken(orderId: string, token: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(`${STORAGE_PREFIX}${orderId}`, token);
  } catch {
    throw new Error('Unable to save secure guest order access in this browser.');
  }
}
