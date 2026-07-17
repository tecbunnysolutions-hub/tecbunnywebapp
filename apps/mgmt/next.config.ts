import type { NextConfig } from "next";

const withBundleAnalyzer = process.env.ANALYZE === 'true'
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ? (require('@next/bundle-analyzer') as any)({ enabled: true, openAnalyzer: false })
  : (c: NextConfig) => c;

const nextConfig: NextConfig = {
  transpilePackages: ["@tecbunny/core", "@tecbunny/ui", "@tecbunny/database"],
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
};

export default withBundleAnalyzer(nextConfig);
