import dns from 'dns/promises';
import net from 'net';

const ALLOWED_REMOTE_IMAGE_PROTOCOLS = new Set(['http:', 'https:']);

export function isBlockedIPv4(ip: string) {
  const octets = ip.split('.').map((part) => Number(part));
  if (octets.length !== 4 || octets.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return true;
  }

  const ipInt = ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;

  return (
    (ipInt & 0xff000000) === 0x00000000 || // 0.0.0.0/8
    (ipInt & 0xff000000) === 0x0a000000 || // 10.0.0.0/8
    (ipInt & 0xff000000) === 0x7f000000 || // 127.0.0.0/8
    (ipInt & 0xffff0000) === 0xa9fe0000 || // 169.254.0.0/16
    (ipInt & 0xfff00000) === 0xac100000 || // 172.16.0.0/12
    (ipInt & 0xffff0000) === 0xc0a80000 || // 192.168.0.0/16
    (ipInt & 0xffc00000) === 0x64400000 || // 100.64.0.0/10
    (ipInt & 0xe0000000) === 0xe0000000    // >= 224.0.0.0
  );
}

export function isBlockedIPv6(ip: string) {
  const normalized = ip.toLowerCase();
  return normalized === '::1'
    || normalized === '::'
    || normalized.startsWith('fc')
    || normalized.startsWith('fd')
    || normalized.startsWith('fe80:')
    || normalized.startsWith('ff');
}

export function isBlockedIp(ip: string) {
  const version = net.isIP(ip);
  if (version === 4) return isBlockedIPv4(ip);
  if (version === 6) return isBlockedIPv6(ip);
  return true;
}

export async function validatePublicRemoteUrl(url: URL) {
  if (!ALLOWED_REMOTE_IMAGE_PROTOCOLS.has(url.protocol)) {
    return false;
  }

  if (url.username || url.password) {
    return false;
  }

  const hostname = url.hostname;
  if (!hostname) {
    return false;
  }

  const literalIpVersion = net.isIP(hostname);
  if (literalIpVersion && isBlockedIp(hostname)) {
    return false;
  }

  const records = await dns.lookup(hostname, { all: true, verbatim: true });
  return records.length > 0 && records.every((record) => !isBlockedIp(record.address));
}
