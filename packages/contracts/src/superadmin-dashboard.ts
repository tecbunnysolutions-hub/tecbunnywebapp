/** Plain TS shapes for the superadmin command-center payload (server-built, trusted). */

export type DashboardSeverity = 'critical' | 'high' | 'medium' | 'low' | 'ok';

export type DashboardMetric = {
  key: string;
  label: string;
  value: number | string;
  displayValue: string;
  category: 'executive' | 'business' | 'realtime' | 'system' | 'analytics';
  severity: DashboardSeverity;
  source: string;
  trend?: string;
  href?: string;
};

export type DashboardActivity = {
  id: string;
  label: string;
  detail: string;
  timestamp: string;
  source: string;
  href?: string;
};

export type DashboardIssue = {
  module: string;
  severity: DashboardSeverity;
  businessImpact: string;
  rootCause: string;
  filesAffected: string[];
  recommendedSolution: string;
  implementationSteps: string[];
  failingEndpoints?: {
    method: string;
    endpoint: string;
    status: number;
    count: number;
    problem: string;
  }[];
  alertKey?: string;
  acknowledged?: boolean;
  acknowledgedBy?: string;
  assignedTo?: string;
};

export type DashboardInsight = {
  title: string;
  detail: string;
  severity: DashboardSeverity;
  action: string;
};

export type DashboardSeriesPoint = {
  label: string;
  value: number;
};

export type SuperadminCommandCenterData = {
  generatedAt: string;
  healthScore: number;
  readinessPercent: number;
  executiveMetrics: DashboardMetric[];
  businessMetrics: DashboardMetric[];
  realtimeMetrics: DashboardMetric[];
  systemMetrics: DashboardMetric[];
  analyticsMetrics: DashboardMetric[];
  recentActivity: DashboardActivity[];
  staffActivity: DashboardActivity[];
  auditLogs: DashboardActivity[];
  notifications: DashboardIssue[];
  aiInsights: DashboardInsight[];
  revenueTrend: DashboardSeriesPoint[];
  orderTrend: DashboardSeriesPoint[];
  topProducts: DashboardSeriesPoint[];
  lowStockProducts: DashboardSeriesPoint[];
  topCompanies: DashboardSeriesPoint[];
  topBranches: DashboardSeriesPoint[];
  productionReport: DashboardIssue[];
};

export type QueryIssue = {
  table: string;
  operation: string;
  message: string;
};

export type PlatformRuntimeSnapshot = {
  status: 'operational' | 'degraded';
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  diskUsage: string;
  networkUsage: string;
  uptimeSeconds: number;
  loadAverage: number[];
  storageBuckets: number;
  storageStatus: 'operational' | 'degraded' | 'unavailable';
  redisStatus: 'connected' | 'configured' | 'unreachable' | 'not_configured';
  cacheStatus: 'configured' | 'in_process';
};

