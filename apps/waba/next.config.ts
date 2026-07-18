import type { NextConfig } from "next";
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = process.env.ANALYZE === 'true'
  ? bundleAnalyzer({ enabled: true, openAnalyzer: false })
  : (c: NextConfig) => c;

const nextConfig: NextConfig = {
  output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined,
  transpilePackages: ["@tecbunny/core", "@tecbunny/ui", "@tecbunny/database", "@tecbunny/config"],
  serverExternalPackages: ['sharp', '@img/sharp-win32-x64'],
  experimental: {
    optimizePackageImports: ['@tecbunny/ui', 'lucide-react'],
  },
  webpack(config, { isServer }) {
    if (isServer) {
      config.externals.push({
        sharp: 'commonjs sharp',
        '@img/sharp-win32-x64': 'commonjs @img/sharp-win32-x64',
      });
    }
    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
