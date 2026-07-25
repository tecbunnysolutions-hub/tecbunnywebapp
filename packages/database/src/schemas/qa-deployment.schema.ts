import { z } from 'zod';

export const ReleaseStatusEnum = z.enum(['PLANNED', 'STAGING', 'UAT', 'PRODUCTION', 'ROLLED_BACK', 'FAILED']);
export const DeploymentEnvironmentEnum = z.enum(['DEVELOPMENT', 'STAGING', 'PRODUCTION']);
export const DeploymentStatusEnum = z.enum(['QUEUED', 'RUNNING', 'SUCCESS', 'FAILED', 'ROLLED_BACK']);
export const TestTypeEnum = z.enum(['UNIT', 'INTEGRATION', 'API', 'UI', 'REGRESSION', 'UAT', 'SMOKE', 'SECURITY', 'PERFORMANCE']);
export const TestResultStatusEnum = z.enum(['PASSED', 'FAILED', 'BLOCKED', 'PENDING']);
export const IncidentSeverityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
export const IncidentStatusEnum = z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'POSTMORTEM']);
export const HypercarePriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

export const ReleaseVersionSchema = z.object({
  id: z.string().uuid(),
  version: z.string(),
  release_date: z.string().optional(),
  status: ReleaseStatusEnum.default('PLANNED'),
  build_success_rate_percent: z.number().min(0).max(100).default(0),
  failed_builds_count: z.number().int().nonnegative().default(0),
  created_by_id: z.string().uuid().optional(),
});

export const DeploymentHistorySchema = z.object({
  id: z.string().uuid(),
  release_id: z.string().uuid(),
  environment: DeploymentEnvironmentEnum,
  status: DeploymentStatusEnum.default('QUEUED'),
  started_at: z.string().optional(),
  completed_at: z.string().optional(),
  deployed_by_id: z.string().uuid().optional(),
  notes: z.string().optional(),
});

export const RollbackHistorySchema = z.object({
  id: z.string().uuid(),
  deployment_id: z.string().uuid(),
  rollback_reason: z.string(),
  rolled_back_to_version: z.string(),
  initiated_by_id: z.string().uuid().optional(),
  started_at: z.string().optional(),
  completed_at: z.string().optional(),
  status: z.enum(['RUNNING', 'SUCCESS', 'FAILED']).default('RUNNING'),
});

export const TestSuiteSchema = z.object({
  id: z.string().uuid(),
  suite_name: z.string(),
  test_type: TestTypeEnum,
  module_scope: z.string(),
  is_automated: z.boolean().default(true),
  is_required_for_release: z.boolean().default(true),
});

export const TestResultSchema = z.object({
  id: z.string().uuid(),
  test_suite_id: z.string().uuid(),
  release_id: z.string().uuid().optional(),
  status: TestResultStatusEnum,
  passed_count: z.number().int().nonnegative().default(0),
  failed_count: z.number().int().nonnegative().default(0),
  blocked_count: z.number().int().nonnegative().default(0),
  pending_count: z.number().int().nonnegative().default(0),
  executed_at: z.string().optional(),
});

export const TestCoverageMetricSchema = z.object({
  id: z.string().uuid(),
  release_id: z.string().uuid(),
  module_name: z.string(),
  line_coverage_percent: z.number().min(0).max(100),
  branch_coverage_percent: z.number().min(0).max(100),
  function_coverage_percent: z.number().min(0).max(100),
  recorded_at: z.string().optional(),
});

export const PerformanceMetricSchema = z.object({
  id: z.string().uuid(),
  release_id: z.string().uuid().optional(),
  metric_name: z.enum(['API_RESPONSE_TIME_MS', 'DB_QUERY_TIME_MS', 'DASHBOARD_LOAD_TIME_MS', 'REPORT_GENERATION_TIME_MS', 'FILE_UPLOAD_TIME_MS', 'FILE_DOWNLOAD_TIME_MS']),
  module_name: z.string(),
  value: z.number().nonnegative(),
  target_value: z.number().nonnegative().optional(),
  recorded_at: z.string().optional(),
});

export const LoadTestResultSchema = z.object({
  id: z.string().uuid(),
  release_id: z.string().uuid().optional(),
  concurrent_users: z.number().int().positive(),
  throughput_rps: z.number().nonnegative(),
  avg_latency_ms: z.number().nonnegative(),
  p95_latency_ms: z.number().nonnegative(),
  cpu_usage_percent: z.number().min(0).max(100),
  memory_usage_percent: z.number().min(0).max(100),
  db_load_percent: z.number().min(0).max(100),
  status: z.enum(['PASS', 'FAIL']).default('PASS'),
  executed_at: z.string().optional(),
});

