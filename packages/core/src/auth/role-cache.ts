// Global Cache for HMAC key used in Role Cache Signing (prevents GC thrashing)
let cachedRoleKey: CryptoKey | null = null;
let cachedRoleSecret: string | null = null;
const textEncoder = new TextEncoder();

async function getRoleKey(secret: string): Promise<CryptoKey> {
  if (cachedRoleKey && cachedRoleSecret === secret) return cachedRoleKey;
  cachedRoleKey = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
  cachedRoleSecret = secret;
  return cachedRoleKey;
}

/**
 * Signs the user role to create a tamper-proof transient session cache cookie
 */
export async function signUserRole(userId: string, role: string, secret: string): Promise<string> {
  const expiresAt = Math.floor(Date.now() / 1000) + 300; // 5-minute expiration
  const data = `${userId}:${role}:${expiresAt}`;
  const key = await getRoleKey(secret);
  const signatureBytes = await crypto.subtle.sign('HMAC', key, textEncoder.encode(data));
  const signatureHex = Array.from(new Uint8Array(signatureBytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `${data}.${signatureHex}`;
}

/**
 * Verifies the tamper-proof role signature cookie
 */
export async function verifySignedUserRole(cookieValue: string, userId: string, secret: string): Promise<string | null> {
  try {
    const parts = cookieValue.split('.');
    if (parts.length !== 2) return null;
    const [data, signatureHex] = parts;
    const dataParts = data.split(':');
    if (dataParts.length !== 3) return null;
    const [cookieUserId, role, expiresAtStr] = dataParts;

    if (cookieUserId !== userId) return null;

    const expiresAt = parseInt(expiresAtStr, 10);
    if (isNaN(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) return null;

    const key = await getRoleKey(secret);
    const signatureBytes = await crypto.subtle.sign('HMAC', key, textEncoder.encode(data));
    const expectedSignatureHex = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return signatureHex === expectedSignatureHex ? role : null;
  } catch {
    return null;
  }
}
