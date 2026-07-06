import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@tecbunny/core", "@tecbunny/ui"],
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.tecbunny.com';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