export const MonitoringEventSchema = z.object({
  id: z.string().uuid(),
  category: z.enum(['APPLICATION', 'DATABASE', 'INFRASTRUCTURE', 'QUEUE', 'SECURITY', 'DEPLOYMENT']),
  severity: IncidentSeverityEnum.default('MEDIUM'),
  event_name: z.string(),
  message: z.string(),
  correlation_id: z.string().optional(),
  created_at: z.string().optional(),
});

export const ApplicationLogEntrySchema = z.object({
  id: z.string().uuid(),
  level: z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL']).default('INFO'),
  module: z.string(),
  message: z.string(),
  correlation_id: z.string().optional(),
  context: z.record(z.string(), z.any()).optional(),
  logged_at: z.string().optional(),
});

export const IncidentReportSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  severity: IncidentSeverityEnum,
  status: IncidentStatusEnum.default('OPEN'),
  owner_user_id: z.string().uuid().optional(),
  detected_at: z.string().optional(),
  resolved_at: z.string().optional(),
  post_incident_notes: z.string().optional(),
});

export const ReleaseNoteSchema = z.object({
  id: z.string().uuid(),
  release_id: z.string().uuid(),
  summary: z.string(),
  fixed_bugs: z.array(z.string()).default([]),
  known_issues: z.array(z.string()).default([]),
  breaking_changes: z.array(z.string()).default([]),
  migration_notes: z.string().optional(),
  published_at: z.string().optional(),
});

export const GoLiveChecklistSchema = z.object({
  id: z.string().uuid(),
  release_id: z.string().uuid(),
  checklist_name: z.string(),
  items: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      completed: z.boolean().default(false),
    }),
  ).default([]),
  approved_by_id: z.string().uuid().optional(),
  approved_at: z.string().optional(),
  status: z.enum(['DRAFT', 'READY', 'APPROVED']).default('DRAFT'),
});

export const DeploymentEnvironmentConfigSchema = z.object({
  id: z.string().uuid(),
  environment: DeploymentEnvironmentEnum,
  key: z.string(),
  value_encrypted: z.string(),
  updated_at: z.string().optional(),
});

export const MigrationHistorySchema = z.object({
  id: z.string().uuid(),
  release_id: z.string().uuid().optional(),
  migration_name: z.string(),
  applied_by_id: z.string().uuid().optional(),
  started_at: z.string().optional(),
  completed_at: z.string().optional(),
  status: z.enum(['RUNNING', 'SUCCESS', 'FAILED']).default('RUNNING'),
  rollback_script_reference: z.string().optional(),
});

export const HypercareTicketSchema = z.object({
  id: z.string().uuid(),
  incident_id: z.string().uuid().optional(),
  title: z.string(),
  description: z.string(),
  priority: HypercarePriorityEnum,
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'DEFERRED']).default('OPEN'),
  response_sla: z.enum(['IMMEDIATE', '4_HOURS', '1_BUSINESS_DAY', 'PLANNED_RELEASE']),
  assigned_to_user_id: z.string().uuid().optional(),
  created_at: z.string().optional(),
  resolved_at: z.string().optional(),
});

export type ReleaseVersion = z.infer<typeof ReleaseVersionSchema>;
export type DeploymentHistory = z.infer<typeof DeploymentHistorySchema>;
export type RollbackHistory = z.infer<typeof RollbackHistorySchema>;
export type TestSuite = z.infer<typeof TestSuiteSchema>;
export type TestResult = z.infer<typeof TestResultSchema>;
export type TestCoverageMetric = z.infer<typeof TestCoverageMetricSchema>;
export type PerformanceMetric = z.infer<typeof PerformanceMetricSchema>;
export type LoadTestResult = z.infer<typeof LoadTestResultSchema>;
export type MonitoringEvent = z.infer<typeof MonitoringEventSchema>;
export type ApplicationLogEntry = z.infer<typeof ApplicationLogEntrySchema>;
export type IncidentReport = z.infer<typeof IncidentReportSchema>;
export type ReleaseNote = z.infer<typeof ReleaseNoteSchema>;
export type GoLiveChecklist = z.infer<typeof GoLiveChecklistSchema>;
export type DeploymentEnvironmentConfig = z.infer<typeof DeploymentEnvironmentConfigSchema>;
export type MigrationHistory = z.infer<typeof MigrationHistorySchema>;
export type HypercareTicket = z.infer<typeof HypercareTicketSchema>;