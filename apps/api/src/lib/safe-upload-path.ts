const MAX_PATH_LENGTH = 100;
const SEGMENT = /^[a-z0-9_-]+$/;

/** Returns a normalized folder path, or null if invalid. Empty input yields ''. */
export function sanitizeUploadFolder(input: string | null | undefined): string | null {
  if (input == null) return '';
  const value = input.trim();
  if (!value) return '';
  if (value.length > MAX_PATH_LENGTH || value.startsWith('/') || value.includes('\\')) return null;
  const segments = value.replace(/\/+$/, '').split('/');
  if (!segments.every((s) => SEGMENT.test(s))) return null;
  return segments.join('/');
}
