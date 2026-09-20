/**
 * Centralized company statistics.
 *
 * Single source of truth for numbers shown across public pages
 * (homepage, about, trust banners, case studies). Update here only;
 * do not hard-code these figures in individual components.
 */
export const COMPANY_STATS = {
  /** Cumulative sites/locations secured or serviced. */
  sitesSecured: 280,
  /** Cumulative projects delivered. */
  projectsDelivered: 280,
  /** Remote support availability label. */
  supportAvailability: '24/7',
  /** Target uptime for eligible managed plans. */
  targetUptime: '99.9%',
  /** Year the company was established. */
  establishedYear: 2025,
} as const;

export type CompanyStats = typeof COMPANY_STATS;
