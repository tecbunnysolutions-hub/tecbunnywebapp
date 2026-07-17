import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined,
  transpilePackages: ["@tecbunny/core", "@tecbunny/ui", "@tecbunny/admin-ui", "@tecbunny/database"],
  generateBuildId: async () => `superadmin-${Date.now()}`,
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.tecbunny.com';
    const mgmtUrl = process.env.NEXT_PUBLIC_MGMT_URL || 'https://staff.tecbunny.com';
    return [
      {
        source: '/api/admin/:path*',
        destination: `${mgmtUrl}/api/admin/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
