/**
 * Safely stringifies structured data for embedding in Next.js JSON-LD script tags,
 * escaping angle brackets to prevent script injection.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
