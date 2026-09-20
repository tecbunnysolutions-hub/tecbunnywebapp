/**
 * Service × Location architecture (local SEO).
 *
 * Registry of location-specific service pages. Only add a location page when it
 * carries genuinely unique local content — never auto-generate thin pages.
 * Parent service pages must link to their location pages (internal-link graph);
 * enforced by scripts/validate-seo-contract.mjs.
 */
export interface ServiceLocation {
  name: string;
  url: string;
  areas: string[];
}

export interface ServiceLocationGroup {
  serviceName: string;
  serviceUrl: string;
  locations: ServiceLocation[];
}

export const SERVICE_LOCATIONS: ServiceLocationGroup[] = [
  {
    serviceName: 'Network Infrastructure',
    serviceUrl: '/services/network-infrastructure',
    locations: [
      {
        name: 'North Goa',
        url: '/services/network-infrastructure/north-goa',
        areas: ['Panaji', 'Mapusa', 'Calangute', 'Candolim', 'Pernem'],
      },
    ],
  },
  {
    serviceName: 'Physical Security & Home Theater',
    serviceUrl: '/services/physical-security',
    locations: [
      {
        name: 'Pernem (Home Theater & Automation)',
        url: '/services/physical-security/pernem-home-theater',
        areas: ['Pernem', 'Parcem', 'Mandrem', 'Arambol', 'Morjim', 'Siolim'],
      },
    ],
  },
];

export function getLocationsForService(serviceUrl: string): ServiceLocation[] {
  return SERVICE_LOCATIONS.find((group) => group.serviceUrl === serviceUrl)?.locations ?? [];
}
