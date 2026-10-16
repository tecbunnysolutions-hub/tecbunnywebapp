/**
 * Canonical entity definition for TecBunny Solutions.
 *
 * Single source of truth for company identity used across metadata, JSON-LD,
 * and page copy — keeps Organization/LocalBusiness schema, llms.txt, ai.txt
 * and visible page content from drifting apart (LLMO/GEO consistency layer).
 *
 * Keep in sync with: apps/public/public/llms.txt, apps/public/public/company-info.json
 * (enforced by scripts/validate-seo-contract.mjs)
 */
export const ENTITY = {
  name: 'TecBunny Solutions',
  legalName: 'TECBUNNY SOLUTIONS PRIVATE LIMITED',
  url: 'https://www.tecbunny.com',
  foundingYear: '2025',
  cin: 'U80200GA2025PTC017488',
  gstin: '30AAMCT1608G1ZO',
  phone: '+91-9604136010',
  email: 'support@tecbunny.com',
  headquarters: 'Pernem, North Goa, India',
  serviceAreas: ['North Goa', 'Sawantwadi area of Sindhudurg district, Maharashtra'] as const,

  /** One canonical sentence describing what TecBunny is — reuse verbatim. */
  description:
    'TecBunny Solutions Private Limited is a technology services company headquartered in Pernem, North Goa, India, providing CCTV, IT support, RFID locks, networking and website development in North Goa and the Sawantwadi area of Sindhudurg district, Maharashtra.',

  /** Short variant for meta descriptions and schema nodes. */
  shortDescription:
    'CCTV, IT support, RFID locks, networking and website development in North Goa and the Sawantwadi area of Sindhudurg district, Maharashtra.',

  services: [
    { name: 'CCTV', navLabel: 'CCTV', url: '/services/cctv-security' },
    { name: 'IT Support', navLabel: 'IT Support', url: '/services/it-support' },
    { name: 'RFID Locks', navLabel: 'RFID Locks', url: '/services/rfid-locks' },
    { name: 'Networking', navLabel: 'Networking', url: '/services/networking' },
    { name: 'Website Development', navLabel: 'Website Development', url: '/webdev' },
  ] as const,

  industries: [
    { name: 'Hospitality', navLabel: 'Hospitality & Resorts', url: '/industries/hospitality' },
    { name: 'Corporate Offices', navLabel: 'Offices & Co-working', url: '/industries/offices' },
    { name: 'Education', navLabel: 'Education & Campuses', url: '/industries/education' },
    { name: 'Healthcare', navLabel: 'Healthcare & Hospitals', url: '/industries/healthcare' },
    { name: 'Retail', navLabel: 'Retail & Commercial', url: '/industries/retail' },
    { name: 'Builders', navLabel: 'Builders & Developers', url: '/industries/builders' },
  ] as const,
} as const;
