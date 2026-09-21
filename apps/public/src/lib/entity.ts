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
  serviceAreas: ['Goa', 'Maharashtra'] as const,

  /** One canonical sentence describing what TecBunny is — reuse verbatim. */
  description:
    'TecBunny Solutions Private Limited is a technology services company headquartered in Pernem, North Goa, India, providing CCTV installation, IT services, managed IT support (AMC), network infrastructure, home automation, RFID and access-control systems, and web development across Goa and Maharashtra.',

  /** Short variant for meta descriptions and schema nodes. */
  shortDescription:
    'Enterprise IT infrastructure, CCTV and physical security, AMC support, networking, smart building automation, and RFID access control in Goa and Maharashtra.',

  services: [
    { name: 'Network Infrastructure', navLabel: 'Network & IT Infrastructure', url: '/services/network-infrastructure' },
    { name: 'CCTV & Physical Security', navLabel: 'Physical Security & CCTV', url: '/services/physical-security' },
    { name: 'Smart Access Control', navLabel: 'Smart Access Control', url: '/services/smart-access-control' },
    { name: 'Smart Infrastructure', navLabel: 'Hotel Smart Infrastructure', url: '/services/smart-infrastructure' },
    { name: 'Lifecycle Hardware', navLabel: 'Lifecycle Hardware & AMC', url: '/services/lifecycle-hardware' },
    { name: 'Software & System Administration', navLabel: 'Software & System Admin', url: '/services/software-system-admin' },
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
