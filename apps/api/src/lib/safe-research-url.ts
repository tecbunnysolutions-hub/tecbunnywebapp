import net from 'net';
import { isBlockedIp, validatePublicRemoteUrl } from '@tecbunny/core/security/network-validation';

/** Synchronous structural checks; returns a normalized URL string or null. */
export function parseSafeResearchUrl(raw: string): URL | null {
  if (!raw || raw.length > 2048) return null;
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== 'https:') return null;
  if (url.username || url.password) return null;
  const host = url.hostname.toLowerCase();
  if (!host || host.includes('%') || host.startsWith('[') || net.isIP(host) === 6) return null;
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) return null;
  if (!host.includes('.') && net.isIP(host) === 0) return null;
  if (net.isIP(host) === 4 && isBlockedIp(host)) return null;
  if (host === 'metadata.google.internal') return null;
  return url;
}

export async function isSafeResearchUrl(raw: string): Promise<boolean> {
  const url = parseSafeResearchUrl(raw);
  if (!url) return false;
  try {
    return await validatePublicRemoteUrl(url);
  } catch {
    return false;
  }
}
