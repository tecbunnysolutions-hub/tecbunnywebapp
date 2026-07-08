/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdfkit', 'fontkit', 'sharp', '@aws-sdk/client-s3', 'nodemailer', 'bullmq'],
  experimental: {
    instrumentationHook: true
  }
};

export default nextConfig;
