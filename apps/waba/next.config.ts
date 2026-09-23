import type { NextConfig } from "next";
import path from 'node:path';

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(__dirname, '../..'),
  output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined,
  transpilePackages: ["@tecbunny/core", "@tecbunny/ui", "@tecbunny/database", "@tecbunny/config"],
  serverExternalPackages: ['pdfkit', 'pdf-lib', 'fontkit', 'sharp', '@img/sharp-win32-x64', 'bullmq', 'ioredis', 'pino', 'pino-pretty', 'thread-stream', 'nodemailer'],
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
        pdfkit: 'commonjs pdfkit',
        'pdf-lib': 'commonjs pdf-lib',
        fontkit: 'commonjs fontkit',
      });
    }
    return config;
  },
};

export default nextConfig;
