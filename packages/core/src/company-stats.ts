/**
 * Centralized company statistics.
 *
 * Single source of truth for numbers shown across public pages
 * (homepage, about, trust banners, case studies). Update here only;
 * do not hard-code these figures in individual components.
 */
export const COMPANY_STATS = {
  /** Remote support availability label. */
  supportAvailability: '24/7',
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
