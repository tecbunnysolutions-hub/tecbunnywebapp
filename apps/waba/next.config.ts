import type { NextConfig } from "next";

const withBundleAnalyzer = process.env.ANALYZE === 'true'
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ? (require('@next/bundle-analyzer') as any)({ enabled: true, openAnalyzer: false })
  : (c: NextConfig) => c;

const nextConfig: NextConfig = {
  transpilePackages: ["@tecbunny/core", "@tecbunny/ui", "@tecbunny/database"],
  experimental: {
    optimizePackageImports: ['@tecbunny/ui', 'lucide-react'],
  },
};

export default withBundleAnalyzer(nextConfig);
