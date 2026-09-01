/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdf-lib', 'pdfkit', 'fontkit', 'sharp', '@img/sharp-win32-x64', '@aws-sdk/client-s3', 'nodemailer', 'bullmq'],
  transpilePackages: ['@tecbunny/core', '@tecbunny/domain', '@tecbunny/infra', '@tecbunny/rpc', '@tecbunny/types', '@tecbunny/database'],
  webpack(config, { isServer }) {
    if (isServer) {
      config.externals.push({
        sharp: 'commonjs sharp',
        '@img/sharp-win32-x64': 'commonjs @img/sharp-win32-x64',
        'pdf-lib': 'commonjs pdf-lib',
        pdfkit: 'commonjs pdfkit',
        fontkit: 'commonjs fontkit',
      });
    }
    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ];
  },
};

export default nextConfig;
