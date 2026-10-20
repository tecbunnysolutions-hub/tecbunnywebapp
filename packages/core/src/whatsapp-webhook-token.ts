const CANONICAL = 'WHATSAPP_WEBHOOK_VERIFY_TOKEN';
const DEPRECATED = ['WEBHOOK_VERIFY_TOKEN', 'WHATSAPP_VERIFY_TOKEN', 'META_WHATSAPP_VERIFY_TOKEN'] as const;

const warned = new Set<string>();

/**
 * Single verify token for the WhatsApp webhook (GET handshake and POST ?token=).
 * Deprecated names are still read; only the variable NAME is logged.
 */
export function getWebhookVerifyToken(env: Record<string, string | undefined> = process.env): string | undefined {
  if (env[CANONICAL]) return env[CANONICAL];
  for (const name of DEPRECATED) {
    if (!env[name]) continue;
    if (!warned.has(name)) {
      warned.add(name);
      console.warn(`[env] ${name} is deprecated; use ${CANONICAL}`);
    }
    return env[name];
  }
  return undefined;
}
