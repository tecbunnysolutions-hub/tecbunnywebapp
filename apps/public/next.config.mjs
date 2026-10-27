import { cpus } from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { resolveApiBaseUrl } from '../../packages/api-client/src/base-url.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const isStaticExport = process.env.NEXT_OUTPUT_MODE === 'export';

// Optimize Node.js thread pool for sharp/libvips processing
process.env.UV_THREADPOOL_SIZE = String(Math.max(4, cpus().length));

const hostFromUrl = (value) => {
  try {
    return value ? new URL(value).hostname : null;
  } catch {
    return null;
  }
};

const allowedImageHosts = Array.from(new Set([
  'tecbunny.com',
  'www.tecbunny.com',
  'placehold.co',
  hostFromUrl(process.env.NEXT_PUBLIC_SITE_URL),
  hostFromUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
  ...(process.env.NEXT_IMAGE_ALLOWED_HOSTS || '')
    .split(',')
    .map((host) => host.trim())
    .filter(Boolean),
].filter(Boolean)));

const nextConfig = {
  outputFileTracingRoot: path.resolve(__dirname, '../..'),
  ...(isStaticExport ? { output: 'export' } : process.env.DOCKER_BUILD === 'true' ? { output: 'standalone' } : {}),
  compress: true,
  transpilePackages: ["@tecbunny/core", "@tecbunny/ui", "@tecbunny/database", "@tecbunny/config", "@tecbunny/api-client", "@tecbunny/contracts"],
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'date-fns']
  },
  serverExternalPackages: ['pdfkit', 'nodemailer', 'bullmq', 'ioredis', 'pino', 'pino-pretty', 'thread-stream', 'sharp', '@img/sharp-win32-x64'],
  poweredByHeader: false,
  images: {
    unoptimized: isStaticExport,
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    remotePatterns: allowedImageHosts.map((hostname) => ({
      protocol: 'https',
      hostname,
    })),
  },
  reactStrictMode: true,
  webpack(config, { isServer }) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    if (isServer) {
      config.externals.push({
        sharp: 'commonjs sharp',
        '@img/sharp-win32-x64': 'commonjs @img/sharp-win32-x64',
      });
    }
    return config;
  },
  async headers() {
    return [
      {
        // Long-lived cache for hashed static assets (JS/CSS/fonts/images)
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Cache Next.js optimized images for 1 year
        source: '/_next/image',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''} https://challenges.cloudflare.com https://checkout.razorpay.com https://www.googletagmanager.com https://www.google-analytics.com https://maps.googleapis.com`,
              "style-src 'self' 'unsafe-inline' https:",
              "img-src 'self' https: data: blob:",
              "font-src 'self' https: data:",
              "connect-src 'self' https: wss:",
              "frame-src 'self' https://challenges.cloudflare.com https://api.razorpay.com https://checkout.razorpay.com https://www.google.com https://maps.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https:",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
  async redirects() {
    if (isStaticExport) return [];
    const legacyRoutes = [
      ['/services/physical-security', '/services/cctv-security'],
      ['/services/physical-security/pernem-home-theater', '/solutions'],
      ['/services/physical-security/:path*', '/services/cctv-security'],
      ['/physical-security', '/services/cctv-security'],
      ['/cctv', '/services/cctv-security'],
      ['/cctv-installation', '/services/cctv-security'],
      ['/cctv-security', '/services/cctv-security'],
      ['/services/cctv', '/services/cctv-security'],
      ['/services/cctv-installation', '/services/cctv-security'],
      ['/services/cctv-installation-goa', '/services/cctv-security'],
      ['/services/surveillance', '/services/cctv-security'],
      ['/services/computers-mobiles', '/services/it-support'],
      ['/computers-mobiles', '/services/it-support'],
      ['/services/lifecycle-hardware', '/services/it-support'],
      ['/lifecycle-hardware', '/services/it-support'],
      ['/services/software-system-admin', '/services/it-support'],
      ['/software-system-admin', '/services/it-support'],
      ['/services/smart-access-control', '/services/rfid-locks'],
      ['/smart-access-control', '/services/rfid-locks'],
      ['/services/networking-internet', '/services/networking'],
      ['/networking-internet', '/services/networking'],
      ['/services/network-infrastructure', '/services/networking'],
      ['/services/network-infrastructure/:path*', '/services/networking'],
      ['/network-infrastructure', '/services/networking'],
      ['/services/smart-infrastructure', '/solutions'],
      ['/smart-infrastructure', '/solutions'],
      ['/industries/:path*', '/solutions'],
      ['/projects', '/portfolio'],
      ['/shop', '/products'],
    ];
    return [
      ...legacyRoutes.map(([source, destination]) => ({
        source,
        destination: `https://www.tecbunny.com${destination}`,
        permanent: true,
      })),
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'tecbunny.com' }],
        destination: 'https://www.tecbunny.com/:path*',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    if (isStaticExport) return [];

    const apiUrl = resolveApiBaseUrl();
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
}

export default nextConfig
