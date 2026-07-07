/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdfkit', 'fontkit'],
  experimental: {
    instrumentationHook: true,
  },
};

export default nextConfig;
