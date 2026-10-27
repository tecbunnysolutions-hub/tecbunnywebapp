import type {Metadata, Viewport} from 'next';

const BRAND_LOGO_URL = 'https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/TecBunny%20Solution/TECBUNNY_SOLUTIONS_PVT_LTD-removebg-preview.png';
import { Suspense } from 'react';

import './globals.css';
import {Header} from '@/components/layout/Header';
import {Footer} from '@/components/layout/Footer';
import {TechShell} from '@/components/layout/TechShell';
import {AppProvider} from "@tecbunny/core/context/AppProvider";
import {EnterpriseAnalyticsAutoTracker} from '@tecbunny/core/components/EnterpriseAnalyticsAutoTracker';
import {ThemeProvider} from '@/components/providers/ThemeProvider';
import {DeferredFloatingAIAssistant} from '@/components/layout/DeferredFloatingAIAssistant';
import {QuickContactWidget} from '@/components/layout/QuickContactWidget';
import {DeferredRuntimeServices} from '@/components/layout/DeferredRuntimeServices';
import {TRPCProvider} from '@/components/providers/TRPCProvider';
import {FeatureFlagProviderLoader} from '@/components/providers/FeatureFlagProviderLoader';
import {ENTITY} from '@/lib/entity';
import {getStartingPrices} from '@/lib/starting-prices';
import type {StartingPrice} from '@/content/pricing';

import { Analytics } from '@vercel/analytics/react';

const googleSiteVerification = Array.from(new Set([
  'K9vfCefiTTuGQTBnrwUXh34gMmhjr_2Bi4_MaxVUUWw',
  process.env.GOOGLE_SITE_VERIFICATION,
].filter((value): value is string => Boolean(value))));
const xHandle = process.env.NEXT_PUBLIC_X_HANDLE;
const xUrl = process.env.NEXT_PUBLIC_X_URL;
const googleBusinessUrl = process.env.NEXT_PUBLIC_GOOGLE_BUSINESS_URL;

const sameAsLinks = [
  'https://www.facebook.com/profile.php?id=61578165368064',
  'https://www.instagram.com/tecbunny_solutions/',
  xUrl,
  googleBusinessUrl,
].filter((value): value is string => Boolean(value));

const serviceOffer = (name: string, path: string, minPrice?: number) => ({
  '@type': 'Offer',
  url: `https://www.tecbunny.com${path}`,
  ...(minPrice && {
    priceCurrency: 'INR',
    priceSpecification: { '@type': 'PriceSpecification', minPrice, priceCurrency: 'INR' },
  }),
  itemOffered: {
    '@type': 'Service',
    name,
    url: `https://www.tecbunny.com${path}`,
    provider: { '@id': 'https://www.tecbunny.com/#localbusiness' },
  },
});

