import { cpus } from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

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
  ...(isStaticExport ? { output: 'export' } : process.env.DOCKER_BUILD === 'true' ? { output: 'standalone' } : {}),
  compress: true,
  transpilePackages: ["@tecbunny/core", "@tecbunny/ui", "@tecbunny/database", "@tecbunny/config"],
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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
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
    // Consolidate non-www → www into a single 308 hop to avoid redirect chains
    return [
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
