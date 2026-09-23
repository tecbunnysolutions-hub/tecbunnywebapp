/** Read provider/API errors without rendering objects as "[object Object]". */
export function getMessageError(error: unknown, fallback = 'Unable to send message. Please try again.'): string {
  if (typeof error === 'string' && error.trim()) return error;
  if (!error || typeof error !== 'object') return fallback;

  const value = error as Record<string, unknown>;
  if (value.error) return getMessageError(value.error, fallback);
  const message = typeof value.message === 'string' ? value.message : null;
  if (!message) return fallback;

  const code = typeof value.code === 'number' || typeof value.code === 'string' ? ` (code ${value.code})` : '';
  const details = value.error_data && typeof value.error_data === 'object'
    ? (value.error_data as Record<string, unknown>).details
    : null;
  return `${message}${code}${typeof details === 'string' && details !== message ? ` — ${details}` : ''}`;
}
