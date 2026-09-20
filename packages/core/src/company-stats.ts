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
  /** Response-time targets shown across homepage hero + contact page. Single source of truth. */
  responseTimes: {
    /** General enquiry / sales response. */
    generalEnquiry: 'Average: 9.2 hours',
    /** Contact-page badge for general enquiries. */
    generalEnquiryBadge: 'Avg Response <9h',
    /** Critical AMC incident response target. */
    criticalAmc: 'Response target: <2 hours',
    /** Contact-page label for the critical AMC SLA target. */
    criticalAmcShort: 'Target Response: <2 Hours',
    /** On-site critical fault target. */
    onsiteCriticalFault: 'Target: same business day',
  },
} as const;

export type CompanyStats = typeof COMPANY_STATS;
