import type { NextConfig } from "next";
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = process.env.ANALYZE === 'true'
  ? bundleAnalyzer({ enabled: true, openAnalyzer: false })
  : (c: NextConfig) => c;

const nextConfig: NextConfig = {
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
