/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdfkit', 'fontkit', 'sharp', '@aws-sdk/client-s3'],
  experimental: {
    instrumentationHook: true,
    optimizePackageImports: ["@tecbunny/core"]
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      const ext = ['pdfkit', 'fontkit', 'sharp', '@aws-sdk/client-s3'];
      if (Array.isArray(config.externals)) {
        config.externals.push(...ext);
      } else if (config.externals) {
        config.externals = [config.externals, ...ext];
      } else {
        config.externals = ext;
      }
    }
    return config;
  },
};

export default nextConfig;
