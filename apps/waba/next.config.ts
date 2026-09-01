import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined,
  transpilePackages: ["@tecbunny/core", "@tecbunny/ui", "@tecbunny/database", "@tecbunny/config"],
  serverExternalPackages: ['pdfkit', 'pdf-lib', 'fontkit', 'sharp', '@img/sharp-win32-x64', 'bullmq', 'ioredis', 'pino', 'pino-pretty', 'thread-stream', 'nodemailer'],
  experimental: {
    optimizePackageImports: ['@tecbunny/ui', 'lucide-react'],
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
