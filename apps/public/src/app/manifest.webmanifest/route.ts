import { NextResponse } from 'next/server';

export function GET() {
  const manifest = {
    id: '/',
    name: 'TecBunny Solutions',
    short_name: 'TecBunny',
    description:
      'CCTV installation, IT support, networking, access control, and website services in North Goa and the Sawantwadi area of Sindhudurg district, Maharashtra.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0f172a',
    lang: 'en-IN',
    categories: ['business', 'shopping', 'productivity'],
    icons: [
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
    },
  });
}
