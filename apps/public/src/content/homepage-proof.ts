export type CustomerReview = {
  name: string;
  location?: string;
  service: string;
  quote: string;
  rating?: 1 | 2 | 3 | 4 | 5;
};

export type ProjectPhoto = {
  src: string;
  alt: string;
  title: string;
  location: string;
  width: number;
  height: number;
};

// Add only genuine customer reviews (with permission); the homepage section stays hidden while this is empty.
export const CUSTOMER_REVIEWS: readonly CustomerReview[] = [];

// Add real project photos under public/projects/; the homepage section stays hidden while this is empty.
export const PROJECT_PHOTOS: readonly ProjectPhoto[] = [];

// Brands named on the service pages, shown as text when the CMS supplies no logos.
export const FALLBACK_BRANDS = ['CP PLUS', 'Hikvision', 'Dahua', 'HP', 'Dell', 'Lenovo', 'ASUS', 'TP-Link'] as const;

// Set NEXT_PUBLIC_GOOGLE_REVIEWS_URL to the Google Business Profile review link once the profile is claimed.
export const GOOGLE_REVIEWS_URL = process.env.NEXT_PUBLIC_GOOGLE_REVIEWS_URL ?? '';
