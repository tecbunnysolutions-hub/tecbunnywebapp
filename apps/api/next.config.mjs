/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdfkit', 'fontkit', 'sharp', '@img/sharp-win32-x64', '@aws-sdk/client-s3', 'nodemailer', 'bullmq'],
  transpilePackages: ['@tecbunny/core', '@tecbunny/domain', '@tecbunny/infra', '@tecbunny/rpc', '@tecbunny/types', '@tecbunny/database'],
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
