import { Suspense, type ComponentProps } from 'react';

import type { Metadata } from 'next';

import HomePage from '@/components/home-page';
import { createPageMetadata } from "@tecbunny/core/metadata";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Revalidate homepage every 60 seconds (ISR) to fix 2.8s Document Request Latency
export const revalidate = 60;

// AEO: FAQPage structured data mirroring the visible FAQ section in home-page.tsx
// Keep in sync with the <dl> in components/home-page.tsx (validator enforces parity).
const homeFaqs: Array<{ question: string; answer: string }> = [
  {
    question: 'Do you set up Wi-Fi networks in Goa?',
    answer:
      'Yes. We set up Wi-Fi, LAN networks, and cable runs for offices, hotels, and commercial properties across Goa. We use Ubiquiti, Cisco, and Fortinet gear. Every network job comes with a 90-day free support period and a full handover report.',
  },
  {
    question: 'What does an AMC plan cover?',
    answer:
      'An AMC (Annual Maintenance Contract) covers your CCTV or IT kit for the full year. It can include planned check-ups, remote support, on-site fixes, and audit reports, with response targets defined in your plan. It helps reduce ad hoc repairs and keeps your gear maintained.',
  },
  {
    question: 'Do you serve areas outside Goa?',
    answer:
      'Yes. We serve clients in Mumbai, Pune, and Nashik for large IT and CCTV jobs. We also run remote IT support for firms across India. For jobs outside Goa, we can send a team or work with a local vendor under our watch. Call us to get a fast quote.',
  },
];

const homeFaqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': 'https://www.tecbunny.com/#faq',
  isPartOf: { '@id': 'https://www.tecbunny.com/#webpage' },
  mainEntity: homeFaqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer },
  })),
};

const serializeJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');


// Homepage metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
  title: 'Enterprise IT Infrastructure & Security in Goa | TecBunny',
  description:
    'Enterprise IT infrastructure, CCTV & physical security, networking, smart buildings, and managed AMC services across Goa and Maharashtra — by TecBunny Solutions.',
  keywords: [
    'enterprise IT infrastructure Goa',
    'CCTV physical security Goa',
    'smart access control',
    'smart building automation Goa',
    'IT lifecycle management',
    'managed IT services Goa',
    'TecBunny',
  ],
  path: '/',
  image: '/brand.png',
});
}

function HomePageSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded w-3/4 mx-auto mb-6"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
            <div className="h-12 bg-gray-200 rounded w-48 mx-auto"></div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type PartnerBrand = { name: string; logoUrl: string };
type HomePageProps = ComponentProps<typeof HomePage>;

function parsePartnerBrands(value: unknown): PartnerBrand[] {
  if (Array.isArray(value)) {
    return value
      .map((item: unknown) => {
        const record = item && typeof item === 'object'
          ? item as Record<string, unknown>
          : {};
        return {
          name: record.name ? String(record.name).trim() : '',
          logoUrl: record.logoUrl ? String(record.logoUrl).trim() : '',
        };
      })
      .filter((brand) => brand.name.length > 0);
  }

  if (typeof value !== 'string') {
    return [];
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }

  if (trimmed.startsWith('[')) {
    try {
      return parsePartnerBrands(JSON.parse(trimmed));
    } catch {
      return [];
    }
  }

  return trimmed
    .split(',')
    .map((name) => ({ name: name.trim(), logoUrl: '' }))
    .filter((brand) => brand.name.length > 0);
}

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(homeFaqJsonLd) }}
      />
      <Suspense fallback={<HomePageSkeleton />}>
        <HomePageDataLoader />
      </Suspense>
    </>
  );
}

async function HomePageDataLoader() {
  let initialPartnerBrands: PartnerBrand[] = [];
  // Default to {} so HeroCarousel skips client-side fetch when no data is configured.
  let initialHeroCarousel: HomePageProps['initialHeroCarousel'] = {};

  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

    const [brandsResult, heroResult] = await Promise.allSettled([
      supabase.from('settings').select('value').eq('key', 'partnerBrands').maybeSingle(),
      supabase.from('page_content').select('data').eq('key', 'hero-carousels').maybeSingle(),
    ]);

    if (brandsResult.status === 'fulfilled' && brandsResult.value.data && !brandsResult.value.error) {
      initialPartnerBrands = parsePartnerBrands(brandsResult.value.data.value);
    }

    if (heroResult.status === 'fulfilled' && heroResult.value.data && !heroResult.value.error) {
      initialHeroCarousel = heroResult.value.data.data ?? {};
    }
  } catch (error) {
    console.error('Error prefetching data for homepage:', error);
  }

  return (
    <HomePage
      initialPartnerBrands={initialPartnerBrands}
      initialHeroCarousel={initialHeroCarousel}
    />
  );
}
