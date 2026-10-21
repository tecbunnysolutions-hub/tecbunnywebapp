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

export const SERVICE_LOCATIONS: ServiceLocationGroup[] = [];

export function getLocationsForService(serviceUrl: string): ServiceLocation[] {
  return SERVICE_LOCATIONS.find((group) => group.serviceUrl === serviceUrl)?.locations ?? [];
}
