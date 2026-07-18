import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined,
  transpilePackages: ["@tecbunny/core", "@tecbunny/ui", "@tecbunny/admin-ui", "@tecbunny/database", "@tecbunny/config"],
  serverExternalPackages: ['sharp', '@img/sharp-win32-x64'],
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

export default nextConfig;
