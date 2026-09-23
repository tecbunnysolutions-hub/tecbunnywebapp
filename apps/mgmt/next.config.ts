import type { NextConfig } from "next";
import path from 'node:path';
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = process.env.ANALYZE === 'true'
  ? bundleAnalyzer({ enabled: true, openAnalyzer: false })
  : (c: NextConfig) => c;

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(__dirname, '../..'),
  output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined,
  transpilePackages: ["@tecbunny/core", "@tecbunny/ui", "@tecbunny/database", "@tecbunny/config"],
  serverExternalPackages: ['pdfkit', 'pdf-lib', 'fontkit', 'sharp', '@img/sharp-win32-x64', 'bullmq', 'ioredis', 'pino', 'pino-pretty', 'thread-stream', 'nodemailer'],
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.tecbunny.com';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
  experimental: {
    optimizePackageImports: ['@tecbunny/ui', 'lucide-react'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ];
  },
  webpack(config, { isServer }) {
    if (isServer) {
      config.externals.push({
        sharp: 'commonjs sharp',
        '@img/sharp-win32-x64': 'commonjs @img/sharp-win32-x64',
        bullmq: 'commonjs bullmq',
        ioredis: 'commonjs ioredis',
        pdfkit: 'commonjs pdfkit',
        'pdf-lib': 'commonjs pdf-lib',
        fontkit: 'commonjs fontkit',
      });
    }
    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
