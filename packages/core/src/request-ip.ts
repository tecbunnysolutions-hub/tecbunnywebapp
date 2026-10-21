export function getTrustedClientIp(request: Request): string {
  if (process.env.TRUST_CLOUDFLARE_IP === 'true') {
    const cloudflareIp = request.headers.get('cf-connecting-ip')?.trim();
    if (cloudflareIp) return cloudflareIp;
  }

  if (process.env.TRUST_PROXY_HEADERS === 'true') {
    return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')?.trim()
      || 'unknown';
  }

  return 'unknown';
}
