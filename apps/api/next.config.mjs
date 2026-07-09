/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdfkit', 'fontkit', 'sharp', '@aws-sdk/client-s3', 'nodemailer', 'bullmq'],
  transpilePackages: ['@tecbunny/core', '@tecbunny/domain', '@tecbunny/infra', '@tecbunny/rpc', '@tecbunny/types'],
  experimental: {
    instrumentationHook: true
  },

};

export default nextConfig;