export const metadata: Metadata = {
  manifest: '/manifest.webmanifest',
  metadataBase: new URL('https://www.tecbunny.com'),
  title: {
    default: 'CCTV & IT Support for Goa Homes | TecBunny',
    template: '%s',
  },
  description:
    'CCTV, computer repair, RFID locks, networking and website development for homes and small businesses in North Goa and the Sawantwadi area of Sindhudurg district, Maharashtra.',
  applicationName: 'TecBunny Solutions',
  authors: [{ name: 'TecBunny Solutions' }],
  publisher: 'TecBunny Solutions',
  alternates: {
    canonical: 'https://www.tecbunny.com/',
    types: {
      'application/rss+xml': 'https://www.tecbunny.com/feed.xml',
    },
  },
  openGraph: {
    type: 'website',
    url: 'https://www.tecbunny.com/',
    title: 'CCTV & IT Support for Goa Homes | TecBunny',
    description:
      'CCTV, computer repair, RFID locks, networking and website development for homes and small businesses in North Goa and the Sawantwadi area of Sindhudurg district, Maharashtra.',
    siteName: 'TecBunny Solutions',
    images: [
      {
        url: BRAND_LOGO_URL,
        width: 512,
        height: 512,
        alt: 'TecBunny Solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CCTV & IT Support for Goa Homes | TecBunny',
    description:
      'CCTV, computer repair, RFID locks, networking and website development for homes and small businesses in North Goa and the Sawantwadi area of Sindhudurg district, Maharashtra.',
    images: [BRAND_LOGO_URL],
    site: xHandle,
    creator: xHandle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: {
    google: googleSiteVerification,
  },
  icons: {
    icon: [
      {
        url: '/logo.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/logo.png',
        sizes: '16x16',
        type: 'image/png',
      },
    ],
    shortcut: '/logo.png',
    apple: [
      {
        url: '/logo.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

const buildStructuredData = (prices: readonly StartingPrice[]) => {
  const minPrice = (service: string) => {
    const amounts = prices.filter((price) => price.service === service).map((price) => price.amount);
    return amounts.length > 0 ? Math.min(...amounts) : undefined;
  };
  return {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@context': 'https://schema.org',
      '@type': 'Corporation',
      '@id': 'https://www.tecbunny.com/#corporation',
      'name': 'TecBunny Solutions Private Limited',
      'legalName': 'TECBUNNY SOLUTIONS PRIVATE LIMITED',
      'url': 'https://www.tecbunny.com',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': 'H. No. 11, Nhayginwada, Parcem',
        'addressLocality': 'Pernem, North Goa',
        'addressRegion': 'Goa',
        'postalCode': '403512',
        'addressCountry': 'IN'
      },
      'identifier': {
        '@type': 'PropertyValue',
        'propertyID': 'CIN',
        'value': 'U80200GA2025PTC017488'
      }
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.tecbunny.com/#website',
      url: 'https://www.tecbunny.com',
      name: 'TecBunny Solutions',
      description:
        'CCTV, IT support, RFID locks, networking and website development for homes and small businesses in North Goa and the Sawantwadi area of Sindhudurg district, Maharashtra.',
      publisher: { '@id': 'https://www.tecbunny.com/#organization' },
      author: { '@id': 'https://www.tecbunny.com/#organization' },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://www.tecbunny.com/products?search={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'WebPage',
      '@id': 'https://www.tecbunny.com/#webpage',
      url: 'https://www.tecbunny.com',
      name: 'CCTV, IT Support & Web Development in Goa | TecBunny',
      isPartOf: { '@id': 'https://www.tecbunny.com/#website' },
      about: { '@id': 'https://www.tecbunny.com/#localbusiness' },
      primaryImageOfPage: { '@id': 'https://www.tecbunny.com/#logo' },
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['h1', 'main p'],
      },
    },
    {
      '@type': 'ImageObject',
      '@id': 'https://www.tecbunny.com/#logo',
      url: BRAND_LOGO_URL,
      contentUrl: BRAND_LOGO_URL,
      caption: 'TecBunny Solutions logo',
    },
    {
      '@type': 'Organization',
      '@id': 'https://www.tecbunny.com/#organization',
      name: 'TecBunny Solutions',
      url: 'https://www.tecbunny.com',
      logo: BRAND_LOGO_URL,
      description: ENTITY.description,
      sameAs: sameAsLinks,
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: '+91-9604136010',
          contactType: 'customer support',
          areaServed: ['IN-GA', 'IN-MH'],
          email: 'support@tecbunny.com',
        },
      ],
    },
    {
      '@type': ['LocalBusiness', 'ITService', 'SecurityService'],
      '@id': 'https://www.tecbunny.com/#localbusiness',
      name: 'TecBunny Solutions Private Limited',
      legalName: 'TECBUNNY SOLUTIONS PRIVATE LIMITED',
      foundingDate: '2025',
      url: 'https://www.tecbunny.com',
      logo: BRAND_LOGO_URL,
      image: BRAND_LOGO_URL,
      description: ENTITY.shortDescription,
      telephone: '+91-9604136010',
      email: 'support@tecbunny.com',
      taxID: '30AAMCT1608G1ZO',
      iso6523Code: '0199:U80200GA2025PTC017488',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'H. No. 11, Nhayginwada, Parcem',
        addressLocality: 'Pernem',
        addressRegion: 'Goa',
        postalCode: '403512',
        addressCountry: 'IN',
      },
      openingHoursSpecification: [{
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:30',
        closes: '19:30',
      }],
      areaServed: [
        { '@type': 'AdministrativeArea', name: 'North Goa' },
        { '@type': 'AdministrativeArea', name: 'Sawantwadi area, Sindhudurg district' },
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Services',
        itemListElement: [
          serviceOffer('CCTV', '/services/cctv-security', minPrice('CCTV')),
          serviceOffer('IT Support', '/services/it-support', minPrice('Repairs')),
          serviceOffer('RFID Locks', '/services/rfid-locks'),
          serviceOffer('Networking', '/services/networking'),
          serviceOffer('Website Development', '/webdev'),
        ],
      },
      ...(googleBusinessUrl && { hasMap: googleBusinessUrl }),
      sameAs: sameAsLinks,
    },
  ],
  };
};

const serializeJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || 'G-6QWJ4732Q9';
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  // NOTE: no per-request CSP nonce is read here. Middleware only sets x-nonce
  // on protected routes (/checkout, /orders, /payment, /profile), and reading
  // headers() in this shared layout forced EVERY public page into dynamic
  // rendering — defeating ISR/CDN caching for zero benefit (public routes
  // receive no nonce-based CSP). next-themes' inline init script may be
  // blocked by CSP on protected routes, so the default dark theme is applied
  // statically via className="dark" below to avoid any theme flash there.
  return (
    <html
      lang="en"
      className="dark"
      suppressHydrationWarning
      style={{
        ['--font-body' as string]: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <head>
        <link rel="preconnect" href="https://fbcsagupcxheyiusjfak.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fbcsagupcxheyiusjfak.supabase.co" />
        <link rel="dns-prefetch" href="https://cdn.grofers.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.facebook.com" />
        <link rel="dns-prefetch" href="https://www.instagram.com" />
        <link rel="dns-prefetch" href="https://maps.googleapis.com" />
        <link rel="preload" as="image" href={BRAND_LOGO_URL} fetchPriority="high" />
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildStructuredData(await getStartingPrices())) }}
          />
      </head>
      <body className="font-body antialiased overflow-x-hidden w-full" suppressHydrationWarning>
        <ThemeProvider>
          <TRPCProvider>
            <FeatureFlagProviderLoader>
              <AppProvider>
                  <EnterpriseAnalyticsAutoTracker application="public" defaultModule="website" dashboardPaths={['/account', '/orders', '/dashboard']} />
                  <TechShell>
                    <div className="site-shell flex min-h-[100dvh] flex-col bg-background text-foreground w-full">
                      <Suspense fallback={<div className="h-16 border-b" />}>
                        <Header />
                      </Suspense>
                      <main className="flex-1">{children}</main>
                      <Footer />
                    </div>
                  </TechShell>
                  <DeferredFloatingAIAssistant />
                  <QuickContactWidget />

                  <DeferredRuntimeServices gaId={gaId} metaPixelId={metaPixelId} />
                  <Analytics />
              </AppProvider>
            </FeatureFlagProviderLoader>
          </TRPCProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
