import { cpus } from 'os';

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
  ...(isStaticExport ? { output: 'export' } : {}),
  transpilePackages: ["@tecbunny/core", "@tecbunny/ui"],
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@tecbunny/core', '@tecbunny/ui', 'lucide-react']
  },
  serverExternalPackages: ['pdfkit', 'nodemailer', 'bullmq', 'ioredis', 'pino', 'pino-pretty', 'thread-stream'],
  poweredByHeader: false,
  images: {
    unoptimized: isStaticExport,
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
  },
  reactStrictMode: true,
  async headers() {
    return [
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
  async rewrites() {
    if (isStaticExport) return [];
    
    // Proxy API requests to the external API app
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.tecbunny.com';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
}

export default nextConfig
